export type PilotAssumptions={organizations:number;acceptance:number;completion:number};
/** Illustrative funnel only. Two requests per organization and 50% eligible
 * introductions are declared assumptions, not measured platform conversion. */
export function simulatePilot(a:PilotAssumptions){
 const organizations=Math.max(0,Math.floor(Number.isFinite(a.organizations)?a.organizations:0));
 const bounded=(v:number)=>Math.min(100,Math.max(0,Number.isFinite(v)?v:0))/100;
 const requests=organizations*2,introductions=Math.floor(requests*.5),conversations=Math.floor(introductions*bounded(a.acceptance)),collaborations=Math.floor(conversations*bounded(a.completion));
 return {organizations,requests,introductions,conversations,collaborations};
}
