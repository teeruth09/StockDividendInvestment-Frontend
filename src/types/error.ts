export interface MyApiError {
  response?: {
    status: number;
    data: {
      message: string;
    };
  };
  message: string;
}