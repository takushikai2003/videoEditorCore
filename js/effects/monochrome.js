//canvasデータにフィルタをかける
//モノクロ
export function monochrome(data) {
    for (let i = 0; i < data.length; i += 4) {
        const g = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
        data[i] = data[i + 1] = data[i + 2] = g;
        // data[i+3]に格納されたα値は変更しない
    }

    return data;
}
