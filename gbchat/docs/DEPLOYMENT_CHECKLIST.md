# GBChat Deployment Checklist

Use this checklist to ensure everything is configured correctly before and after deployment.

---

## 📋 Pre-Deployment Checklist

### Environment Setup

- [ ] **MongoDB Atlas**
  - [ ] Created cluster
  - [ ] Created database user
  - [ ] Got connection string
  - [ ] Whitelisted `0.0.0.0/0` (all IPs)
  - [ ] Tested connection locally

- [ ] **Cloudinary**
  - [ ] Created account
  - [ ] Got Cloud Name
  - [ ] Got API Key
  - [ ] Got API Secret
  - [ ] Tested upload locally

- [ ] **Email Service**
  - [ ] Enabled 2FA on Gmail
  - [ ] Generated App Password
  - [ ] Tested sending email locally

- [ ] **Environment Variables**
  - [ ] Created server `.env` file
  - [ ] Created client `.env` file
  - [ ] All required variables set
  - [ ] No sensitive values in code

### Code Preparation

- [ ] **Git Repository**
  - [ ] All changes committed
  - [ ] Pushed to GitHub
  - [ ] On correct branch (main)
  - [ ] `.gitignore` includes `.env`

- [ ] **Package Files**
  - [ ] `package.json` has all dependencies
  - [ ] `render.yaml` is configured correctly
  - [ ] Build scripts are correct

- [ ] **Testing**
  - [ ] Tested locally
  - [ ] No console errors
  - [ ] All features working
  - [ ] API endpoints tested

---

## 🚀 Deployment Checklist

### Render Setup

- [ ] **Account & Connection**
  - [ ] Render account created
  - [ ] GitHub connected
  - [ ] Repository selected

- [ ] **Backend Service**
  - [ ] Service created
  - [ ] Root dir: `server`
  - [ ] Build command: `npm install`
  - [ ] Start command: `node index.js`
  - [ ] Region selected (Oregon recommended)
  - [ ] Plan selected (Starter recommended)

- [ ] **Backend Environment Variables**
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `MONGODB_URI` (with real credentials)
  - [ ] `JWT_SECRET` (auto-generated or custom)
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `CLIENT_URL` (frontend URL)
  - [ ] `CORS_ORIGIN` (frontend URL)
  - [ ] `EMAIL_HOST`
  - [ ] `EMAIL_PORT`
  - [ ] `EMAIL_USER`
  - [ ] `EMAIL_PASS`

- [ ] **Backend Disk**
  - [ ] Persistent disk added
  - [ ] Mount path: `/opt/render/project/src/uploads`
  - [ ] Size: 1 GB minimum

- [ ] **Frontend Service**
  - [ ] Static site created
  - [ ] Root dir: `client`
  - [ ] Build command: `npm install && npm run build`
  - [ ] Publish directory: `dist`

- [ ] **Frontend Environment Variables**
  - [ ] `VITE_API_URL` (backend URL)
  - [ ] `VITE_SOCKET_URL` (backend URL)

- [ ] **Redis (Optional)**
  - [ ] Redis service created
  - [ ] Connection string added to backend

---

## ✅ Post-Deployment Checklist

### Initial Verification

- [ ] **Backend Health Check**
  ```bash
  curl https://your-backend.onrender.com/api/health
  ```
  Expected: `{"status":"ok",...}`

- [ ] **Frontend Loads**
  - [ ] Visit frontend URL
  - [ ] Page loads without errors
  - [ ] No 404s in console
  - [ ] Styles load correctly

- [ ] **Backend Logs**
  - [ ] Check Render logs
  - [ ] No errors on startup
  - [ ] MongoDB connected successfully
  - [ ] No CORS errors

### Feature Testing

- [ ] **Authentication**
  - [ ] Register new account
  - [ ] Login works
  - [ ] Logout works
  - [ ] JWT token generated
  - [ ] Token persists in localStorage

- [ ] **Real-time Features**
  - [ ] Socket.IO connects
  - [ ] Messages send/receive in real-time
  - [ ] Online status updates
  - [ ] Typing indicators work

- [ ] **File Uploads**
  - [ ] Profile picture upload
  - [ ] Image appears in chat
  - [ ] Files stored in Cloudinary
  - [ ] Upload progress shows

- [ ] **Permissions**
  - [ ] Camera permission request
  - [ ] Microphone permission request
  - [ ] Notifications permission
  - [ ] Settings save correctly

- [ ] **Backup & Recovery**
  - [ ] Create backup
  - [ ] Restore backup
  - [ ] Email backup works
  - [ ] Recovery email sends
  - [ ] Password reset works

- [ ] **GB Settings**
  - [ ] Privacy settings save
  - [ ] Theme changes apply
  - [ ] Messaging settings work
  - [ ] All toggles function

### Performance Testing

- [ ] **Load Time**
  - [ ] Initial load < 3 seconds
  - [ ] API responses < 500ms
  - [ ] No timeout errors

- [ ] **Concurrent Users**
  - [ ] Test with 2+ users
  - [ ] Messages sync correctly
  - [ ] No race conditions

- [ ] **Mobile**
  - [ ] Responsive design works
  - [ ] Touch interactions smooth
  - [ ] Mobile menu works
  - [ ] Bottom nav functional

### Security Verification

- [ ] **HTTPS**
  - [ ] Backend uses HTTPS
  - [ ] Frontend uses HTTPS
  - [ ] No mixed content warnings

- [ ] **CORS**
  - [ ] Only allowed origins can access API
  - [ ] No unauthorized cross-origin requests

- [ ] **Authentication**
  - [ ] Protected routes require token
  - [ ] Invalid tokens rejected
  - [ ] Expired tokens rejected

- [ ] **Rate Limiting**
  - [ ] Too many requests blocked
  - [ ] 429 status returned when limit exceeded

---

## 🔧 Troubleshooting Checklist

### If Backend Won't Start

- [ ] Check Render logs for errors
- [ ] Verify `MONGODB_URI` is correct
- [ ] Check all environment variables set
- [ ] Ensure `PORT=5000`
- [ ] Verify `package.json` dependencies
- [ ] Check Node.js version compatibility

### If Frontend Won't Build

- [ ] Check build logs in Render
- [ ] Verify all imports correct
- [ ] Check for TypeScript errors
- [ ] Ensure `VITE_API_URL` set
- [ ] Clear cache and retry

### If CORS Errors

- [ ] Verify `CLIENT_URL` in backend env
- [ ] Verify `CORS_ORIGIN` in backend env
- [ ] Check frontend URL matches exactly
- [ ] Include protocol (https://)
- [ ] Restart backend service

### If Database Connection Fails

- [ ] Verify MongoDB Atlas credentials
- [ ] Check IP whitelist (0.0.0.0/0)
- [ ] Ensure cluster is not paused
- [ ] Test connection string locally
- [ ] Check MongoDB Atlas logs

### If File Uploads Fail

- [ ] Verify Cloudinary credentials
- [ ] Check disk space on Render
- [ ] Verify uploads folder permissions
- [ ] Check file size limits
- [ ] Test upload locally first

### If Emails Don't Send

- [ ] Verify Gmail App Password (not regular password)
- [ ] Check 2FA enabled on Gmail
- [ ] Verify SMTP settings
- [ ] Check spam folder
- [ ] Test with different email provider

---

## 📊 Monitoring Checklist

### Daily

- [ ] Check Render logs for errors
- [ ] Monitor disk usage
- [ ] Check database size
- [ ] Review error logs

### Weekly

- [ ] Review performance metrics
- [ ] Check backup status
- [ ] Review user feedback
- [ ] Update dependencies if needed

### Monthly

- [ ] Rotate JWT secret
- [ ] Review and update environment variables
- [ ] Check for security updates
- [ ] Review and optimize database queries
- [ ] Clean up old backups/files

---

## 🎯 Production Readiness

### Must Have

- [ ] All features tested and working
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Error logging enabled
- [ ] Monitoring setup
- [ ] Backup strategy in place

### Recommended

- [ ] Custom domain configured
- [ ] CDN for static assets
- [ ] Redis for caching
- [ ] Multiple backup locations
- [ ] Uptime monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics configured

### Nice to Have

- [ ] Load balancing
- [ ] Auto-scaling configured
- [ ] Staging environment
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Performance optimization

---

## 📞 Support Resources

- **Render Support:** https://render.com/support
- **MongoDB Support:** https://support.mongodb.com
- **Cloudinary Support:** https://support.cloudinary.com
- **GitHub Issues:** Your repository issues

---

## ✅ Final Sign-Off

- [ ] All pre-deployment tasks complete
- [ ] All deployment tasks complete
- [ ] All post-deployment tests pass
- [ ] All troubleshooting resolved
- [ ] Monitoring setup
- [ ] Documentation updated
- [ ] Team notified of deployment
- [ ] **READY FOR PRODUCTION** ✨

---

**Last Updated:** March 2026
**Version:** 1.0
