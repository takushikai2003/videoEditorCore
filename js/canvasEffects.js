//canvas effects
//引数、戻り値が、canvasやctxのときと、data(RGBA)のときがあるので注意
//どれを取るかは、利用法を考えた上での最速を。

export const canvasEffects = {
    init(width, height){
        const LENA_GPU = new LenaGPU({width: width, height: height});

        // with lena-GPU
        canvasEffects.gpu = {
            bigGaussian: LENA_GPU.bigGaussian.bind(LENA_GPU),
            blue       : LENA_GPU.blue.bind(LENA_GPU),
            flip       : LENA_GPU.flip.bind(LENA_GPU),
            gaussian   : LENA_GPU.gaussian.bind(LENA_GPU),
            grayscale  : LENA_GPU.grayscale.bind(LENA_GPU),
            green      : LENA_GPU.green.bind(LENA_GPU),
            highpass   : LENA_GPU.highpass.bind(LENA_GPU),
            invert     : LENA_GPU.invert.bind(LENA_GPU),
            laplacian  : LENA_GPU.laplacian.bind(LENA_GPU),
            lowpass3   : LENA_GPU.lowpass3.bind(LENA_GPU),
            lowpass5   : LENA_GPU.lowpass5.bind(LENA_GPU),
            mirror     : LENA_GPU.mirror.bind(LENA_GPU),
            prewittHorizontal: LENA_GPU.prewittHorizontal.bind(LENA_GPU),
            prewittVertical: LENA_GPU.prewittVertical.bind(LENA_GPU),
            red        : LENA_GPU.red.bind(LENA_GPU),
            roberts    : LENA_GPU.roberts.bind(LENA_GPU),
            sepia      : LENA_GPU.sepia.bind(LENA_GPU),
            sharpen    : LENA_GPU.sharpen.bind(LENA_GPU),
            sobelHorizontal: LENA_GPU.sobelHorizontal.bind(LENA_GPU),
            sobelVertical: LENA_GPU.sobelVertical.bind(LENA_GPU),
        }
    },
    addText: addText,
    addImage: addImage,
    monochrome: monochrome,
    sepia: sepia,
    negativeInverte: negativeInverte,
}

//canvasにテキストを追加
//TODO: 改行対応
// fontsize:autoやunderなどの複雑な処理はUIに任せるか？
// (↑単純に中心なら良いが、そこから少しずらすなどするならプロパティが増える)
function addText(config){
    let canvas = config.canvas;
    const text = config.text;
    if(canvas == undefined){
        canvas = document.getElementById("main_canvas");
    }
    const ctx = canvas.getContext("2d");

    // config.size = config.size;//str
    config.font = config.font || "Arial";
    config.color = config.color || "#000000";
    config.bold = (config.bold==true)?"bold":"";
    config.italic = (config.italic==true)?"italic":"";
    config.positionX = config.positionX || 0;
    config.positionY = config.positionY || 0;
    config.underLine = config.underLine || false;
    config.backgroundColor = config.backgroundColor || false;

    let size;


    if(config.size == "auto"){
        
        //はじめのフォント(pt)
        let font_size = 100;
        //textがcanvas幅いっぱいになると見にくいので、canvas幅の2/3をMAXに
        const textWidthMAX = canvas.width*2/3;

        const _bold = (config.bold==true)?"bold":"";
        const _italic = (config.italic==true)?"italic":"";

        while(true){
            ctx.font = _italic+" "+_bold+" "+font_size+"pt"+" "+config.font;
            // ctxFontEdited = true;

            const textWidth = ctx.measureText(text).width;

            if(textWidth <= textWidthMAX){
                // console.log("size: "+font_size+"pt");
                break;
            }
            else{
                //sizeを1ptずつ小さくしながら比較していく
                font_size--;
            }
        }

        size = font_size + "pt";

    }

    else{
        size = config.size + "pt";
    }

    ctx.save();
    ctx.font = config.italic+" "+config.bold+" "+size+" "+config.font;
    ctx.textAlign = "start";
    ctx.textBaseline = "top";

    const textWidth = ctx.measureText(text).width;
    const mesure = ctx.measureText(text);
    const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

    let positionX = config.positionX;
    let positionY = config.positionY;

    if(config.positionX == "left"){
        positionX = 0;
    }
    else if(config.positionX == "center"){
        positionX = (canvas.width - textWidth)/2;
    }
    else if(config.positionX == "right"){
        positionX = canvas.width - textWidth;
    }

    if(config.positionY == "above"){
        positionY = textHeight*1.5;
    }
    else if(config.positionY == "center"){
        positionY = (canvas.height/2) + (textHeight/2);
    }
    else if(config.positionY == "under"){
        positionY = canvas.height; // - 30;// -30で下からちょっと上へ
    }

    // 回転の中心位置を計算（画像の中心を回転中心にする）
    const cx = positionX + textWidth/2;
    const cy = positionY + textHeight/2;
    const rad = config.rotate/180*Math.PI
    // 画像を回転
    ctx.setTransform(Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad),cx-cx*Math.cos(rad)+cy*Math.sin(rad),cy-cx*Math.sin(rad)-cy*Math.cos(rad));

    //背景色
    if(config.backgroundColor != false){
        const mesure = ctx.measureText(text);
        const textWidth = mesure.width;
        const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

        //ピッタリすぎるので5px広く
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(positionX - 5, positionY - 5, textWidth + 10, textHeight + 10);
    }

    //アンダーライン
    if(config.underLine != false){

        const mesure = ctx.measureText(text);
        const textWidth = mesure.width;
        const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

        ctx.beginPath();
        ctx.moveTo(positionX, positionY + textHeight);
        ctx.lineTo(positionX + textWidth, positionY + textHeight);
        ctx.strokeStyle = config.underLine;
        ctx.stroke();
    }

    ctx.fillStyle = config.color;
    ctx.fillText(text, positionX, positionY);
    ctx.restore();
}


function addImage({canvas,image,config}){
    const ctx = canvas.getContext("2d");
    
    config.positionX = config.positionX || 0;
    config.positionY = config.positionY || 0;
    config.width = config.width || image.width;
    config.height = config.height || image.height;
    
    ctx.drawImage(image,config.positionX,config.positionY,config.width,config.height);
}

//canvasデータにフィルタをかける

//モノクロ
function monochrome(data){
    for (let i = 0; i < data.length; i+=4) {
        const g = data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722;
        data[i] = data[i+1] = data[i+2] = g;
        // data[i+3]に格納されたα値は変更しない
    }

    return data;
}


//セピア(重いので動画には非推奨)
function sepia(data){
    for (let i=0; i<data.length; i++)
    {
        const red = data[ i*4 ];
        const green = data[ i*4 + 1 ];
        const blue = data[ i*4 + 2 ];

        const g = parseInt(( red*30 + green*59 + blue*11 ) / 100);

        data[ i*4 ] = parseInt( (g/255)*240 );
        data[ i*4 + 1 ] = parseInt( (g/255)*200 );
        data[ i*4 + 2 ] = parseInt( (g/255)*145 );
    }
}



//ネガ反転
function negativeInverte(data){
    for (var i = 0; i < data.length; i+=4) {
        data[i] = 255 - data[i];
        data[i+1] = 255 - data[i+1];
        data[i+2] = 255 - data[i+2];
        // data[i+3]に格納されたα値は変更しない
    }
    
    return data;
}


//TODO:
//クロマキー合成（グリーンバック）