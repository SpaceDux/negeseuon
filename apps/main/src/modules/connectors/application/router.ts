import { initTRPC } from "@trpc/server";
import { wrap } from "@typeschema/valibot";
import * as v from "valibot";
import {
  BooleanResponseSchema,
  KafkaMessageSchema,
  KafkaTopicMetadataSchema,
} from "@negeseuon/schemas";
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

          const topics =
            await dependencies.connectorService.listTopics(connectionId);

          return topics;
        }),
      metadata: t.procedure
        .input(
          wrap(
            v.object({
              connectionId: v.number(),
              topic: v.string(),
            })
          )
        )
        .output(wrap(v.nullable(KafkaTopicMetadataSchema)))
        .query(async ({ input }) => {
          const { connectionId, topic } = input;

          return await dependencies.connectorService.getTopicMetadata(
            connectionId,
            topic
          );
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
    queryMessages: t.procedure
      .input(
        wrap(
          v.object({
            connectionId: v.number(),
            topic: v.string(),
            offset: v.string(),
            limit: v.string(),
            partition: v.optional(v.number()),
            avroDecode: v.boolean(),
          })
        )
      )
      .output(wrap(v.array(KafkaMessageSchema)))
      .query(async ({ input }) => {
        console.dir(input, { depth: null });
        const { connectionId, topic, offset, limit, partition, avroDecode } =
          input;
        const messages = await dependencies.connectorService.queryMessages({
          connectionId,
          topic,
          offset,
          limit,
          partition: partition ? Number(partition) : null,
          avroDecode,
        });

        // Transform Message objects to KafkaMessageSchema format
        return messages.map((message) => {
          // Convert headers from Map<Buffer, Buffer> to Record<string, string>
          const headers: Record<string, string> = {};
          if (message.headers instanceof Map) {
            for (const [k, v] of message.headers.entries()) {
              headers[k.toString()] = v.toString();
            }
          }

          // Convert value (Buffer) to payload
          let payload: any;
          try {
            // Try to parse as JSON first
            const valueStr = message.value?.toString() ?? "";
            payload = JSON.parse(valueStr);
          } catch {
            // If not JSON, use as string
            payload = message.value?.toString() ?? "";
          }

          // Calculate size from value buffer
          const size = message.value ? message.value.length : 0;

          return {
            offset: Number(message.offset),
            partition: message.partition,
            key: message.key?.toString() ?? "",
            timestamp: message.timestamp.toString(),
            payload,
            size,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
          };
        });
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
