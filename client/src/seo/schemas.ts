import { SITE, absoluteUrl } from "./site";

export type SchemaDict = Record<string, unknown>;

export function webSiteSchema(): SchemaDict {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.legalName,
    url: SITE.url,
    description: SITE.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema(): SchemaDict {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.legalName,
    url: SITE.url,
    logo: absoluteUrl("/favicon-192.png"),
    sameAs: [],
  };
}

export function softwareAppSchema(): SchemaDict {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.legalName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE.url,
    description: SITE.defaultDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "128",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): SchemaDict {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]): SchemaDict {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

const SCHEMA_BUILDERS: Record<string, (params?: { breadcrumb?: { name: string; path: string }[]; faq?: { question: string; answer: string }[] }) => SchemaDict> = {
  webSite: webSiteSchema,
  organization: organizationSchema,
  softwareApp: softwareAppSchema,
  breadcrumb: (p) => breadcrumbSchema(p?.breadcrumb ?? []),
  faq: (p) => faqSchema(p?.faq ?? []),
};

export function buildSchemas(names: string[], params?: { breadcrumb?: { name: string; path: string }[]; faq?: { question: string; answer: string }[] }): SchemaDict[] {
  return names.map((name) => {
    if (name === "breadcrumb" && params?.breadcrumb) return breadcrumbSchema(params.breadcrumb);
    if (name === "faq" && params?.faq) return faqSchema(params.faq);
    const builder = SCHEMA_BUILDERS[name];
    return builder ? builder() : null;
  }).filter(Boolean) as SchemaDict[];
}
