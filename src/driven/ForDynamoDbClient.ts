import {
    DynamoDBClient as AWSDynamoDBClient,
    GetItemCommand,
    UpdateItemCommand,
    AttributeValue,
} from "@aws-sdk/client-dynamodb";
import {
    MetaDataDbClientInterface,
    MetadataDbClientResultType,
} from "./ports/MetadataDbClientInterface";

export default class DynamoDbClient implements MetaDataDbClientInterface {
    private readonly client: AWSDynamoDBClient;

    constructor() {
        if (process.env.NODE_ENV === "development") {
            this.client = new AWSDynamoDBClient({
                region: process.env.AWS_DEFAULT_REGION ?? "eu-west-1",
            });
        } else {
            this.client = new AWSDynamoDBClient({
                endpoint: process.env.AWS_SERVICES_ENDPOINT ?? "",
                region: process.env.AWS_DEFAULT_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
                },
            });
        }
    }

    public async getItem(
        id: string,
        tableName: string
    ): Promise<MetadataDbClientResultType> {
        try {
            const command = new GetItemCommand({
                TableName: tableName,
                Key: {
                    id: { S: id },
                },
            });

            const response = await this.client.send(command);

            return {
                success: true,
                result: this.unmarshallItem(response.Item ?? {}),
            };
        } catch (error: unknown) {
            return {
                success: false,
                error,
            };
        }
    }

    public async updateStatus(
        id: string,
        status: string,
        tableName: string
    ): Promise<MetadataDbClientResultType> {
        try {
            const command = new UpdateItemCommand({
                TableName: tableName,
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
                ReturnValues: "ALL_NEW",
            });

            const response = await this.client.send(command);

            if (!response.Attributes) {
                return {
                    success: false,
                    error: new Error(
                        `Failed to update item with id ${id} and status ${status}`
                    ),
                };
            }

            return {
                success: true,
                result: this.unmarshallItem(response.Attributes),
            };
        } catch (error) {
            return {
                success: false,
                error,
            };
        }
    }

    private unmarshallItem(
        item: Record<string, AttributeValue>
    ): Record<string, any> {
        const result: Record<string, any> = {};

        for (const [key, value] of Object.entries(item)) {
            if (value.S) result[key] = value.S;
            else if (value.N) result[key] = Number(value.N);
            else if (value.BOOL !== undefined) result[key] = value.BOOL;
            // Add other types as needed
        }

        return result;
    }
}
