import Timer from "../timer.js";
import videoEditor from "../videoEditor.js";
import config from "../config.js";
import canvasEffects from "./canvasEffects.js";

const timer = new Timer();

let canvas;
let ctx;
// canvas.width = config.encode.width;
// canvas.height = config.encode.height;


//previwで使用（内部がshiftされていくので深いコピー必須）
let videoTrackCopy, audioTrackCopy, objectTrackCopy;

let audioCtx, emptyNode, audioGain, videoAudioGain;
// let soundDestinationConnected = false;

let addedElements = [];//createMediaElementSource()に追加されたもの

const preview = {
    init: function(_canvas){
        canvas = _canvas;
        ctx = _canvas.getContext("2d");
    },
    nowTime: 0,//再生時の現在位置[s]
    length: 0,//プレビューの長さ[s]
    animationframeId: null,//cancelするようのストック
    playing: false,
    allowableMisalignment: 0.05,//再生ズレの許容値[s]
    onTimeUpdate: function(){},
    onStart: function(){},
    onEnd: function(){},
    onAudioStreamAvailable: function(){},
    seeking: false,
    
    //arg: nowTime：途中から再生[秒]
    play:async function(startTime = 0, encode=false, seek=false){

        preview.nowTime = startTime;

        //トラックの深いコピー
        videoTrackCopy = Array.from(videoEditor.videoTrack);
        audioTrackCopy = Array.from(videoEditor.audioTrack);
        objectTrackCopy = Array.from(videoEditor.objectTrack);

        //previewLengthの値を決定
        let videoLength=0, objectLength=0, audioLength=0;

        if(videoTrackCopy.length != 0){
            videoLength = videoTrackCopy[videoTrackCopy.length - 1].overallEndTime;
        }
        if(objectTrackCopy.length != 0){
            objectLength = objectTrackCopy[objectTrackCopy.length - 1].overallEndTime;
        }
        if(audioTrackCopy.length != 0){
            audioLength = audioTrackCopy[audioTrackCopy.length - 1].overallEndTime;
        }
        
        preview.length = Math.max(videoLength, objectLength, audioLength);

        //途中から再生するために、overallEndTime未満のクリップは破棄
        videoTrackCopy = videoTrackCopy.filter(clip => {
            return (clip.overallEndTime >= preview.nowTime);
        });
        objectTrackCopy = objectTrackCopy.filter(clip => {
            return (clip.overallEndTime >= preview.nowTime);
        });
        audioTrackCopy = audioTrackCopy.filter(clip => {
            return (clip.overallEndTime >= preview.nowTime);
        });


        if(audioCtx == undefined){
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            emptyNode = audioCtx.createGain();
            audioGain = audioCtx.createGain();
            videoAudioGain = audioCtx.createGain();
        }
        
        // emptyNode.gain.value = 1;//全体の音量
        
        //MediaElementSourceの作成
        for(let i=0; i<videoEditor.videoTrack.length; i++){
            const element = videoEditor.videoTrack[i].element;
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

        for(let i=0; i<videoEditor.audioTrack.length; i++){
            const element = videoEditor.audioTrack[i].element;
            
            if(addedElements.includes(element)){
                continue;
            }

            const audioSource = audioCtx.createMediaElementSource(element);
            audioSource.connect(audioGain);
            audioGain.connect(emptyNode);

            addedElements.push(element);
        }


        if(!encode){
            emptyNode.connect(audioCtx.destination);
        }
        else {
            try{
                emptyNode.disconnect(audioCtx.destination);
            }
            catch(e){}

            const streamdest = audioCtx.createMediaStreamDestination();
            emptyNode.connect(streamdest);
            preview.onAudioStreamAvailable(streamdest.stream);
        }


        //seekならcomputeFrameは一度だけ
        if(seek){
            preview.seeking = true;
            
            await computeFrame(videoTrackCopy, audioTrackCopy, objectTrackCopy);
            preview.pause();
            console.log("preview seeked");
            preview.seeking = false;
            return;
        }


        //seekでない
        preview.playing = true;
        timer.start(startTime);
        preview.onStart();

        timer.onTimeUpdate = async function(time){
            preview.nowTime = time;

            //全ての再生が終了したら
            if(preview.nowTime > preview.length){
                preview.pause();
                preview.onEnd();

                preview.nowTime = 0;
                preview.onTimeUpdate();
                return;
            }

            await computeFrame(videoTrackCopy, audioTrackCopy, objectTrackCopy);
            preview.onTimeUpdate();
        }
        
    },


    //return: 何秒時点で止まったか
    pause: function(){

        timer.stop();
        timer.reset();
        
        //video elementの場合stop
        if(videoTrackCopy.length != 0 && videoTrackCopy[0].element.tagName == "VIDEO"){
            videoTrackCopy[0].element.pause();
        }

        if(audioTrackCopy.length != 0){
            audioTrackCopy[0].element.pause();
        }

        console.log("preview stopped");

        preview.playing = false;
        
        return preview.nowTime;
    },


    seekTo: async function(startTime){
        if(preview.seeking){
            return;
        }

        await preview.play(startTime, false, true);

        return;
    }
}


//------------------------------------------
//動画処理用のcanvas（ユーザーからは見えない）
const c_tmp = document.createElement("canvas");
c_tmp.setAttribute("width", config.encode.width);
c_tmp.setAttribute("height", config.encode.height);
const ctx_tmp = c_tmp.getContext("2d",{willReadFrequently: true});

async function computeFrame(videoTrack, audioTrack, effectTrack) {
    
    ctx_tmp.clearRect(0, 0, c_tmp.width, c_tmp.height);

    await processVideoTrack(videoTrack);

    //frameに対して動画のエフェクトをかけられる
    const imagedata = ctx_tmp.getImageData(0, 0, canvas.width, canvas.height);
    
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
        default:
            break;
    }


    await processAudioTrack(audioTrack);

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imagedata, 0, 0);

    processEffectTrack(effectTrack);
    
    // await wait(1);//chromeバグ対策
}


//-----------------------------------------------------
//  トラック処理
//(全体)：プロジェクト内の位置
//(内部)：そのElmの位置（どこを切り取るか）。※Image,objectには無い。

//per frame
async function processVideoTrack(videoTrack){

    let misalignment; //本来の位置とのずれ[s]

    if(videoTrack[0]!=undefined &&
        videoTrack[0].element.tagName == "VIDEO"
    ){
        misalignment = Math.abs(videoTrack[0].element.currentTime + videoTrack[0].overallStartTime - videoTrack[0].internalStartTime - preview.nowTime);
    }

    //今のelmが再生されていなければ
    if(
        videoTrack[0]!=undefined &&
        videoTrack[0].element.tagName == "VIDEO" &&
        videoTrack[0].element.paused == true &&
        preview.nowTime >= videoTrack[0].overallStartTime //いるのか微妙
    ){
        videoTrack[0].element.currentTime = Math.max(videoTrack[0].internalStartTime, preview.nowTime - videoTrack[0].overallStartTime);//startTime(内部)に飛ぶ
        videoAudioGain.gain.value = videoTrack[0].gain;//gain
        
        await videoTrack[0].element.play();
    }

    //play中かつズレていれば
    else if(
        videoTrack[0]!=undefined &&
        videoTrack[0].element.paused == false &&
        misalignment > preview.allowableMisalignment
    ){
        console.log("video misalignment: " + misalignment);
        timer.stop();
        videoTrack[0].element.currentTime = preview.nowTime - (videoTrack[0].overallStartTime - videoTrack[0].internalStartTime);
        await wait_seek(videoTrack[0].element);
        timer.start();
    }

    if( //endTimeを超えていたら
        videoTrack[0] != undefined &&
        preview.nowTime > videoTrack[0].overallEndTime
    ){
        if(videoTrack[0].element.tagName == "VIDEO"){
            videoTrack[0].element.pause();
        }

        videoTrack.shift();//次のobjへ
    }

    //毎フレーム描画
    if(videoTrack[0]!=undefined && preview.nowTime >= videoTrack[0].overallStartTime){
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

        //描画
        // ctx.drawImage(videoTrack[0].element, dx, dy, width, height);
        
    }
}


async function processAudioTrack(audioTrack){
    if(audioTrack[0]==undefined){
        return;
    }

    //本来の位置とのずれ[s]
    const misalignment = Math.abs(audioTrack[0].element.currentTime + audioTrack[0].overallStartTime - audioTrack[0].internalStartTime - preview.nowTime);

    //今のelmが再生されていなければ
    if(
        audioTrack[0].element.paused == true &&
        preview.nowTime >= audioTrack[0].overallStartTime //いるのか微妙
    ){
        audioTrack[0].element.currentTime = Math.max(audioTrack[0].internalStartTime, preview.nowTime - audioTrack[0].overallStartTime);//startTime(内部)に飛ぶ
        audioGain.gain.value = audioTrack[0].gain;

        await audioTrack[0].element.play();//awaitしたほうがいいかも
        // await wait_play(audioTrack[0].element);
    }

    //play中かつズレていれば
    else if(
        audioTrack[0].element.paused == false &&
        misalignment > preview.allowableMisalignment
    ){
        console.log("audio misalignment: " + misalignment);
        timer.stop();
        audioTrack[0].element.currentTime = preview.nowTime - (audioTrack[0].overallStartTime - audioTrack[0].internalStartTime);
        await wait_seek(audioTrack[0].element);
        timer.start();
    }


    if( //endTimeを超えていたら
        preview.nowTime > audioTrack[0].overallEndTime
    ){
        audioTrack[0].element.pause();
        audioTrack.shift();//次のobjへ
    }
}


function processEffectTrack(effectTrack){

    if(effectTrack[0]!=undefined && preview.nowTime > effectTrack[0].overallEndTime){ //endTimeを超えていたら
        effectTrack.shift();//次のobjへ
    }

    if(effectTrack[0]!=undefined && preview.nowTime >= effectTrack[0].overallStartTime){ //startTime以上なら
        //描画処理へ
        for(let i=0; i<effectTrack[0].effect.length; i++){//内部のeffectの長さ分
            effectTrack[0].effect[i].function(effectTrack[0].effect[i].arguments);
        }
    }

}


function wait_seek(elm){
    return new Promise(resolve=>{
        elm.addEventListener("seeked",()=>{
            resolve();
        });
    });
}

// function wait_play(elm){
//     return new Promise(resolve=>{
//         elm.addEventListener("play",()=>{
//             resolve();
//         });
//     });
// }

function wait(ms){
    return new Promise(resolve=>{
        setTimeout(() => {
            resolve();
        }, ms);
    });
}


export default preview;