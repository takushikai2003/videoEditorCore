import { VideoClip, AudioClip } from "./generateClip.js";

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
        endTime: 5,
        relativeStartTime: 0,
        gain: 1,
    }),
];

export const audioTrack = [];

export const effectTrack = [];


function waitEvent(element, eventType){
    return new Promise(resolve=>{
        element.addEventListener(eventType,()=>{
            resolve();
        });
    });
}