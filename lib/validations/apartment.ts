import * as z from "zod";

export const ApartmentValidation = z.object({
  internal_name: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    checkin_process: z
    .string()
    .max(5000, { message: "Maximum 5000 caracters." })
    .optional(),
    address: z
    .string()
    .max(1000, { message: "Maximum 1000 caracters." }).optional(),
    urgent_number: z
    .string()
    .max(30, { message: "Maximum 30 caracters." })
});
