import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { paginationObject } from "../utils/prisma-pagination";
import { getPrisma } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const clients = new Hono();

// Get all clients with pagination
clients.get("/", zValidator("query", queryPaginationSchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const { page, limit, q } = c.req.valid("query");
  const where = {
    name: { contains: q },
  };

  const [data, count] = await prisma.$transaction([
    prisma.client.findMany({
      where,
      ...paginationObject({ limit, page }),
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        contact: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        trips: true,
      },
    }),
    prisma.client.count({ where }),
  ]);

  return c.json({
    meta: { page, limit, total: count },
    data,
  });
});

// Get client by ID
clients.get("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) return c.json({ message: "Client not found" }, 404);
  return c.json(client);
});

// Create client
clients.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string(),
      contact: z.string().optional(),
      address: z.string().optional(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const { name, contact, address } = c.req.valid("json");

    const client = await prisma.client.create({
      data: { name, contact, address },
    });

    return c.json(client);
  }
);

// Update client by ID
clients.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      name: z.string().optional(),
      contact: z.string().optional(),
      address: z.string().optional(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const id = c.req.param("id");
    const client = await prisma.client.findUnique({ where: { id } });

    if (!client) return c.json({ message: "Client not found" }, 404);

    const { name, contact, address } = c.req.valid("json");
    const updatedClient = await prisma.client.update({
      where: { id },
      data: { name, contact, address },
    });

    return c.json(updatedClient);
  }
);

// Delete client by ID
clients.delete("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const client = await prisma.client.findUnique({ where: { id } });

  if (!client) return c.json({ message: "Client not found" }, 404);

  await prisma.client.delete({ where: { id } });
  return c.json({ message: "Client deleted" });
});

export default clients;
