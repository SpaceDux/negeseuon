import * as v from "valibot";

const SaslMechanismSchema = v.union([
  v.literal("PLAIN"),
  v.literal("SCRAM-SHA-512"),
  v.literal("SCRAM-SHA-256"),
  v.literal("OAUTHBEARER"),
]);

export const KafkaConfigurationSchema = v.object({
  bootstrapBrokers: v.pipe(v.array(v.string()), v.minLength(1)),
  timeout: v.optional(v.number()),
  sasl: v.optional(
    v.object({
      mechanism: SaslMechanismSchema,
      username: v.optional(v.string()),
      password: v.optional(v.string()),
      token: v.optional(v.string()),
    })
  ),
});

export type KafkaConfiguration = v.InferOutput<typeof KafkaConfigurationSchema>;

export const KafkaTopicMetadataSchema = v.object({
  id: v.string(),
  brokers: v.map(
    v.number(),
    v.object({
      host: v.string(),
      port: v.number(),
    })
  ),
  topics: v.map(
    v.string(),
    v.object({
      id: v.string(),
      partitions: v.array(
        v.object({
          leader: v.number(),
          leaderEpoch: v.number(),
          replicas: v.array(v.number()),
        })
      ),
      partitionsCount: v.number(),
      lastUpdate: v.number(),
    })
  ),
  lastUpdate: v.number(),
});

export type KafkaTopicMetadata = v.InferOutput<typeof KafkaTopicMetadataSchema>;

export const KafkaMessageSchema = v.object({
  offset: v.number(),
  partition: v.number(),
  key: v.string(),
  timestamp: v.string(),
  payload: v.any(),
  size: v.number(),
  headers: v.optional(v.record(v.string(), v.string())),
});
