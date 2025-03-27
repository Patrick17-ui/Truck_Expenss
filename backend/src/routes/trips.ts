import { zValidator } from "@hono/zod-validator";
import { Prisma, TripType } from "@prisma/client";
import { Hono } from "hono";
import * as z from "zod";
import { paginationObject } from "../utils/prisma-pagination";
import { getPrisma } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const trips = new Hono();
const tripsQuerySchema = queryPaginationSchema.extend({});

const tripSchema = z.object({
  vehicleId: z.string(),
  driverId: z.string(),
  clientId: z.string().optional(),
  departure: z.string(),
  arrival: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  tripType: z.nativeEnum(TripType),
  cubicMeters: z.number().optional(),
  totalAmount: z.number().optional(),
  lvNumber: z.string().optional(),
});
trips.get("/", zValidator("query", tripsQuerySchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const { q, ...pagination } = c.req.valid("query");
  const where: Prisma.TripWhereInput = {
    departure: { contains: q },
    arrival: { contains: q },
  };

  const [trips, count] = await prisma.$transaction([
    prisma.trip.findMany({
      where,
      ...paginationObject(pagination),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        departure: true,
        arrival: true,
        startTime: true,
        endTime: true,
        tripType: true,
        expenses: {
          select: {
            id: true,
            category: true,
            amount: true,
            description: true,
            weighbridge: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
        vehicle: true,
        vehicleId: true,
        driver: true,
        client: true,
        clientId: true,
        driverId: true,
        cubicMeters: true,
        totalAmount: true,
        lvNumber: true,
        invoice: true,
      },
    }),
    prisma.trip.count({ where }),
  ]);

  return c.json({
    meta: {
      ...pagination,
      total: count,
    },
    data: trips,
  });
});

trips.get("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  let trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true, client: true },
  });

  if (!trip) {
    trip = await prisma.trip.findUnique({
      where: { lvNumber: id },
      include: { vehicle: true, driver: true, client: true },
    });
  }

  if (!trip) {
    return c.json({ message: "Trip not found" }, 404);
  }

  return c.json(trip);
});

trips.post("/", zValidator("json", tripSchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);

  const newTrip = await prisma.trip.create({
    data: c.req.valid("json"),
  });

  return c.json(newTrip, 201);
});

trips.patch("/:id", zValidator("json", tripSchema.partial()), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) {
    return c.json({ message: "Trip not found" }, 404);
  }

  const updatedData = c.req.valid("json");
  const updatedTrip = await prisma.trip.update({
    where: { id },
    data: updatedData,
  });

  return c.json(updatedTrip);
});

trips.delete("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const trip = await prisma.trip.findUnique({ where: { id } });

  if (!trip) {
    return c.json({ message: "Trip not found" }, 404);
  }

  await prisma.trip.delete({ where: { id } });
  return c.json({ message: "Trip deleted" });
});

export default trips;
