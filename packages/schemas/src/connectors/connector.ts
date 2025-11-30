import * as v from "valibot";
import { KafkaConfigurationSchema } from "./kafka";

export const ConnectorTypeSchema = v.union([v.literal("kafka")]);

export type ConnectorType = v.InferOutput<typeof ConnectorTypeSchema>;

export const ConnectorConfigurationSchema = v.object({
  id: v.optional(v.number()),
  name: v.string(),
  description: v.string(),
  type: ConnectorTypeSchema,
  config: v.union([KafkaConfigurationSchema]),
  connected: v.boolean(),
});

export type ConnectorConfiguration = v.InferOutput<
  typeof ConnectorConfigurationSchema
>;

export const ConnectorConfigurationListSchema = v.array(
  ConnectorConfigurationSchema
);

export type ConnectorConfigurationList = v.InferOutput<
  typeof ConnectorConfigurationListSchema
>;

export const TestConnectionInputSchema = v.object({
  type: ConnectorTypeSchema,
  config: v.union([ConnectorConfigurationSchema]),
});

export type TestConnectionInput = v.InferOutput<
  typeof TestConnectionInputSchema
>;
