//ネガ反転
export function negativeInverte(data) {
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
        // data[i+3]に格納されたα値は変更しない
    }

    return data;
}
