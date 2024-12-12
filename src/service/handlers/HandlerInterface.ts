export interface HandlerInterface {
    handle(context: ProcessingContext): Promise<boolean>;
    setNext(handler: HandlerInterface): HandlerInterface;
}

export interface ProcessingContext {
    imageKey: string;
    receiptHandle: string;
    imageBuffer?: Buffer;
    resizedBuffer?: Buffer;
    [key: string]: any;
}
