import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

export default class SecretService {
  private static client?: SecretsManagerClient;
  private static cache = new Map<string, string | Record<string, any>>();

  private static init(): void {
    if (!this.client) {
      this.client = new SecretsManagerClient({});
    }
  }


  public static async get(SecretId: string): Promise<string | Record<string, any>> {
    if (this.cache.has(SecretId)) return this.cache.get(SecretId)!;

    this.init();

    const command = new GetSecretValueCommand({ SecretId });
    const response = await this.client!.send(command);
    if (!response.SecretString) throw new Error(`Secret ${SecretId} not found`);

    let parsed: string | Record<string, any>;
    try {
      parsed = JSON.parse(response.SecretString);
    } catch {
      parsed = response.SecretString;
    }

    this.cache.set(SecretId, parsed);
    return parsed;
  }
}
