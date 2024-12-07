export const errorHandler = (error: Error | unknown, message?: string) => {
  return {
    success: false,
    data: null,
    message:
      message || (error instanceof Error ? error.message : "Unknown error"),
  };
};

export const successHandler = (data: any, pagination?: any) => {
  return {
    success: true,
    data,
    pagination,
  };
};
