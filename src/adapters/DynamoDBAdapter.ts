import { DynamoDB } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBAdapterInterface,
    ImageMetadata,
} from "./DynamoDBAdapterInterface";
import * as dotenv from "dotenv";
import { LoggerInterface } from "../utils/logger/LoggerInterface";

dotenv.config();

export default class DynamoDBAdapter implements DynamoDBAdapterInterface {
    private readonly dynamodb: DynamoDB;
    private readonly tableName = "image_metadata";
    private readonly logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;

        try {
            if (process.env.NODE_ENV === "production") {
                this.dynamodb = new DynamoDB({
                    region: process.env.AWS_DEFAULT_REGION ?? "eu-west-1",
                });
                this.logger.info(
                    "Initialized DynamoDB client for production environment"
                );
            } else {
                this.dynamodb = new DynamoDB({
                    endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                    region: process.env.AWS_DEFAULT_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                        secretAccessKey:
                            process.env.AWS_SECRET_ACCESS_KEY ?? "",
                    },
                });
                this.logger.info(
                    "Initialized DynamoDB client for local environment"
                );
            }
        } catch (error) {
            logger.error("Failed to initialize DynamoDB client", { error });
            throw new Error("DynamoDB client initialization failed");
        }
    }

    async getItem(id: string): Promise<ImageMetadata | { error: string }> {
        try {
            this.logger.info("Getting item from DynamoDB", { id });

            const result = await this.dynamodb.getItem({
                TableName: this.tableName,
                Key: {
                    id: { S: id },
                },
            });

            if (!result.Item) {
                return { error: "Item not found" };
            }

            this.logger.info("Successfully retrieved item from DynamoDB", {
                id,
            });

            return {
                id: result.Item.id.S!,
                originalName: result.Item.originalName.S!,
                size: parseInt(result.Item.size.N!),
                mimeType: result.Item.mimeType.S!,
                createdAt: result.Item.createdAt.S!,
                status: result.Item.status.S! as ImageMetadata["status"],
            };
        } catch (error) {
            this.logger.error("Error getting item from DynamoDB", {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            return { error: "Failed to get item from DynamoDB" };
        }
    }

    async updateStatus(
        id: string,
        status: ImageMetadata["status"]
    ): Promise<{ success: boolean } | { error: string }> {
        try {
            this.logger.info("Updating status in DynamoDB", { id, status });

            await this.dynamodb.updateItem({
                TableName: this.tableName,
                Key: {
                    id: { S: id },
                },
                UpdateExpression: "SET #status = :status",
                ExpressionAttributeNames: {
                    "#status": "status",
                },
                ExpressionAttributeValues: {
                    ":status": { S: status },
                },
            });

            this.logger.info("Successfully updated status in DynamoDB", {
                id,
                status,
            });
            return { success: true };
        } catch (error) {
            this.logger.error("Error updating status in DynamoDB", {
                id,
                status,
                error: error instanceof Error ? error.message : String(error),
            });
            return { error: "Failed to update status in DynamoDB" };
        }
    }
}
