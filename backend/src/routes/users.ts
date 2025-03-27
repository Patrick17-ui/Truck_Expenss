import { zValidator } from "@hono/zod-validator";
import { Prisma, UserRole } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";
import { paginationObject } from "../utils/prisma-pagination";
import { getPrisma } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const users = new Hono();
const prisma = getPrisma(Bun.env.DATABASE_URL!);

// Query schema for filtering and pagination
const userQuerySchema = queryPaginationSchema.extend({
  role: z.nativeEnum(UserRole).optional(),
});

// GET /users (List users with filters & pagination)
users.get("/", zValidator("query", userQuerySchema), async (c) => {
  const { q, role, ...pagination } = c.req.valid("query");

  const where: Prisma.UserWhereInput = {
    OR: q
      ? [
          { email: { contains: q, mode: "insensitive" } },
          { matricule: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
    role,
  };
  const [data, count] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      ...paginationObject(pagination),
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        matricule: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return c.json({
    meta: {
      ...pagination,
      total: count,
    },
    data,
  });
});

const driversTripsFilterSchema = z.object({
  endingDate: z.coerce.date(),
  startingDate: z.coerce.date(),
});
// GET /drivers-trips (List drivers with trips sinca at a specific date)
users.get(
  "/drivers-trips",
  zValidator("query", driversTripsFilterSchema),
  async (c) => {
    const { startingDate, endingDate } = c.req.valid("query");
    const drivers = await prisma.user.findMany({
      where: { role: UserRole.DRIVER },
      select: {
        id: true,
        name: true,
        email: true,
        matricule: true,
        trips: {
          where: {
            startTime: {
              gte: startingDate,
            },
            endTime: {
              lte: endingDate,
            },
          },
          // orderBy: { startTime: "desc" },
        },
      },
      orderBy: {
        trips: {
          _count: "desc",
        },
      },
    });
    return c.json(drivers);
  }
);

// GET /users/:id (Get a user)
users.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? c.json(user) : c.json({ message: "User not found" }, 404);
});

// DELETE /users/:id (Delete a user)
users.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return c.json({ message: "User not found" }, 404);

  await prisma.user.delete({ where: { id } });
  return c.json({ message: "User deleted" });
});

// DELETE /users (Batch delete users)
users.delete("/", async (c) => {
  const ids = c.req.query("ids")?.split(",") || [];
  if (ids.length === 0) return c.json({ message: "No IDs provided" }, 400);

  const usersToDelete = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  if (usersToDelete.length === 0)
    return c.json({ message: "No valid users found" }, 404);

  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  return c.json({ message: `${usersToDelete.length} users deleted` });
});

// Schema for updating a user
const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  matricule: z.string().min(2).max(64).optional(),
  password: z.string().min(8).optional(),
});

// PATCH /users/:id (Update a user)
users.patch("/:id", zValidator("json", updateUserSchema), async (c) => {
  const id = c.req.param("id");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return c.json({ message: "User not found" }, 404);

  const updateData = c.req.valid("json");
  if (updateData.password) {
    updateData.password = await Bun.password.hash(updateData.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  const { password: _, ...updatedUserData } = updatedUser;
  return c.json(updatedUserData);
});

export default users;
