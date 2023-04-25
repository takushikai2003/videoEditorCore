
import encoder from "./js/encoder.js";
import canvasEffects from "./js/canvasEffects.js";
import preview from "./js/preview.js";
import config from "./config.js";

const videoEditorCore = {};

videoEditorCore.canvas;
videoEditorCore.ctx;

function init(canvas){
    config.preview.width = canvas.width;
    config.preview.height = canvas.height;
    config.preview.canvas = canvas;

    config.encoder.canvas = canvas;

    preview.init();
    encoder.init();
}

videoEditorCore.init = init;

videoEditorCore.videoTrack = [];
videoEditorCore.audioTrack = [];
videoEditorCore.effectTrack = [];

videoEditorCore.config = config;
videoEditorCore.preview = preview;
videoEditorCore.encoder = encoder;
videoEditorCore.canvasEffects = canvasEffects;

export default videoEditorCore;