//canvasにテキストを追加
//TODO: 改行対応
// fontsize:autoやunderなどの複雑な処理はUIに任せるか？
// (↑単純に中心なら良いが、そこから少しずらすなどするならプロパティが増える)
export function drawText(config) {
    let canvas = config.canvas;
    const text = config.text;
    if (canvas == undefined) {
        canvas = document.getElementById("main_canvas");
    }
    const ctx = canvas.getContext("2d");

    // config.size = config.size;//str
    config.font = config.font || "Arial";
    config.color = config.color || "#000000";
    config.bold = (config.bold == true) ? "bold" : "";
    config.italic = (config.italic == true) ? "italic" : "";
    config.positionX = config.positionX || 0;
    config.positionY = config.positionY || 0;
    config.underLine = config.underLine || false;
    config.backgroundColor = config.backgroundColor || false;

    let size;


    if (config.size == "auto") {

        //はじめのフォント(pt)
        let font_size = 100;
        //textがcanvas幅いっぱいになると見にくいので、canvas幅の2/3をMAXに
        const textWidthMAX = canvas.width * 2 / 3;

        const _bold = (config.bold == true) ? "bold" : "";
        const _italic = (config.italic == true) ? "italic" : "";

        while (true) {
            ctx.font = _italic + " " + _bold + " " + font_size + "pt" + " " + config.font;
            // ctxFontEdited = true;
            const textWidth = ctx.measureText(text).width;

            if (textWidth <= textWidthMAX) {
                // console.log("size: "+font_size+"pt");
                break;
            }
            else {
                //sizeを1ptずつ小さくしながら比較していく
                font_size--;
            }
        }

        size = font_size + "pt";

    }

    else {
        size = config.size + "pt";
    }

    ctx.save();
    ctx.font = config.italic + " " + config.bold + " " + size + " " + config.font;
    ctx.textAlign = "start";
    ctx.textBaseline = "top";

    const textWidth = ctx.measureText(text).width;
    const mesure = ctx.measureText(text);
    const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

    let positionX = config.positionX;
    let positionY = config.positionY;

    if (config.positionX == "left") {
        positionX = 0;
    }
    else if (config.positionX == "center") {
        positionX = (canvas.width - textWidth) / 2;
    }
    else if (config.positionX == "right") {
        positionX = canvas.width - textWidth;
    }

    if (config.positionY == "above") {
        positionY = textHeight * 1.5;
    }
    else if (config.positionY == "center") {
        positionY = (canvas.height / 2) + (textHeight / 2);
    }
    else if (config.positionY == "under") {
        positionY = canvas.height; // - 30;// -30で下からちょっと上へ
    }

    // 回転の中心位置を計算（画像の中心を回転中心にする）
    const cx = positionX + textWidth / 2;
    const cy = positionY + textHeight / 2;
    const rad = config.rotate / 180 * Math.PI;
    // 画像を回転
    ctx.setTransform(Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), cx - cx * Math.cos(rad) + cy * Math.sin(rad), cy - cx * Math.sin(rad) - cy * Math.cos(rad));

    //背景色
    if (config.backgroundColor != false) {
        const mesure = ctx.measureText(text);
        const textWidth = mesure.width;
        const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent;

        //ピッタリすぎるので5px広く
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(positionX - 5, positionY - 5, textWidth + 10, textHeight + 10);
    }

    //アンダーライン
    if (config.underLine != false) {

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
