class Clip {
    constructor(startTime, endTime) {
        this.id = Clip.nextId();
        this.startTime = startTime;
        this.endTime = endTime;
    }

    static nextId() {
        if (!this.latestId) {
            this.latestId = 1;
        } else {
            this.latestId++;
        }
        return this.latestId;
    }
}


export class VideoClip extends Clip{
    constructor({
        element,
        startTime,
        endTime,
        relativeStartTime,
        relativeEndTime,
        gain,
    }){
        super(startTime, endTime);
        this.element = element;
        this.relativeStartTime = relativeStartTime;
        this.relativeEndTime = relativeEndTime;
        this.gain = gain;
    }
}


export class AudioClip extends Clip{
    constructor({
        element,
        startTime,
        endTime,
        relativeStartTime,
        relativeEndTime,
        gain,
    }){
        super(startTime, endTime);
        this.element = element;
        this.relativeStartTime = relativeStartTime;
        this.relativeEndTime = relativeEndTime;
        this.gain = gain;
    }
}


// export class EffectClip extends Clip{
//     constructor({
//         fn,
//         startTime,
//         endTime
//     }){
//         super(startTime, endTime);
//     }
// }
