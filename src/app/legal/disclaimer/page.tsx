import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";
import { DISCLAIMER_SECTIONS, RELEASE_DATE } from "@/lib/legal-content";
export const metadata: Metadata={title:"Financial Disclaimer",description:"Financial and hypothetical-performance disclaimer for Quant Edge.",alternates:{canonical:"/legal/disclaimer"}};
export default function DisclaimerPage(){return <DocumentPage eyebrow="Legal center" title="Financial Disclaimer" intro="Quant Edge demonstrates software and backtesting concepts. Its outputs are hypothetical and are not investment advice or real market performance." effectiveDate={RELEASE_DATE} sections={DISCLAIMER_SECTIONS}/>}
