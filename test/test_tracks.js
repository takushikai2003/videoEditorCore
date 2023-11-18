import { VideoClip, AudioClip, EffectClip, Effect, Keyframe, KeyframeEffect } from "./generateClip.js";
import canvasEffects from "../js/canvasEffects.js";

const videoElement = document.createElement("video");
videoElement.src = "./media/720p.mp4";
await waitEvent(videoElement, "loadeddata");
const imageElement = document.createElement("img");
imageElement.src = "./media/mountain.jpg";
await waitEvent(imageElement, "load");
const audioElement = document.createElement("audio");
audioElement.src = "./media/HighwayStar.mp3";
await waitEvent(audioElement, "loadeddata");

export const videoTrack = [
    new VideoClip({
        element: videoElement,
        startTime: 0,
        endTime: 10,
        relativeStartTime: 0,
        gain: 1,
        filter: "gpu.sepia",
    }),
];

export const audioTrack = [];

export const effectTrack = [
    new EffectClip({
        startTime:0,
        endTime:10,
        effects:[
            new Effect(
                canvasEffects.addText,
                {
                    text: "あああ",
                    size: 100,
                    positionX:"center",
                    positionY:"center",
                    backgroundColor:"red",
                    underLine: "blue",
                    rotate: 30
                }
            )
        ]
    })
];

const keyframes = [
    new Keyframe(0, canvasEffects.addText, {size:0, positionX:0}, {text: "あああ", positionY:"center",rotate: 0}),
    new Keyframe(3, canvasEffects.addText, {size:100, positionX:50}, {text: "あああ", positionY:"center",rotate: 0}),
    new Keyframe(10, canvasEffects.addText, {size:0, positionX:100}, {text: "あああ", positionY:"center",rotate: 0}),
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