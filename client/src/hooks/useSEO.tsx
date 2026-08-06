import { useLocation } from "react-router-dom";
import { SEO } from "../seo/SEO";

interface UseSEOOptions {
  title?: string;
  description?: string;
  breadcrumb?: { name: string; path: string }[];
  faq?: { question: string; answer: string }[];
}

/**
 * Renders route metadata (title, description, canonical, OG, JSON-LD) into the
 * document head based on the current route. Call from a page component.
 */
export function useSEO(options: UseSEOOptions = {}) {
  const { pathname } = useLocation();
  return <SEO pathname={pathname} {...options} />;
}
