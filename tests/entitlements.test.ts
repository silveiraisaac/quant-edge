import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BILLING_AVAILABLE,getEntitlements } from '../src/lib/entitlements';
import { validateSettings } from '../src/lib/validation';
import { settings } from './fixtures';
test('development keeps all features available without a paid subscription',()=>{for(const plan of ['FREE','PRO'] as const)assert.ok(Object.values(getEntitlements(plan).features).every(Boolean));assert.equal(BILLING_AVAILABLE,false);});
test('entitlements are immutable and share safety limits',()=>{assert.ok(Object.isFrozen(getEntitlements('FREE')));assert.equal(getEntitlements('PRO').maxComparisonRuns,4);});
test('caller plan and user identity are stripped from backtest configuration',()=>{const s=validateSettings({...settings,plan:'PRO',userId:'forged'});assert.equal('plan' in s,false);assert.equal('userId' in s,false);});
