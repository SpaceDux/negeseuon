import * as v from "valibot";

export const ResponseSchema = v.object({
  success: v.boolean(),
  message: v.string(),
});

export type Response = v.InferOutput<typeof ResponseSchema>;
