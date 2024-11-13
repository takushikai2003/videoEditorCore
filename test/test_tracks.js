import { VideoClip, AudioClip, EffectClip, Effect, Keyframe, KeyframeEffect } from "./generateClip.js";
import { genAudioBuffer } from "./genAudioBuffer.js";
import { canvasEffects } from "../js/canvasEffects.js";

const videoSrc = "./media/ABCDE.mp4";
const videoElement = document.createElement("video");
videoElement.src = videoSrc;
await waitEvent(videoElement, "loadeddata");
videos["v0"] = {audioBuffer: await genAudioBuffer(videoSrc)};

document.getElementById("videostate")
.appendChild(videoElement);

const imageElement = document.createElement("img");
imageElement.src = "./media/mountain.jpg";
await waitEvent(imageElement, "load");

const audioSrc = "./media/HighwayStar.mp3";
const audioElement = document.createElement("audio");
audioElement.src = audioSrc;
await waitEvent(audioElement, "loadeddata");
audios["a0"] = {audioBuffer: await genAudioBuffer(audioSrc)}


const canvas = document.getElementById("main_canvas");

const offset = 2;//[s]
export const videoTrack = [
    new VideoClip({
        mediaId: "v0",
        element: videoElement,
        startTime: 0.0,
        endTime: videoElement.duration - offset,
        relativeStartTime: offset,
        gain: 1,
        filter: "gpu.sepia",
    }),
];

export const audioTrack = [
    new AudioClip({
        mediaId: "a0",
        element: audioElement,
        startTime: 0,
        endTime: 5,
        relativeStartTime: 0,
        gain: 1,
    }),
];

export const effectTrack = [
    new EffectClip({
        startTime:0,
        endTime:10,
        effects:[
            new Effect(
                canvasEffects.drawText,
                {
                    canvas: canvas,
                    text: "あああ",
                    size: 100,
                    positionX:"center",
                    positionY:"center",
                    backgroundColor:"red",
                    underline: "blue",
                    rotate: 30
                }
            )
        ]
    })
];

const keyframes = [
    new Keyframe(0, canvasEffects.drawText, {size:0, positionX:0}, {canvas:canvas, text: "あああ", positionY:"center",rotate: 0}),
    new Keyframe(3, canvasEffects.drawText, {size:100, positionX:50}, {canvas:canvas, text: "あああ", positionY:"center",rotate: 0}),
    new Keyframe(10, canvasEffects.drawText, {size:0, positionX:100}, {canvas:canvas, text: "あああ", positionY:"center",rotate: 0}),
];

export const keyframeEffectTrack = [
    new KeyframeEffect(keyframes, 0, 10)
];


function waitEvent(element, eventType){
    return new Promise(resolve=>{
        element.addEventListener(eventType,()=>{
            resolve();
        });
    });
}