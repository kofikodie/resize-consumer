import { MetadataDbAdapterInterface } from "../../adapters/ports/MetaDataDBAdapterInterface";
import { BaseHandler } from "./BaseHandler";
import { ProcessingContext } from "./HandlerInterface";
export class MetadataUpdateHandler extends BaseHandler {
    private readonly dynamoDbAdapter: MetadataDbAdapterInterface;

    constructor(
        dynamoDbAdapter: MetadataDbAdapterInterface,
        ...args: ConstructorParameters<typeof BaseHandler>
    ) {
        super(...args);
        this.dynamoDbAdapter = dynamoDbAdapter;
    }

    protected async processRequest(
        context: ProcessingContext
    ): Promise<boolean> {
        const updateResult = await this.dynamoDbAdapter.updateStatus(
            context.imageKey,
            { status: "processed" },
            context.tableName
        );

        if ("error" in updateResult) {
            this.logger.error("Failed to update image status", {
                imageKey: context.imageKey,
                error: {
                    name: updateResult.error?.name,
                    message: updateResult.error?.message,
                    stack: updateResult.error?.stack,
                },
            });
            return false;
        }

        return true;
    }
}
