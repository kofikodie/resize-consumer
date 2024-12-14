export interface ImageProcessorInterface {
    resize(
        imageBuffer: Buffer,
        width: number,
        height: number
    ): Promise<ImageProcessorResult>;
}

export type ImageProcessorResult = {
    success: boolean;
    imageBuffer?: Buffer;
    error?: unknown;
};
