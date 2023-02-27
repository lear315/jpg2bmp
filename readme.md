A library for jpeg to bmp, with a lovely and simple API.
See <https://womenzhai.cn/project> for all the documentation.
``` js

```


## 前言
这是一个将 JPG 图像转换为 BMP 图像的 Node.js 模块。因此，该模块主要的功能就是读取 JPG 图像文件，解码文件中的二进制数据，并将其转换为 BMP 格式，最后将转换后的数据写入到新的 BMP 文件中

## 原理

将 JPG 图像转换为 BMP 图像之前，需要先将 JPG 图像解码成 RGB 格式。这是因为 JPG 格式使用的是基于离散余弦变换（DCT）的压缩算法，它将原始的 RGB 图像数据转换为一组 DCT 系数，并进行压缩存储。将 JPG 图像解码成 RGB 格式后，就可以得到完整的图像信息。在 BMP 图片中，颜色是 BGR 排列的，每行的存储顺序是从左到右，但是每行的颜色值又是从下到上存储的。所以进行了转换。BMP 文件格式是由文件头、位图信息头和像素数据三部分组成的。其中，文件头（File Header）包含了文件类型、文件大小、位图数据的偏移量等信息；位图信息头（Bitmap Info Header）则包含了图像的宽度、高度、颜色位数等信息；像素数据（Pixel Data）则包含了图像的实际像素值数据。

## 使用方法
```
    const jpg2bmp = require('jpg2bmp');
    
    var bmpBuffer = jpg2bm.convertToBuffer(jpgBuffer, {bitDepth: 32})
```
## API接口

1.  函数将接受一个 JPG 文件的缓冲区，并返回一个 BMP 文件的缓冲区, bitDepth为图片位深度
```
    static convertToBuffer: (jpgBuffer: Buffer,opts?: {
        bitDepth?: number ;
      }) => Buffer;
```

2.  函数将接受一个 JPG 文件的路径，并返回一个 BMP 文件的缓冲区, bitDepth为图片位深度
```
    static convertToBufferFromFile: (jpgPath: string,opts?: {
        bitDepth?: number ;
      }) => Buffer;
```

3.  函数将接受一个JPG 文件的路径和一个 BMP文件的路径, bitDepth为图片位深度
```
    static convertToFile: (jpgPath: string, bmpPath: string, opts?: {
        bitDepth?: number ;
    }) => void;
```




## [](https://www.npmjs.com/package/jszip#license)License

jpg2bmp is dual-licensed. You may use it under the MIT license *or* the GPLv3 license. 
