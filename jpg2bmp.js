/*
 * Copyright (C) 2023 The jpg2bmp Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */
const jpeg = require('jpeg-js');
const fs = require('fs');

function constructor() {
}

// 函数将接受一个 JPG 文件的缓冲区，并返回一个 BMP 文件的缓冲区
function convertToBuffer(jpgBuffer, opts) {
    const decoded = jpeg.decode(jpgBuffer);
    var bitDepth = 32; // 24 or 32
    if (opts && opts.bitDepth) {
        if (opts.bitDepth != 24 && opts.bitDepth != 32) {
            throw new Error("Invalid bit depth: " + opts.bitDepth);
        }
        bitDepth = opts.bitDepth;
    }
    var bmpBuffer = bmpFromJpeg(decoded, bitDepth);
    return bmpBuffer;
}

// 函数将接受一个 JPG 文件的路径，并返回一个 BMP 文件的缓冲区
function convertToBufferFromFile(jpgPath, opts) {
    const data = fs.readFileSync(jpgPath);
    return convertToBuffer(data, opts);
}

// 函数将接受一个JPG 文件的路径和一个 BMP文件的路径
function convertToFile(jpgPath, bmpPath, opts) {
    const bmpBuffer = convertToBufferFromFile(jpgPath, opts);
    fs.writeFileSync(bmpPath, bmpBuffer);
}

function bmpFromJpeg(jpgDecoded, bitDepth) {
    const { data: pixelsRaw, width, height } = jpgDecoded;

    // 计算每行像素字节数
    const bytesPerRow = Math.ceil(width * bitDepth / 8);

    // 创建BMP文件头
    const fileSize = 54 + bytesPerRow * height;
    const bmpHeader = Buffer.alloc(14);
    bmpHeader.write('BM', 0); // 文件类型
    bmpHeader.writeUInt32LE(fileSize, 2); // 文件大小
    bmpHeader.writeUInt32LE(54, 10); // 数据偏移量

    // 创建BMP信息头
    const bmpInfoHeader = Buffer.alloc(40);
    bmpInfoHeader.writeUInt32LE(40, 0); // 信息头大小
    bmpInfoHeader.writeUInt32LE(width, 4); // 图像宽度
    bmpInfoHeader.writeInt32LE(height, 8); // 图像高度（注意是有符号整数）
    bmpInfoHeader.writeUInt16LE(1, 12); // 颜色平面数（必须为1）
    bmpInfoHeader.writeUInt16LE(bitDepth, 14); // 每个像素的位数（32位）
    bmpInfoHeader.writeUInt32LE(0, 16); // 压缩类型（无压缩）
    bmpInfoHeader.writeUInt32LE(bytesPerRow * height, 20); // 图像数据大小
    bmpInfoHeader.writeInt32LE(2835, 24); // 水平分辨率（像素/米）
    bmpInfoHeader.writeInt32LE(2835, 28); // 垂直分辨率（像素/米）
    bmpInfoHeader.writeUInt32LE(0, 32); // 调色板颜色数（使用默认值）
    bmpInfoHeader.writeUInt32LE(0, 36); // 重要颜色数（使用所有颜色）

    if (bitDepth == 24) {
        // 24位BMP不需要透明通道
        var pixels24 = swapRgbBgr(pixelsRaw);
        // 处理pixels
        const bmpBuffer24 = Buffer.alloc(pixels24.length);
        for (var y = 0; y < height; y++) {
            const start = (height - y - 1) * bytesPerRow;
            for (var x = 0; x < width; x++) {
                const index = (y * width + x) * 3;
                bmpBuffer24.writeUInt8(pixels24[index + 2], start + x * 3);
                bmpBuffer24.writeUInt8(pixels24[index + 1], start + x * 3 + 1);
                bmpBuffer24.writeUInt8(pixels24[index], start + x * 3 + 2);
            }
        }
        return Buffer.concat([bmpHeader, bmpInfoHeader, bmpBuffer24]);

    } else if (bitDepth == 32) {
        // 32位BMP需要透明通道
        var pixels32 = swapRgbaBgra(pixelsRaw);
        // 处理pixels
        const bmpBuffer32 = Buffer.alloc(pixels32.length);
        for (var y = 0; y < height; y++) {
            const start = (height - y - 1) * bytesPerRow;
            for (var x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                var oidi = (pixels32[index + 2] << 16 | pixels32[index + 1] << 8 | pixels32[index]) + (pixels32[index + 3] << 23) * 2;
                bmpBuffer32.writeUInt32LE(oidi , start + x * 4);
            }
        }
        return Buffer.concat([bmpHeader, bmpInfoHeader, bmpBuffer32]);
    }
}


function swapRgbaBgra(data) {
    const swappedData = Buffer.alloc(data.length);
    for (var i = 0; i < data.length; i += 4) {
        swappedData[i] = data[i + 2];
        swappedData[i + 1] = data[i + 1];
        swappedData[i + 2] = data[i];
        swappedData[i + 3] = data[i + 3];
    }
    return swappedData;
}

function swapRgbBgr(data) {
    const swappedData = Buffer.alloc(data.length);
    for (var i = 0; i < data.length; i += 4) {
        swappedData[i] = data[i + 2];
        swappedData[i + 1] = data[i + 1];
        swappedData[i + 2] = data[i];
    }
    return swappedData;
}


if (typeof module !== 'undefined') {
    // module.exports导出多个
    module.exports = {
        convertToBuffer: convertToBuffer,
        convertToFile: convertToFile,
        convertToBufferFromFile: convertToBufferFromFile
    };

} else if (typeof window !== 'undefined') {
	window['jpg2bmp'] = window['jpg2bmp'] || {};
	window['jpg2bmp'].convertToBuffer = convertToBuffer;
	window['jpg2bmp'].convertToFile = convertToFile;
    window['jpg2bmp'].convertToBufferFromFile = convertToBufferFromFile;
}
