import { z } from "zod";

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  category: z.string().trim().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  imageUrl: z
    .string()
    .trim()
    .regex(
      /^(https?:\/\/\S+|\/(?!\/)\S*)$/i,
      "Image must be an http(s) URL or a path starting with /",
    )
    .optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;

export const searchVehicleSchema = z
  .object({
    make: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    // Query strings arrive as text, so coerce. "abc" becomes NaN and fails validation (400).
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  })
  .refine(
    (q) =>
      q.minPrice === undefined ||
      q.maxPrice === undefined ||
      q.minPrice <= q.maxPrice,
    { message: "minPrice must not exceed maxPrice", path: ["minPrice"] },
  );

export type SearchVehicleInput = z.infer<typeof searchVehicleSchema>;

export const updateVehicleSchema = createVehicleSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;

export const restockSchema = z.object({
  quantity: z.number().int().positive(),
});

export type RestockInput = z.infer<typeof restockSchema>;
