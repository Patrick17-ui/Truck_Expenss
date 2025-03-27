import { Prisma, PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import {
  createSoftDeleteExtension,
  ModelConfig,
} from "prisma-extension-soft-delete";

const softDeleteableModels: Partial<
  Record<Prisma.ModelName, boolean | ModelConfig>
> = {
  Client: true,
  Document: true,
  Expense: true,
  Trip: true,
  User: true,
  Vehicle: true,
  Invoice: true,
  Weighbridge: true,
  Salary: true,
};
export const getPrisma = (database_url: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  })
    .$extends(
      createSoftDeleteExtension({
        models: softDeleteableModels,
        defaultConfig: {
          field: "deletedAt",
          createValue: (deleted) => {
            if (deleted) return new Date();
            return null;
          },
        },
      })
    )
    .$extends(withAccelerate());

  return prisma;
};

export const getPrismaWithoutSoftDelete = (database_url: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  }).$extends(withAccelerate());

  return prisma;
};
