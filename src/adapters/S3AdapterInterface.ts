export interface S3AdapterInterface {
    storeImage(
        buffer: Buffer,
        imageName: string,
        buctketName: string
    ): Promise<{ success: string } | { error: string }>;
    getImageByKey(
        bucketName: string,
        key: string
    ): Promise<Buffer | { error: string }>;
    deleteImageByKey(bucketName: string, key: string): Promise<void>;
}
