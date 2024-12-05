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

dotenv.config();

export default class SQSAdapter implements SqsAdapterInterface {
    private readonly sqs: SQSClient;

    constructor() {
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
                return { error };
            }

            return {};
        } catch (error: any) {
            console.error(error);

            return {
                error: `${error.code}`,
            };
        }
    }

    public async deleteMessage(receiptHandle: string): Promise<void> {
        const params: DeleteMessageRequest = {
            QueueUrl: process.env.QUEUE_URL,
            ReceiptHandle: receiptHandle,
        };

        try {
            const command = new DeleteMessageCommand(params);
            await this.sqs.send(command);
        } catch (error: unknown) {
            //TODO logs or SNS
            console.log({
                error: `${error}`,
            });
        }
    }
}
