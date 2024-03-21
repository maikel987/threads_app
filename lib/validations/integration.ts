import * as z from "zod";
import { platformLogo } from "@/constants";


const platformKeys: string[] = Object.keys(platformLogo);
const PlatformEnum = z.enum(platformKeys as [string, ...string[]]);

const baseIntegrationValidation = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .max(200, { message: "Maximum 200 characters." }),
  password: z
    .string()
    .max(200, { message: "Maximum 200 characters." })
    .optional(),
  platform: PlatformEnum,
  platform_account_id: z
    .string()
    .min(1, { message: "Platform account ID is required." })
    .max(200, { message: "Maximum 200 characters." }),
  account_url: z
    .string()
    .max(200, { message: "Maximum 200 characters." })
    .optional(),
});

export const IntegrationValidation = baseIntegrationValidation.refine((data) => {
  // Rendre account_url obligatoire si la platform est "airbnb"
  if (data.platform === "airbnb") {
    return !!data.account_url; // Vérifie que account_url n'est pas vide
  }
  return true; // Pas de condition pour les autres valeurs de platform
}, {
  message: "Account URL is required for Airbnb.",
  path: ["account_url"], // Spécifie le chemin de la propriété affectée par cette validation
});
