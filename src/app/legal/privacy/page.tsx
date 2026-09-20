import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";
import { PRIVACY_SECTIONS, RELEASE_DATE } from "@/lib/legal-content";
export const metadata: Metadata={title:"Privacy Policy",description:"How the Quant Edge portfolio project processes browser, backtest and optional account information.",alternates:{canonical:"/legal/privacy"}};
export default function PrivacyPage(){return <DocumentPage eyebrow="Legal center" title="Privacy Policy" intro="This policy describes the data actually processed by the portfolio release, including browser-local saves, hosting infrastructure and optional Supabase accounts." effectiveDate={RELEASE_DATE} sections={PRIVACY_SECTIONS}/>}
