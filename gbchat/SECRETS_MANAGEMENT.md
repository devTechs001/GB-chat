# 🔐 Secrets & Security Management Guide

**CRITICAL:** This document outlines what should NEVER be committed to version control and how to properly manage secrets in GBChat.

---

## 🚫 NEVER Commit These Files

### Environment Files (.env)

| File Pattern | Location | Contains |
|--------------|----------|----------|
| `.env` | Root, client/, server/ | All environment variables |
| `.env.local` | Root, client/, server/ | Local overrides |
| `.env.*.local` | Root, client/, server/ | Environment-specific locals |
| `*.env.bak`, `*.env.backup` | Anywhere | Backup copies with secrets |

### API Keys & Credentials

| Service | Files to Ignore | Risk Level |
|---------|----------------|------------|
| **MongoDB** | Connection strings with passwords | 🔴 CRITICAL |
| **JWT** | Secret keys | 🔴 CRITICAL |
| **Cloudinary** | API secret, cloud name | 🔴 CRITICAL |
| **Stripe** | Secret keys | 🔴 CRITICAL |
| **Firebase** | Service account JSON, private keys | 🔴 CRITICAL |
| **Google AI** | API keys | 🟠 HIGH |
| **Twilio** | Account SID, auth token | 🟠 HIGH |
| **AWS** | Access keys, secret keys | 🔴 CRITICAL |

### Private Keys & Certificates

```
*.pem
*.key
*.p12
*.pfx
id_rsa
id_rsa.*
*.ppk
*.crt
*.cer
*.der
```

### Database Files

```
*.sqlite
*.sqlite3
*.db
data.db
dumps/
```

### Uploads & User Content

```
server/uploads/
uploads/
avatars/
media/
temp/
```

---

## ✅ What IS Safe to Commit

### Example/Template Files

| File | Purpose |
|------|---------|
| `.env.example` | Template with placeholder values |
| `.env.development.example` | Development template |
| `ENVIRONMENT_VARIABLES_SETUP.md` | Documentation |

### Configuration Files (Without Secrets)

| File | Safe Content |
|------|-------------|
| `netlify.toml` | Build config (no secrets) |
| `render.yaml` | Service config (use `sync: false` for secrets) |
| `package.json` | Dependencies and scripts |
| `vite.config.js` | Build configuration |
| `tailwind.config.js` | Styling config |

---

## 🔒 How to Manage Secrets Properly

### 1. Use Environment Variables

**Development:**
```bash
# Create .env file (DO NOT COMMIT)
cp .env.example .env
# Edit .env with your actual values
```

**Production (Netlify/Render):**
- Add secrets via dashboard UI
- Never in code or config files
- Use platform secret management

### 2. Use .env.example as Template

```bash
# .env.example (SAFE TO COMMIT)
MONGODB_URI=mongodb://localhost:27017/gbchat
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name

# .env (NEVER COMMIT)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gbchat
JWT_SECRET=<your-32-character-random-secret>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
```

### 3. Render.yaml - Use sync: false for Secrets

```yaml
# render.yaml (SAFE TO COMMIT)
envVars:
  - key: MONGODB_URI
    sync: false  # ← This tells Render to get value from dashboard
  - key: JWT_SECRET
    sync: false
  - key: CLOUDINARY_API_SECRET
    sync: false
```

---

## 🛡️ Security Best Practices

### 1. Rotate Secrets Regularly

| Secret Type | Rotation Frequency |
|-------------|-------------------|
| JWT_SECRET | Every 90 days |
| API Keys | Every 6 months |
| Database Passwords | Every 90 days |
| Service Account Keys | Every 6 months |

### 2. Use Different Secrets Per Environment

```
Development → Test keys, local database
Staging → Staging keys, staging database
Production → Production keys, production database
```

### 3. Limit Secret Access

- **Principle of Least Privilege**: Only give access to those who need it
- **Service Accounts**: Use service-specific accounts, not personal ones
- **API Scopes**: Limit what each key can access

### 4. Monitor for Leaks

- **GitHub Secret Scanning**: Enable in repository settings
- **Git History**: Check if secrets were accidentally committed
- **Audit Logs**: Review access logs regularly

---

## 🚨 If You Accidentally Commit Secrets

### Immediate Actions

1. **Rotate the compromised secret immediately**
   - Generate new API keys
   - Change passwords
   - Update JWT_SECRET

2. **Remove from Git history**
   ```bash
   # Install git-filter-repo
   pip install git-filter-repo
   
   # Remove the file from all history
   git-filter-repo --path .env --invert-paths
   
   # Force push (WARNING: rewrites history)
   git push --force
   ```

3. **Revoke the old secret**
   - Delete old API keys
   - Invalidate old tokens

4. **Audit access**
   - Check if the secret was used
   - Review logs for unauthorized access

### GitHub Specific

If pushed to GitHub:
1. Rotate the secret immediately
2. Contact GitHub support to remove from cache
3. Enable secret scanning on the repo

---

## 📋 Secrets Checklist

### Before Each Commit

- [ ] No `.env` files staged
- [ ] No `*.key`, `*.pem` files staged
- [ ] No credentials JSON files staged
- [ ] No upload directories staged
- [ ] Run: `git status` and review all files

### Before Each Push

- [ ] Review commit history for accidental secrets
- [ ] Run: `git log -p --all` to check for leaked secrets
- [ ] Use: `git diff --cached` to review staged changes

### Automated Checks

Add to CI/CD pipeline:
```yaml
# Example: Check for .env files
- name: Check for secrets
  run: |
    if git ls-files | grep -E '\.env$|\.pem$|\.key$'; then
      echo "❌ Potential secrets detected!"
      exit 1
    fi
```

---

## 🔍 Tools to Help

### Pre-commit Hooks

```bash
# Install pre-commit
npm install -g pre-commit

# Add to package.json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

### Secret Detection Tools

| Tool | Purpose |
|------|---------|
| **git-secrets** | AWS credential detection |
| **truffleHog** | High entropy string detection |
| **detect-secrets** | Yelp's secret detection |
| **GitHub Secret Scanning** | Built-in GitHub protection |

---

## 📁 Project Structure - What Goes Where

```
gbchat/
├── .env.example              ✅ SAFE - Template only
├── .gitignore                ✅ SAFE - Ignore patterns
├── ENVIRONMENT_VARIABLES_SETUP.md  ✅ SAFE - Documentation
├── SECRETS_MANAGEMENT.md     ✅ SAFE - This file
├── .env                      ❌ NEVER - Actual secrets
├── .env.local                ❌ NEVER - Local secrets
│
├── server/
│   ├── .env.example          ✅ SAFE - Template
│   ├── .gitignore            ✅ SAFE - Ignore patterns
│   ├── .env                  ❌ NEVER - Server secrets
│   └── uploads/              ❌ NEVER - User content
│
├── client/
│   ├── .env.example          ✅ SAFE - Template
│   ├── .gitignore            ✅ SAFE - Ignore patterns
│   └── .env                  ❌ NEVER - Client secrets
│
└── render.yaml               ⚠️ PARTIAL - Use sync: false for secrets
```

---

## 🆘 Emergency Contacts

If you suspect a secret leak:

1. **Immediately rotate** the compromised credential
2. **Check audit logs** for unauthorized access
3. **Report** to your security team
4. **Document** the incident

---

## 📚 Additional Resources

- [12 Factor App - Config](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

**Remember:** When in doubt, ask yourself:
> "Would I be okay if this was public on GitHub?"

If the answer is no, **don't commit it!**
