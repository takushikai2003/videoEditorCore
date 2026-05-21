import { Timer } from "../Timer.js";
import { videoEditorCore } from "../videoEditorCore.js";
import { config } from "../config.js";
import { canvasEffects } from "./canvasEffects.js";

const timer = new Timer();

let canvas;
let ctx;

//動画処理用のcanvas（ユーザーからは見えない）
const c_tmp = document.createElement("canvas");
const ctx_tmp = c_tmp.getContext("2d",{willReadFrequently: true});


//previwで使用（内部がshiftされていくので深いコピー必須）
let _videoTrackCopy, _audioTrackCopy, _effectTrackCopy, _keyframeEffectTrackCopy;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const emptyNode = audioCtx.createGain();
const audioGain = audioCtx.createGain();
const videoAudioGain = audioCtx.createGain();
// emptyNode.gain.value = 1;//全体の音量
// let soundDestinationConnected = false;

let addedElements = [];//createMediaElementSource()に追加されたもの

function prepareTracks(startTime, videoTrack, audioTrack, effectTrack, keyframeEffectTrack, encode=false){
    // トラックの深いコピー。ただしstartTime以前のクリップを除外
    const videoTrackCopy = videoEditorCore.videoTrack.filter(clip => clip.endTime >= startTime).map(list=>({...list}));
    const audioTrackCopy = videoEditorCore.audioTrack.filter(clip => clip.endTime >= startTime).map(list=>({...list}));
    const effectTrackCopy = videoEditorCore.effectTrack.filter(clip => clip.endTime >= startTime).map(list=>({...list}));
    const keyframeEffectTrackCopy = videoEditorCore.keyframeEffectTrack.map(list=>({...list}));


    compileKeyframeEffectTrack(keyframeEffectTrackCopy);

    // MediaElementSource の接続        
    // MediaElementSourceの作成
    // 将来的なTODO:audioCtxをグローバルに出せるのであれば、element読込み時にcreateMediaElementSourceしておくほうがキレイ。
    for(let i=0; i<videoEditorCore.videoTrack.length; i++){
        const element = videoEditorCore.videoTrack[i].element;
        if(element.tagName == "IMG"){
            continue;
        }
        
        if(addedElements.includes(element)){
            continue;
        }

        const videoAudioSource = audioCtx.createMediaElementSource(element);
        videoAudioSource.connect(videoAudioGain);
        videoAudioGain.connect(emptyNode);

        addedElements.push(element);
    }

    for(let i=0; i<videoEditorCore.audioTrack.length; i++){
        const element = videoEditorCore.audioTrack[i].element;
        
        if(addedElements.includes(element)){
            continue;
        }

        const audioSource = audioCtx.createMediaElementSource(element);
        audioSource.connect(audioGain);
        audioGain.connect(emptyNode);

        addedElements.push(element);
    }


    if(!encode){
        // エンコードでなければ、音声を出力する
        emptyNode.connect(audioCtx.destination);
    }
    else {
        try{
            emptyNode.disconnect(audioCtx.destination);
        }
        catch(e){}

        // const streamdest = audioCtx.createMediaStreamDestination();
        // emptyNode.connect(streamdest);
        // preview.onAudioStreamAvailable(streamdest.stream);
    }


    
    // キーフレームをコンパイル
    compileKeyframeEffectTrack(keyframeEffectTrackCopy);
    
    return { videoTrackCopy, audioTrackCopy, effectTrackCopy, keyframeEffectTrackCopy };
}



function calcLength(videoTrack, audioTrack, effectTrack, keyframeEffectTrack){

    //previewLengthの値を決定
    let videoLength=0, effectLength=0, audioLength=0, keyframeEffectLength=0;

    if(videoTrack.length != 0){
        videoLength = videoTrack[videoTrack.length - 1].endTime;
    }
    if(effectTrack.length != 0){
        effectLength = effectTrack[effectTrack.length - 1].endTime;
    }
    if(audioTrack.length != 0){
        audioLength = audioTrack[audioTrack.length - 1].endTime;
    }
    if(keyframeEffectTrack.length != 0){
        keyframeEffectLength = keyframeEffectTrack[keyframeEffectTrack.length - 1].endTime;
    }

    return Math.max(videoLength, effectLength, audioLength, keyframeEffectLength);
}
    

export const preview = {
    init: function(){
        canvas = config.preview.canvas;
        ctx = canvas.getContext("2d");
        c_tmp.width = config.preview.width;
        c_tmp.height = config.preview.height;
    },
    nowTime: 0,//再生時の現在位置[s]
    length: 0,//プレビューの長さ[s]
    animationframeId: null,//cancelするようのストック
    playing: false,
    allowableMisalignment: 0.05,//再生ズレの許容値[s]
    onTimeUpdate: function(){},
    onStart: function(){},
    onEnd: function(){},
    // onAudioStreamAvailable: function(){},
    seeking: false,

    /**
     * previewの長さを計算してpreview.lengthにセットする
     * @return {number} previewの長さを返す
     */
    calcLength: function(){
        preview.length = calcLength(videoEditorCore.videoTrack, videoEditorCore.audioTrack, videoEditorCore.effectTrack, videoEditorCore.keyframeEffectTrack);
        
        return preview.length;
    },
    
    /**
     * プレビューを再生する
     * @param {number} startTime 途中から再生[秒]
     */
    play: async function(startTime = 0){

        preview.nowTime = startTime;
        preview.calcLength();

        // トラックの準備
        const { videoTrackCopy, audioTrackCopy, effectTrackCopy, keyframeEffectTrackCopy }
        = prepareTracks(startTime, videoEditorCore.videoTrack, videoEditorCore.audioTrack, videoEditorCore.effectTrack, videoEditorCore.keyframeEffectTrack);        

        _videoTrackCopy = videoTrackCopy; _audioTrackCopy = audioTrackCopy; _effectTrackCopy = effectTrackCopy; _keyframeEffectTrackCopy = keyframeEffectTrackCopy;

        
        preview.playing = true;
        timer.start(startTime);
        preview.onStart();

        timer.onTimeUpdate = async function(time){
            preview.nowTime = time;

            //全ての再生が終了したら
            if(preview.nowTime > preview.length){
                preview.nowTime = 0;
                preview.pause();
                preview.onEnd();

                preview.nowTime = 0;
                preview.onTimeUpdate();
                return;
            }

            await computeFrame(time, videoTrackCopy, audioTrackCopy, effectTrackCopy, keyframeEffectTrackCopy);
            preview.onTimeUpdate();
        }
        
    },


    /**
     * プレビューを停止する
     * @return {number} 何秒時点で止まったか
     */
    pause: function(){

        timer.stop();
        timer.reset();
        
        //video elementの場合stop
        if(_videoTrackCopy.length != 0 && _videoTrackCopy[0].element.tagName == "VIDEO"){
            _videoTrackCopy[0].element.pause();
        }

        if(_audioTrackCopy.length != 0){
            _audioTrackCopy[0].element.pause();
        }

        preview.playing = false;
        
        return preview.nowTime;
    },


    /**
     * 指定時間に飛ぶ
     * @param {number} startTime 
     * @param {boolean} [encode]
     */
    seekTo: async function(startTime, encode=false){
        if(preview.seeking){
            return;
        }

        preview.nowTime = startTime;
        preview.calcLength();

        const { videoTrackCopy, audioTrackCopy, effectTrackCopy, keyframeEffectTrackCopy }
        = prepareTracks(startTime, videoEditorCore.videoTrack, videoEditorCore.audioTrack, videoEditorCore.effectTrack, videoEditorCore.keyframeEffectTrack);        

        // seekではcomputeFrameを一度だけ
        if(seek){
            preview.seeking = true;
            
            await computeFrame(startTime, videoTrackCopy, audioTrackCopy, effectTrackCopy, keyframeEffectTrackCopy);
            preview.seeking = false;
            return;
        }

        if(!encode){
            console.log("preview seeked");
        }

        return;
    }
}


//------------------------------------------
async function computeFrame(time, videoTrack, audioTrack, effectTrack, keyframeEffectTrack) {
    
    ctx_tmp.clearRect(0, 0, c_tmp.width, c_tmp.height);

    await processVideoTrack(time, videoTrack);

    //frameに対して動画のエフェクトをかけられる
    // TODO: gpu.sepia以外のGPU実装（動作未確認のため実装してない）
    let imagedata = ctx_tmp.getImageData(0, 0, canvas.width, canvas.height);
    
    if(videoTrack.length != 0){
        switch(videoTrack[0].filter){
            case "monochrome":
                canvasEffects.monochrome(imagedata.data);
                break;
            case "negativeInverte":
                canvasEffects.negativeInverte(imagedata.data);
                break;
            case "sepia":
                canvasEffects.sepia(imagedata.data);
                break;
            case "gpu.sepia":
                await canvasEffects.gpu.sepia(c_tmp, c_tmp);
                imagedata = ctx_tmp.getImageData(0, 0, canvas.width, canvas.height);
                break;
            default:
                break;
        }    
    }
    

    await processAudioTrack(time, audioTrack);

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imagedata, 0, 0);

    processEffectTrack(time, effectTrack);
    processKeyframeEffectTrack(time, keyframeEffectTrack)
    
    // await wait(1);//chromeバグ対策
}


//-----------------------------------------------------
//  トラック処理
//(全体)：プロジェクト内の位置
//(内部)：そのElmの位置（どこを切り取るか）。※Image,effectには無い。

//per frame
async function processVideoTrack(time, videoTrack){
    
    let misalignment; //本来の位置とのずれ[s]

    if(videoTrack[0] != undefined &&
        videoTrack[0].element.tagName == "VIDEO"
    ){
        misalignment = Math.abs(videoTrack[0].element.currentTime + videoTrack[0].startTime - videoTrack[0].relativeStartTime - time);
    }

    //今のelmが再生されていなければ
    if(
        videoTrack[0] != undefined &&
        videoTrack[0].element.tagName == "VIDEO" &&
        videoTrack[0].element.paused == true &&
        time >= videoTrack[0].startTime //いるのか微妙
    ){
        // TODO：videoTrack[0].relativeStartTimeが採用される場合があるか確認.ずれの確認用？
        videoTrack[0].element.currentTime = Math.max(videoTrack[0].relativeStartTime, time - videoTrack[0].startTime + videoTrack[0].relativeStartTime);//startTime(内部)に飛ぶ
        videoAudioGain.gain.value = videoTrack[0].gain;//gain
        
        await videoTrack[0].element.play();
    }

    //play中かつズレていれば
    else if(
        videoTrack[0] != undefined &&
        videoTrack[0].element.paused == false &&
        misalignment > preview.allowableMisalignment
    ){
        console.log("video misalignment: " + misalignment + "s");

        timer.stop();
        videoTrack[0].element.currentTime = time - (videoTrack[0].startTime - videoTrack[0].relativeStartTime);
        await wait_seek(videoTrack[0].element);
        timer.start();
    }

    if( //endTimeを超えていたら
        videoTrack[0] != undefined &&
        time > videoTrack[0].endTime
    ){
        if(videoTrack[0].element.tagName == "VIDEO"){
            videoTrack[0].element.pause();
        }

        videoTrack.shift();//次のobjへ
    }

    //毎フレーム描画
    if(videoTrack[0] != undefined && time >= videoTrack[0].startTime){
        const elm_width = videoTrack[0].element.width || videoTrack[0].element.videoWidth;
        const elm_height = videoTrack[0].element.height || videoTrack[0].element.videoHeight;
        

        let dx = 0;
        let dy = 0;
        let width = canvas.width;
        let height = canvas.height;

        if(elm_width/elm_height >= canvas.width/canvas.height){
            //widthをフルに描画
            height = canvas.height*elm_height/elm_width;
            dy = (canvas.height - height)/2;
        }
        else{
            //heightをフルに描画
            width = canvas.width*elm_width/elm_height;
            dx = (canvas.width - width)/2;
        }

        ctx_tmp.drawImage(videoTrack[0].element, dx, dy, width, height);
    }
}


async function processAudioTrack(time, audioTrack){
    if(audioTrack[0] == undefined){
        return;
    }

    //本来の位置とのずれ[s]
    const misalignment = Math.abs(audioTrack[0].element.currentTime + audioTrack[0].startTime - audioTrack[0].relativeStartTime - time);

    //今のelmが再生されていなければ
    if(
        audioTrack[0].element.paused == true &&
        time >= audioTrack[0].startTime //いるのか微妙
    ){
        audioTrack[0].element.currentTime = Math.max(audioTrack[0].relativeStartTime, time - audioTrack[0].startTime + audioTrack[0].relativeStartTime);//startTime(内部)に飛ぶ
        audioGain.gain.value = audioTrack[0].gain;

        await audioTrack[0].element.play();
    }

    //play中かつズレていれば
    else if(
        audioTrack[0].element.paused == false &&
        misalignment > preview.allowableMisalignment
    ){
        console.log("audio misalignment: " + misalignment);
        timer.stop();
        audioTrack[0].element.currentTime = time - (audioTrack[0].startTime - audioTrack[0].relativeStartTime);
        await wait_seek(audioTrack[0].element);
        timer.start();
    }


    if( //endTimeを超えていたら
        time > audioTrack[0].endTime
    ){
        audioTrack[0].element.pause();
        audioTrack.shift();//次のobjへ
    }
}


function processEffectTrack(time, effectTrack){

    if(effectTrack[0] != undefined && time > effectTrack[0].endTime){ //endTimeを超えていたら
        effectTrack.shift();//次のobjへ
    }

    if(effectTrack[0] != undefined && time >= effectTrack[0].startTime){ //startTime以上なら
        //描画処理へ
        for(let i=0; i<effectTrack[0].effect.length; i++){//内部のeffectの長さ分
            effectTrack[0].effect[i].function(effectTrack[0].effect[i].arguments);
        }
    }

}


// 再生前に一度だけ、各keyframeの数式係数を決定する
// (とりあえずlinearのみ)
function compileKeyframeEffectTrack(keyframeEffectTrack){

    for(let i=0; i<keyframeEffectTrack.length; i++){
        for(let j=0; j<keyframeEffectTrack[i].keyframes.length; j++){
            const keyframe = keyframeEffectTrack[i].keyframes[j];
            const nextKeyframe = keyframeEffectTrack[i].keyframes[j+1];

            if(nextKeyframe == undefined){
                break;
            }

            // 係数保存用
            keyframe.coefficients = [];//{key,a,b}
            // linear
            // f(t) = at + b の係数a,bを決定する
            Object.entries(keyframe.dynamicArguments)
            .forEach(arr=>{
                const key = arr[0];
                const value = arr[1];
                const a = (nextKeyframe.dynamicArguments[key] - value) / (nextKeyframe.startTime - keyframe.startTime);
                const b = value - (a * keyframe.startTime);
                keyframe.coefficients.push({key: key, a: a, b: b});
            });
           
        }
    }

}


function processKeyframeEffectTrack(time, keyframeEffectTrack){

    if(keyframeEffectTrack[0] != undefined && time > keyframeEffectTrack[0].endTime){ //endTimeを超えていたら
        keyframeEffectTrack.shift();//次のKeyframeEffectへ
    }

    // .length==0じゃだめ？
    if(keyframeEffectTrack[0] == undefined){
        return;
    }

    // 次の要素のstartTimeがtimeを超えていたらそれより前の要素を削除する
    for(let i=0; i<keyframeEffectTrack[0].keyframes.length; i++){
        const keyframe = keyframeEffectTrack[0].keyframes[i];
        
        if(keyframe.startTime >= time){
            keyframeEffectTrack[0].keyframes = keyframeEffectTrack[0].keyframes.slice(i-1);
            break;
        }
    }

    //startTime以上なら、キーフレームの実行を開始する
    if(time >= keyframeEffectTrack[0].keyframes[0].startTime){
        const keyframe = keyframeEffectTrack[0].keyframes[0];
        const args = {};
        // 動的引数の値を計算して決定する
        keyframe.coefficients.forEach(obj=>{
            // f(t) = at + b
            args[obj.key] = obj.a * time + obj.b;
        });

        // 静的引数を結合
        Object.assign(args, keyframe.staticArguments);

        //描画処理へ
        keyframeEffectTrack[0].keyframes[0].function(args);
        
    }

}


function wait_seek(elm){
    return new Promise(resolve=>{
        elm.addEventListener("seeked",()=>{
            resolve();
        });
    });
}

function wait(ms){
    return new Promise(resolve=>{
        setTimeout(() => {
            resolve();
        }, ms);
    });
}