import { zValidator } from "@hono/zod-validator";
import { UserRole } from "@prisma/client";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import * as z from "zod";
import { getPrisma } from "../utils/prismaFunction";

const auth = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
  name: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.DRIVER]),
  matricule: z.string(),
});

// POST /login (Login a user)
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const prisma = getPrisma((c.env as any).DATABASE_URL);
  const { email, password } = c.req.valid("json");

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return c.json({ message: "Invalid credentials" }, 404);
  }

  // Verify password
  if (!user.password) {
    return c.json({ message: "Invalid credentials" }, 422);
  }
  const isPasswordValid = await Bun.password.verify(password, user.password);
  if (!isPasswordValid) {
    return c.json({ message: "Invalid credentials" }, 422);
  }

  // Generate JWT token
  const token = await sign(
    { id: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    Bun.env.SECRET!
  );

  const { password: _, ...userData } = user;
  return c.json({ user: userData, token });
});

// POST /register (Register a new user)
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const prisma = getPrisma((c.env as any).DATABASE_URL);
  const { email, password, name, role, matricule } = c.req.valid("json");

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    return c.json({ message: "User already exists" }, 422);
  }

  // Hash password
  const hashedPassword = await Bun.password.hash(password);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      matricule,
    },
  });

  const { password: _, ...userData } = newUser;

  // Generate JWT token
  const token = await sign(
    { id: userData.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    Bun.env.SECRET!
  );

  return c.json({ user: userData, token });
});

export default auth;
