import { Message } from "@aws-sdk/client-sqs";

export interface SqsAdapterInterface {
    getMessage(): Promise<Message | undefined | { error: string }>;
    deleteMessage(receiptHandle: string): Promise<{ success: boolean; error?: string }>;
}
