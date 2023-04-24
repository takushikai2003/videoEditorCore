//canvas effects
//引数、戻り値が、canvasやctxのときと、data(RGBA)のときがあるので注意
//どれを取るかは、利用法を考えた上での最速を。

const canvasEffects = {
    addText: addText,
    addImage: addImage,
    monochrome: monochrome,
    sepia: sepia,
    negativeInverte: negativeInverte,
}

//canvasにテキストを追加
//TODO: rotate 改行対応
function addText({canvas,text,config}){
    if(canvas == undefined){
        canvas = document.getElementById("main_canvas");
    }
    const ctx = canvas.getContext("2d");

    config.size = config.size;//str
    config.font = config.font || "Arial";
    config.color = config.color || "#000000";
    config.bold = (config.bold==true)?"bold":"";
    config.italic = (config.italic==true)?"italic":"";
    config.positionX = config.positionX || 0;
    config.positionY = config.positionY || 0;
    config.underLine = config.underLine || false;
    config.backgroundColor = config.backgroundColor || false;

    let ctxFontEdited = false; //ctx.fontを編集したかのフラグ

    if(config.size == "auto"){
        console.log("size: auto");
        //まず20ptで試してみる
        config.size = "20pt";

        //はじめのフォント(pt)
        let size = 30;
        let flg = false;
        while(flg == false){
            ctx.font = config.italic+" "+config.bold+" "+config.size+" "+config.font;
            ctxFontEdited = true;

            let textWidth = ctx.measureText(text).width;
            //textがcanvas幅いっぱいになると見にくいので、canvas幅の2/3をMAXに
            const textWidthMAX = canvas.width*2/3;
            if(textWidth <= textWidthMAX){
                flg = true;
                console.log("size: "+size+"pt");
            }
            else{
                //sizeを1ptずつ小さくしながら比較していく
                size--;
                config.size = size + "pt";
            }
        }

    }

    if(config.positionX == "center"){
        console.log("positionX: center");

        if(ctxFontEdited == false){
            ctx.font = config.italic+" "+config.bold+" "+config.size+" "+config.font;
        }

        const textWidth = ctx.measureText(text).width;
        config.positionX = (canvas.width - textWidth)/2;
    }

    if(config.positionY == "under"){
        console.log("positionY: under");

        const mesure = ctx.measureText(text);
        const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

        config.positionY = canvas.height - textHeight - 30;// -30で下からちょっと上へ
    }

    //アンダーライン
    if(config.underLine != false){
        console.log("underLine");

        const mesure = ctx.measureText(text);
        const textWidth = mesure.width;
        const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

        ctx.beginPath();
        ctx.moveTo(config.positionX, config.positionY + textHeight);
        ctx.lineTo(config.positionX + textWidth, config.positionY + textHeight);
        ctx.strokeStyle = config.underLine;
        ctx.stroke();
    }

    //背景色
    if(config.backgroundColor != false){
        // let txw2 = ctx.measureText(text);

        const mesure = ctx.measureText(text);
        const textWidth = mesure.width;
        const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

        //ピッタリすぎるので5px広く
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(config.positionX - 5, config.positionY - 5, textWidth + 10, textHeight + 10);
    }


    ctx.font = config.italic+" "+config.bold+" "+config.size+" "+config.font;
    ctxFontEdited = true;
    ctx.textAlign = "start";
    ctx.textBaseline = "top";

    ctx.fillStyle = config.color;
    ctx.fillText(text, config.positionX, config.positionY);
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
//クロマキー合成（グリーンバッグ）



export default canvasEffects;