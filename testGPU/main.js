const canavas = document.getElementById("canvas");
const ctx = canavas.getContext("2d");
const canavas2 = document.getElementById("canvas2");
const ctx2 = canavas2.getContext("2d");

const lenaGPU = new LenaGPU({width: canavas.width, height: canavas.height});

const imageElement = document.createElement("img");
imageElement.src = "./media/mountain.jpg";
await waitEvent(imageElement, "load");

ctx.drawImage(imageElement, 0, 0, 300, 400);

lenaGPU.sepia(canavas, canavas2);

function waitEvent(element, eventType){
    return new Promise(resolve=>{
        element.addEventListener(eventType,()=>{
            resolve();
        });
    });
}