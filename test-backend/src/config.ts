import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({ quiet: true })

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://127.0.0.1:3000'),
  ADMIN_EMAIL: z
    .string()
    .email()
    .default('admin@64x.com')
    .transform((value) => value.trim().toLowerCase()),
  ADMIN_PASSWORD: z.string().min(1).default('password'),
  JWT_SECRET: z.string().min(8).default('dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  AUTH_OTP_CODE: z.string().min(4).default('242400'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment configuration', parsedEnv.error.flatten())
  process.exit(1)
}

const env = parsedEnv.data

export const config = {
  port: env.PORT,
  allowedOrigins: env.ALLOWED_ORIGINS.split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0),
  adminEmail: env.ADMIN_EMAIL,
  adminPassword: env.ADMIN_PASSWORD,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  authOtpCode: env.AUTH_OTP_CODE,
}

export type AppConfig = typeof config
