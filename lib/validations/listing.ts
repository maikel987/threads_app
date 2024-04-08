import * as z from "zod";

export const ListingValidation = z.object({
  link: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    platform: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    status: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(1000, { message: "Maximum 1000 caracters." }),
    title: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
});

