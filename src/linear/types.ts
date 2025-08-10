export const USE_IA_LABEL_ID = "0359de4e-9c18-44f7-811b-b74f83a9ab82";
export const OWNER = "GaroX";
export const REPO = "react-ai-agent";

export interface LinearUser {
  id: string;
  name: string;
}

export interface LinearState {
  id: string;
  name: string;
}

export interface LinearIssue {
  id: string;
  title: string;
  description: string;
  labelIds: string[];
  identifier: string;
  url?: string;
}

export interface LinearWebhookEvent {
  action: string;
  data: LinearIssue;
  type: string;
}

export interface UserDirectoryEntry {
  id: number;
  name: string;
  email: string;
  age: number;
  occupation: string;
  location: string;
  joinDate: string;
  status: string;
  department: string;
  manager: string;
}
