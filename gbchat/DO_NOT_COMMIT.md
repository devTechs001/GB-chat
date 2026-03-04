# 🚫 DO NOT COMMIT - Quick Reference

## Files That Should NEVER Be Committed

### Environment Files
```bash
.env
.env.local
.env.*.local
*.env.bak
*.env.backup
```

### Keys & Credentials
```bash
*.pem *.key *.p12 *.pfx           # Private keys
id_rsa id_rsa.* *.ppk              # SSH keys
*.crt *.cer *.der                  # Certificates
credentials*.json                  # Credential files
firebase-*.json                    # Firebase configs
service-account*.json              # Service accounts
google-*.json                      # Google credentials
aws-credentials                    # AWS credentials
```

### Database & Uploads
```bash
*.sqlite *.sqlite3 *.db            # Database files
server/uploads/                    # Server uploads
uploads/                           # User uploads
avatars/                           # User avatars
```

---

## ✅ Safe to Commit

```bash
.env.example                       # Template only
render.yaml                        # With sync: false for secrets
netlify.toml                       # No secrets in file
package.json                       # No secrets
*.js *.jsx *.ts *.tsx              # Source code
*.css *.scss                       # Styles
*.html                             # Templates
```

---

## Before You Commit - Run This

```bash
# Check what you're about to commit
git status
git diff --cached

# Look for dangerous patterns
git ls-files | grep -E '\.env$|\.pem$|\.key$|credentials'
```

---

## Quick Secret Detection

```bash
# Check for .env files
find . -name ".env*" -not -name "*.example"

# Check for key files
find . -name "*.pem" -o -name "*.key" -o -name "id_rsa*"

# Check for credential files
find . -name "*credentials*" -o -name "*service-account*"
```

---

## If You Accidentally Commit Secrets

1. **ROTATE THE SECRET IMMEDIATELY**
2. Remove from history:
   ```bash
   git-filter-repo --path .env --invert-paths
   git push --force
   ```
3. Revoke the old secret
4. Check logs for unauthorized access

---

## Environment Variables - Where to Store

| Platform | Where to Add Secrets |
|----------|---------------------|
| **Local Dev** | `.env` file (gitignored) |
| **Netlify** | Site Settings → Environment Variables |
| **Render** | Dashboard → Environment → Add Variable |
| **GitHub Actions** | Settings → Secrets → Actions |

---

**Golden Rule:** If it contains passwords, keys, or tokens → DON'T COMMIT IT!
