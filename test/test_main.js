import videoEditorCore from "../videoEditorCore.js";
import { videoTrack, audioTrack, effectTrack } from "./test_tracks.js";

const canvas = document.getElementById("canvas");
canvas.width = 400;
canvas.hight = 300;

videoEditorCore.init(canvas);

console.log(videoEditorCore);

videoEditorCore.preview.play();