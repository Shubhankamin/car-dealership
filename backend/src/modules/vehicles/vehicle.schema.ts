import { z } from "zod";

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  category: z.string().trim().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
