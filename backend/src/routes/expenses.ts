import { zValidator } from "@hono/zod-validator";
import { ExpenseCategory, Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";
import { paginationObject } from "../utils/prisma-pagination";
import { getPrisma } from "../utils/prismaFunction";
import { queryPaginationSchema } from "../utils/query-validator";

const expenses = new Hono();

// Get all expenses with pagination
const expensesQuerySchema = queryPaginationSchema.extend({
  category: z.nativeEnum(ExpenseCategory).optional(),
  trip: z.string().optional(),
  startingDate: z.coerce.date().optional(),
  endingDate: z.coerce.date().optional(),
});

const expensesSchema = z.object({
  tripId: z.string(),
  category: z
    .enum([
      ExpenseCategory.FUEL,
      ExpenseCategory.TOLL,
      ExpenseCategory.MAINTENANCE,
      ExpenseCategory.MISC,
      ExpenseCategory.WEIGHBRIDGE,
    ])
    .nullable(),
  weighbridgeId: z.string().optional().nullable(),
  amount: z.number(),
  description: z.string().optional(),
});

expenses.get("/", zValidator("query", expensesQuerySchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const { category, trip, q, startingDate, endingDate, ...pagination } =
    c.req.valid("query");
  const where: Prisma.ExpenseWhereInput = {};

  if (trip) {
    where.tripId = trip;
  }
  if (category) {
    where.category = category;
  }

  if (startingDate && endingDate) {
    where.createdAt = {
      gte: new Date(startingDate),
      lte: new Date(endingDate),
    };
  }

  const [data, count] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      ...paginationObject(pagination),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        category: true,
        amount: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        trip: true,
        weighbridge: true,
        weighbridgeId: true,
      },
    }),
    prisma.expense.count({ where }),
  ]);

  return c.json({
    meta: { ...pagination, total: count },
    data,
  });
});

// Get expense by ID
expenses.get("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense) return c.json({ message: "Expense not found" }, 404);
  return c.json(expense);
});

// Create expense
expenses.post("/", zValidator("json", expensesSchema), async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const data = c.req.valid("json");

  const expense = await prisma.expense.create({
    data,
  });

  return c.json(expense);
});

// Update expense by ID
expenses.patch(
  "/:id",
  zValidator("json", expensesSchema.partial()),
  async (c) => {
    const prisma = getPrisma(Bun.env.DATABASE_URL!);
    const id = c.req.param("id");
    const expense = await prisma.expense.findUnique({ where: { id } });

    if (!expense) return c.json({ message: "Expense not found" }, 404);

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: c.req.valid("json"),
    });

    return c.json(updatedExpense);
  }
);

// Delete expense by ID
expenses.delete("/:id", async (c) => {
  const prisma = getPrisma(Bun.env.DATABASE_URL!);
  const id = c.req.param("id");
  const expense = await prisma.expense.findUnique({ where: { id } });

  if (!expense) return c.json({ message: "Expense not found" }, 404);

  await prisma.expense.delete({ where: { id } });
  return c.json({ message: "Expense deleted" });
});

export default expenses;
