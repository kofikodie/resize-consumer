import {
    ImageProcessorInterface,
    ImageProcessorResult,
} from "../../src/driven/ports/ImageProcessorInterface";

export class SharpImageProcessorMock implements ImageProcessorInterface {
    async resize(
        _imageBuffer: Buffer,
        _width: number,
        _height: number
    ): Promise<ImageProcessorResult> {
        try {
            return {
                success: true,
                imageBuffer: Buffer.from("test-image-data"),
            };
        } catch (error) {
            return { success: false, error };
        }
    }
}
