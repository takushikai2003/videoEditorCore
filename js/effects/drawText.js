//canvasにテキストを追加
//TODO: 改行対応
// fontsize:autoやunderなどの複雑な処理はUIに任せるか？
// (↑単純に中心なら良いが、そこから少しずらすなどするならプロパティが増える)
// (↑KeyFrameの補完時、centerの計算などはどうする？)

// JSDocは以下のよう記述で必須とオプショナルのプロパティを指定できる
//  * @property {string} email 必須
//  * @property {string} [nickName] オプショナル

/**
 * canvasにテキストを描く
 * @param {Object} config
 * 
 * ---必須---
 * 
 * @param {HTMLCanvasElement} config.canvas 
 * @param {number | "auto"} config.size フォントサイズ[pt]
 * @param {number | "left" | "center" | "right"} config.positionX
 * @param {number | "above" | "center" | "under"} config.positionY
 * @param {string} config.text　表示したいテキスト
 * 
 * ---オプション---
 * 
 * @param {string} [config.font]　フォント名
 * @param {string} [config.color] 文字色
 * @param {boolean} [config.bold] 太字
 * @param {boolean} [config.italic] 斜体
 * @param {string} [config.underline] 下線を描く場合は色を指定
 * @param {string} [config.backgroundColor] 文字背景を塗る場合は色を指定
 * @param {number} [config.rotate] 回転角[度degree]
 * @param {boolean} [config.gradation_enable] グラデーションを行うかどうか
 * @param {string[]} [config.gradation_arr] グラデーションの色配列
 */

export function drawText(config) {
    const canvas = config.canvas;
    const ctx = canvas.getContext("2d");

    const text = config.text;

    const font = config.font || "Arial";
    const color = config.color || "#000000";
    const bold = (config.bold == true) ? "bold" : "";
    const italic = (config.italic == true) ? "italic" : "";
    const underline = config.underline || false;
    const backgroundColor = config.backgroundColor || false;
    const rotate = config.rotate || 0;

    let gradation_enable = config.gradation_enable;
    const gradation_arr = config.gradation_arr;


    let size;

    if (config.size == "auto") {

        //はじめのフォント(pt)
        let font_size = 100;
        //textがcanvas幅いっぱいになると見にくいので、canvas幅の2/3をMAXに
        const textWidthMAX = canvas.width * 2 / 3;

        while (true) {
            ctx.font = italic + " " + bold + " " + font_size + "pt" + " " + font;
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
    ctx.font = italic + " " + bold + " " + size + " " + font;
    ctx.textAlign = "start";
    ctx.textBaseline = "top";

    const mesure = ctx.measureText(text);
    const textWidth = mesure.width;
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
    const rad = rotate / 180 * Math.PI;
    // 画像を回転
    ctx.setTransform(Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), cx - cx * Math.cos(rad) + cy * Math.sin(rad), cy - cx * Math.sin(rad) - cy * Math.cos(rad));

    //背景色
    if (backgroundColor != false) {
        //ピッタリすぎるので5px広く
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(positionX - 5, positionY - 5, textWidth + 10, textHeight + 10);
    }


    //グラデーション
    let grad;
    if(gradation_enable){
        grad = ctx.createLinearGradient(positionX, positionY, textWidth, textHeight);

        const length = gradation_arr.length;
        if(length == 0){
            gradation_enable = false;
        }
        const step = Math.round((1 / length)*100)/100;//小数第2位で四捨五入
        for(let i=0; i<length; i++){
            if(i == length-1){
                grad.addColorStop(1.0, gradation_arr[i]);
            }
            else{
                grad.addColorStop(step * i, gradation_arr[i]);
            }
        }
    }

    //アンダーライン
    if (underline != false) {
        ctx.beginPath();
        ctx.moveTo(positionX, positionY + textHeight);
        ctx.lineTo(positionX + textWidth, positionY + textHeight);
        ctx.strokeStyle = underline;
        ctx.stroke();
    }

    if(gradation_enable){
        ctx.fillStyle = grad;
    }
    else{
        ctx.fillStyle = color;
    }

    ctx.fillText(text, positionX, positionY);
    ctx.restore();
}
