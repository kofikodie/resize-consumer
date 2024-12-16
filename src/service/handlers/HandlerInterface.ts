export interface HandlerInterface {
    handle(context: ProcessingContext): Promise<boolean>;
    setNext(handler: HandlerInterface): HandlerInterface;
}

export interface ProcessingContext {
    queueUrl: string;
    imageKey: string;
    receiptHandle: string;
    imageBuffer?: Buffer;
    resizedBuffer?: Buffer;
    tableName: string;
    primaryBucketName: string;
    secondaryBucketName: string;
}
