import { initTRPC } from "@trpc/server";
import { wrap } from "@typeschema/valibot";
import * as v from "valibot";
import { BooleanResponseSchema } from "@negeseuon/schemas";
import { ConnectorService } from "../domain/connector_service";

const t = initTRPC.create();

type Dependencies = {
  connectorService: ConnectorService;
};

export function createConnectorsRouter(dependencies: Dependencies) {
  return t.router({
    connect: t.procedure
      .input(
        wrap(
          v.object({
            connectionId: v.number(),
          })
        )
      )
      .output(wrap(BooleanResponseSchema))
      .mutation(async ({ input }) => {
        const { connectionId } = input;

        return await dependencies.connectorService.connect(connectionId);
      }),
    disconnect: t.procedure
      .input(
        wrap(
          v.object({
            connectionId: v.number(),
          })
        )
      )
      .output(wrap(BooleanResponseSchema))
      .mutation(async ({ input }) => {
        const { connectionId } = input;

        return await dependencies.connectorService.disconnect(connectionId);
      }),
    // Broker-agnostic operations
    topics: t.router({
      list: t.procedure
        .input(
          wrap(
            v.object({
              connectionId: v.number(),
            })
          )
        )
        .output(wrap(v.array(v.string())))
        .query(async ({ input }) => {
          const { connectionId } = input;

          return await dependencies.connectorService.listTopics(connectionId);
        }),
    }),
    publish: t.procedure
      .input(
        wrap(
          v.object({
            connectionId: v.number(),
            topic: v.string(),
            message: v.unknown(),
          })
        )
      )
      .output(wrap(BooleanResponseSchema))
      .mutation(async ({ input }) => {
        const { connectionId, topic, message } = input;

        return await dependencies.connectorService.publish(
          connectionId,
          topic,
          message
        );
      }),
    getType: t.procedure
      .input(
        wrap(
          v.object({
            connectionId: v.number(),
          })
        )
      )
      .output(wrap(v.string()))
      .query(async ({ input }) => {
        const { connectionId } = input;

        return dependencies.connectorService.getConnectorType(connectionId);
      }),
  });
}

export type ConnectorsRouter = ReturnType<typeof createConnectorsRouter>;
