import SaveikDownloader from "@/components/main-page"
import { OrganizationSchema, WebApplicationSchema, HowToSchema, FAQSchema, BreadcrumbListSchema } from "@/components/structured-data"
import { getDictionary } from "@/lib/dictionaries"
import { defaultLocale, localeLabels, type Locale } from "@/lib/i18n"

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.saveik.com")
  .replace(/。/g, ".").replace(/．/g, ".").replace(/：/g, ":").replace(/／/g, "/")
  .replace(/\/\/saveik\.com/, "//www.saveik.com")

/**
 * Homepage with JSON-LD Schema — Organization, WebApplication, HowTo, FAQ, BreadcrumbList
 * This runs only for / (root) since [locale]/layout.tsx handles locale-prefixed pages.
 */
export default async function HomePage() {
  const locale = defaultLocale as Locale
  const dict = await getDictionary(locale)

  const schemas = [
    OrganizationSchema(locale),
    WebApplicationSchema(locale, dict as any),
    HowToSchema(locale, dict as any, siteUrl),
    FAQSchema(dict as any),
    BreadcrumbListSchema([
      { name: localeLabels[locale] || "Home", url: siteUrl },
    ]),
  ]

  const graph = {
    "@context": "https://schema.org",
    "@graph": schemas,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <SaveikDownloader />
    </>
  )
}
