import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";
import { RELEASE_DATE, TERMS_SECTIONS } from "@/lib/legal-content";
export const metadata: Metadata={title:"Terms of Use",description:"Terms governing use of the Quant Edge portfolio project.",alternates:{canonical:"/legal/terms"}};
export default function TermsPage(){return <DocumentPage eyebrow="Legal center" title="Terms of Use" intro="These terms govern access to Quant Edge, an independent quantitative-finance and software-engineering portfolio project." effectiveDate={RELEASE_DATE} sections={TERMS_SECTIONS}/>}
