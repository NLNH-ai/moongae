# Infrastructure

Deployment assets for Prompt 6 live here.

- `nginx/company-website.conf`: Nginx reverse proxy and static hosting config
- `configure-domain.ps1`: generate an nginx config with the real domain
- `deploy.sh`: frontend + backend deployment script with health check
- `company-website.service`: systemd unit for the Spring Boot API
- `.env.template`: server environment variable template
- `server-setup.md`: initial server bootstrap guide
- `set-branch-protection.ps1`: GitHub branch protection helper
