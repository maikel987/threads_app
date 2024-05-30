import * as z from "zod";
import { platformLogo } from "@/constants";


const platformKeys: string[] = Object.keys(platformLogo);
const PlatformEnum = z.enum(platformKeys as [string, ...string[]]);

export const IntegrationValidation = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  platform: PlatformEnum.refine(data => data !== undefined, {
    message: "Platform selection is required!",
  }),
  platform_account_id: z.string().optional(),
  account_url: z.string().optional(),
  apiKey: z.string().optional(),
}).superRefine((data, ctx) => {
  switch (data.platform) {
    case "airbnb":
      if (!data.account_url) {
        ctx.addIssue({
          path: ['account_url'],
          message: 'Account URL is required for Airbnb.',
          code: z.ZodIssueCode.custom,
        });
      }
      break;
    case "vrbo":
    case "booking":
      if (!data.username) {
        ctx.addIssue({
          path: ['username'],
          message: `Username is required for ${data.platform}.`,
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.password) {
        ctx.addIssue({
          path: ['password'],
          message: `Password is required for ${data.platform}.`,
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.platform_account_id) {
        ctx.addIssue({
          path: ['platform_account_id'],
          message: `Platform Account ID is required for ${data.platform}.`,
          code: z.ZodIssueCode.custom,
        });
      }
      break;
    case "bed24":
    case "hospitable":
      if (!data.apiKey) {
        ctx.addIssue({
          path: ['apiKey'],
          message: `API Key is required for ${data.platform}.`,
          code: z.ZodIssueCode.custom,
        });
      }
      break;
  }
});