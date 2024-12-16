import {
    DeleteMessageOutput,
    QueueClientInterface,
    QueueOutput,
    ReceiveMessageOutput,
} from "../../src/driven/ports/QueueClientInterface";

export class ForSqsClientMock implements QueueClientInterface {
    public async receiveMessage(
        queueUrl: string
    ): Promise<ReceiveMessageOutput> {
        if (queueUrl === "valid-queue") {
            return Promise.resolve({
                success: true,
                messages: [
                    {
                        MessageId: "test",
                        ReceiptHandle: "test",
                        Body: "test",
                    },
                ],
            });
        }

        return Promise.resolve({
            success: false,
            messages: [],
            error: new Error("Queue not found"),
        });
    }

    public async deleteMessage(
        queueUrl: string,
        receiptHandle: string
    ): Promise<DeleteMessageOutput> {
        if (queueUrl === process.env.QUEUE_URL && receiptHandle === "test") {
            return Promise.resolve({
                success: true,
            });
        }
        return Promise.resolve({
            success: false,
            error: new Error(
                `Failed to delete message with status code 404 and receipt handle ${receiptHandle}`
            ),
        });
    }
}
