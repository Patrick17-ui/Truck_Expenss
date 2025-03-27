import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getPrisma, getPrismaWithoutSoftDelete } from "../utils/prismaFunction";

const invoices = new Hono();

// Get all invoices with pagination
invoices.get("/", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 50;
  const where = {};

  const [data, count] = await prisma.$transaction([
    prisma.invoice.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.count({ where }),
  ]);

  return c.json({
    meta: { page, limit, total: count },
    data,
  });
});

// Get invoice by ID
invoices.get("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) return c.json({ message: "Invoice not found" }, 404);
  return c.json(invoice);
});

const invoiceSchema = z.object({
  clientId: z.string(),
  totalAmount: z.number(),
  invoiceDate: z.coerce.date(),
  tva: z.number().optional(),
  tripId: z.string(),
});
// Create invoice
invoices.post("/", zValidator("json", invoiceSchema), async (c) => {
  const prisma = getPrismaWithoutSoftDelete(Bun.env.DATABASE_URL!);

  const findDeletedInvoice = await prisma.invoice.findFirst({
    where: {
      tripId: c.req.valid("json").tripId,
      deletedAt: { not: null },
    },
  });
  if (!findDeletedInvoice) {
    return c.json(
      await prisma.invoice.create({
        data: c.req.valid("json"),
      })
    );
  }
  if (findDeletedInvoice) {
    const invoice = await prisma.invoice.update({
      where: { id: findDeletedInvoice.id },
      data: { deletedAt: null, ...c.req.valid("json") },
    });
    return c.json(invoice);
  }

});

// Update invoice by ID
invoices.patch(
  "/:id",
  zValidator("json", invoiceSchema.partial()),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const id = c.req.param("id");
    const invoice = await prisma.invoice.findUnique({ where: { id } });

    if (!invoice) return c.json({ message: "Invoice not found" }, 404);

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: c.req.valid("json"),
    });

    return c.json(updatedInvoice);
  }
);

// Delete invoice by ID
invoices.delete("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) return c.json({ message: "Invoice not found" }, 404);

  await prisma.invoice.delete({ where: { id } });
  return c.json({ message: "Invoice deleted" });
});

export default invoices;
