import * as dotenv from "dotenv";
import {
    QueueAdapterInterface,
    QueueAdapterResultType,
} from "./ports/QueueAdapterInterface";
import { QueueClientInterface } from "../driven/ports/QueueClientInterface";
import { ClientError } from "../driven/ClientError";

dotenv.config();

export default class QueueAdapter implements QueueAdapterInterface {
    private readonly queueClient: QueueClientInterface;

    constructor(queueClient: QueueClientInterface) {
        this.queueClient = queueClient;
    }

    public async getMessage(queueUrl: string): Promise<QueueAdapterResultType> {
        const result = await this.queueClient.receiveMessage(queueUrl);
        if (!result.success) {
            return {
                success: false,
                error: new ClientError("Failed to get message", {
                    name: "Failed to get message",
                    stack:
                        result.error instanceof Error
                            ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                            : String(result.error),
                }),
            };
        }
        return { success: true, result: result.messages[0] };
    }

    public async deleteMessage(
        queueUrl: string,
        receiptHandle: string
    ): Promise<QueueAdapterResultType> {
        const result = await this.queueClient.deleteMessage(
            queueUrl,
            receiptHandle
        );
        if (!result.success) {
            return {
                success: false,
                error: new ClientError("Failed to delete message", {
                    name: "Failed to delete message",
                    stack:
                        result.error instanceof Error
                            ? `${result.error.message} ${result.error.stack} ${result.error.name}`
                            : String(result.error),
                }),
            };
        }
        return { success: result.success };
    }
}
