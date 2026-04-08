param(
    [Parameter(Mandatory = $true)]
    [string]$RepoFullName,

    [string]$Branch = "main",

    [string]$GitHubToken = $env:GITHUB_TOKEN
)

if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    throw "GITHUB_TOKEN is required. Pass -GitHubToken or set the GITHUB_TOKEN environment variable."
}

$headers = @{
    Accept               = "application/vnd.github+json"
    Authorization        = "Bearer $GitHubToken"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$owner, $repo = $RepoFullName.Split("/", 2)

if ([string]::IsNullOrWhiteSpace($owner) -or [string]::IsNullOrWhiteSpace($repo)) {
    throw "RepoFullName must be in the form owner/repo."
}

$body = @{
    required_status_checks = @{
        strict   = $true
        contexts = @(
            "backend-quality",
            "frontend-quality"
        )
    }
    enforce_admins = $true
    required_pull_request_reviews = @{
        dismiss_stale_reviews           = $true
        require_code_owner_reviews      = $false
        required_approving_review_count = 1
        require_last_push_approval      = $false
    }
    restrictions                    = $null
    required_linear_history         = $false
    allow_force_pushes              = $false
    allow_deletions                 = $false
    block_creations                 = $false
    required_conversation_resolution = $true
    lock_branch                     = $false
    allow_fork_syncing              = $true
} | ConvertTo-Json -Depth 10

$url = "https://api.github.com/repos/$owner/$repo/branches/$Branch/protection"

Invoke-RestMethod `
    -Method Put `
    -Uri $url `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body | Out-Null

Write-Host "Branch protection updated for $RepoFullName ($Branch)."
