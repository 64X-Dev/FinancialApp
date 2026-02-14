import { NextFunction, Request, Response } from 'express'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { config } from '../config'
import { ApiError } from './error'

interface AdminClaims {
  role: 'admin'
  email: string
}

export interface AuthenticatedRequest extends Request {
  auth?: AdminClaims
}

function getBearerToken(headerValue?: string): string | null {
  if (!headerValue) {
    return null
  }

  const [scheme, token] = headerValue.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

export function issueAdminToken(email: string): string {
  const expiresIn = config.jwtExpiresIn as SignOptions['expiresIn']

  return jwt.sign(
    {
      role: 'admin',
      email,
    },
    config.jwtSecret,
    {
      expiresIn,
    },
  )
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = getBearerToken(req.header('authorization'))

  if (!token) {
    throw new ApiError(401, 'AUTH_REQUIRED', 'Authorization header with Bearer token is required')
  }

  let decoded: unknown

  try {
    decoded = jwt.verify(token, config.jwtSecret)
  } catch {
    throw new ApiError(401, 'INVALID_TOKEN', 'Token is invalid or expired')
  }

  if (!decoded || typeof decoded !== 'object') {
    throw new ApiError(401, 'INVALID_TOKEN', 'Token payload is invalid')
  }

  const claims = decoded as Partial<AdminClaims>

  if (claims.role !== 'admin' || claims.email !== config.adminEmail) {
    throw new ApiError(403, 'FORBIDDEN', 'Admin access is required')
  }

  ;(req as AuthenticatedRequest).auth = {
    role: 'admin',
    email: claims.email,
  }

  next()
}
