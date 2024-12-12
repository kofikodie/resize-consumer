import DynamoDBAdapter from "../../adapters/DynamoDBAdapter";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";
export class MetadataUpdateHandler extends BaseHandler {
    private readonly dynamoDbAdapter: DynamoDBAdapter;

    constructor(dynamoDbAdapter: DynamoDBAdapter, ...args: ConstructorParameters<typeof BaseHandler>) {
        super(...args);
        this.dynamoDbAdapter = dynamoDbAdapter;
    }

    protected async processRequest(context: ProcessingContext): Promise<boolean> {
        const updateResult = await this.dynamoDbAdapter.updateStatus(
            context.imageKey,
            "processed"
        );

        if ("error" in updateResult) {
            this.logger.error("Failed to update image status", {
                imageKey: context.imageKey,
                error: updateResult.error
            });
            return false;
        }

        return true;
    }
} 