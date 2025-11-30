import * as v from "valibot";
import { ConnectorType } from "../enums/connector_type";

export const KafkaConfigurationSchema = v.object({
  bootstrapBrokers: v.pipe(v.array(v.string()), v.minLength(1)),
  timeout: v.optional(v.number()),
  sasl: v.optional(
    v.object({
      mechanism: v.pipe(
        v.union([
          v.literal("PLAIN"),
          v.literal("SCRAM-SHA-512"),
          v.literal("SCRAM-SHA-256"),
          v.literal("OAUTHBEARER"),
        ]),
        v.minLength(1)
      ),
      username: v.optional(v.string()),
      password: v.optional(v.string()),
      token: v.optional(v.string()),
    })
  ),
});

export type KafkaConfiguration = v.InferOutput<typeof KafkaConfigurationSchema>;

export const ConnectorConfigurationSchema = v.object({
  key: v.string(),
  name: v.string(),
  description: v.string(),
  type: v.union([v.literal(ConnectorType.KAFKA)]),
  config: v.union([KafkaConfigurationSchema]),
});

export type ConnectorConfiguration = v.InferOutput<
  typeof ConnectorConfigurationSchema
>;

// Schema for testing connections - only requires type and config
export const TestConnectionInputSchema = v.object({
  type: v.union([v.literal(ConnectorType.KAFKA)]),
  config: v.union([KafkaConfigurationSchema]),
});

export type TestConnectionInput = v.InferOutput<
  typeof TestConnectionInputSchema
>;
