import { LinearIssue } from "./types";

export interface GeminiTaskAssessment {
  canDo: boolean;
  reason?: string;
  needMoreInfo?: boolean;
  missingInfo?: string[];
}
export function buildTaskAssessmentPrompt(issue: LinearIssue): string {
  return `You are an AI agent that helps automate tasks for a development team. You will receive information about a task from Linear. Your ONLY scope is to add or update user information in the following JSON file used by a React app as a user directory. You CANNOT delete users or perform unrelated actions.

Here is the structure and an example of the users.json file:

[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "age": 32,
    "occupation": "Software Engineer",
    "location": "New York, NY",
    "joinDate": "2022-01-15",
    "status": "Active",
    "department": "Engineering",
    "manager": "Jane Smith"
  },
  ...
]

You must answer ONLY in valid JSON, following this structure:
{
  "canDo": boolean, // true if you can do the task, false if not
  "reason": string, // Explain why you can or cannot do it. If you cannot do it or need more information, specify exactly which fields are missing. If there is extra information in the request that will not be used, mention it as well.
  "needMoreInfo": boolean, // true if you need more information to decide
  "missingInfo": [string], // List of missing data, if any
  "userData": object // If canDo is true, provide the user object ready to be added/updated in users.json. For updates, always include the user's id or email to identify them.
}

If the task is to update a user, you MUST include either the user's id or email in userData to identify the user in the directory. If neither is provided, ask for it in missingInfo and reason.

Task information:
Title: ${issue.title}
Description: ${issue.description}
`;
}
