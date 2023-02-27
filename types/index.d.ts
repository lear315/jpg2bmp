export declare function convertToBuffer(
    jpgBuffer: Buffer,
    opts?: {
        bitDepth?: number;
    },
  ): Buffer;


export declare function convertToFile(
    jpgPath: string,
    bmpPath: string,
    opts?: {
        bitDepth?: number;
    },
  ): Buffer;

export declare function convertToBufferFromFile(
    jpgPath: string,
    opts?: {
        bitDepth?: number;
    },
  ): Buffer;