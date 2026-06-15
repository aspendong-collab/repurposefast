/**
 * Programmatic City-Level Landing Pages
 * ======================================
 * Auto-generates unique pages for major cities in each supported locale.
 * Template-driven with locale-specific data → infinite unique pages.
 *
 * Pattern: /{locale}/city/{city-slug}
 * Example: /id/city/jakarta, /id/city/surabaya, /id/city/bandung
 */

export interface CityPage {
  slug: string
  cityName: string
  localName: string
  region: string
  population: string // e.g. "10M+", "2.5M"
  headline: string
  subheadline: string
  localKeywords: string[]
}

// ── 10 priority locales × 10-15 major cities = 130+ unique pages ──

export const cityPages: Record<string, CityPage[]> = {
  en: [
    { slug: "new-york", cityName: "New York", localName: "New York City", region: "Northeast", population: "8.3M", headline: "Download TikTok Videos in New York City — Free HD, No Watermark", subheadline: "The fastest TikTok downloader for NYC. Works on iPhone, Android, PC. No app needed.", localKeywords: ["TikTok downloader NYC", "download TikTok New York", "TikTok no watermark NYC"] },
    { slug: "los-angeles", cityName: "Los Angeles", localName: "Los Angeles", region: "West Coast", population: "3.8M", headline: "Download TikTok Videos in Los Angeles — Free HD, No Watermark", subheadline: "LA's favorite TikTok downloader. Save videos in HD from any device.", localKeywords: ["TikTok downloader LA", "download TikTok Los Angeles", "TikTok no watermark LA"] },
    { slug: "chicago", cityName: "Chicago", localName: "Chicago", region: "Midwest", population: "2.7M", headline: "Download TikTok Videos in Chicago — Free HD, No Watermark", subheadline: "Chicago's fastest TikTok downloader. No app, no registration.", localKeywords: ["TikTok downloader Chicago", "download TikTok Chicago", "TikTok no watermark Chicago"] },
    { slug: "houston", cityName: "Houston", localName: "Houston", region: "South", population: "2.3M", headline: "Download TikTok Videos in Houston — Free HD, No Watermark", subheadline: "Download TikTok videos in Houston. Works on every device.", localKeywords: ["TikTok downloader Houston", "download TikTok Houston"] },
    { slug: "miami", cityName: "Miami", localName: "Miami", region: "Southeast", population: "450K", headline: "Download TikTok Videos in Miami — Free HD, No Watermark", subheadline: "Miami's go-to TikTok downloader. Fast, free, no watermarks.", localKeywords: ["TikTok downloader Miami", "download TikTok Miami"] },
    { slug: "san-francisco", cityName: "San Francisco", localName: "San Francisco", region: "West Coast", population: "808K", headline: "Download TikTok Videos in San Francisco — Free HD, No Watermark", subheadline: "SF's best TikTok downloader. Save videos in HD quality.", localKeywords: ["TikTok downloader SF", "download TikTok San Francisco"] },
    { slug: "london-uk", cityName: "London", localName: "London", region: "England", population: "8.9M", headline: "Download TikTok Videos in London — Free HD, No Watermark", subheadline: "London's fastest TikTok downloader. No app installation needed.", localKeywords: ["TikTok downloader London", "download TikTok London UK"] },
    { slug: "toronto", cityName: "Toronto", localName: "Toronto", region: "Ontario", population: "2.9M", headline: "Download TikTok Videos in Toronto — Free HD, No Watermark", subheadline: "Toronto's best TikTok downloader. Works on all devices.", localKeywords: ["TikTok downloader Toronto", "download TikTok Toronto Canada"] },
    { slug: "sydney", cityName: "Sydney", localName: "Sydney", region: "NSW", population: "5.3M", headline: "Download TikTok Videos in Sydney — Free HD, No Watermark", subheadline: "Sydney's fastest TikTok downloader. Free, no app needed.", localKeywords: ["TikTok downloader Sydney", "download TikTok Sydney Australia"] },
    { slug: "melbourne", cityName: "Melbourne", localName: "Melbourne", region: "VIC", population: "5.1M", headline: "Download TikTok Videos in Melbourne — Free HD, No Watermark", subheadline: "Melbourne's go-to TikTok downloader. HD quality, no watermark.", localKeywords: ["TikTok downloader Melbourne", "download TikTok Melbourne"] },
  ],

  id: [
    { slug: "jakarta", cityName: "Jakarta", localName: "Jakarta", region: "DKI Jakarta", population: "10.5M", headline: "Download Video TikTok di Jakarta — Gratis HD, Tanpa Watermark", subheadline: "Pengunduh TikTok tercepat di Jakarta. Tanpa aplikasi, tanpa daftar.", localKeywords: ["download TikTok Jakarta", "pengunduh TikTok Jakarta", "cara download TikTok di Jakarta"] },
    { slug: "surabaya", cityName: "Surabaya", localName: "Surabaya", region: "Jawa Timur", population: "2.9M", headline: "Download Video TikTok di Surabaya — Gratis HD, Tanpa Watermark", subheadline: "Pengunduh TikTok terbaik di Surabaya. HD, tanpa watermark.", localKeywords: ["download TikTok Surabaya", "pengunduh TikTok Surabaya"] },
    { slug: "bandung", cityName: "Bandung", localName: "Bandung", region: "Jawa Barat", population: "2.5M", headline: "Download Video TikTok di Bandung — Gratis HD, Tanpa Watermark", subheadline: "Cara download TikTok di Bandung. Gratis, kualitas HD.", localKeywords: ["download TikTok Bandung", "cara download TikTok Bandung"] },
    { slug: "medan", cityName: "Medan", localName: "Medan", region: "Sumatera Utara", population: "2.4M", headline: "Download Video TikTok di Medan — Gratis HD, Tanpa Watermark", subheadline: "Pengunduh TikTok tercepat di Medan. Tanpa aplikasi.", localKeywords: ["download TikTok Medan", "pengunduh TikTok Medan"] },
    { slug: "semarang", cityName: "Semarang", localName: "Semarang", region: "Jawa Tengah", population: "1.6M", headline: "Download Video TikTok di Semarang — Gratis HD, Tanpa Watermark", subheadline: "Download TikTok di Semarang. Kualitas HD, gratis selamanya.", localKeywords: ["download TikTok Semarang"] },
    { slug: "makassar", cityName: "Makassar", localName: "Makassar", region: "Sulawesi Selatan", population: "1.4M", headline: "Download Video TikTok di Makassar — Gratis HD, Tanpa Watermark", subheadline: "Pengunduh TikTok terbaik di Makassar. Gratis, HD.", localKeywords: ["download TikTok Makassar"] },
    { slug: "yogyakarta", cityName: "Yogyakarta", localName: "Yogyakarta", region: "DIY", population: "400K", headline: "Download Video TikTok di Yogyakarta — Gratis HD, Tanpa Watermark", subheadline: "Download TikTok di Jogja. Gratis, tanpa watermark, kualitas HD.", localKeywords: ["download TikTok Yogyakarta", "download TikTok Jogja"] },
    { slug: "palembang", cityName: "Palembang", localName: "Palembang", region: "Sumatera Selatan", population: "1.7M", headline: "Download Video TikTok di Palembang — Gratis HD, Tanpa Watermark", subheadline: "Cara download TikTok di Palembang. Gratis, mudah.", localKeywords: ["download TikTok Palembang"] },
  ],

  vi: [
    { slug: "ho-chi-minh", cityName: "Ho Chi Minh City", localName: "TP Hồ Chí Minh", region: "Đông Nam Bộ", population: "9.3M", headline: "Tải Video TikTok tại TP Hồ Chí Minh — Miễn Phí, Không Logo, HD", subheadline: "Trình tải TikTok nhanh nhất Sài Gòn. Không cần cài app.", localKeywords: ["tải TikTok Sài Gòn", "tải video TikTok Hồ Chí Minh", "tải TikTok không logo Sài Gòn"] },
    { slug: "hanoi", cityName: "Hanoi", localName: "Hà Nội", region: "Đồng Bằng Sông Hồng", population: "8.4M", headline: "Tải Video TikTok tại Hà Nội — Miễn Phí, Không Logo, HD", subheadline: "Trình tải TikTok tốt nhất Hà Nội. HD, không logo.", localKeywords: ["tải TikTok Hà Nội", "tải video TikTok Hà Nội"] },
    { slug: "da-nang", cityName: "Da Nang", localName: "Đà Nẵng", region: "Duyên Hải Nam Trung Bộ", population: "1.2M", headline: "Tải Video TikTok tại Đà Nẵng — Miễn Phí, Không Logo, HD", subheadline: "Trình tải TikTok Đà Nẵng. Miễn phí, chất lượng HD.", localKeywords: ["tải TikTok Đà Nẵng", "tải video TikTok Đà Nẵng"] },
    { slug: "hai-phong", cityName: "Hai Phong", localName: "Hải Phòng", region: "Đồng Bằng Sông Hồng", population: "2.1M", headline: "Tải Video TikTok tại Hải Phòng — Miễn Phí, Không Logo, HD", subheadline: "Download TikTok tại Hải Phòng. Nhanh, miễn phí.", localKeywords: ["tải TikTok Hải Phòng"] },
  ],

  th: [
    { slug: "bangkok", cityName: "Bangkok", localName: "กรุงเทพมหานคร", region: "ภาคกลาง", population: "10.5M", headline: "ดาวน์โหลดวิดีโอ TikTok ในกรุงเทพ — ฟรี ไม่มีลายน้ำ HD", subheadline: "ตัวดาวน์โหลด TikTok ที่เร็วที่สุดในกรุงเทพ ไม่ต้องติดตั้งแอป", localKeywords: ["ดาวน์โหลด TikTok กรุงเทพ", "โหลดวิดีโอ TikTok กทม"] },
    { slug: "chiang-mai", cityName: "Chiang Mai", localName: "เชียงใหม่", region: "ภาคเหนือ", population: "1.2M", headline: "ดาวน์โหลดวิดีโอ TikTok ในเชียงใหม่ — ฟรี ไม่มีลายน้ำ HD", subheadline: "โหลด TikTok ที่เชียงใหม่ ฟรี คุณภาพ HD", localKeywords: ["ดาวน์โหลด TikTok เชียงใหม่"] },
    { slug: "phuket", cityName: "Phuket", localName: "ภูเก็ต", region: "ภาคใต้", population: "420K", headline: "ดาวน์โหลดวิดีโอ TikTok ในภูเก็ต — ฟรี ไม่มีลายน้ำ HD", subheadline: "ดาวน์โหลด TikTok ที่ภูเก็ต ง่าย ฟรี ไม่มีลายน้ำ", localKeywords: ["ดาวน์โหลด TikTok ภูเก็ต"] },
  ],

  es: [
    { slug: "mexico-city", cityName: "Mexico City", localName: "CDMX", region: "Centro", population: "9.2M", headline: "Descargar TikTok en CDMX — Gratis, Sin Marca de Agua, HD", subheadline: "El mejor descargador de TikTok en Ciudad de México. Sin app.", localKeywords: ["descargar TikTok CDMX", "descargar videos TikTok México DF"] },
    { slug: "guadalajara", cityName: "Guadalajara", localName: "Guadalajara", region: "Jalisco", population: "5.1M", headline: "Descargar TikTok en Guadalajara — Gratis, Sin Marca de Agua, HD", subheadline: "Descargador TikTok en Guadalajara. HD, sin registro.", localKeywords: ["descargar TikTok Guadalajara"] },
    { slug: "monterrey", cityName: "Monterrey", localName: "Monterrey", region: "Nuevo León", population: "4.7M", headline: "Descargar TikTok en Monterrey — Gratis, Sin Marca de Agua, HD", subheadline: "Descarga TikTok en Monterrey. Gratis, calidad HD.", localKeywords: ["descargar TikTok Monterrey"] },
    { slug: "madrid", cityName: "Madrid", localName: "Madrid", region: "Comunidad de Madrid", population: "3.3M", headline: "Descargar TikTok en Madrid — Gratis, Sin Marca de Agua, HD", subheadline: "El mejor descargador TikTok en Madrid. Sin app, sin registro.", localKeywords: ["descargar TikTok Madrid"] },
    { slug: "barcelona", cityName: "Barcelona", localName: "Barcelona", region: "Cataluña", population: "1.6M", headline: "Descargar TikTok en Barcelona — Gratis, Sin Marca de Agua, HD", subheadline: "Descarga TikTok en Barcelona. Gratis, rápido, sin marca de agua.", localKeywords: ["descargar TikTok Barcelona"] },
  ],

  "pt-br": [
    { slug: "sao-paulo", cityName: "São Paulo", localName: "São Paulo", region: "Sudeste", population: "12.3M", headline: "Baixar TikTok em São Paulo — Grátis, Sem Marca D'água, HD", subheadline: "O melhor downloader TikTok em SP. Sem app, sem cadastro.", localKeywords: ["baixar TikTok São Paulo", "baixar vídeos TikTok SP"] },
    { slug: "rio-de-janeiro", cityName: "Rio de Janeiro", localName: "Rio de Janeiro", region: "Sudeste", population: "6.7M", headline: "Baixar TikTok no Rio — Grátis, Sem Marca D'água, HD", subheadline: "Baixe TikTok no Rio de Janeiro. Grátis, qualidade HD.", localKeywords: ["baixar TikTok Rio", "baixar vídeos TikTok Rio de Janeiro"] },
    { slug: "brasilia", cityName: "Brasília", localName: "Brasília", region: "Centro-Oeste", population: "3.1M", headline: "Baixar TikTok em Brasília — Grátis, Sem Marca D'água, HD", subheadline: "Downloader TikTok em Brasília. Gratuito, sem marca d'água.", localKeywords: ["baixar TikTok Brasília"] },
    { slug: "salvador", cityName: "Salvador", localName: "Salvador", region: "Nordeste", population: "2.9M", headline: "Baixar TikTok em Salvador — Grátis, Sem Marca D'água, HD", subheadline: "Baixe vídeos TikTok em Salvador. Grátis, HD.", localKeywords: ["baixar TikTok Salvador"] },
  ],

  zh: [
    { slug: "shanghai", cityName: "Shanghai", localName: "上海", region: "华东", population: "24.8M", headline: "在上海下载TikTok视频 — 免费无水印高清", subheadline: "上海最快的TikTok下载器。无需安装应用。", localKeywords: ["TikTok下载上海", "下载TikTok视频上海"] },
    { slug: "beijing", cityName: "Beijing", localName: "北京", region: "华北", population: "21.5M", headline: "在北京下载TikTok视频 — 免费无水印高清", subheadline: "北京最好的TikTok下载器。高清无水印。", localKeywords: ["TikTok下载北京", "下载TikTok视频北京"] },
    { slug: "guangzhou", cityName: "Guangzhou", localName: "广州", region: "华南", population: "18.6M", headline: "在广州下载TikTok视频 — 免费无水印高清", subheadline: "广州最方便的TikTok下载。免费、简单。", localKeywords: ["TikTok下载广州"] },
    { slug: "shenzhen", cityName: "Shenzhen", localName: "深圳", region: "华南", population: "17.5M", headline: "在深圳下载TikTok视频 — 免费无水印高清", subheadline: "深圳最好的TikTok下载工具。免费高清。", localKeywords: ["TikTok下载深圳"] },
  ],

  ja: [
    { slug: "tokyo", cityName: "Tokyo", localName: "東京", region: "関東", population: "14M", headline: "東京でTikTok動画をダウンロード — 無料・透かしなし・HD", subheadline: "東京で一番速いTikTokダウンローダー。アプリ不要。", localKeywords: ["TikTok ダウンロード 東京", "TikTok 動画 保存 東京"] },
    { slug: "osaka", cityName: "Osaka", localName: "大阪", region: "関西", population: "2.7M", headline: "大阪でTikTok動画をダウンロード — 無料・透かしなし・HD", subheadline: "大阪のTikTokダウンローダー。無料、簡単。", localKeywords: ["TikTok ダウンロード 大阪"] },
    { slug: "nagoya", cityName: "Nagoya", localName: "名古屋", region: "中部", population: "2.3M", headline: "名古屋でTikTok動画をダウンロード — 無料・透かしなし・HD", subheadline: "名古屋で使えるTikTokダウンローダー。無料で高画質。", localKeywords: ["TikTok ダウンロード 名古屋"] },
  ],

  ko: [
    { slug: "seoul", cityName: "Seoul", localName: "서울", region: "수도권", population: "9.7M", headline: "서울에서 TikTok 동영상 다운로드 — 무료, 워터마크 없음, HD", subheadline: "서울에서 가장 빠른 TikTok 다운로더. 앱 불필요.", localKeywords: ["TikTok 다운로드 서울", "틱톡 동영상 저장 서울"] },
    { slug: "busan", cityName: "Busan", localName: "부산", region: "경상권", population: "3.4M", headline: "부산에서 TikTok 동영상 다운로드 — 무료, 워터마크 없음, HD", subheadline: "부산 TikTok 다운로더. 무료, 고화질.", localKeywords: ["TikTok 다운로드 부산"] },
  ],

  // ── Remaining 10 locales (city data fills coverage gap) ──

  fr: [
    { slug: "paris", cityName: "Paris", localName: "Paris", region: "Île-de-France", population: "2.1M", headline: "Télécharger des Vidéos TikTok à Paris — Gratuit, Sans Filigrane, HD", subheadline: "Le meilleur téléchargeur TikTok à Paris. Sans application, sans inscription.", localKeywords: ["télécharger TikTok Paris", "télécharger vidéo TikTok Paris"] },
    { slug: "marseille", cityName: "Marseille", localName: "Marseille", region: "Provence", population: "870K", headline: "Télécharger des Vidéos TikTok à Marseille — Gratuit HD", subheadline: "Téléchargeur TikTok à Marseille. Gratuit, rapide, sans filigrane.", localKeywords: ["télécharger TikTok Marseille"] },
  ],

  de: [
    { slug: "berlin", cityName: "Berlin", localName: "Berlin", region: "Berlin", population: "3.6M", headline: "TikTok Videos in Berlin herunterladen — Kostenlos, Ohne Wasserzeichen, HD", subheadline: "Der beste TikTok Downloader in Berlin. Keine App nötig.", localKeywords: ["TikTok Downloader Berlin", "TikTok Videos herunterladen Berlin"] },
    { slug: "munich", cityName: "Munich", localName: "München", region: "Bayern", population: "1.5M", headline: "TikTok Videos in München herunterladen — Kostenlos HD", subheadline: "TikTok Downloader München. Kostenlos, ohne Wasserzeichen.", localKeywords: ["TikTok Downloader München"] },
    { slug: "hamburg", cityName: "Hamburg", localName: "Hamburg", region: "Hamburg", population: "1.8M", headline: "TikTok Videos in Hamburg herunterladen — Kostenlos HD", subheadline: "TikTok Downloader Hamburg. Gratis, HD Qualität.", localKeywords: ["TikTok Downloader Hamburg"] },
  ],

  ru: [
    { slug: "moscow", cityName: "Moscow", localName: "Москва", region: "Центральный", population: "12.5M", headline: "Скачать Видео TikTok в Москве — Бесплатно, Без Водяного Знака, HD", subheadline: "Лучший загрузчик TikTok в Москве. Без приложения.", localKeywords: ["скачать TikTok Москва", "загрузчик TikTok Москва"] },
    { slug: "saint-petersburg", cityName: "Saint Petersburg", localName: "Санкт-Петербург", region: "Северо-Западный", population: "5.4M", headline: "Скачать Видео TikTok в Санкт-Петербурге — Бесплатно HD", subheadline: "Загрузчик TikTok в СПб. Бесплатно, без регистрации.", localKeywords: ["скачать TikTok Санкт-Петербург", "загрузчик TikTok СПб"] },
  ],

  tr: [
    { slug: "istanbul", cityName: "Istanbul", localName: "İstanbul", region: "Marmara", population: "15.5M", headline: "İstanbul'da TikTok Videolarını İndir — Ücretsiz, Filigransız, HD", subheadline: "İstanbul'un en iyi TikTok indiricisi. Uygulama gerekmez.", localKeywords: ["TikTok indirici İstanbul", "TikTok video indir İstanbul"] },
    { slug: "ankara", cityName: "Ankara", localName: "Ankara", region: "İç Anadolu", population: "5.6M", headline: "Ankara'da TikTok Videolarını İndir — Ücretsiz HD", subheadline: "Ankara TikTok indirici. Ücretsiz, kayıt gerekmez.", localKeywords: ["TikTok indirici Ankara"] },
    { slug: "izmir", cityName: "Izmir", localName: "İzmir", region: "Ege", population: "4.4M", headline: "İzmir'de TikTok Videolarını İndir — Ücretsiz HD", subheadline: "İzmir TikTok indirici. Filigransız, ücretsiz.", localKeywords: ["TikTok indirici İzmir"] },
  ],

  it: [
    { slug: "rome", cityName: "Rome", localName: "Roma", region: "Lazio", population: "2.8M", headline: "Scaricare Video TikTok a Roma — Gratis, Senza Filigrana, HD", subheadline: "Il miglior downloader TikTok a Roma. Senza app, senza registrazione.", localKeywords: ["scaricare TikTok Roma", "download video TikTok Roma"] },
    { slug: "milan", cityName: "Milan", localName: "Milano", region: "Lombardia", population: "1.4M", headline: "Scaricare Video TikTok a Milano — Gratis HD", subheadline: "Downloader TikTok Milano. Gratuito, senza filigrana.", localKeywords: ["scaricare TikTok Milano"] },
  ],

  pl: [
    { slug: "warsaw", cityName: "Warsaw", localName: "Warszawa", region: "Mazowieckie", population: "1.8M", headline: "Pobieranie TikTok w Warszawie — Za Darmo, Bez Znaku Wodnego, HD", subheadline: "Najlepszy downloader TikTok w Warszawie. Bez aplikacji.", localKeywords: ["pobieranie TikTok Warszawa", "pobierz filmy TikTok Warszawa"] },
    { slug: "krakow", cityName: "Krakow", localName: "Kraków", region: "Małopolskie", population: "780K", headline: "Pobieranie TikTok w Krakowie — Za Darmo HD", subheadline: "Pobierz TikTok w Krakowie. Bezpłatnie, bez znaku wodnego.", localKeywords: ["pobieranie TikTok Kraków"] },
  ],

  nl: [
    { slug: "amsterdam", cityName: "Amsterdam", localName: "Amsterdam", region: "Noord-Holland", population: "920K", headline: "TikTok Video's Downloaden in Amsterdam — Gratis, Zonder Watermerk, HD", subheadline: "De beste TikTok downloader in Amsterdam. Geen app nodig.", localKeywords: ["TikTok downloaden Amsterdam", "TikTok video's gratis downloaden Amsterdam"] },
    { slug: "rotterdam", cityName: "Rotterdam", localName: "Rotterdam", region: "Zuid-Holland", population: "650K", headline: "TikTok Video's Downloaden in Rotterdam — Gratis HD", subheadline: "TikTok downloader Rotterdam. Gratis, zonder watermerk.", localKeywords: ["TikTok downloaden Rotterdam"] },
  ],

  ms: [
    { slug: "kuala-lumpur", cityName: "Kuala Lumpur", localName: "Kuala Lumpur", region: "Wilayah Persekutuan", population: "1.8M", headline: "Muat Turun Video TikTok di Kuala Lumpur — Percuma, Tanpa Watermark, HD", subheadline: "Pemuat turun TikTok terbaik di KL. Tanpa aplikasi.", localKeywords: ["muat turun TikTok KL", "download TikTok Kuala Lumpur"] },
    { slug: "penang", cityName: "Penang", localName: "Pulau Pinang", region: "Pulau Pinang", population: "720K", headline: "Muat Turun Video TikTok di Penang — Percuma HD", subheadline: "Pemuat turun TikTok Penang. Percuma, mudah.", localKeywords: ["muat turun TikTok Penang"] },
  ],

  fil: [
    { slug: "manila", cityName: "Manila", localName: "Maynila", region: "NCR", population: "1.8M", headline: "Mag-download ng TikTok Videos sa Manila — Libre, Walang Watermark, HD", subheadline: "Pinakamabilis na TikTok downloader sa Manila. Walang app.", localKeywords: ["TikTok downloader Manila", "mag-download ng TikTok Manila"] },
    { slug: "cebu", cityName: "Cebu", localName: "Cebu", region: "Central Visayas", population: "960K", headline: "Mag-download ng TikTok Videos sa Cebu — Libre HD", subheadline: "TikTok downloader sa Cebu. Libre, walang watermark.", localKeywords: ["TikTok downloader Cebu"] },
  ],

  hi: [
    { slug: "mumbai", cityName: "Mumbai", localName: "मुंबई", region: "Maharashtra", population: "20.7M", headline: "मुंबई में TikTok वीडियो डाउनलोड करें — मुफ़्त, बिना वॉटरमार्क, HD", subheadline: "मुंबई का सबसे तेज़ TikTok डाउनलोडर। बिना ऐप।", localKeywords: ["TikTok डाउनलोडर मुंबई", "TikTok वीडियो डाउनलोड मुंबई"] },
    { slug: "delhi", cityName: "Delhi", localName: "दिल्ली", region: "Delhi NCR", population: "16.8M", headline: "दिल्ली में TikTok वीडियो डाउनलोड करें — मुफ़्त HD", subheadline: "दिल्ली TikTok डाउनलोडर। फ्री, बिना रजिस्ट्रेशन।", localKeywords: ["TikTok डाउनलोडर दिल्ली"] },
    { slug: "bangalore", cityName: "Bangalore", localName: "बेंगलुरु", region: "Karnataka", population: "12.3M", headline: "बेंगलुरु में TikTok वीडियो डाउनलोड करें — मुफ़्त HD", subheadline: "बेंगलुरु TikTok डाउनलोडर। मुफ़्त, HD क्वालिटी।", localKeywords: ["TikTok डाउनलोडर बेंगलुरु"] },
  ],
}
