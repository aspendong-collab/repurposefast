/**
 * Local SEO Landing Pages Data
 * =============================
 * Each locale gets a country-specific landing page targeting
 * "TikTok Downloader [Country]" / "[Local Phrase]" keywords.
 *
 * Auto-generated — add more countries/regions as needed.
 */

export interface LocalLandingPage {
  slug: string
  countryName: string        // English name
  localName: string          // Local language name
  headline: string           // "Download TikTok Videos in [Country]"
  subheadline: string        // Supporting copy
  localKeywords: string[]    // Geo-targeted keywords
  description: string        // Meta description
  features: { title: string; desc: string }[]  // Localized feature highlights
  howToSteps: { step: number; title: string; desc: string }[]
  faq: { q: string; a: string }[]
}

export const localPages: Record<string, LocalLandingPage[]> = {
  en: [
    {
      slug: "united-states",
      countryName: "United States",
      localName: "USA",
      headline: "Download TikTok Videos in the United States — Free, No Watermark",
      subheadline: "The fastest TikTok downloader for US users. Works on iPhone, Android, and PC. No app installation needed.",
      localKeywords: ["TikTok downloader USA", "download TikTok video United States", "TikTok no watermark USA", "free TikTok downloader America"],
      description: "Download TikTok videos without watermark in the United States. Free HD TikTok downloader for USA users. Works on iPhone, Android, PC. No registration required.",
      features: [
        { title: "HD 1080p Downloads", desc: "Download TikTok videos in full HD quality — no compression, no watermarks." },
        { title: "No App Required", desc: "Works directly in your browser on any device — iPhone, Android, Windows, Mac." },
        { title: "Unlimited & Free", desc: "No download limits, no registration, no hidden fees. Completely free for US users." },
      ],
      howToSteps: [
        { step: 1, title: "Copy the TikTok Link", desc: "Open TikTok, tap Share on any video, then tap Copy Link." },
        { step: 2, title: "Paste on Saveik", desc: "Go to saveik.com, paste the link into the download box, and click Download." },
        { step: 3, title: "Save Your Video", desc: "Choose MP4 (video) or MP3 (audio). The file saves to your Downloads folder." },
      ],
      faq: [
        { q: "Is Saveik available in the United States?", a: "Yes! Saveik works perfectly in the USA and all 50 states. No VPN needed." },
        { q: "Can I download TikTok videos on iPhone in the US?", a: "Absolutely. Open Safari, go to saveik.com, paste your link, and download. The video saves to your Files app." },
        { q: "Is it legal to download TikTok videos in the US?", a: "For personal use, yes. Saveik is for saving videos you have the right to access publicly." },
      ],
    },
    {
      slug: "united-kingdom",
      countryName: "United Kingdom",
      localName: "UK",
      headline: "Download TikTok Videos in the UK — Free, No Watermark, HD",
      subheadline: "The best TikTok downloader for British users. Works on all devices with no app needed.",
      localKeywords: ["TikTok downloader UK", "download TikTok video United Kingdom", "TikTok no watermark Britain", "free TikTok downloader UK"],
      description: "Download TikTok videos without watermark in the United Kingdom. Free HD TikTok downloader for UK users. iPhone, Android, PC compatible.",
      features: [
        { title: "HD Downloads", desc: "Save TikTok videos in crisp 1080p quality — perfect for sharing on other platforms." },
        { title: "Browser-Based", desc: "No app to install. Works in Safari, Chrome, or any browser on any device." },
        { title: "100% Free", desc: "No registration, no limits, no hidden costs. Download as many videos as you want." },
      ],
      howToSteps: [
        { step: 1, title: "Get the TikTok Link", desc: "Find a video on TikTok, tap the Share button, and select Copy Link." },
        { step: 2, title: "Use Saveik", desc: "Visit saveik.com, paste your link, and hit the Download button." },
        { step: 3, title: "Download & Enjoy", desc: "Pick MP4 or MP3 format — your file downloads instantly." },
      ],
      faq: [
        { q: "Does Saveik work in the UK?", a: "Yes, Saveik works perfectly across England, Scotland, Wales, and Northern Ireland." },
        { q: "Can I use Saveik on my iPhone in the UK?", a: "Yes! Just use Safari to visit saveik.com — no app download needed." },
      ],
    },
    {
      slug: "canada",
      countryName: "Canada",
      localName: "Canada",
      headline: "Download TikTok Videos in Canada — Free HD, No Watermark",
      subheadline: "The fastest TikTok downloader for Canadian users. Works everywhere from Toronto to Vancouver.",
      localKeywords: ["TikTok downloader Canada", "download TikTok video Canada", "free TikTok downloader Canada", "TikTok no watermark Canadian"],
      description: "Download TikTok videos without watermark in Canada. Free HD TikTok downloader. Works on all devices — iPhone, Android, PC. No app, no registration.",
      features: [
        { title: "HD Quality", desc: "Download TikTok videos in full 1080p HD — no watermarks, no quality loss." },
        { title: "All Devices", desc: "Works on iPhone, Android, Windows, and Mac — just use your browser." },
        { title: "Free Forever", desc: "No limits, no registration, no fees. Unlimited downloads for Canadian users." },
      ],
      howToSteps: [
        { step: 1, title: "Copy Link", desc: "On TikTok, tap Share → Copy Link for the video you want." },
        { step: 2, title: "Paste & Download", desc: "Go to saveik.com, paste the link, click Download." },
        { step: 3, title: "Save File", desc: "Choose MP4 video or MP3 audio and save to your device." },
      ],
      faq: [
        { q: "Does Saveik work in Canada?", a: "Yes! Saveik is fully available across all Canadian provinces and territories." },
        { q: "Can I download TikTok videos on my phone in Canada?", a: "Yes — open your browser, visit saveik.com, paste the link, and download. Works on iPhone and Android." },
      ],
    },
    {
      slug: "australia",
      countryName: "Australia",
      localName: "Australia",
      headline: "Download TikTok Videos in Australia — Free, No Watermark, HD",
      subheadline: "The best TikTok downloader for Aussie users. Fast downloads, no app required.",
      localKeywords: ["TikTok downloader Australia", "download TikTok video Australia", "free TikTok downloader Aussie", "TikTok no watermark Australia"],
      description: "Download TikTok videos without watermark in Australia. Free HD TikTok downloader. Works on iPhone, Android, PC. No registration, unlimited downloads.",
      features: [
        { title: "HD Downloads", desc: "Get TikTok videos in crisp 1080p — perfect quality, zero watermarks." },
        { title: "No App Needed", desc: "Works right in your browser — Safari, Chrome, any browser on any device." },
        { title: "Unlimited Free", desc: "No limits, no sign-up, no payment. Download as many TikToks as you want." },
      ],
      howToSteps: [
        { step: 1, title: "Copy TikTok Link", desc: "Find a video on TikTok, tap Share, then Copy Link." },
        { step: 2, title: "Paste on Saveik", desc: "Open saveik.com, paste your link, click Download." },
        { step: 3, title: "Save Your Video", desc: "Select MP4 or MP3 and save to your device instantly." },
      ],
      faq: [
        { q: "Is Saveik available in Australia?", a: "Yes! Saveik works perfectly in Sydney, Melbourne, Brisbane, Perth, and everywhere in Australia." },
        { q: "Can I use Saveik on my phone in Australia?", a: "Definitely — it works on iPhone and Android browsers with no app installation." },
      ],
    },
  ],

  id: [
    {
      slug: "indonesia",
      countryName: "Indonesia",
      localName: "Indonesia",
      headline: "Download Video TikTok di Indonesia — Gratis, Tanpa Watermark, HD",
      subheadline: "Pengunduh TikTok tercepat untuk pengguna Indonesia. Tanpa aplikasi, tanpa registrasi.",
      localKeywords: ["download TikTok Indonesia", "cara download video TikTok", "pengunduh TikTok gratis", "download TikTok tanpa watermark Indonesia", "unduh video TikTok HD"],
      description: "Download video TikTok tanpa watermark di Indonesia. Pengunduh TikTok HD gratis. Bisa di iPhone, Android, PC. Tanpa registrasi, tanpa batas.",
      features: [
        { title: "Kualitas HD 1080p", desc: "Unduh video TikTok dalam kualitas HD penuh — tanpa kompresi, tanpa watermark." },
        { title: "Tanpa Aplikasi", desc: "Langsung dari browser — Android, iPhone, PC, semua bisa." },
        { title: "Gratis Selamanya", desc: "Tanpa batas download, tanpa registrasi, tanpa biaya tersembunyi." },
      ],
      howToSteps: [
        { step: 1, title: "Salin Link TikTok", desc: "Buka TikTok, ketuk Bagikan, lalu Salin Tautan." },
        { step: 2, title: "Tempel di Saveik", desc: "Buka saveik.com/id, tempel link, klik Unduh." },
        { step: 3, title: "Simpan Video", desc: "Pilih MP4 (video) atau MP3 (audio). File tersimpan otomatis." },
      ],
      faq: [
        { q: "Apakah Saveik bisa digunakan di Indonesia?", a: "Tentu! Saveik berfungsi sempurna di seluruh Indonesia — dari Jakarta sampai Papua." },
        { q: "Bisa download TikTok di HP Android Indonesia?", a: "Bisa! Cukup buka browser, kunjungi saveik.com/id, tempel link, dan unduh." },
        { q: "Apakah gratis?", a: "100% gratis. Tidak perlu registrasi, tidak ada batasan download." },
      ],
    },
  ],

  vi: [
    {
      slug: "vietnam",
      countryName: "Vietnam",
      localName: "Việt Nam",
      headline: "Tải Video TikTok tại Việt Nam — Miễn Phí, Không Logo, HD",
      subheadline: "Trình tải TikTok nhanh nhất cho người dùng Việt. Không cần cài ứng dụng.",
      localKeywords: ["tải TikTok Việt Nam", "tải video TikTok không logo", "trình tải TikTok miễn phí", "download TikTok không watermark Việt Nam"],
      description: "Tải video TikTok không watermark tại Việt Nam. Trình tải TikTok HD miễn phí. Dùng được trên iPhone, Android, PC. Không cần đăng ký.",
      features: [
        { title: "Chất Lượng HD", desc: "Tải video TikTok chất lượng 1080p — không logo, không giảm chất lượng." },
        { title: "Không Cần App", desc: "Dùng trực tiếp trên trình duyệt — Chrome, Safari, Cốc Cốc." },
        { title: "Miễn Phí Mãi Mãi", desc: "Không giới hạn, không đăng ký, không phí ẩn." },
      ],
      howToSteps: [
        { step: 1, title: "Sao Chép Link", desc: "Mở TikTok, nhấn Chia Sẻ → Sao Chép Liên Kết." },
        { step: 2, title: "Dán vào Saveik", desc: "Vào saveik.com/vi, dán link, nhấn Tải Xuống." },
        { step: 3, title: "Lưu Video", desc: "Chọn MP4 hoặc MP3 — video lưu vào máy ngay." },
      ],
      faq: [
        { q: "Saveik có dùng được ở Việt Nam không?", a: "Có! Saveik hoạt động tốt trên toàn Việt Nam." },
        { q: "Tải TikTok trên điện thoại Việt Nam được không?", a: "Được! Mở trình duyệt, vào saveik.com/vi, dán link là tải được." },
      ],
    },
  ],

  th: [
    {
      slug: "thailand",
      countryName: "Thailand",
      localName: "ประเทศไทย",
      headline: "ดาวน์โหลดวิดีโอ TikTok ในประเทศไทย — ฟรี ไม่มีลายน้ำ HD",
      subheadline: "ตัวดาวน์โหลด TikTok ที่เร็วที่สุดสำหรับคนไทย ไม่ต้องติดตั้งแอป",
      localKeywords: ["ดาวน์โหลด TikTok ไทย", "โหลดวิดีโอ TikTok ฟรี", "ดาวน์โหลด TikTok ไม่มีลายน้ำ", "โปรแกรมโหลด TikTok ฟรี"],
      description: "ดาวน์โหลดวิดีโอ TikTok ไม่มีลายน้ำในประเทศไทย ตัวดาวน์โหลด TikTok HD ฟรี ใช้ได้บน iPhone, Android, PC ไม่ต้องสมัคร",
      features: [
        { title: "ความละเอียด HD", desc: "ดาวน์โหลดวิดีโอ TikTok ความละเอียด 1080p — ไม่มีลายน้ำ คุณภาพเต็ม" },
        { title: "ไม่ต้องติดตั้งแอป", desc: "ใช้ผ่านเบราว์เซอร์ได้เลย — Chrome, Safari, ทุกเบราว์เซอร์" },
        { title: "ฟรีตลอดไป", desc: "ไม่จำกัดจำนวนดาวน์โหลด ไม่ต้องลงทะเบียน" },
      ],
      howToSteps: [
        { step: 1, title: "คัดลอกลิงก์", desc: "เปิด TikTok กดแชร์ → คัดลอกลิงก์" },
        { step: 2, title: "วางที่ Saveik", desc: "ไปที่ saveik.com/th วางลิงก์ กดดาวน์โหลด" },
        { step: 3, title: "บันทึกวิดีโอ", desc: "เลือก MP4 หรือ MP3 — ไฟล์บันทึกทันที" },
      ],
      faq: [
        { q: "Saveik ใช้ในประเทศไทยได้ไหม?", a: "ได้! Saveik ใช้งานได้ดีทั่วประเทศไทย" },
        { q: "โหลด TikTok บนมือถือในไทยได้ไหม?", a: "ได้! เปิดเบราว์เซอร์ เข้า saveik.com/th วางลิงก์ แล้วโหลดได้เลย" },
      ],
    },
  ],

  es: [
    {
      slug: "mexico",
      countryName: "Mexico",
      localName: "México",
      headline: "Descargar Videos de TikTok en México — Gratis, Sin Marca de Agua, HD",
      subheadline: "El descargador de TikTok más rápido para usuarios mexicanos. Sin instalar apps.",
      localKeywords: ["descargar TikTok México", "descargar videos TikTok gratis", "TikTok sin marca de agua México", "descargador TikTok gratis"],
      description: "Descarga videos de TikTok sin marca de agua en México. Descargador HD gratuito. Funciona en iPhone, Android, PC. Sin registro, descargas ilimitadas.",
      features: [
        { title: "Calidad HD 1080p", desc: "Descarga videos en calidad HD completa — sin marcas de agua." },
        { title: "Sin Aplicación", desc: "Funciona en tu navegador — Chrome, Safari, cualquier dispositivo." },
        { title: "Gratis Ilimitado", desc: "Sin límites de descarga, sin registro, sin costos ocultos." },
      ],
      howToSteps: [
        { step: 1, title: "Copia el Enlace", desc: "En TikTok, toca Compartir → Copiar Enlace." },
        { step: 2, title: "Pega en Saveik", desc: "Ve a saveik.com/es, pega el enlace, haz clic en Descargar." },
        { step: 3, title: "Guarda el Video", desc: "Elige MP4 (video) o MP3 (audio). Se guarda al instante." },
      ],
      faq: [
        { q: "¿Saveik funciona en México?", a: "¡Sí! Saveik funciona perfectamente en todo México — CDMX, Guadalajara, Monterrey y más." },
        { q: "¿Puedo descargar TikTok en mi celular en México?", a: "¡Claro! Abre tu navegador, ve a saveik.com/es, pega el enlace y descarga." },
      ],
    },
    {
      slug: "spain",
      countryName: "Spain",
      localName: "España",
      headline: "Descargar Videos de TikTok en España — Gratis, Sin Marca de Agua, HD",
      subheadline: "El mejor descargador de TikTok para usuarios españoles. Sin aplicaciones ni registros.",
      localKeywords: ["descargar TikTok España", "descargar videos TikTok sin marca de agua", "descargador TikTok gratis España"],
      description: "Descarga videos de TikTok sin marca de agua en España. Descargador HD gratuito. iPhone, Android, PC. Sin registro.",
      features: [
        { title: "Calidad HD", desc: "Descarga en 1080p sin perder calidad." },
        { title: "Navegador Web", desc: "Sin instalar nada — funciona en Chrome, Safari, Firefox." },
        { title: "Gratis", desc: "Descargas ilimitadas, sin registro." },
      ],
      howToSteps: [
        { step: 1, title: "Copiar Enlace", desc: "En TikTok, Compartir → Copiar Enlace." },
        { step: 2, title: "Pegar en Saveik", desc: "Visita saveik.com/es, pega el enlace, pulsa Descargar." },
        { step: 3, title: "Guardar", desc: "Elige MP4 o MP3 y guarda el archivo." },
      ],
      faq: [
        { q: "¿Funciona Saveik en España?", a: "Sí, perfectamente en toda España — Madrid, Barcelona, Valencia y más." },
      ],
    },
  ],

  "pt-br": [
    {
      slug: "brasil",
      countryName: "Brazil",
      localName: "Brasil",
      headline: "Baixar Vídeos do TikTok no Brasil — Grátis, Sem Marca D'água, HD",
      subheadline: "O melhor downloader de TikTok para brasileiros. Sem aplicativo, sem cadastro.",
      localKeywords: ["baixar TikTok Brasil", "baixar vídeos TikTok grátis", "TikTok sem marca d'água Brasil", "downloader TikTok grátis"],
      description: "Baixe vídeos do TikTok sem marca d'água no Brasil. Downloader HD grátis. Funciona no iPhone, Android, PC. Sem cadastro, downloads ilimitados.",
      features: [
        { title: "Qualidade HD", desc: "Baixe em 1080p — sem marcas d'água, sem perda de qualidade." },
        { title: "Sem Aplicativo", desc: "Funciona direto no navegador — Chrome, Safari, qualquer um." },
        { title: "Grátis Ilimitado", desc: "Sem limites, sem cadastro, sem taxas escondidas." },
      ],
      howToSteps: [
        { step: 1, title: "Copiar Link", desc: "No TikTok, toque Compartilhar → Copiar Link." },
        { step: 2, title: "Colar no Saveik", desc: "Acesse saveik.com/pt-br, cole o link, clique em Baixar." },
        { step: 3, title: "Salvar Vídeo", desc: "Escolha MP4 ou MP3 e salve no seu dispositivo." },
      ],
      faq: [
        { q: "O Saveik funciona no Brasil?", a: "Sim! Funciona em todo Brasil — São Paulo, Rio, Brasília e mais." },
        { q: "Dá pra baixar TikTok no celular no Brasil?", a: "Dá sim! Abra o navegador, acesse saveik.com/pt-br, cole o link e baixe." },
      ],
    },
  ],

  zh: [
    {
      slug: "china",
      countryName: "China",
      localName: "中国",
      headline: "在中国下载TikTok视频 — 免费无水印高清",
      subheadline: "最快的TikTok下载器。无需安装应用，无需注册。",
      localKeywords: ["TikTok下载中国", "抖音下载器", "TikTok视频下载无水印", "免费TikTok下载"],
      description: "下载无水印TikTok视频。免费高清TikTok下载器。支持iPhone、Android、PC。无需注册，无限下载。",
      features: [
        { title: "高清1080p", desc: "下载TikTok视频全高清画质 — 无水印，无压缩。" },
        { title: "无需安装", desc: "浏览器直接使用 — Chrome、Safari均可。" },
        { title: "永久免费", desc: "无下载限制，无需注册，无隐藏费用。" },
      ],
      howToSteps: [
        { step: 1, title: "复制链接", desc: "打开TikTok，点击分享 → 复制链接。" },
        { step: 2, title: "粘贴到Saveik", desc: "访问saveik.com/zh，粘贴链接，点击下载。" },
        { step: 3, title: "保存视频", desc: "选择MP4或MP3，文件即时保存。" },
      ],
      faq: [
        { q: "Saveik在中国能用吗？", a: "可以！通过浏览器直接访问使用。" },
        { q: "能下载抖音视频吗？", a: "Saveik专注于TikTok（国际版）视频下载。抖音视频请使用其他工具。" },
      ],
    },
  ],

  ja: [
    {
      slug: "japan",
      countryName: "Japan",
      localName: "日本",
      headline: "日本でTikTok動画をダウンロード — 無料・透かしなし・HD",
      subheadline: "日本人ユーザーのための最速TikTokダウンローダー。アプリ不要。",
      localKeywords: ["TikTok ダウンロード 日本", "TikTok 動画 保存 無料", "TikTok 透かしなし ダウンロード"],
      description: "日本でTikTok動画を透かしなしでダウンロード。無料HDダウンローダー。iPhone、Android、PC対応。登録不要。",
      features: [
        { title: "HD画質", desc: "1080pの高画質でダウンロード — 透かしなし。" },
        { title: "アプリ不要", desc: "ブラウザでそのまま使えます — Safari、Chrome対応。" },
        { title: "完全無料", desc: "ダウンロード制限なし、登録不要、追加料金なし。" },
      ],
      howToSteps: [
        { step: 1, title: "リンクをコピー", desc: "TikTokで共有 → リンクをコピー。" },
        { step: 2, title: "Saveikに貼り付け", desc: "saveik.com/jaにアクセス、リンクを貼り付け、ダウンロード。" },
        { step: 3, title: "動画を保存", desc: "MP4またはMP3を選択して保存。" },
      ],
      faq: [
        { q: "Saveikは日本で使えますか？", a: "はい！日本全国で問題なくご利用いただけます。" },
      ],
    },
  ],

  ko: [
    {
      slug: "south-korea",
      countryName: "South Korea",
      localName: "대한민국",
      headline: "한국에서 TikTok 동영상 다운로드 — 무료, 워터마크 없음, HD",
      subheadline: "한국 사용자를 위한 가장 빠른 TikTok 다운로더. 앱 설치 불필요.",
      localKeywords: ["TikTok 다운로드 한국", "틱톡 동영상 저장 무료", "TikTok 워터마크 없이 다운로드"],
      description: "한국에서 TikTok 동영상을 워터마크 없이 다운로드. 무료 HD 다운로더. iPhone, Android, PC 지원. 등록 불필요.",
      features: [
        { title: "HD 화질", desc: "1080p 고화질 다운로드 — 워터마크 없음." },
        { title: "앱 불필요", desc: "브라우저에서 바로 사용 — Chrome, Safari 지원." },
        { title: "완전 무료", desc: "무제한 다운로드, 등록 불필요, 숨은 비용 없음." },
      ],
      howToSteps: [
        { step: 1, title: "링크 복사", desc: "TikTok에서 공유 → 링크 복사." },
        { step: 2, title: "Saveik에 붙여넣기", desc: "saveik.com/ko 방문, 링크 붙여넣기, 다운로드 클릭." },
        { step: 3, title: "동영상 저장", desc: "MP4 또는 MP3 선택 후 저장." },
      ],
      faq: [
        { q: "Saveik은 한국에서 사용 가능한가요?", a: "네! 한국 전역에서 완벽하게 작동합니다." },
      ],
    },
  ],

  ar: [
    {
      slug: "saudi-arabia",
      countryName: "Saudi Arabia",
      localName: "المملكة العربية السعودية",
      headline: "تنزيل فيديوهات TikTok في السعودية — مجاني، بدون علامة مائية، HD",
      subheadline: "أسرع محمل TikTok للمستخدمين السعوديين. بدون تطبيق، بدون تسجيل.",
      localKeywords: ["تنزيل TikTok السعودية", "تحميل فيديوهات TikTok مجانا", "TikTok بدون علامة مائية"],
      description: "تنزيل فيديوهات TikTok بدون علامة مائية في السعودية. محمل HD مجاني. يعمل على iPhone و Android و PC. بدون تسجيل.",
      features: [
        { title: "جودة HD", desc: "تنزيل بجودة 1080p — بدون علامة مائية." },
        { title: "بدون تطبيق", desc: "يعمل مباشرة في المتصفح — Safari و Chrome." },
        { title: "مجاني للأبد", desc: "تحميل غير محدود، بدون تسجيل، بدون رسوم." },
      ],
      howToSteps: [
        { step: 1, title: "نسخ الرابط", desc: "في TikTok، اضغط مشاركة → نسخ الرابط." },
        { step: 2, title: "لصق في Saveik", desc: "اذهب إلى saveik.com/ar، الصق الرابط، اضغط تحميل." },
        { step: 3, title: "حفظ الفيديو", desc: "اختر MP4 أو MP3 واحفظ الملف." },
      ],
      faq: [
        { q: "هل يعمل Saveik في السعودية؟", a: "نعم! يعمل بكفاءة في جميع أنحاء المملكة." },
      ],
    },
  ],
}
