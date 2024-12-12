import {
    Message as SqsMessageInterface,
    ReceiveMessageRequest,
    DeleteMessageRequest,
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import * as dotenv from "dotenv";
import { SqsAdapterInterface } from "./SqsAdapterInterface";
import { LoggerService } from "../utils/logger/LoggerService";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

dotenv.config();

export default class SQSAdapter implements SqsAdapterInterface {
    private readonly sqs: SQSClient;
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
        if (process.env.RUNNING_ENV) {
            this.sqs = new SQSClient({
                region: process.env.AWS_DEFAULT_REGION,
            });
        } else {
            this.sqs = new SQSClient({
                endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
                },
            });
        }
    }

    public async getMessage(): Promise<
        SqsMessageInterface | { error: string }
    > {
        const params: ReceiveMessageRequest = {
            QueueUrl: process.env.QUEUE_URL ?? "",
        };

        try {
            const command = new ReceiveMessageCommand(params);
            const data = await this.sqs.send(command);

            if (data.Messages && data.Messages.length > 0) {
                if (data.Messages[0].Body) {
                    this.logger.info(
                        "[SQSAdapter] Successfully received message",
                        {
                            messageId: data.Messages[0].MessageId,
                        }
                    );
                    return {
                        Body: data.Messages[0].Body,
                        ReceiptHandle: data.Messages[0].ReceiptHandle!,
                    };
                }
            }

            let error = "";
            data.Messages?.forEach((element) => {
                if (element.Body) {
                    error += element.Body + "\n";
                }
            });

            if (error) {
                this.logger.warn("[SQSAdapter] Received messages with errors", {
                    error,
                    queueUrl: process.env.QUEUE_URL,
                });
                return { error };
            }

            this.logger.info("[SQSAdapter] No messages available", {
                queueUrl: process.env.QUEUE_URL,
            });
            return {};
        } catch (error: unknown) {
            this.logger.error("[SQSAdapter] Failed to receive message", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                queueUrl: process.env.QUEUE_URL,
            });

            return {
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    public async deleteMessage(
        receiptHandle: string
    ): Promise<{ success: boolean; error?: string }> {
        const params: DeleteMessageRequest = {
            QueueUrl: process.env.QUEUE_URL,
            ReceiptHandle: receiptHandle,
        };

        try {
            const command = new DeleteMessageCommand(params);
            await this.sqs.send(command);
            this.logger.info("[SQSAdapter] Successfully deleted message", {
                queueUrl: process.env.QUEUE_URL,
            });
            return { success: true };
        } catch (error: unknown) {
            this.logger.error("[SQSAdapter] Failed to delete message", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                queueUrl: process.env.QUEUE_URL,
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
}
