import { describe, expect, it } from 'vitest'
import { isPublicAuthPath } from '../src/lib/auth/routes'
describe('auth route protection',()=>{it('allows only explicit unauthenticated auth pages',()=>{expect(isPublicAuthPath('/login')).toBe(true);expect(isPublicAuthPath('/auth/error')).toBe(true);expect(isPublicAuthPath('/inquiries')).toBe(false);expect(isPublicAuthPath('/reports')).toBe(false);expect(isPublicAuthPath('/')).toBe(false)})})
