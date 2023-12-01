// AudioContextオブジェクトを作成
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 静的ファイルのaudiobufferを作成する（テスト用）
export function genAudioBuffer(filepath){
    return new Promise((resolve, reject)=>{
        fetch(filepath)
            .then((response) => {
                // ReadableStreamオブジェクトをBlobオブジェクトに変換
                return response.blob();
            })
            .then((blob) => {
                // BlobオブジェクトをArrayBufferオブジェクトに変換
                return blob.arrayBuffer();
            })
            .then((arrayBuffer) => {
                // ArrayBufferオブジェクトをAudioBufferオブジェクトに変換
                return audioCtx.decodeAudioData(arrayBuffer);
            })
            .then((audioBuffer) => {
                resolve(audioBuffer);
            })
            .catch((error) => {
                reject(error);
            }
        );

    });
}