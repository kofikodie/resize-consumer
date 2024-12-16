import { QueueAdapterInterface } from "../../adapters/ports/QueueAdapterInterface";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";

export class MessageReceiveHandler extends BaseHandler {
    private readonly sqsAdapter: QueueAdapterInterface;

    constructor(
        sqsAdapter: QueueAdapterInterface,
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.sqsAdapter = sqsAdapter;
    }

    protected async processRequest(
        context: ProcessingContext
    ): Promise<boolean> {
        const messageResult = await this.sqsAdapter.getMessage(
            context.queueUrl
        );

        if (messageResult.success && messageResult.result?.length === 0) {
            this.logger.info("No message received", {
                queueUrl: context.queueUrl,
            });
            return false;
        }

        if (!messageResult.success) {
            this.logger.error("Error receiving message", {
                error: {
                    name: messageResult.error?.name ?? "Unknown error",
                    message: messageResult.error?.message ?? "Unknown error",
                    stack: messageResult.error?.stack ?? "Unknown stack",
                },
            });
            return false;
        }

        context.imageKey = messageResult.result?.[0]?.Body ?? "";
        context.receiptHandle = messageResult.result?.[0]?.ReceiptHandle ?? "";
        return true;
    }
}
