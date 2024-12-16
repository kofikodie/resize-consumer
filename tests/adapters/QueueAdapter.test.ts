//Write tests for the QueueAdapter
import QueueAdapter from "../../src/adapters/QueueAdapter";
import { ClientError } from "../../src/driven/ClientError";
import { ForSqsClientMock } from "../ports/ForSqsClient";

describe("QueueAdapter", () => {
    it("should be able to get a message from the queue given a valid queue url", async () => {
        const queueAdapter = new QueueAdapter(new ForSqsClientMock());
        const queueUrl = process.env.QUEUE_URL || "";
        const result = await queueAdapter.getMessage(queueUrl);
        expect(result.success).toBe(true);
    });

    it("should be able to delete a message from the queue given a valid queue url and receipt handle", async () => {
        const queueAdapter = new QueueAdapter(new ForSqsClientMock());
        const queueUrl = process.env.QUEUE_URL || "";
        const receiptHandle = "test";
        const result = await queueAdapter.deleteMessage(
            queueUrl,
            receiptHandle
        );
        expect(result.success).toBe(true);
    });

    it("should NOT be able to delete a message from the queue given an invalid queue url", async () => {
        const queueAdapter = new QueueAdapter(new ForSqsClientMock());
        const queueUrl = "invalid";
        const receiptHandle = "test";
        const result = await queueAdapter.deleteMessage(
            queueUrl,
            receiptHandle
        );

        expect(result.success).toBe(false);
        expect(result.error).toBeInstanceOf(ClientError);
        expect(result.error?.message).toBe("Failed to delete message");
        expect(result.error?.stack).toContain(
            "Failed to delete message with status code 404 and receipt handle test"
        );
    });
});
