export function processKeyframeEffectTrack(time, keyframeEffectTrack){

    if(keyframeEffectTrack[0] != undefined && time > keyframeEffectTrack[0].endTime){ //endTimeを超えていたら
        keyframeEffectTrack.shift();//次のKeyframeEffectへ
    }

    if(keyframeEffectTrack[0] == undefined){
        return;
    }

    // 次の要素のstartTimeがtimeを超えていたらそれより前の要素を削除する
    for(let i=0; i<keyframeEffectTrack[0].keyframes.length; i++){
        const keyframe = keyframeEffectTrack[0].keyframes[i];
        
        if(keyframe.startTime >= time){
            // 修正箇所：i - 1 が負数（-1）になるのを防ぎ、最低でも 0（slice(0) = 削除なし）になるようガード
            keyframeEffectTrack[0].keyframes = keyframeEffectTrack[0].keyframes.slice(Math.max(0, i - 1));
            break;
        }
    }

    //startTime以上なら、キーフレームの実行を開始する
    if(time >= keyframeEffectTrack[0].keyframes[0].startTime){
        const keyframe = keyframeEffectTrack[0].keyframes[0];
        const args = {};
        // 動的引数の値を計算して決定する
        keyframe.coefficients.forEach(obj=>{
            // f(t) = at + b
            args[obj.key] = obj.a * time + obj.b;
        });

        // 静的引数を結合
        Object.assign(args, keyframe.staticArguments);

        //描画処理へ
        keyframeEffectTrack[0].keyframes[0].function(args);
    }
}





// 再生前に一度だけ、各keyframeの数式係数を決定する
// (とりあえずlinearのみ)
export function compileKeyframeEffectTrack(keyframeEffectTrack){

    for(let i=0; i<keyframeEffectTrack.length; i++){
        for(let j=0; j<keyframeEffectTrack[i].keyframes.length; j++){
            const keyframe = keyframeEffectTrack[i].keyframes[j];
            const nextKeyframe = keyframeEffectTrack[i].keyframes[j+1];

            if(nextKeyframe == undefined){
                break;
            }

            // 係数保存用
            keyframe.coefficients = [];//{key,a,b}
            // linear
            // f(t) = at + b の係数a,bを決定する
            Object.entries(keyframe.dynamicArguments)
            .forEach(arr=>{
                const key = arr[0];
                const value = arr[1];
                const a = (nextKeyframe.dynamicArguments[key] - value) / (nextKeyframe.startTime - keyframe.startTime);
                const b = value - (a * keyframe.startTime);
                keyframe.coefficients.push({key: key, a: a, b: b});
            });
           
        }
    }

}
