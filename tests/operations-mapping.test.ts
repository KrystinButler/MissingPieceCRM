import { describe, expect, it } from 'vitest'
import { defaultCorrectiveAction } from '../src/features/operations-review/mapping'
describe('operations corrective action mapping',()=>{it('routes internal follow-up failure to management escalation',()=>{expect(defaultCorrectiveAction('Internal Follow-Up Failure')).toBe('Management Escalation')});it('routes payer processing error to payer escalation',()=>{expect(defaultCorrectiveAction('Payer Processing Error')).toBe('Payer Escalation')})})
