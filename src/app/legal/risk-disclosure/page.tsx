import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";
import { RELEASE_DATE, RISK_SECTIONS } from "@/lib/legal-content";
export const metadata: Metadata={title:"Risk Disclosure",description:"Risk disclosure for hypothetical backtesting and financial-market activity.",alternates:{canonical:"/legal/risk-disclosure"}};
export default function RiskDisclosurePage(){return <DocumentPage eyebrow="Legal center" title="Risk Disclosure" intro="Backtesting cannot remove the financial, model, data, execution and technology risks associated with real-world markets." effectiveDate={RELEASE_DATE} sections={RISK_SECTIONS}/>}
