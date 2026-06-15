import { getAllBlogPosts } from "@/lib/blog"

const siteUrl = "https://www.saveik.com"

export async function GET() {
  const posts = getAllBlogPosts()
    .sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime())
    .slice(0, 50) // Latest 50 posts

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Saveik Blog — TikTok Video Downloader Tips &amp; Guides</title>
    <link>${siteUrl}</link>
    <description>Free TikTok video downloader guides, tutorials, and tips. Download TikTok videos without watermark in HD. Available in 20 languages.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/og-image.png</url>
      <title>Saveik Blog</title>
      <link>${siteUrl}</link>
    </image>
    ${posts
      .map(
        (post) => {
          const postUrl = post.locale === "en"
            ? `${siteUrl}/blog/${post.slug}`
            : `${siteUrl}/${post.locale}/blog/${post.slug}`
          return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.tldr || post.description}]]></description>
      <pubDate>${new Date(post.datePublished).toUTCString()}</pubDate>
      <category>${post.locale}</category>
      ${post.tags?.map((tag: string) => `<category>${tag}</category>`).join("\n      ") || ""}
    </item>`
        }
      )
      .join("")}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
