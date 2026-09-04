import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In development mode, allow seamless testing without requiring full auth session
    if (env.NODE_ENV === 'development') {
      req.userId = 'dev-user-00000000-0000-0000-0000-000000000000';
      return next();
    }
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !env.SUPABASE_JWT_SECRET) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', env.SUPABASE_JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    const signature = Buffer.from(encodedSignature);
    const expected = Buffer.from(expectedSignature);
    if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, expected)) {
      res.status(401).json({ error: 'Invalid token signature' });
      return;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    if (!payload.sub) {
      res.status(401).json({ error: 'Invalid token: no subject' });
      return;
    }

    if (payload.exp && payload.exp < Date.now() / 1000) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}
