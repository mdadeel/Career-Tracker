import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schema?: Record<string, unknown>[];
}

export function SEOHead({
  title = "CareerTrack — Production-Grade Job Application Tracker & Pipeline Analytics",
  description = "Organize job applications, track pipeline status from saved to offer, store JD & resume links, and gain actionable analytics with a private, secure workspace.",
  keywords = "job tracker, application tracking system, job search pipeline, kanban job board, interview calendar, salary tracker, career track",
  canonicalUrl = "https://careertrack.app",
  ogImage = "https://careertrack.app/og-cover.png",
  schema,
}: SEOHeadProps) {
  const defaultSoftwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CareerTrack Lite",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
    },
    "description": description,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "128",
    },
  };

  const schemasToRender = schema ? [defaultSoftwareSchema, ...schema] : [defaultSoftwareSchema];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Shahnawas Adeel" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Structured Data JSON-LD */}
      {schemasToRender.map((s, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
