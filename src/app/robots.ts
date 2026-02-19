import { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = "https://xenkio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
