# GitHub Branch Protection

This workspace is not currently connected to a Git repository, so branch protection cannot be applied from here.

Once the project is pushed to GitHub, configure branch protection with these required status checks:

- `backend-quality`
- `frontend-quality`

Suggested protection settings for the default branch:

- Require a pull request before merging
- Require approvals
- Dismiss stale approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict direct pushes to the protected branch

Recommended setup flow:

1. Push this project to GitHub.
2. Open `Settings > Branches`.
3. Create a rule for your default branch, such as `main`.
4. Enable the protection options above.
5. Add `backend-quality` and `frontend-quality` as required checks.

If you want to apply the rule through the API, use:

```powershell
$env:GITHUB_TOKEN = "your-token"
.\infra\set-branch-protection.ps1 -RepoFullName "owner/repo" -Branch "main"
```
