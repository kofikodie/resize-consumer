import SQSAdapter from "../../adapters/SqsAdapter";
import { SqsAdapterInterface } from "../../adapters/SqsAdapterInterface";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";

export class MessageReceiveHandler extends BaseHandler {
    private readonly sqsAdapter: SqsAdapterInterface;

    constructor(
        sqsAdapter: SqsAdapterInterface,
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.sqsAdapter = sqsAdapter;
    }

    protected async processRequest(
        context: ProcessingContext
    ): Promise<boolean> {
        const messageResult = await this.sqsAdapter.getMessage();

        if (
            !messageResult ||
            "error" in messageResult ||
            !messageResult.Body ||
            !messageResult.ReceiptHandle
        ) {
            if (messageResult && "error" in messageResult) {
                this.logger.error("Error receiving message", {
                    error: messageResult.error,
                });
                return false;
            }
            this.logger.info("No messages to process");
            return false;
        }

        context.imageKey = messageResult.Body;
        context.receiptHandle = messageResult.ReceiptHandle;
        return true;
    }
}
