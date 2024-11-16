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


const effects = [];
const x_positions = ["left", "center", "right"];
const y_positions = ["above", "center", "under"];
for(const x of x_positions){
    for(const y of y_positions){
        const effect = new Effect(
            canvasEffects.drawText,
                {
                    canvas: canvas,
                    text: `あ ${x} ${y} g`,
                    size: 10,
                    positionX: x,
                    positionY: y,
                    backgroundColor: "red",
                    underline: "blue",
                    rotate: 0,
                    color: "yellow",

                    gradation_enable: true,
                    gradation_arr: ["red", "green", "yellow"]
                }
        );

        effects.push(effect);
    }
}

export const effectTrack = [
    new EffectClip({
        startTime:0,
        endTime:10,
        effects:effects,
    })
];

const keyframes = [
    new Keyframe(0, canvasEffects.drawText, {rotate:0}, {underline:"green", size: 50, positionX:"center", canvas:canvas, text: "あああabgp", positionY:"center"}),
    new Keyframe(3, canvasEffects.drawText, {rotate:90}, {underline:"green", size: 50, positionX:"center", canvas:canvas, text: "あああabgp", positionY:"center"}),
    new Keyframe(10, canvasEffects.drawText, {rotate:180}, {underline:"green", size: 50, positionX:"center", canvas:canvas, text: "あああabgp", positionY:"center"}),
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