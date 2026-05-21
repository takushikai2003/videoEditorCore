import { encoder } from "./js/encoder.js";
import { canvasEffects } from "./js/canvasEffects.js";
import { preview } from "./js/preview.js";
import { config } from "./config.js";

export const videoEditorCore = {};

function init(canvas){
    config.preview.width = canvas.width;
    config.preview.height = canvas.height;
    config.preview.canvas = canvas;

    config.encoder.canvas = canvas;

    preview.init(canvas);
    encoder.init(canvas);
    canvasEffects.init(config.preview.width, config.preview.height)
}

videoEditorCore.init = init;

videoEditorCore.videoTrack = [];
videoEditorCore.audioTrack = [];
videoEditorCore.effectTrack = [];
videoEditorCore.keyframeEffectTrack = [];

videoEditorCore.config = config;
videoEditorCore.preview = preview;
videoEditorCore.encoder = encoder;
videoEditorCore.canvasEffects = canvasEffects;


// 外部でTrackの値を変更するときは、この関数の使用を推奨
videoEditorCore.setVideoTrack = function(videoTrack){
    videoEditorCore.videoTrack = videoTrack;
    videoEditorCore.preview.calcLength();
}
videoEditorCore.setAudioTrack = function(audioTrack){
    videoEditorCore.audioTrack = audioTrack;
    videoEditorCore.preview.calcLength();
}
videoEditorCore.setEffectTrack = function(effectTrack){
    videoEditorCore.effectTrack = effectTrack;
    videoEditorCore.preview.calcLength();
}
videoEditorCore.setKeyframeEffectTrack = function(keyframeEffectTrack){
    videoEditorCore.keyframeEffectTrack = keyframeEffectTrack;
    videoEditorCore.preview.calcLength();
}