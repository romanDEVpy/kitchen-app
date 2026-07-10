export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tsvetkovmebel.ru';

  // Base URLs
  const staticPaths = [
    { url: '', changefreq: 'daily', priority: '1.0' },
    { url: '/catalog', changefreq: 'daily', priority: '0.9' },
    { url: '/privacy', changefreq: 'monthly', priority: '0.3' }
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPaths.map(path => `
  <url>
    <loc>${baseUrl}${path.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${path.changefreq}</changefreq>
    <priority>${path.priority}</priority>
  </url>
  `).join('')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=18000'
    }
  });
}
