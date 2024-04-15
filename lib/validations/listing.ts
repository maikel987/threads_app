import * as z from "zod";

export const ListingValidation = z.object({
    listing_photo: z.string().url().nonempty().optional(),
    link: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    platform: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    title: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    apartment: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    platform_account: z
    .string()
    .min(3, { message: "Minimum 3 characters." })
    .max(300, { message: "Maximum 300 caracters." }),
    
});

