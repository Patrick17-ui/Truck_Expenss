import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";
import { getPrismaWithoutSoftDelete } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const logs = new Hono();
type ModelName = Prisma.TypeMap["meta"]["modelProps"][];
const models: ModelName = [
  "client",
  "document",
  "expense",
  "trip",
  "user",
  "vehicle",
  "weighbridge",
  "salary",
];
const logsQuerySchema = queryPaginationSchema.extend({
  startingDate: z.coerce.date(),
  endingDate: z.coerce.date(),
  model: z.enum(models as [string, ...string[]]),
});
// GET /logs (List deleted items with filters & pagination)
logs.get("/", zValidator("query", logsQuerySchema), async (c) => {
  const prisma = getPrismaWithoutSoftDelete(Bun.env.DATABASE_URL!);
  const { startingDate, endingDate, model, ...pagination } =
    c.req.valid("query");
  const where: any = {};
  if (startingDate && endingDate) {
    where.deletedAt = {
      gte: new Date(startingDate),
      lte: new Date(endingDate),
    };
  }

  const responseData = await (prisma as any)[model].findMany({
    where,
    include: {},
  });

  return c.json(responseData);
});
export default logs;
