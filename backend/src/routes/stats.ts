import { Hono } from "hono";
import { getPrismaWithoutSoftDelete } from "../utils/prismaFunction";

const stats = new Hono();

stats.get("/", async (c) => {
  try {
    const prisma = getPrismaWithoutSoftDelete(Bun.env.DATABASE_URL!);

    // Exécution des requêtes en parallèle pour optimiser la performance
    const [
      tripsLast12Months,
      ongoingTrips,
      expensesLast12Months,
      weighbridgeExpensesLast12Months,
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT TO_CHAR(DATE_TRUNC('month', "startTime"), 'YYYY-MM') AS month, COUNT(id) as trip_count
        FROM "Trip"
        WHERE "startTime" >= NOW() - INTERVAL '12 months' 
          AND "deletedAt" IS NULL
        GROUP BY month
        ORDER BY month ASC;
      `,

      prisma.trip.count({
        where: { endTime: null, deletedAt: null },
      }),

      prisma.$queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('month', e."createdAt"), 'YYYY-MM') AS month, SUM(e.amount) as total_expense
      FROM "Expense" e
      JOIN "Trip" t ON e."tripId" = t."id"
      WHERE e."createdAt" >= NOW() - INTERVAL '12 months'
        AND e.category != 'WEIGHBRIDGE'
        AND e."deletedAt" IS NULL
        AND t."deletedAt" IS NULL  -- Exclure les voyages supprimés
      GROUP BY month
      ORDER BY month ASC;
    `,

      prisma.$queryRaw`
      SELECT TO_CHAR(DATE_TRUNC('month', e."createdAt"), 'YYYY-MM') AS month, SUM(e.amount) as total_expense
      FROM "Expense" e
      JOIN "Trip" t ON e."tripId" = t."id"
      WHERE e."createdAt" >= NOW() - INTERVAL '12 months'
        AND e.category = 'WEIGHBRIDGE'
        AND e."deletedAt" IS NULL
        AND t."deletedAt" IS NULL  -- Exclure les voyages supprimés
      GROUP BY month
      ORDER BY month ASC;
    `,
    ]);

    // Gestion des BigInt (PostgreSQL peut renvoyer des BigInt pour SUM())
    const sanitizeBigInt = (obj: any) => {
      return JSON.parse(
        JSON.stringify(obj, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    };

    return c.json({
      meta: { success: true },
      data: {
        tripsLast12Months: sanitizeBigInt(tripsLast12Months),
        ongoingTrips,
        expensesLast12Months: sanitizeBigInt(expensesLast12Months),
        weighbridgeExpensesLast12Months: sanitizeBigInt(
          weighbridgeExpensesLast12Months
        ),
      },
    });
  } catch (error: unknown) {
    return c.json(
      {
        meta: {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
      },
      500
    );
  }
});
export default stats;
