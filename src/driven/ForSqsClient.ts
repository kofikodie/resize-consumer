import {
    DeleteMessageCommand,
    ReceiveMessageCommand,
    SQSClient,
} from "@aws-sdk/client-sqs";
import {
    DeleteMessageOutput,
    QueueClientInterface,
    ReceiveMessageOutput,
} from "./ports/QueueClientInterface";

export class ForSqsClient implements QueueClientInterface {
    private sqsClient: SQSClient;

    constructor() {
        if (process.env.RUNNING_ENV) {
            this.sqsClient = new SQSClient({
                region: process.env.AWS_DEFAULT_REGION,
            });
        } else {
            this.sqsClient = new SQSClient({
                endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
                },
            });
        }
    }

    async receiveMessage(queueUrl: string): Promise<ReceiveMessageOutput> {
        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: queueUrl,
            });
            const response = await this.sqsClient.send(command);
            return {
                success: true,
                messages: response.Messages ?? [],
            };
        } catch (error) {
            return {
                success: false,
                messages: [],
                error: error,
            };
        }
    }

    async deleteMessage(
        queueUrl: string,
        receiptHandle: string
    ): Promise<DeleteMessageOutput> {
        try {
            const command = new DeleteMessageCommand({
                QueueUrl: queueUrl,
                ReceiptHandle: receiptHandle,
            });
            const response = await this.sqsClient.send(command);

            if (response.$metadata.httpStatusCode === 200) {
                return {
                    success: true,
                };
            }
            return {
                success: false,
                error: new Error(
                    `Failed to delete message with status code ${response.$metadata.httpStatusCode} and receipt handle ${receiptHandle}`
                ),
            };
        } catch (error) {
            return {
                success: false,
                error: error,
            };
        }
    }
}
