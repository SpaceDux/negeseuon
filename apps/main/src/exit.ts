import { safeAsync } from "@negeseuon/utils";
import { getDatabase } from "@negeseuon/db";
import { closeKnex } from "./libs/knex";
import { connectorService } from "./router";

export const exit = async () => {
  console.log("=== Exit ===");

  const [_, disconnectAllError] = await safeAsync(
    async () => await connectorService.disconnectAll()
  );

  if (disconnectAllError) {
    console.error("Error disconnecting connectors:", disconnectAllError);
  }

  await closeKnex();
  const dbManager = getDatabase();
  dbManager.close();
  console.log("Database connections closed");
};
