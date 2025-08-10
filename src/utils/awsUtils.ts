import { APIGatewayProxyResult } from "aws-lambda";

export const AWSResponse = <T>(statusCode: number, data: T): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(data)
  };
};
