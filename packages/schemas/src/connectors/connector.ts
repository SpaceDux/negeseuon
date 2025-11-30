import * as v from "valibot";
import { KafkaConfigurationSchema } from "./kafka";

export const ConnectorTypeSchema = v.union([v.literal("kafka")]);

export type ConnectorType = v.InferOutput<typeof ConnectorTypeSchema>;

export const ConnectorConfigurationSchema = v.object({
  key: v.string(),
  name: v.string(),
  description: v.string(),
  type: ConnectorTypeSchema,
  config: v.union([KafkaConfigurationSchema]),
});

export type ConnectorConfiguration = v.InferOutput<
  typeof ConnectorConfigurationSchema
>;

export const TestConnectionInputSchema = v.object({
  type: ConnectorTypeSchema,
  config: v.union([ConnectorConfigurationSchema]),
});

export type TestConnectionInput = v.InferOutput<
  typeof TestConnectionInputSchema
>;
