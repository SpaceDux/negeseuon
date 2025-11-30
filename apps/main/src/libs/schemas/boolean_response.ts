import * as v from "valibot";

export const BooleanResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
});

export type BooleanResponse = v.InferOutput<typeof BooleanResponseSchema>;
