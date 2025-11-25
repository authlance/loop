// src/global.d.ts
export {};

declare global {
  namespace Express {
    interface Request {
        user?: any; // Replace `any` with the appropriate type for `user`
    }
  }
}
