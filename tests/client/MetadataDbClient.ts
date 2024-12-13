//write mock for the metadata db client
import {
    MetaDataDbClientInterface,
    MetadataDbClientResultType,
} from "../../src/driven/ports/MetadataDbClientInterface";

export class MetadataDbClient implements MetaDataDbClientInterface {
    updateStatus(
        id: string,
        status: string,
        tableName: string
    ): Promise<MetadataDbClientResultType> {
        if (id === "test" && status === "pending" && tableName === "test") {
            return Promise.resolve({ success: true });
        }
        return Promise.resolve({
            success: false,
            error: new Error("Item not found"),
        });
    }
    public async getItem(id: string, tableName: string): Promise<any> {
        if (id === "test" && tableName === "test") {
            return Promise.resolve({ success: true, result: {} });
        }
        return Promise.resolve({
            success: false,
            error: new Error("Item not found"),
        });
    }
}
