import { ClientError } from "../../driven/ClientError";
import { Message } from "../../driven/ports/QueueClientInterface";

export interface QueueAdapterInterface {
    getMessage(
        queueUrl: string
    ): Promise<QueueAdapterResultType>;
    deleteMessage(
        queueUrl: string,
        receiptHandle: string
    ): Promise<QueueAdapterResultType>;
}

export type QueueAdapterResultType = {
    success: boolean;
    result?: Message;
    error?: ClientError;
};
