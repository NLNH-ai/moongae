param(
    [Parameter(Mandatory = $true)]
    [string]$Domain,

    [string]$SourcePath = (Join-Path $PSScriptRoot "nginx/company-website.conf"),

    [string]$OutputPath = (Join-Path $PSScriptRoot "nginx/company-website.generated.conf"),

    [switch]$DisableWww
)

$source = Get-Content $SourcePath -Raw
$escapedDomain = [Regex]::Escape("example.com")
$escapedWwwDomain = [Regex]::Escape("www.example.com")
$wwwDomain = "www.$Domain"

$configured = $source -replace $escapedWwwDomain, $wwwDomain
$configured = $configured -replace $escapedDomain, $Domain

if ($DisableWww) {
    $configured = $configured -replace " $wwwDomain", ""
    $configured = $configured -replace "-d $wwwDomain", ""
}

Set-Content -Path $OutputPath -Value $configured -Encoding UTF8
Write-Host "Generated nginx config: $OutputPath"
