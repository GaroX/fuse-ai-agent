import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import SecretService from "./secretManager";

interface GitHubAppSecrets {
  GITHUB_APP_ID: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_WEBHOOK_SECRET?: string;
  GITHUB_INSTALLATION_ID: string;
}

export default class GitHubClient {
  private static octokit?: Octokit;
  private static initializing = false;

  private static async init(): Promise<void> {
    if (this.octokit || this.initializing) return;
    this.initializing = true;

    const [secrets, GITHUB_PRIVATE_KEY] = await Promise.all([
      (await SecretService.get("GITHUB_APP_KEYS")) as GitHubAppSecrets,
      await SecretService.get("GITHUB_PRIVATE_KEY"),
    ]);

    
    if (
      !secrets?.GITHUB_APP_ID ||
      !GITHUB_PRIVATE_KEY ||
      !secrets?.GITHUB_INSTALLATION_ID
    ) throw new Error("Github Secrets keys is required");

    const privateKey = GITHUB_PRIVATE_KEY.replace(/\\n/g, "\n");

    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: parseInt(secrets.GITHUB_APP_ID, 10),
        privateKey,
        installationId: parseInt(secrets.GITHUB_INSTALLATION_ID, 10),
      },
    });

    this.initializing = false;
  }
  
  public static async getInstance(): Promise<Octokit> {
    if (!this.octokit) {
      await this.init();
    }
    if (!this.octokit) {
      throw new Error("Octokit instance is not initialized");
    }
    return this.octokit;
  }
}
