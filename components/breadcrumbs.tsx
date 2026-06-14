/**
 * Breadcrumbs Component — Silo Navigation
 * =========================================
 * Renders schema.org BreadcrumbList compatible breadcrumb trail.
 * Critical for: traditional SEO crawling + AI engine content hierarchy parsing.
 */

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbItem {
  name: string
  url: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol
        className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li
              key={item.url}
              className="flex items-center gap-1.5"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {isLast ? (
                <span
                  className="text-foreground font-medium truncate max-w-[200px]"
                  itemProp="name"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-foreground transition-colors truncate max-w-[200px]"
                  itemProp="item"
                >
                  <span itemProp="name">{item.name}</span>
                </Link>
              )}
              <meta itemProp="position" content={String(i + 1)} />
              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}