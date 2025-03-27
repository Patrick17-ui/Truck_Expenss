import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { paginationObject } from "../utils/prisma-pagination";
import { getPrisma } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const weighbridges = new Hono();

weighbridges.get("/", zValidator("query", queryPaginationSchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const { page, limit, q } = c.req.valid("query");
  const where = {
    name: { contains: q },
  };

  const [data, count] = await prisma.$transaction([
    prisma.weighbridge.findMany({
      where,
      ...paginationObject({ limit, page }),
      orderBy: { updatedAt: "desc" },
    }),
    prisma.weighbridge.count({ where }),
  ]);

  return c.json({
    meta: { page, limit, total: count },
    data,
  });
});

weighbridges.get("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const weighbridge = await prisma.weighbridge.findUnique({ where: { id } });

  if (!weighbridge) return c.json({ message: "Weighbridge not found" }, 404);
  return c.json(weighbridge);
});

weighbridges.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const { name } = c.req.valid("json");

    const weighbridge = await prisma.weighbridge.create({
      data: { name },
    });

    return c.json(weighbridge);
  }
);

// Update weighbridge by ID
weighbridges.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const id = c.req.param("id");
    const weighbridge = await prisma.weighbridge.findUnique({ where: { id } });

    if (!weighbridge) return c.json({ message: "Weighbridge not found" }, 404);

    const { name } = c.req.valid("json");
    const updatedWeighbridge = await prisma.weighbridge.update({
      where: { id },
      data: { name },
    });

    return c.json(updatedWeighbridge);
  }
);

weighbridges.delete("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const weighbridge = await prisma.weighbridge.findUnique({ where: { id } });

  if (!weighbridge) return c.json({ message: "Weighbridge not found" }, 404);

  await prisma.weighbridge.delete({ where: { id } });
  return c.json({ message: "Weighbridge deleted" });
});

export default weighbridges;
