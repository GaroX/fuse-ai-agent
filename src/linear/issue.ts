import { LinearIssue, OWNER, REPO, UserDirectoryEntry } from "./types";
import { buildTaskAssessmentPrompt } from "./prompts";
import { AWSResponse } from "../utils/awsUtils";
import GeminiClient from "../utils/gemini";
import LinearService from "../utils/linear";
import GitHubClient from "../utils/github";

async function validateIfBranchExists(branchName: string): Promise<boolean> {
  const octokit = await GitHubClient.getInstance();
  try {
    await octokit.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/feature/${branchName}`,
    });
    return true;
  } catch (err) {
    return false;
  }
}

function cleanGeminiResponse(text: string | undefined): string {
  if (!text) return "";

  return text
    .trim()
    .replace(/^```json[\r\n]*/i, "")
    .replace(/^```[\r\n]*/i, "")
    .replace(/```$/, "");
}

async function createUserDirectoryPR(issue: LinearIssue, userData: UserDirectoryEntry) {
  const octokit = await GitHubClient.getInstance();
  const repoInfo = await octokit.repos.get({
    owner: OWNER,
    repo: REPO,
  });

  const defaultBranch = repoInfo.data.default_branch;
  const mainRefData = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${defaultBranch}`,
  });
  const mainSha = mainRefData.data.object.sha;

  const usersFile = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: "src/data/users.json",
    ref: defaultBranch,
  });
  const usersJson: UserDirectoryEntry[] = JSON.parse(
    Buffer.from((usersFile.data as { content: string }).content, "base64").toString("utf8")
  );

  const idx = usersJson.findIndex(
    (u) => u.id === userData.id || u.email === userData.email
  );

  if (idx >= 0) usersJson[idx] = { ...usersJson[idx], ...userData };
  else usersJson.push(userData);

  const branchName = `feature/${issue.identifier}`;
  await octokit.git.createRef({
    owner: OWNER,
    repo: REPO,
    ref: `refs/heads/${branchName}`,
    sha: mainSha,
  });

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: "src/data/users.json",
    message: `Update users.json for issue ${issue.id}`,
    content: Buffer.from(JSON.stringify(usersJson, null, 2), "utf8").toString("base64"),
    branch: branchName,
    sha: (usersFile.data as any).sha,
  });

  const pr = await octokit.pulls.create({
    owner: OWNER,
    repo: REPO,
    title: `Automatic Change: Modify users.json for ${issue.identifier}`,
    body: `Pull request automatically created for issue: ${issue.title}\n\n${issue.description}\n\n${issue.url}`,
    head: branchName,
    base: defaultBranch,
  });

  await LinearService.addComment(issue.id, `PR created: ${pr.data.html_url}`);
}

export const issueIA = async (issue: LinearIssue) => {
  try {
    const branchExists = await validateIfBranchExists(issue.identifier);
    if (branchExists) return AWSResponse(200, { message: `Branch feature/${issue.identifier} already exists.` });

    const prompt = buildTaskAssessmentPrompt(issue);
    const geminiRaw = await GeminiClient.prompt(prompt);
    const geminiResult = JSON.parse(cleanGeminiResponse(geminiRaw));
    if (!geminiResult) throw new Error("Error with Gemini response!");

    if (!geminiResult?.canDo || geminiResult?.needMoreInfo) {
      await LinearService.addComment(issue.id, geminiResult?.reason || "Not specified");
      const msg = geminiResult?.needMoreInfo
        ? "[Issue] need more information"
        : "[Issue] not supported";

      return AWSResponse(200, { message: msg });
    }

    if (geminiResult?.canDo) {
      await createUserDirectoryPR(issue, geminiResult.userData);
    }

    return AWSResponse(200, { message: "TASK IN SCOPE" });

  } catch (error) {
    console.error("Error:", error);
    return AWSResponse(500, { message: "Error processing request" });
  }
}
