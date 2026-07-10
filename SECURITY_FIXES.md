# SECURITY FIXES DOCUMENTATION
**Project**: Kitchen Factory Website & CRM (Цветков Мебель)  
**Author**: Senior Application Security Engineer & DevSecOps Specialist  

---

## Patch Summary

| File Path | Change Category | Description |
| :--- | :--- | :--- |
| [`src/middleware.js`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/src/middleware.js) | **[NEW]** | Standard Next.js route-level access middleware (replaces `src/proxy.js`). |
| [`src/lib/auth.js`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/src/lib/auth.js) | **[MODIFY]** | Added async Web Crypto-based `hashPassword` and `verifyPassword` using PBKDF2. Broken serverConfig dependency. |
| [`src/lib/serverConfig.js`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/src/lib/serverConfig.js) | **[MODIFY]** | Shifted to `ADMIN_PASSWORD_HASH` and `MANAGER_PASSWORD_HASH`. Added async config check for default credentials. |
| [`src/app/api/auth/login/route.js`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/src/app/api/auth/login/route.js) | **[MODIFY]** | Awaits `getAuthConfig()` and calls `verifyPassword()` to authenticate logins. |
| [`src/components/ContactForm.jsx`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/src/components/ContactForm.jsx) | **[MODIFY]** | Added a hidden `website` input field to the final step of the quiz wizard. |
| [`src/app/api/leads/route.js`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/src/app/api/leads/route.js) | **[MODIFY]** | Rejects submissions containing a value in the `website` honeypot field. |
| [`src/app/api/reviews/route.js`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/src/app/api/reviews/route.js) | **[MODIFY]** | Restricts `imageUrl` and `videoUrl` to approved protocols (`/`, `http://`, `https://`). |
| [`.env`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/.env) | **[MODIFY]** | Loaded secure default hashes and non-standard usernames. |
| [`tests/serverConfig.test.mjs`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/tests/serverConfig.test.mjs) | **[MODIFY]** | Updated environment configuration tests to utilize hashed properties. |
| [`scripts/e2e-smoke.mjs`](file:///C:/Users/user/.gemini/antigravity/scratch/kitchen-app/scripts/e2e-smoke.mjs) | **[MODIFY]** | Integrated PBKDF2 pre-calculated hashes for admin and manager roles. |

---

## Code Diffs & Explanations

### 1. Web Crypto PBKDF2 Password Hashing (`src/lib/auth.js`)
We avoided using the Node.js `'crypto'` module to keep the library compatible with Edge Runtime:
```javascript
export async function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [saltHex, originalHash] = storedHash.split(':');
  
  const baseKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(saltHex),
      iterations: 100000,
      hash: 'SHA-512'
    },
    baseKey,
    512
  );
  
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === originalHash;
}
```

### 2. Next.js Routing Protection (`src/middleware.js`)
Activated the Next.js router rules by placing the file in standard location:
```javascript
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = await readSession(request);
    if (!session || session.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }
  // ... (similar check for /manager)
}
```

### 3. Honeypot Anti-Spam Guard (`src/app/api/leads/route.js`)
We intercept the incoming request parameters:
```javascript
const body = await request.json();
if (body.website && String(body.website).trim() !== '') {
  console.warn(`[Security Alert] Bot spam blocked from IP: ${ip} via honeypot field`);
  return errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Spam detected', 400);
}
```
