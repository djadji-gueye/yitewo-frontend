
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
                    "/api/",
                    "/_next/",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/partner-portal/", "/dashboard/"],
            },
        ],
        sitemap: "https://yitewo.com/sitemap.xml",
        host: "https://yitewo.com",
    };
}