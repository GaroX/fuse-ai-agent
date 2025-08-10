import { APIGatewayProxyHandler } from "aws-lambda";
import { issueIA } from "./linear/issue";
import { LinearWebhookEvent, LinearIssue, USE_IA_LABEL_ID } from "./linear/types";
import { AWSResponse } from "./utils/awsUtils";

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}") as LinearWebhookEvent;
  const data = body.data;
  const info: LinearIssue = {
    id: data.id,
    title: data.title,
    description: data.description,
    labelIds: data.labelIds,
    url: data.url,
    identifier: data.identifier,
  };
  
  if (body.action !== "update" || body.type !== "Issue") return AWSResponse(200, { message: "Ignoring task non-update event or non-issue event" });
  if (!info.labelIds.includes(USE_IA_LABEL_ID)) return AWSResponse(200, { message: "Not found label 'USE IA'" });
  
  return issueIA(info);
};
