export class Timer{
    constructor(){
        this.time = 0;
        this.onTimeUpdate = function(){};
        this.animationframeId;
        this.started = false;
    }

    start(startTime=0){

        if(!this.started){
            this.time = startTime;
            this.started = true;
        }
        
        let beforeTime = performance.now();

        const _this = this;
    
        function timeUpdate(){
            _this.animationframeId = requestAnimationFrame(timeUpdate);
    
            const nowTime = performance.now();
            const deltaTime = (nowTime - beforeTime)/1000;
            _this.time += deltaTime;//[秒]
    
            _this.onTimeUpdate(_this.time);
            
            beforeTime = nowTime;
        }
        timeUpdate();
    }

    stop(){
        if(!this.started){
            return;
        }
        cancelAnimationFrame(this.animationframeId);
    }

    reset(){
        this.stop();
        this.started = false;
    }
}