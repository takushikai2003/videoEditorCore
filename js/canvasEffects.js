//canvas effects
//引数、戻り値が、canvasやctxのときと、data(RGBA)のときがあるので注意
//どれを取るかは、利用法を考えた上での最速を。

import { drawText } from "./effects/drawText.js";
import { drawImage } from "./effects/drawImage.js";
import { monochrome } from "./effects/monochrome.js";
import { negativeInverte } from "./effects/negativeInverte.js";
import { sepia } from "./effects/sepia.js";

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
    drawText: drawText,
    drawImage: drawImage,
    monochrome: monochrome,
    sepia: sepia,
    negativeInverte: negativeInverte,
}
