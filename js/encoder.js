import videoEditorCore from "../videoEditorCore.js";
import { videoEditorEncoder } from "../videoEditorEncoder/videoEditorEncoder.js";
const canvas = document.getElementById("main_canvas");
const ctx = canvas.getContext("2d");

// videoEditorEncoder側はまだ30固定
const FPS = 30;

const encoder = {
    length: 0,
    frames: 0,
    progress: 0,

    status: "none", //none,start,finished
    onStatusChange: function(){},
    onProgress: function(){},

    encode: encode,

    cancel: function(){//未
        //progressを0に
    },

}


// encoder.encode()は、makeTrackなどをした上で呼ぶ必要がある
//----------------------------------------------------------------
async function encode(){

    encoder.status = "start";
    encoder.onStatusChange(encoder.status);

    const encodingStartTime = performance.now();//[ms]
    console.log("encoding start");

    const length = videoEditorCore.preview.length;
    const sampleRate = new AudioContext().sampleRate;

    console.log("merging audio buffers");
    videoEditorEncoder.init({
        sampleRate: sampleRate,
        videoTrack: videoEditorCore.videoTrack,
        length: length,
        audioTrack:videoEditorCore.audioTrack,
        width: canvas.width,
        height: canvas.height
    })
    .then(async()=>{
        console.log("writing video frames");
        const frameLen = Math.floor(length*FPS);
        for(let i=0; i<frameLen; i++){
            await videoEditorCore.preview.seekTo(i/FPS, true);// seek
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
        download(url, "test.mp4");
        encoder.status = "finished";
        encoder.onStatusChange(encoder.status);
        console.log(`encoding finished in ${(performance.now() - encodingStartTime)/1000}s`);
    })
    .catch(e=>{
        console.error(e);
        alert(e);
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


export default encoder;