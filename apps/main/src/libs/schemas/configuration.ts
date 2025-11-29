import * as v from "valibot";

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
