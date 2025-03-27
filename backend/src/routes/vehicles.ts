import { zValidator } from "@hono/zod-validator";
import { Prisma, VehicleType } from "@prisma/client";
import { Hono } from "hono";
import * as z from "zod";
import { paginationObject } from "../utils/prisma-pagination";
import { getPrisma } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const vehicles = new Hono();
const querySchema = queryPaginationSchema.extend({});
vehicles.get("/", zValidator("query", querySchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const { page, limit, q } = c.req.valid("query");
  const where: Prisma.VehicleWhereInput = {
    brand: { contains: q },
    model: { contains: q },
  };

  const [vehicles, count] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      ...paginationObject({ limit, page }),
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        brand: true,
        model: true,
        type: true,
        tractorPlateNumber: true,
        trailerPlateNumber: true,
        createdAt: true,
        updatedAt: true,
        documents: true,
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return c.json({
    meta: {
      page: page,
      limit: limit,
      total: count,
    },
    data: vehicles,
  });
});

vehicles.get("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) {
    return c.json({ message: "Vehicle not found" }, 404);
  }

  return c.json(vehicle);
});

vehicles.post(
  "/",
  zValidator(
    "json",
    z.object({
      brand: z.string(),
      type: z.nativeEnum(VehicleType),
      model: z.string(),
      tractorPlateNumber: z.string(),
      trailerPlateNumber: z.string().optional(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const { brand, type, model, tractorPlateNumber, trailerPlateNumber } =
      c.req.valid("json");

    const newVehicle = await prisma.vehicle.create({
      data: {
        brand,
        type,
        model,
        tractorPlateNumber,
        trailerPlateNumber,
      },
    });

    return c.json(newVehicle, 201);
  }
);

vehicles.patch(
  "/:id",
  zValidator(
    "json",
    z.object({
      brand: z.string().optional(),
      type: z.nativeEnum(VehicleType).optional(),
      model: z.string().optional(),
      tractorPlateNumber: z.string().optional(),
      trailerPlateNumber: z.string().optional(),
    })
  ),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const id = c.req.param("id");
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });

    if (!vehicle) {
      return c.json({ message: "Vehicle not found" }, 404);
    }

    const updatedData = c.req.valid("json");
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updatedData,
    });

    return c.json(updatedVehicle);
  }
);

vehicles.delete("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });

  if (!vehicle) {
    return c.json({ message: "Vehicle not found" }, 404);
  }

  await prisma.vehicle.delete({ where: { id } });
  return c.json({ message: "Vehicle deleted" });
});

export default vehicles;
