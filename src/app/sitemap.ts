import type { MetadataRoute } from "next";
const BASE_URL="https://quant-edge-gray.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {return ["","/about","/strategies","/docs","/legal/terms","/legal/privacy","/legal/disclaimer","/legal/risk-disclosure"].map((path,index)=>({url:`${BASE_URL}${path}`,lastModified:"2026-09-20",changeFrequency:"monthly" as const,priority:index===0?1:path==="/about"||path==="/docs"?0.8:0.6}));}
