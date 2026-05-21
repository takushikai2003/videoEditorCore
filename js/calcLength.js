export function calcLength(videoTrack, audioTrack, effectTrack, keyframeEffectTrack){

    //previewLengthの値を決定
    let videoLength=0, effectLength=0, audioLength=0, keyframeEffectLength=0;

    if(videoTrack.length != 0){
        videoLength = videoTrack[videoTrack.length - 1].endTime;
    }
    if(effectTrack.length != 0){
        effectLength = effectTrack[effectTrack.length - 1].endTime;
    }
    if(audioTrack.length != 0){
        audioLength = audioTrack[audioTrack.length - 1].endTime;
    }
    if(keyframeEffectTrack.length != 0){
        keyframeEffectLength = keyframeEffectTrack[keyframeEffectTrack.length - 1].endTime;
    }

    return Math.max(videoLength, effectLength, audioLength, keyframeEffectLength);
}