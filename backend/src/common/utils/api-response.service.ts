/**
 * API Response Utilities
 * Standardized response formatting
 */

import { Injectable } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  path?: string;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class ApiResponseService {
  /**
   * Success response
   */
  success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Paginated success response
   */
  paginated<T>(data: T[], page: number, limit: number, total: number): ApiResponse<PaginatedData<T>> {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error response
   */
  error(code: string, message: string, details?: Record<string, any>): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Map paginated result
   */
  mapPaginated<T>(
    items: T[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedData<T> {
    const totalPages = Math.ceil(total / limit);
    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
