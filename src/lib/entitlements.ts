export type Plan='FREE'|'PRO';
export type Feature='advancedAnalytics'|'comparison'|'premiumStrategies'|'exports'|'savedBacktests';
export interface Entitlements {
  features:Readonly<Record<Feature,boolean>>;
  maxHistoricalDays:number;maxSavedBacktests:number;maxComparisonRuns:number;
}
// Launch policy keeps every implemented feature available. These are capacity
// limits, not a live subscription offer or artificial development paywalls.
const launch:Entitlements=Object.freeze({features:Object.freeze({advancedAnalytics:true,comparison:true,premiumStrategies:true,exports:true,savedBacktests:true}),maxHistoricalDays:3660,maxSavedBacktests:100,maxComparisonRuns:4});
export const PLAN_ENTITLEMENTS:Readonly<Record<Plan,Entitlements>>=Object.freeze({FREE:launch,PRO:launch});
export function getEntitlements(plan:Plan):Entitlements{return PLAN_ENTITLEMENTS[plan];}
export interface BillingProvider {
  // Implement only after payment-provider configuration, signature verification,
  // idempotency and authoritative server-side account-to-customer mapping exist.
  createCheckout(userId:string,plan:Plan):Promise<{url:string}>;
  handleVerifiedWebhook(rawBody:string,signature:string):Promise<void>;
}
export const BILLING_AVAILABLE=false;
