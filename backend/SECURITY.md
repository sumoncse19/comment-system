# Backend Security Documentation

## Overview

This document outlines the comprehensive security measures implemented in the backend API, configuration details, and best practices.

## 🔐 Security Features

### 1. HttpOnly Cookie-Based Authentication

**Implementation:** `src/controllers/authController.ts`, `src/config/security.ts`

#### Access Token Cookie
```typescript
{
  httpOnly: true,           // Prevents JavaScript access (XSS protection)
  secure: true,             // HTTPS only (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 15 * 60 * 1000,   // 15 minutes
  path: '/'                 // Available to all routes
}
```

#### Refresh Token Cookie
```typescript
{
  httpOnly: true,           // Prevents JavaScript access
  secure: true,             // HTTPS only (production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/api/auth'         // Only sent to auth endpoints
}
```

**Benefits:**
- ✅ Immune to XSS attacks (JavaScript cannot read tokens)
- ✅ Automatic transmission with requests
- ✅ Secure flag ensures HTTPS-only transmission
- ✅ sameSite prevents CSRF attacks
- ✅ Path restriction limits cookie exposure

---

### 2. CSRF Protection

**Implementation:** `src/utils/csrf.ts`, `src/middleware/security.ts`

#### Double-Submit Cookie Pattern
1. **Token Generation:**
   - Cryptographically secure random token (32 bytes)
   - HMAC-SHA256 signature for integrity
   - Format: `{token}.{signature}`

2. **Token Distribution:**
   - Set as cookie (httpOnly=false for JS access)
   - Also sent in X-CSRF-Token response header
   - Regenerated on every GET request

3. **Token Validation:**
   - Required for POST, PUT, DELETE, PATCH
   - Cookie token must match header token
   - Signature verified using HMAC
   - Timing-safe comparison prevents timing attacks

**Code Example:**
```typescript
// Token Generation
const token = crypto.randomBytes(32).toString('hex');
const signature = crypto.createHmac('sha256', CSRF_SECRET)
  .update(token)
  .digest('hex');

// Validation (timing-safe)
crypto.timingSafeEqual(
  Buffer.from(cookieToken),
  Buffer.from(headerToken)
);
```

**Protected Routes:**
- All state-changing operations
- Authentication endpoints
- Comment CRUD operations

---

### 3. Comprehensive Security Headers

**Implementation:** `src/middleware/security.ts`, `src/config/security.ts`

#### Helmet.js Configuration

**Content Security Policy (CSP):**
```typescript
{
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'", "data:"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
}
```

**HTTP Strict Transport Security (HSTS):**
```typescript
{
  maxAge: 31536000,        // 1 year
  includeSubDomains: true,
  preload: true
}
```

**Other Headers:**
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Legacy XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer info
- `Permissions-Policy` - Restricts browser features

---

### 4. Rate Limiting

**Implementation:** `src/middleware/security.ts`

#### API Rate Limits

**General API:**
```typescript
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
}
```

**Authentication Endpoints:**
```typescript
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests per window
  skipSuccessfulRequests: true
}
```

**Configuration:**
- Environment variable overrides
- Standard headers enabled
- Custom error messages
- IP-based tracking

---

### 5. Input Validation & Sanitization

**Implementation:** `src/middleware/security.ts`

#### XSS Protection
- Removes `<script>` tags from string inputs
- Strips event handler attributes (`onload=`, `onclick=`, etc.)
- Applied to all request body strings

```typescript
.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
```

#### NoSQL Injection Prevention
- Removes `$` operators from object keys
- Prevents `.` notation in keys
- Recursive sanitization of nested objects

```typescript
// Blocked patterns: {$where: "..."}, {"user.email": "..."}
if (!key.startsWith('$') && !key.includes('.')) {
  // Allow key
}
```

#### Request Size Limits
```typescript
express.json({ limit: '10kb' })
express.urlencoded({ extended: true, limit: '10kb' })
```

---

### 6. Authentication Middleware

**Implementation:** `src/middleware/auth.ts`

#### Token Verification Flow

1. **Priority 1:** Read token from httpOnly cookie
2. **Fallback:** Check Authorization Bearer header (backward compatibility)
3. **Verification:** JWT signature validation
4. **User Attachment:** Decoded user attached to `req.user`

```typescript
// Priority: Cookie > Bearer token
const token = req.cookies['accessToken'] ||
              req.headers.authorization?.split(' ')[1];

// Verify and decode
const decoded = jwt.verify(token, JWT_SECRET);

// Attach to request
req.user = { id, username, email };
```

#### Optional Authentication
- `optionalAuth` middleware for public routes
- Attaches user if token valid
- Continues without error if token invalid
- Used for features like "like count" with/without auth

---

### 7. CORS Configuration

**Implementation:** `src/app.ts`, `src/config/security.ts`

```typescript
{
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,                      // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],       // Expose to frontend
  maxAge: 86400                            // Cache preflight 24 hours
}
```

---

## 🔒 Security Best Practices

### Environment Variables

**Required in Production:**
```env
# JWT Secrets (use cryptographically random values)
JWT_SECRET=<256-bit random string>
JWT_REFRESH_SECRET=<256-bit random string>

# CSRF Secret
CSRF_SECRET=<256-bit random string>

# Node Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://...

# CORS
CLIENT_URL=https://your-frontend-domain.com
```

**Generate Secrets:**
```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Cookie Security Checklist

- [x] httpOnly: true (prevents XSS)
- [x] secure: true (HTTPS only in production)
- [x] sameSite: 'strict' (prevents CSRF)
- [x] maxAge set (automatic expiry)
- [x] path restrictions (minimize exposure)
- [x] Domain not set (current domain only)

### Token Security Checklist

- [x] Short-lived access tokens (15 minutes)
- [x] Long-lived refresh tokens (7 days)
- [x] Tokens signed with strong secrets
- [x] Payload contains minimal data
- [x] No sensitive data in payload
- [x] Token verification on every request

### API Security Checklist

- [x] Rate limiting on all endpoints
- [x] Input validation with Zod
- [x] XSS protection middleware
- [x] NoSQL injection prevention
- [x] Request size limits
- [x] Error messages don't leak info
- [x] HTTPS enforced in production
- [x] Security headers set

---

## 🚨 Security Incidents

### Response Plan

1. **Detection:**
   - Monitor failed auth attempts
   - Track CSRF validation failures
   - Watch rate limit violations
   - Alert on unusual patterns

2. **Containment:**
   - Rotate JWT secrets immediately
   - Invalidate all active sessions
   - Block suspicious IPs
   - Review access logs

3. **Recovery:**
   - Patch vulnerability
   - Force password resets
   - Notify affected users
   - Document incident

4. **Prevention:**
   - Update security measures
   - Review similar code
   - Add new tests
   - Update documentation

---

## 🧪 Security Testing

### Manual Tests

1. **CSRF Protection:**
```bash
# Should fail (no CSRF token)
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}' \
  --cookie "accessToken=<token>"

# Should succeed (with CSRF token)
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d '{"content":"test"}' \
  --cookie "accessToken=<token>;csrf-token=<token>"
```

2. **HttpOnly Cookies:**
```javascript
// In browser console (should be undefined)
document.cookie // Should not show accessToken or refreshToken
```

3. **Rate Limiting:**
```bash
# Rapid requests should be blocked
for i in {1..10}; do
  curl http://localhost:5000/api/auth/login \
    -d '{"identifier":"test","password":"test"}'
done
```

### Automated Tests

**Recommended Tools:**
- **OWASP ZAP** - Vulnerability scanning
- **Burp Suite** - Penetration testing
- **npm audit** - Dependency vulnerabilities
- **Snyk** - Container & code scanning

```bash
# Run dependency audit
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 📊 Security Monitoring

### Metrics to Track

1. **Authentication:**
   - Failed login attempts per IP
   - Token refresh frequency
   - Session duration
   - Concurrent sessions per user

2. **CSRF:**
   - Failed CSRF validations
   - Missing CSRF tokens
   - Token mismatch rate

3. **Rate Limiting:**
   - Requests hitting limits
   - Blocked IPs
   - Geographic distribution

4. **Errors:**
   - 401 Unauthorized rate
   - 403 Forbidden rate
   - 500 Internal errors
   - Unusual error patterns

### Logging Best Practices

```typescript
// Log security events
logger.warn('Failed CSRF validation', {
  ip: req.ip,
  path: req.path,
  timestamp: new Date()
});

// Don't log sensitive data
logger.error('Auth failed', {
  username: user.username,
  // DON'T log: password, tokens
});
```

---

## 🔄 Regular Maintenance

### Weekly
- Review access logs for anomalies
- Check rate limit violations
- Monitor error rates
- Verify backup systems

### Monthly
- Update dependencies
- Review security advisories
- Test disaster recovery
- Audit user permissions

### Quarterly
- Penetration testing
- Security header audit
- CORS policy review
- Secret rotation plan

### Annually
- Full security audit
- Third-party assessment
- Compliance review
- Update security documentation

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

## 📞 Security Contact

For security vulnerabilities or concerns:
- **DO NOT** create public GitHub issues
- Email: security@your-domain.com
- PGP Key: [Link to public key]

---

## 📅 Last Updated

2026-01-17 - **MAJOR SECURITY UPDATE:** Complete security overhaul implemented

---

**Next Review Date:** 2026-04-17 (Quarterly review)
