# SECURITY AUDIT REPORT
**Project**: Kitchen Factory Website & CRM (Цветков Мебель)  
**Author**: Senior Application Security Engineer & Penetration Tester  
**Date**: July 9, 2026  
**Status**: Completed  

---

## 1. Threat Modeling & Attack Surface

The application acts as a customer acquisition landing page coupled with a multi-role CRM (roles: `admin`, `manager`) for managing customer leads, logs, product listings, promotional codes, and reviews.

```mermaid
graph TD
    Client[Anonymous Visitor] -->|Submit Lead / Upload Project File| PublicAPI[Public endpoints: /api/leads, /api/upload]
    Client -->|View Landing Page| Landing[Landing View /api/products, /api/reviews, /api/promos]
    
    Manager[CRM Manager] -->|Manage Leads, Read Logs| MgrUI[/manager Route]
    Manager -->|API Request| AuthAPI[Authenticated API /api/leads]
    
    Admin[CRM Administrator] -->|Full Control: Catalog, Promos, Logs| AdminUI[/admin Route]
    Admin -->|API Request| AdminAPI[Admin-only API /api/products, /api/promos, /api/logs, /api/reviews]
    
    subgraph Trust Boundaries
        PublicBoundary(Internet facing - Public)
        PrivateBoundary(Private CRM dashboard)
    end
```

### Main Entry Points (Attack Surface):
- **Authentication**: Credentials entry at `/api/auth/login`.
- **File Upload**: File submission at `/api/upload` (publicly accessible).
- **Leads Intake**: Public lead generation at `/api/leads`.
- **Database Access**: Underlying SQLite database storage (`dev.db`).

---

## 2. Identified Vulnerabilities & Security Risks

### Vulnerability 1: Next.js Middleware Route Bypass
- **Severity**: Critical (CVSS: 9.3)
- **CWE**: CWE-287 / CWE-306 (Missing Authentication for Critical Function)
- **Description**: The authorization check routing file was named `src/proxy.js` instead of the Next.js standard `src/middleware.js`. As a result, the middleware was not executed by Next.js. Anonymous web requests could access the `/admin` and `/manager` page shells directly.
- **Impact**: Bypassed route-level authorization, exposing administrative and management UI layouts. (API data fetches were protected separately).
- **PoC**:
  ```bash
  curl -I http://localhost:3000/admin
  # Returned 200 OK showing admin panel dashboard HTML structure instead of redirecting to login.
  ```

### Vulnerability 2: Plain-Text Environment Credentials
- **Severity**: High (CVSS: 7.5)
- **CWE**: CWE-312 / CWE-522 (Insufficiently Protected Credentials)
- **Description**: The credentials for admin and manager roles were stored in plain text within `.env` (`ADMIN_PASSWORD`, `MANAGER_PASSWORD`) and compared directly in `login/route.js`.
- **Impact**: Exposure of the host environment variables (e.g., via SSRF, debug dumps, process managers) would compromise the administrator and manager accounts immediately.
- **PoC**:
  ```javascript
  // Old code snippet inside login/route.js:
  if (username === authConfig.adminUsername && password === authConfig.adminPassword) { ... }
  ```

### Vulnerability 3: Lack of Honeypot / Bot Spam Protection on Leads Endpoint
- **Severity**: Medium (CVSS: 5.3)
- **CWE**: CWE-400 (Uncontrolled Resource Consumption)
- **Description**: The lead generation form (/api/leads) did not have anti-bot checks. Automated bots could submit endless spam leads.
- **Impact**: Database exhaustion and CRM noise.

### Vulnerability 4: Lack of Protocol Sanitization on Review URLs
- **Severity**: Medium (CVSS: 6.1)
- **CWE**: CWE-79 / CWE-20 (Improper Input Validation)
- **Description**: User-provided image and video URLs in review submissions were saved directly to the database without validating the protocol schema.
- **Impact**: Allowed saving URLs with `javascript:` schemas, which could lead to XSS attacks if loaded into interactive navigation components.

---

## 3. Remediation & Hardening Actions Taken

1. **Activated Next.js Middleware Router**: Renamed `proxy.js` to `middleware.js` and confirmed that Next.js correctly processes routing rules, redirecting unauthorized users back to `/admin/login` and `/manager/login`.
2. **Hashed Credentials Migration**: Implemented a secure Web Crypto-based PBKDF2 hashing helper (100k iterations, SHA-512, random salts). Replaced plain text password keys with `ADMIN_PASSWORD_HASH` and `MANAGER_PASSWORD_HASH` in `.env` and `.env.example`.
3. **Spam Prevention Honeypot**: Implemented a hidden honeypot field (`website`) in the main contact form. Submissions that populate this field are rejected instantly by the API.
4. **URL Protocol Guard**: Added validation to reject any review URL string that does not start with `/`, `http://`, or `https://`, preventing protocol hijacking.
