export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type ApiError = {
  error: { code: string; message: string };
};
