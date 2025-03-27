import { z } from "zod";

export const queryPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().default(50),
  q: z.string().optional(),
});

 export type QueryPaginationSchema = z.infer<typeof queryPaginationSchema>;