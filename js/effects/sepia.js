//セピア(重いので動画には非推奨)
export function sepia(data) {
    for (let i = 0; i < data.length; i++) {
        const red = data[i * 4];
        const green = data[i * 4 + 1];
        const blue = data[i * 4 + 2];

        const g = parseInt((red * 30 + green * 59 + blue * 11) / 100);

        data[i * 4] = parseInt((g / 255) * 240);
        data[i * 4 + 1] = parseInt((g / 255) * 200);
        data[i * 4 + 2] = parseInt((g / 255) * 145);
    }
}
