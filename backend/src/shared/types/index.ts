export interface AppConfig {
  port: number;
  host: string;
  databaseUrl: string;
  databaseUrlRo: string;
  nodeEnv: string;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
