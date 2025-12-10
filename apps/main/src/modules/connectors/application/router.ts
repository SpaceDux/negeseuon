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
        try {
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
          const transformed = messages.map((message, index) => {
            try {
              // Convert headers - may be Map, Record, or already transformed
              const headers: Record<string, string> = {};
              if (message.headers instanceof Map) {
                for (const [k, v] of message.headers.entries()) {
                  headers[k.toString()] = v.toString();
                }
              } else if (
                message.headers &&
                typeof message.headers === "object"
              ) {
                // Already a Record/object
                for (const [k, v] of Object.entries(message.headers)) {
                  headers[k] = String(v);
                }
              }

              // Handle value - it may already be deserialized (object/string) or still a Buffer
              let payload: any;
              let size: number;

              if (Buffer.isBuffer(message.value)) {
                // Value is still a Buffer, need to deserialize
                try {
                  const valueStr = message.value.toString();
                  payload = JSON.parse(valueStr);
                } catch {
                  payload = message.value.toString();
                }
                size = message.value.length;
              } else {
                // Value is already deserialized (object, string, etc.)
                payload = message.value;
                // Calculate size from serialized representation
                try {
                  size = Buffer.byteLength(JSON.stringify(payload));
                } catch {
                  size = Buffer.byteLength(String(payload));
                }
              }

              // Ensure payload is serializable (handle circular refs, functions, etc.)
              try {
                // Test serialization to catch any issues early
                JSON.stringify(payload);
              } catch (serializeError) {
                // If payload can't be serialized, convert to string representation
                payload = String(payload);
                size = Buffer.byteLength(payload);
              }

              // Handle key - may be Buffer (from noopDeserializer) or already deserialized
              let key = "";
              if (message.key != null) {
                if (Buffer.isBuffer(message.key)) {
                  key = message.key.length > 0 ? message.key.toString() : "";
                } else {
                  key = String(message.key);
                }
              }

              const result: any = {
                offset: Number(message.offset),
                partition: Number(message.partition),
                key,
                timestamp: String(message.timestamp),
                payload,
                size,
              };

              // Only include headers if there are any (omit property entirely if empty)
              if (Object.keys(headers).length > 0) {
                result.headers = headers;
              }

              // Validate the result matches schema expectations
              if (typeof result.offset !== "number" || isNaN(result.offset)) {
                throw new Error(`Invalid offset: ${message.offset}`);
              }
              if (
                typeof result.partition !== "number" ||
                isNaN(result.partition)
              ) {
                throw new Error(`Invalid partition: ${message.partition}`);
              }
              if (typeof result.key !== "string") {
                throw new Error(`Invalid key type: ${typeof result.key}`);
              }
              if (typeof result.timestamp !== "string") {
                throw new Error(
                  `Invalid timestamp type: ${typeof result.timestamp}`
                );
              }
              if (typeof result.size !== "number" || isNaN(result.size)) {
                throw new Error(`Invalid size: ${result.size}`);
              }

              return result;
            } catch (error) {
              console.error(
                `Error transforming message ${index}:`,
                error,
                message
              );
              throw error;
            }
          });

          // Validate the entire array before returning
          try {
            // Test serialization of the entire result
            JSON.stringify(transformed);
          } catch (serializeError) {
            console.error(
              "Failed to serialize transformed messages:",
              serializeError
            );
            throw new Error(
              `Failed to serialize messages: ${serializeError instanceof Error ? serializeError.message : String(serializeError)}`
            );
          }

          // Log first message for debugging
          if (transformed.length > 0) {
            console.log(
              "First transformed message:",
              JSON.stringify(transformed[0], null, 2)
            );
          }

          return transformed;
        } catch (error) {
          console.error("Error in queryMessages procedure:", error);
          if (error instanceof Error) {
            console.error("Error stack:", error.stack);
          }
          throw error;
        }
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
