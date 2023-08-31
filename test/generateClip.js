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
        filter
    }){
        super(startTime, endTime);
        this.element = element;
        this.relativeStartTime = relativeStartTime;
        this.relativeEndTime = relativeEndTime;
        this.gain = gain;
        this.filter = filter;
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


export class EffectClip extends Clip{
    constructor({
        startTime,
        endTime,
        effects,
    }){
        super(startTime, endTime);
        this.effect = effects;
    }
}


export class Effect{
    constructor(_function, _arguments){
        this.function = _function,
        this.arguments = _arguments
    }
}


export class Keyframe{
    constructor(startTime, _function, dynamicArguments, staticArguments){
        this.function = _function;
        this.startTime = startTime;
        this.staticArguments = staticArguments;
        this.dynamicArguments = dynamicArguments;
    }
}


export class KeyframeEffect{
    constructor(keyframes, startTime, endTime){
        this.keyframes = keyframes;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}