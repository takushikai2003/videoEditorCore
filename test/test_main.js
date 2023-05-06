import videoEditorCore from "../videoEditorCore.js";
import { videoTrack, audioTrack, effectTrack } from "./test_tracks.js";

const canvas = document.getElementById("canvas");
canvas.width = 400;
canvas.height = 300;

videoEditorCore.init(canvas);
videoEditorCore.videoTrack = videoTrack;
videoEditorCore.audioTrack = audioTrack;
videoEditorCore.effectTrack = effectTrack;

let startTime = 0;
document.getElementById("btn")
.addEventListener("click",()=>{
    if(videoEditorCore.preview.playing){
        //再生が停止した時間が返る
        startTime = videoEditorCore.preview.pause();
    }
    else{
        videoEditorCore.preview.play(startTime);
    }
});
