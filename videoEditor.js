
import encoder from "./js/encoder.js";
import canvasEffects from "./js/canvasEffects.js";
import preview from "./js/preview.js";
import config from "./config.js";

const videoEditor = {};

videoEditor.canvas;
videoEditor.ctx;

function init(canvas){
    preview.init(canvas);
    encoder.init(canvas);
}

videoEditor.init = init;

videoEditor.videoTrack = [];
videoEditor.audioTrack = [];
videoEditor.objectTrack = [];

videoEditor.config = config;
videoEditor.preview = preview;
videoEditor.encoder = encoder;
videoEditor.canvasEffects = canvasEffects;

export default videoEditor;