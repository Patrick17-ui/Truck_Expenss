import { zValidator } from "@hono/zod-validator";
import { DocumentStatus, DocumentType } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";
import { paginationObject } from "../utils/prisma-pagination";
import { getPrisma } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const documents = new Hono();

documents.get("/", zValidator("query", queryPaginationSchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const { page, limit, q } = c.req.valid("query");

  const [documents, count] = await prisma.$transaction([
    prisma.document.findMany({
            ...paginationObject({ limit, page }),
      
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.count(),
  ]);

  return c.json({
    meta: {
      page,
      limit,
      total: count,
    },
    data: documents,
  });
});

documents.post(
  "/",
  zValidator(
    "json",
    z.object({
      vehicleId: z.string(),
      documentType: z.nativeEnum(DocumentType),
      expiryDate: z.coerce.date(),
      status: z.nativeEnum(DocumentStatus).optional(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const { vehicleId, documentType, expiryDate, status } = c.req.valid("json");

    const newDocument = await prisma.document.create({
      data: {
        vehicleId,
        documentType,
        expiryDate,
        status,
      },
    });

    return c.json(newDocument, 201);
  }
);

documents.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      vehicleId: z.string().optional(),
      documentType: z.nativeEnum(DocumentType).optional(),
      expiryDate: z.coerce.date().optional(),
      status: z.nativeEnum(DocumentStatus).optional(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const id = c.req.param("id");
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return c.json({ message: "Document not found" }, 404);
    }
    const { vehicleId, documentType, expiryDate, status } = c.req.valid("json");
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        vehicleId,
        documentType,
        expiryDate,
        status,
      },
    });
    return c.json(updatedDocument);
  }
);

documents.delete("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) {
    return c.json({ message: "Document not found" }, 404);
  }
  await prisma.document.delete({ where: { id } });
  return c.json({ message: "Document deleted" });
});

export default documents;
