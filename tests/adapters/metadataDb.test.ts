//write test for the metadata db adapter
import MetadataDBAdapter from "../../src/adapters/MetaDataDBAdapter";
import { ClientError } from "../../src/driven/ClientError";
import { MetadataDbClient } from "../client/MetadataDbClient";

describe("MetadataDbAdapter", () => {
    it("should update the status of an item given a valid id, status and tableName", async () => {
        const id = "test";
        const tableName = "test";

        const metadataDbAdapter = new MetadataDBAdapter(new MetadataDbClient());
        const result = await metadataDbAdapter.updateStatus(
            id,
            { status: "pending" },
            tableName
        );
        expect(result.success).toBe(true);
    });

    it("should return an error if the id is not valid", async () => {
        const id = "notValid";
        const tableName = "test";
        const metadataDbAdapter = new MetadataDBAdapter(new MetadataDbClient());
        const result = await metadataDbAdapter.updateStatus(
            id,
            { status: "pending" },
            tableName
        );
        expect(result.error).toBeInstanceOf(ClientError);
        expect(result.error?.message).toBe("Failed to update status");
        expect(result.error?.name).toBe("Failed to update status");
        expect(result.error?.stack).toContain(
            "Item not found Error: Item not found"
        );

        expect(result.success).toBe(false);
    });
});
