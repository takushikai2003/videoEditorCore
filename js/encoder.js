import { videoEditorCore } from "../videoEditorCore.js";
import { videoEditorEncoder } from "../videoEditorEncoder/videoEditorEncoder.js";
import { calcLength } from "./calcLength.js";
import { canvasEffects } from "./canvasEffects.js";
import { processKeyframeEffectTrack, compileKeyframeEffectTrack } from "./processKeyframeEffectTrack.js";


// メイン描画canvass（エンコードなのでユーザーからは見えない）
let canvas, ctx;
//動画処理用のcanvas（ユーザーからは見えない）
const c_tmp = document.createElement("canvas");
const ctx_tmp = c_tmp.getContext("2d");

// videoEditorEncoder側はまだ30固定
const FPS = 30;

export const encoder = {
    length: 0,
    frames: 0,
    progress: 0,

    status: "none", //none,start,finished,error
    onStatusChange: function(){},
    onProgress: function(){},


    init: function(_canvas){
        canvas = _canvas;
        ctx = canvas.getContext("2d");
        canvas.width = canvas.width;
        canvas.height = canvas.height;
        c_tmp.width = canvas.width;
        c_tmp.height = canvas.height;
    },

    encode: encode,

    cancel: function(){//未
        //progressを0に
    },

}



function prepareTracksForEncoder(){
    // エンコーダ用のトラックの深いコピー。
    const videoTrackCopy = videoEditorCore.videoTrack.map(list=>({...list}));
    const audioTrackCopy = videoEditorCore.audioTrack.map(list=>({...list}));
    const effectTrackCopy = videoEditorCore.effectTrack.map(list=>({...list}));
    const keyframeEffectTrackCopy = videoEditorCore.keyframeEffectTrack.map(list=>({...list}));


    compileKeyframeEffectTrack(keyframeEffectTrackCopy);
    
    return { videoTrackCopy, audioTrackCopy, effectTrackCopy, keyframeEffectTrackCopy };
}

//------------------------------------------
async function computeFrameForEncoder(time, videoTrack, effectTrack, keyframeEffectTrack) {
    
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
    

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imagedata, 0, 0);

    processEffectTrack(time, effectTrack);

    processKeyframeEffectTrack(time, keyframeEffectTrack);
    
}


//-----------------------------------------------------
//  トラック処理
//(全体)：プロジェクト内の位置
//(内部)：そのElmの位置（どこを切り取るか）。※Image,effectには無い。

//per frame
async function processVideoTrack(time, videoTrack){
    if(
        videoTrack[0] != undefined &&
        videoTrack[0].element.tagName == "VIDEO" &&
        // videoTrack[0].element.paused == true &&
        time >= videoTrack[0].startTime //いるのか微妙
    ){ 
        videoTrack[0].element.currentTime = time - (videoTrack[0].startTime - videoTrack[0].relativeStartTime);
        await wait_seek(videoTrack[0].element);
    }

    if( //endTimeを超えていたら
        videoTrack[0] != undefined &&
        time > videoTrack[0].endTime
    ){
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


// encoder.encode()は、makeTrackなどをした上で呼ぶ必要がある
//----------------------------------------------------------------
async function encode(fileName){

    encoder.status = "start";
    encoder.onStatusChange(encoder.status);

    const encodingStartTime = performance.now();//[ms]
    console.log("encoding start");

    const tracks = prepareTracksForEncoder();

    const length = calcLength(tracks.videoTrackCopy, tracks.audioTrackCopy, tracks.effectTrackCopy, tracks.keyframeEffectTrackCopy);
    const sampleRate = new AudioContext().sampleRate;

    console.log("merging audio buffers");
    videoEditorEncoder.init({
        sampleRate: sampleRate,
        videoTrack: tracks.videoTrackCopy,
        length: length,
        audioTrack: tracks.audioTrackCopy,
        width: canvas.width,
        height: canvas.height
    })
    .then(async()=>{
        console.log("writing video frames");
        const frameLen = Math.floor(length*FPS);
        for(let i=0; i<frameLen; i++){
            // await videoEditorCore.preview.seekTo(i/FPS, true);// seek
            await computeFrameForEncoder(i/FPS, tracks.videoTrackCopy, tracks.effectTrackCopy, tracks.keyframeEffectTrackCopy);
            const isLastFrame = i == frameLen - 1;
            videoEditorEncoder.addFrame(canvas, isLastFrame);
    
            const progress = Math.floor((i / frameLen) * 100);
            if(progress != encoder.progress){
                encoder.progress = Math.floor(progress);
                console.log(encoder.progress + "%");
                encoder.onProgress(encoder.progress);
            }
            
        }
    
        const blob = await videoEditorEncoder.finalize();
        const url = URL.createObjectURL(blob);
        download(url, `${fileName}.mp4`);
        encoder.status = "finished";
        encoder.onStatusChange(encoder.status);
        console.log(`encoding finished in ${(performance.now() - encodingStartTime)/1000}s`);
    })
    .catch(e=>{
        encoder.status = "error";
        encoder.onStatusChange(encoder.status);
        console.error(e);
        alert(e);
        console.error(e);
    });

}

//便利グッズ---------------------------------------
function download(url, fileName){
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName || "download";
    anchor.click();
    anchor.remove();
}