## Fuse AI Agent

This project implements a serverless backend agent that automates user management in a directory (`users.json`) in this repository https://github.com/GaroX/react-ai-agent based on issues created in Linear, using Gemini AI and automatically creating Pull Requests in a GitHub repository

### What does it do?
- Listens to Linear webhooks for tasks with a specific label -> USE IA
- Uses Gemini to decide if the task can be performed (add/update user) and validations
- If possible, generates the change in `users.json` and creates a Pull Request in GitHub
- Comments on the Linear issue with the result (PR created, missing info, etc)

### Requirements
- Node.js 20+
- AWS CLI configured (for secrets)
- Access to Linear, GitHub, and Gemini API

### Installation & Usage

```bash
npm install
npm run dev
```

After running the local server, you can execute:

```bash
npm run smee
```

This will forward webhooks from Linear to your local `/webhook` endpoint. Make sure to set the following URL as a webhook in your Linear workspace:

```
https://smee.io/fuse-linear
```

This allows you to receive Linear events locally for development and testing.

### Available Scripts

- **dev**: Builds in watch mode and runs the backend locally with Serverless Offline.
- **build**: Compiles TypeScript to JavaScript using esbuild.
- **build:watch**: Compiles in watch mode (rebuilds on file changes).
- **offline**: Runs the backend with Serverless Offline and nodemon (auto-reload).
- **package**: Builds and packages the handler for deployment (generates `lambda.zip`).
- **smee**: Uses smee.io to forward Linear webhooks to your local `/webhook` endpoint.


### Project Structure

- `src/utils/github.ts`: Authenticated GitHub App client
- `src/utils/linear.ts`: Linear API client
- `src/utils/gemini.ts`: Gemini (Google AI) client
- `src/utils/awsUtils.ts`: AWS utils for lambda
- `src/utils/secretManager.ts`: Utility for loading secrets from AWS Secrets Manager. Implements an in-memory cache per runtime to avoid repeated calls to the secrets service and improve performance.
- `src/linear/issue.ts`: Main agent logic
- `src/linear/prompts.ts`: Centralized prompt for the AI. Here you define the instructions and conditions for the LLM to understand what it should do and how to respond.


### Secrets


Secrets (API Keys) are managed via AWS Secrets Manager. The following secret keys are required:

- **GITHUB_APP_KEYS**: (JSON/plaintext)
	- `GITHUB_APP_ID`: Your GitHub App ID
	- `GITHUB_INSTALLATION_ID`: Your GitHub App installation ID

- **GITHUB_PRIVATE_KEY**: (plaintext)
	- Your GitHub App private key (PEM)

- **LINEAR_API_KEY**: (plaintext)
	- Your Linear personal API key (starts with `lin_api_...`)

- **GEMINI_API_KEY**: (plaintext)
	- Your Gemini API key

All secrets should be stored as plaintext (not JSON unless specified) and must be available in AWS Secrets Manager for the Lambda to function.

### Deployment

This project is designed to run as an AWS Lambda, but you can develop locally using Serverless Offline.

**Production deployment is automated via GitHub Actions.**
Check the `.github/workflows/` directory for the deployment pipeline. On push to `main` (or your configured branch), the action will build and deploy the Lambda and related infrastructure.

---
For any questions or issues, please contact me
