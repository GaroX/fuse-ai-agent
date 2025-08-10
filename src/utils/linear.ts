import { LinearClient } from "@linear/sdk";
import SecretService from "./secretManager";

export default class LinearService {
  private static client?: LinearClient;
  private static initializing = false;

  private static async init(): Promise<void> {
    if (this.client || this.initializing) return;
    this.initializing = true;

    const LINEAR_APIKEY = (await SecretService.get("LINEAR_API_KEY")) as string;
    if (!LINEAR_APIKEY) throw new Error("Linear API key is required");

    this.client = new LinearClient({ apiKey: LINEAR_APIKEY });
    this.initializing = false;
  }

  public static async addComment(issueId: string, body: string): Promise<void> {
    if (!this.client) await this.init();

    const mutation = `
      mutation CommentCreate($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          success
          comment {
            id
            body
          }
        }
      }
    `;

    const result = await (this.client as any).client.request(mutation, {
      input: { issueId, body },
    });

    if (!result.commentCreate.success) throw new Error("Error creating comment");
    console.log(`Comment created: ${result.commentCreate.comment.id}`);
  }
}
