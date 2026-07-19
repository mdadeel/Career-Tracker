import { Request } from "express";
import { TokenPayload } from "../utils/token";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}
