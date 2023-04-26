import videoEditorCore from "../videoEditorCore.js";
import { videoTrack, audioTrack, effectTrack } from "./test_tracks.js";

const canvas = document.getElementById("canvas");
canvas.width = 400;
canvas.height = 300;

videoEditorCore.init(canvas);
videoEditorCore.videoTrack = videoTrack;
videoEditorCore.audioTrack = audioTrack;
videoEditorCore.effectTrack = effectTrack;

console.log(videoEditorCore);

document.getElementById("btn")
.addEventListener("click",()=>{
    videoEditorCore.preview.play();
});
