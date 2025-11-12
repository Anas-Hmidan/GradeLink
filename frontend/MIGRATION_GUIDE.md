# Quick Migration Guide

## Files That Still Need Updates

If you encounter errors with these files, here's how to fix them:

### 1. Any file using `useNavigate` from react-router-dom

**Find:**
```typescript
import { useNavigate } from "react-router-dom"
```

**Replace with:**
```typescript
import { useNavigate } from "@/lib/navigation"
```

---

### 2. Any file using `useParams` from react-router-dom

**Find:**
```typescript
import { useParams } from "react-router-dom"
const { id } = useParams()
```

**Replace with:**
```typescript
import { useParams } from "next/navigation"
const params = useParams()
const id = params?.id as string
```

---

### 3. Any file using `useLocation` from react-router-dom

**Find:**
```typescript
import { useLocation } from "react-router-dom"
const location = useLocation()
const state = location.state
```

**Replace with:**
```typescript
import { usePathname } from "next/navigation"
import { useNavigationState } from "@/lib/navigation"
const pathname = usePathname()
const state = useNavigationState(pathname)
```

---

### 4. Any API call manually adding Authorization header

**Find:**
```typescript
const token = localStorage.getItem("auth_token")
axios.get("/api/endpoint", {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Replace with:**
```typescript
// Token is automatically added by axios interceptor
axios.get("/api/endpoint")
```

---

### 5. Files that need updating:

Run this command to find any remaining react-router-dom imports:

```bash
# Windows (PowerShell)
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "react-router-dom"

# Unix/Mac/Git Bash
grep -r "react-router-dom" --include="*.tsx" --include="*.ts" .
```

Common files that might still need updates:
- `app/not-found/page.tsx`
- `app/results/page.tsx`
- `app/tests/[id]/page.tsx`
- `components/quick-login.tsx`
- Any other custom components you've added

---

## How to Test Each Fix

After updating a file:

1. **Check for TypeScript errors:**
   ```bash
   pnpm run lint
   ```

2. **Test in browser:**
   - Navigate to the page
   - Check browser console for errors
   - Test the functionality

3. **Common issues:**
   - If you see "useNavigate is not a function" → Check import path
   - If navigation doesn't work → Make sure using correct hooks
   - If you see "Can't read property 'id' of undefined" → Check params usage

---

## Emergency Fallback

If something breaks and you need to quickly fix it:

1. **Revert specific file:**
   ```bash
   git checkout HEAD -- path/to/file.tsx
   ```

2. **Check what changed:**
   ```bash
   git diff path/to/file.tsx
   ```

3. **Ask for help with:**
   - Screenshot of error
   - File name and line number
   - What you were trying to do
