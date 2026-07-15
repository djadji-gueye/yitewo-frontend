
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/partner-portal/",
                    "/dashboard/",
                    "/prestataire-portal/",
                    "/api/",
                    "/_next/",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/partner-portal/", "/dashboard/", "prestataire-portal"],
            },
        ],
        sitemap: "https://yitewo.com/sitemap.xml",
        // host: "https://yitewo.com",
    };
}