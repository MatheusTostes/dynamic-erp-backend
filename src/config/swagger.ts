import { SwaggerOptions } from "swagger-ui-express";

export const swaggerOptions: SwaggerOptions = {
  swaggerOptions: {
    openapi: "3.0.0",
    info: {
      title: "API",
    },
    url: "/api/swagger.json",
    baseUrl: "/api",
  },
  explorer: true,
  swaggerUrl: "/api",
  customSiteTitle: "API Documentation",
};

export const configureSwaggerDocument = (swaggerDocument: any) => {
  swaggerDocument.servers = [
    {
      url: "/api",
      description: "API Server",
    },
  ];
  return swaggerDocument;
};
