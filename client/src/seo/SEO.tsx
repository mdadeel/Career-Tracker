import { Helmet } from "react-helmet-async";
import { SITE, absoluteUrl, pageTitle } from "./site";
import { getMetaForPath, toCanonical, breadcrumbFromPath } from "./metadata";
import { buildSchemas, type SchemaDict } from "./schemas";

interface SEOProps {
  pathname: string;
  /** Override metadata for dynamic pages (e.g. application detail). */
  title?: string;
  description?: string;
  extraSchemas?: SchemaDict[];
  /** Custom breadcrumb for dynamic routes. */
  breadcrumb?: { name: string; path: string }[];
  /** Custom FAQ items for JSON-LD. */
  faq?: { question: string; answer: string }[];
}

export function SEO({ pathname, title, description, extraSchemas = [], breadcrumb, faq }: SEOProps) {
  const meta = getMetaForPath(pathname);
  const finalTitle = pageTitle(title ?? meta.title);
  const finalDescription = description ?? meta.description;
  const canonical = toCanonical(pathname);
  const crumbs = breadcrumb ?? breadcrumbFromPath(pathname);

  const schemaNames = [...(meta.schema ?? [])];
  if (meta.index !== false) {
    schemaNames.push("breadcrumb");
  }
  const schemas = [...buildSchemas(schemaNames, { breadcrumb: crumbs, faq }), ...extraSchemas];

  const robots = meta.index === false ? "noindex, nofollow" : "index, follow";

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      <meta name="author" content={SITE.author} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={robots} />

      <meta property="og:site_name" content={SITE.legalName} />
      <meta property="og:type" content={meta.ogType ?? "website"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={absoluteUrl("/og-cover.png")} />
      <meta property="og:locale" content={SITE.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={absoluteUrl("/og-cover.png")} />

      <html lang={SITE.language} />

      {schemas.map((s, idx) => (
        <script key={`schema-${idx}`} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
