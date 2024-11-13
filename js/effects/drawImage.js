export function drawImage({ canvas, image, config }) {
    const ctx = canvas.getContext("2d");

    config.positionX = config.positionX || 0;
    config.positionY = config.positionY || 0;
    config.width = config.width || image.width;
    config.height = config.height || image.height;

    ctx.drawImage(image, config.positionX, config.positionY, config.width, config.height);
}
