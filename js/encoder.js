import videoEditor from "../videoEditor.js";

let canvas;
let ctx;

const FPS = 25;

const encoder = {
    init: function(_canvas){
        canvas = _canvas;
        ctx = _canvas.getContext("2d");
    },
    length: 0,
    frames: 0,
    progress: 0,

    status: "none", //none,start,finished
    onStatusChange: function(){},
    onProgress: function(){},

    encode: encode,

    cancel: function(){//未
        //progressを0に
    },

}


//----------------------------------------------------------------
function encode(encodeType){

    const preview = videoEditor.preview;

    encoder.status = "start";
    encoder.onStatusChange(encoder.status);

    const encodingStartTime = performance.now();//[ms]
    console.log("encoding start");
    
    console.log(preview);

    preview.onAudioStreamAvailable = function(stream){
        
        const canvasStream = canvas.captureStream(FPS);
        const videoAudioStream = stream;

        canvasStream.addTrack(videoAudioStream.getAudioTracks()[0]);

        // const [videoTrack] = canvasStream.getVideoTracks();
        // const [audioTrack] = videoAudioStream.getAudioTracks();

        // const combinedStream = new MediaStream([videoTrack, audioTrack]);

        const mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: "video/webm;codecs=vp8",
            // audioBitsPerSecond: 16 * 1000
        });

        const chunks = [];
        mediaRecorder.addEventListener("dataavailable", function(ele) {
            if(ele.data.size > 0){
                chunks.push(ele.data);
            }
        });

        mediaRecorder.addEventListener("stop", function() {
            const blob = new Blob(chunks);
            console.log(encoder.length*1000);

            getSeekableBlob(blob , function(fixedBlob){
                const url = URL.createObjectURL(fixedBlob);
                download(url, "test.webm");
            });
        });


        // let interval;
        preview.onStart = function(){
            encoder.length = preview.length;//[s]
            mediaRecorder.start();

            // interval = setInterval(() => {
            //     encoder.progress = Math.floor((performance.now() - encodingStartTime)/10 / preview.length);
            //     encoder.onProgress(encoder.progress);
            // }, 1000);

            preview.onStart = null;
        }

        preview.onEnd = function(){
            // clearInterval(interval);
            mediaRecorder.stop();
            encoder.status = "finished";
            encoder.onStatusChange(encoder.status);

            preview.onEnd = null;
        }


        function getSeekableBlob(inputBlob, callback) {
            // EBML.js copyrights goes to: https://github.com/legokichi/ts-ebml
            if (typeof EBML === "undefined") {
                throw new Error("Please link: https://www.webrtc-experiment.com/EBML.js");
            }
        
            const reader = new EBML.Reader();
            const decoder = new EBML.Decoder();
            const tools = EBML.tools;
        
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                const ebmlElms = decoder.decode(this.result);
                ebmlElms.forEach(function(element) {
                    reader.read(element);
                });
                reader.stop();
                const refinedMetadataBuf = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues);
                const body = this.result.slice(reader.metadataSize);
                const newBlob = new Blob([refinedMetadataBuf, body], {
                    type: "video/webm"
                });
        
                callback(newBlob);
            };
            fileReader.readAsArrayBuffer(inputBlob);
        }
        
    }


    preview.play(0, true);
}

//便利グッズ---------------------------------------
// バグ対策 https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome
function download(url, fileName){
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName || "download";
    anchor.click();
    anchor.remove();
}


export default encoder;