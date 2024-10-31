import { VideoClip, AudioClip, EffectClip, Effect, Keyframe, KeyframeEffect } from "./generateClip.js";
import { genAudioBuffer } from "./genAudioBuffer.js";
import canvasEffects from "../js/canvasEffects.js";

const videoElement = document.createElement("video");
videoElement.src = "./media/ABCDE.mp4";
await waitEvent(videoElement, "loadeddata");
videos["v0"] = {audioBuffer: await genAudioBuffer("./media/720p.mp4")};

document.getElementById("videostate")
.appendChild(videoElement);

const imageElement = document.createElement("img");
imageElement.src = "./media/mountain.jpg";

const audioElement = document.createElement("audio");
audioElement.src = "./media/HighwayStar.mp3";
await waitEvent(audioElement, "loadeddata");
await waitEvent(imageElement, "load");
audios["a0"] = {audioBuffer: await genAudioBuffer("./media/HighwayStar.mp3")}


export const videoTrack = [
    new VideoClip({
        mediaId: "v0",
        element: videoElement,
        startTime: 0.0,
        endTime: 4.1,
        relativeStartTime: 2,
        gain: 1,
        // filter: "gpu.sepia",
    }),
];

export const audioTrack = [
    // new AudioClip({
    //     mediaId: "a0",
    //     element: audioElement,
    //     startTime: 0,
    //     endTime: 5,
    //     relativeStartTime: 0,
    //     gain: 1,
    // }),
];

export const effectTrack = [
    // new EffectClip({
    //     startTime:0,
    //     endTime:10,
    //     effects:[
    //         new Effect(
    //             canvasEffects.addText,
    //             {
    //                 text: "あああ",
    //                 size: 100,
    //                 positionX:"center",
    //                 positionY:"center",
    //                 backgroundColor:"red",
    //                 underLine: "blue",
    //                 rotate: 30
    //             }
    //         )
    //     ]
    // })
];

const keyframes = [
    new Keyframe(0, canvasEffects.addText, {size:0, positionX:0}, {text: "あああ", positionY:"center",rotate: 0}),
    new Keyframe(3, canvasEffects.addText, {size:100, positionX:50}, {text: "あああ", positionY:"center",rotate: 0}),
    new Keyframe(10, canvasEffects.addText, {size:0, positionX:100}, {text: "あああ", positionY:"center",rotate: 0}),
];

export const keyframeEffectTrack = [
    // new KeyframeEffect(keyframes, 0, 10)
];


function waitEvent(element, eventType){
    return new Promise(resolve=>{
        element.addEventListener(eventType,()=>{
            resolve();
        });
    });
}