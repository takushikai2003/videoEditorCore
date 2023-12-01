import videoEditorCore from "../videoEditorCore.js";
import { videoTrack, audioTrack, effectTrack, keyframeEffectTrack } from "./test_tracks.js";

const canvas = document.getElementById("main_canvas");
canvas.width = 400;
canvas.height = 300;

videoEditorCore.init(canvas);
videoEditorCore.videoTrack = videoTrack;
videoEditorCore.audioTrack = audioTrack;
videoEditorCore.effectTrack = effectTrack;
videoEditorCore.keyframeEffectTrack = keyframeEffectTrack;

// 再生
let startTime = 0;
document.getElementById("play")
.addEventListener("click",()=>{
    if(videoEditorCore.preview.playing){
        //再生が停止した時間が返る
        startTime = videoEditorCore.preview.pause();
    }
    else{
        videoEditorCore.preview.play(startTime);
    }
});


// 書き出し
document.getElementById("encode")
.addEventListener("click",()=>{
    videoEditorCore.encoder.encode();
});