# Security Measures Documentation

This document outlines the security measures implemented in the Sajilotantra Web Backend to prevent Cross-Site Scripting (XSS) and other common web vulnerabilities.

## XSS Prevention

### 1. Security Headers with Helmet
**Location:** `app.js`
**Implementation:**
```javascript
app.use(helmet());
```
**What it does:**
- Sets various HTTP headers to enhance security
- Includes `X-XSS-Protection` header to enable XSS filtering in browsers
- Sets `X-Content-Type-Options: nosniff` to prevent MIME type sniffing
- Configures `X-Frame-Options` to prevent clickjacking
- Enables DNS prefetch control

### 2. Input Sanitization with xss-clean
**Location:** `app.js`
**Implementation:**
```javascript
app.use(xss());
```
**What it does:**
- Sanitizes user input from:
  - POST request body
  - GET query parameters
  - URL parameters
- Removes or encodes potentially dangerous characters
- Prevents script injection in user inputs

### 3. NoSQL Injection Prevention
**Location:** `app.js`
**Implementation:**
```javascript
app.use(mongoSanitize());
```
**What it does:**
- Removes any keys containing prohibited characters (e.g., `$`, `.`)
- Prevents NoSQL injection attacks
- Sanitizes data before it reaches MongoDB queries

### 4. HTTP Parameter Pollution Prevention
**Location:** `app.js`
**Implementation:**
```javascript
app.use(hpp());
```
**What it does:**
- Prevents HTTP parameter pollution attacks
- Only allows the last parameter value when duplicate parameters are received

## Additional Security Measures

### 5. CORS Configuration
**Location:** `app.js`
**Implementation:**
```javascript
const corsOptions = {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
```
**What it does:**
- Restricts cross-origin requests to trusted domains
- Limits HTTP methods to only those required
- Specifies allowed headers
- Enables credentials for cross-origin requests

### 6. Request Body Size Limit
**Location:** `app.js`
**Implementation:**
```javascript
app.use(express.json({ limit: '10kb' }));
```
**What it does:**
- Limits request body size to 10kb
- Helps prevent denial of service (DoS) attacks

## Best Practices for Developers

1. **Always validate and sanitize user input**
   - Use express-validator for request validation
   - Never trust user input

2. **Use parameterized queries**
   - Always use Mongoose's built-in query builders
   - Avoid string concatenation in database queries

3. **Content Security Policy (CSP)**
   - Consider implementing a strict CSP header
   - Restrict sources for scripts, styles, and other resources

4. **Secure Cookies**
   - Use `httpOnly`, `secure`, and `sameSite` flags for cookies
   - Implement proper session management

5. **Regular Updates**
   - Keep all dependencies updated
   - Regularly audit for known vulnerabilities using `npm audit`

## Testing Security
1. **Manual Testing**
   - Test all input fields with XSS payloads
   - Verify headers using browser dev tools or curl

2. **Automated Testing**
   - Consider using OWASP ZAP or similar tools
   - Implement security testing in your CI/CD pipeline

## Resources
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
