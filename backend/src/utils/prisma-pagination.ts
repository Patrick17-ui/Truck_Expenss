import { QueryPaginationSchema } from "./query-validator";

export function paginationObject({
  limit,
  page,
}: Omit<QueryPaginationSchema, "q">):
  | { take: number; skip: number }
  | undefined {
  if (limit <= 0) return undefined;

  return {
    take: limit,
    skip: (page - 1) * limit,
  };
}
