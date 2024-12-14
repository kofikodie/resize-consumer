export interface QueueClientInterface {
    receiveMessage(queueUrl: string): Promise<ReceiveMessageOutput>;
    deleteMessage(queueUrl: string, receiptHandle: string): Promise<DeleteMessageOutput>;
}

export interface QueueOutput {
    success: boolean;
    messages: Message[];
    error?: unknown;
}
export interface Message {
    MessageId?: string;
    ReceiptHandle?: string;
    Body?: string;
}

export interface ReceiveMessageOutput extends QueueOutput {}
export interface DeleteMessageOutput extends Omit<QueueOutput, "messages"> {}
