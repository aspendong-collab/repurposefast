/**
 * TikTok Hashtag Landing Pages — Programmatic SEO
 * ================================================
 * Auto-generates unique download pages for popular TikTok hashtags.
 * Pattern: /{locale}/hashtag/{tag-slug}
 *
 * Each hashtag = high-intent search query:
 *   "download [hashtag] TikTok videos" / "save [hashtag] TikToks"
 *
 * Scales: add hashtags → new pages auto-created.
 */

export interface HashtagPage {
  slug: string
  hashtag: string
  category: string
  description: string
}

export const hashtagPages: HashtagPage[] = [
  // ── Dance & Challenge (biggest category) ──
  { slug: "dance-challenge", hashtag: "#dancechallenge", category: "Dance", description: "Popular TikTok dance challenge videos. Learn moves and save your favorites." },
  { slug: "viral-dance", hashtag: "#viraldance", category: "Dance", description: "The latest viral TikTok dance trends. Download and practice offline." },
  { slug: "renegade", hashtag: "#renegade", category: "Dance", description: "The iconic Renegade dance and its variations on TikTok." },
  { slug: "savage-dance", hashtag: "#savagedance", category: "Dance", description: "Savage dance challenge TikTok videos. Download in HD." },
  { slug: "kpop-dance", hashtag: "#kpopdance", category: "Dance", description: "K-pop dance cover TikTok videos. Save and learn choreography." },
  { slug: "hiphop-dance", hashtag: "#hiphopdance", category: "Dance", description: "Hip-hop TikTok dance videos. Download without watermark." },
  { slug: "dance-tutorial", hashtag: "#dancetutorial", category: "Dance", description: "Step-by-step TikTok dance tutorials. Save for practice." },
  { slug: "couple-dance", hashtag: "#coupledance", category: "Dance", description: "Couple dance challenge TikTok videos. Download and share." },

  // ── Cooking & Food ──
  { slug: "tiktok-recipe", hashtag: "#tiktokrecipe", category: "Food", description: "Viral TikTok recipes. Save cooking tutorials for later." },
  { slug: "cooking-hack", hashtag: "#cookinghack", category: "Food", description: "Genius cooking hacks from TikTok. Download and keep." },
  { slug: "baking-tiktok", hashtag: "#bakingtiktok", category: "Food", description: "TikTok baking videos and dessert recipes. Save your favorites." },
  { slug: "food-trend", hashtag: "#foodtrend", category: "Food", description: "Latest food trends on TikTok. Download viral food videos." },
  { slug: "meal-prep", hashtag: "#mealprep", category: "Food", description: "TikTok meal prep ideas and recipes. Save for weekly planning." },
  { slug: "easy-recipe", hashtag: "#easyrecipe", category: "Food", description: "Quick and easy TikTok recipes. Download and cook later." },

  // ── Comedy & Entertainment ──
  { slug: "funny-tiktok", hashtag: "#funnytiktok", category: "Comedy", description: "The funniest TikTok videos. Download and share with friends." },
  { slug: "comedy-sketch", hashtag: "#comedysketch", category: "Comedy", description: "TikTok comedy skits and sketches. Save your favorites." },
  { slug: "prank-video", hashtag: "#prankvideo", category: "Comedy", description: "TikTok prank videos. Download and watch offline." },
  { slug: "relatable", hashtag: "#relatable", category: "Comedy", description: "Relatable TikTok moments. Save videos that hit close to home." },
  { slug: "storytime", hashtag: "#storytime", category: "Comedy", description: "TikTok storytime videos. Download and enjoy offline." },
  { slug: "pov", hashtag: "#pov", category: "Comedy", description: "Point-of-view TikTok videos. Download creative POV content." },

  // ── Beauty & Fashion ──
  { slug: "makeup-tutorial", hashtag: "#makeuptutorial", category: "Beauty", description: "TikTok makeup tutorials and transformations. Save for reference." },
  { slug: "grwm", hashtag: "#grwm", category: "Beauty", description: "Get Ready With Me TikTok videos. Download beauty routines." },
  { slug: "skincare-routine", hashtag: "#skincareroutine", category: "Beauty", description: "TikTok skincare routines and tips. Save your favorites." },
  { slug: "outfit-ideas", hashtag: "#outfitideas", category: "Fashion", description: "TikTok outfit inspiration videos. Download fashion content." },
  { slug: "ootd", hashtag: "#ootd", category: "Fashion", description: "Outfit of the Day TikTok videos. Save style inspiration." },
  { slug: "fashion-hack", hashtag: "#fashionhack", category: "Fashion", description: "TikTok fashion hacks and styling tips. Download and save." },
  { slug: "hair-tutorial", hashtag: "#hairtutorial", category: "Beauty", description: "TikTok hair styling tutorials. Save for offline practice." },
  { slug: "nail-art", hashtag: "#nailart", category: "Beauty", description: "TikTok nail art designs and tutorials. Download inspiration." },

  // ── DIY & Life Hacks ──
  { slug: "diy-project", hashtag: "#diyproject", category: "DIY", description: "TikTok DIY project videos. Save and build later." },
  { slug: "life-hack", hashtag: "#lifehack", category: "DIY", description: "Useful TikTok life hacks. Download and remember." },
  { slug: "room-makeover", hashtag: "#roommakeover", category: "DIY", description: "TikTok room makeover and decor videos. Save ideas." },
  { slug: "organization", hashtag: "#organization", category: "DIY", description: "TikTok organization tips and tricks. Download and apply." },
  { slug: "cleaning-hack", hashtag: "#cleaninghack", category: "DIY", description: "TikTok cleaning hacks that actually work. Save for later." },
  { slug: "craft-ideas", hashtag: "#craftideas", category: "DIY", description: "Creative TikTok craft project videos. Download tutorials." },

  // ── Fitness & Health ──
  { slug: "workout-routine", hashtag: "#workoutroutine", category: "Fitness", description: "TikTok workout videos and routines. Download and exercise." },
  { slug: "fitness-challenge", hashtag: "#fitnesschallenge", category: "Fitness", description: "TikTok fitness challenge videos. Save workout inspiration." },
  { slug: "yoga-tutorial", hashtag: "#yogatutorial", category: "Fitness", description: "TikTok yoga tutorial videos. Download for offline practice." },
  { slug: "home-workout", hashtag: "#homeworkout", category: "Fitness", description: "At-home TikTok workout videos. No equipment needed." },
  { slug: "weightloss", hashtag: "#weightloss", category: "Fitness", description: "TikTok weight loss journey videos. Save motivation." },
  { slug: "healthy-recipe", hashtag: "#healthyrecipe", category: "Fitness", description: "Healthy TikTok recipe videos. Download meal ideas." },

  // ── Music & Audio ──
  { slug: "viral-song", hashtag: "#viralsong", category: "Music", description: "TikTok viral song videos. Download and save trending audio." },
  { slug: "cover-song", hashtag: "#coversong", category: "Music", description: "TikTok song cover videos. Download music performances." },
  { slug: "music-trend", hashtag: "#musictrend", category: "Music", description: "Latest TikTok music trends. Save viral audio content." },
  { slug: "karaoke", hashtag: "#karaoke", category: "Music", description: "TikTok karaoke and singing videos. Download entertainment." },

  // ── Travel & Adventure ──
  { slug: "travel-vlog", hashtag: "#travelvlog", category: "Travel", description: "TikTok travel vlog videos. Download travel inspiration." },
  { slug: "hidden-gem", hashtag: "#hiddengem", category: "Travel", description: "TikTok hidden gem travel destinations. Save for trip planning." },
  { slug: "travel-tips", hashtag: "#traveltips", category: "Travel", description: "TikTok travel tips and hacks. Download useful guides." },
  { slug: "bucket-list", hashtag: "#bucketlist", category: "Travel", description: "TikTok bucket list destination videos. Save travel dreams." },

  // ── Pets & Animals ──
  { slug: "cat-tiktok", hashtag: "#cattiktok", category: "Pets", description: "Cute TikTok cat videos. Download and save the best cat content." },
  { slug: "dog-tiktok", hashtag: "#dogtiktok", category: "Pets", description: "Funny TikTok dog videos. Download your favorite dog clips." },
  { slug: "pet-tricks", hashtag: "#pettricks", category: "Pets", description: "TikTok pet trick videos. Save animal training ideas." },
  { slug: "funny-animals", hashtag: "#funnyanimals", category: "Pets", description: "Hilarious TikTok animal videos. Download and share." },

  // ── Tech & Gaming ──
  { slug: "tech-review", hashtag: "#techreview", category: "Tech", description: "TikTok tech review videos. Download gadget reviews." },
  { slug: "phone-tips", hashtag: "#phonetips", category: "Tech", description: "TikTok phone tips and tricks. Save useful tech content." },
  { slug: "gaming-clips", hashtag: "#gamingclips", category: "Gaming", description: "TikTok gaming highlight videos. Download gaming moments." },
  { slug: "streamer-tiktok", hashtag: "#streamertiktok", category: "Gaming", description: "TikTok streamer clips and moments. Save gaming content." },

  // ── Education & Learning ──
  { slug: "learn-on-tiktok", hashtag: "#learnontiktok", category: "Education", description: "Educational TikTok videos. Download and learn offline." },
  { slug: "study-tips", hashtag: "#studytips", category: "Education", description: "TikTok study tips and techniques. Save for exams." },
  { slug: "language-learning", hashtag: "#languagelearning", category: "Education", description: "TikTok language learning videos. Download for practice." },
  { slug: "science-facts", hashtag: "#sciencefacts", category: "Education", description: "TikTok science explanation videos. Download knowledge content." },
  { slug: "math-hack", hashtag: "#mathhack", category: "Education", description: "TikTok math hack videos. Save learning tricks." },

  // ── Sports ──
  { slug: "sports-highlights", hashtag: "#sportshighlights", category: "Sports", description: "TikTok sports highlight videos. Download best moments." },
  { slug: "football-skills", hashtag: "#footballskills", category: "Sports", description: "TikTok football/soccer skill videos. Save and learn." },
  { slug: "basketball", hashtag: "#basketball", category: "Sports", description: "TikTok basketball videos. Download highlights and tips." },
  { slug: "skateboarding", hashtag: "#skateboarding", category: "Sports", description: "TikTok skateboarding videos. Download trick tutorials." },
  { slug: "surfing", hashtag: "#surfing", category: "Sports", description: "TikTok surfing videos. Save wave-riding content." },

  // ── Art & Creative ──
  { slug: "art-tutorial", hashtag: "#arttutorial", category: "Art", description: "TikTok art tutorial videos. Download and learn techniques." },
  { slug: "drawing-tiktok", hashtag: "#drawingtiktok", category: "Art", description: "TikTok drawing and illustration videos. Save art content." },
  { slug: "photography-tips", hashtag: "#photographytips", category: "Art", description: "TikTok photography tip videos. Download for reference." },
  { slug: "satisfying-video", hashtag: "#satisfyingvideo", category: "Art", description: "Satisfying TikTok videos. Download oddly satisfying content." },
  { slug: "transition", hashtag: "#transition", category: "Art", description: "TikTok transition effect videos. Download creative edits." },

  // ── Trending & Viral ──
  { slug: "fyp", hashtag: "#fyp", category: "Trending", description: "For You Page trending TikTok videos. Download viral content." },
  { slug: "viral-tiktok", hashtag: "#viraltiktok", category: "Trending", description: "Currently viral TikTok videos. Save popular content." },
  { slug: "trending-now", hashtag: "#trendingnow", category: "Trending", description: "TikTok trending right now videos. Download hot content." },
  { slug: "duet", hashtag: "#duet", category: "Trending", description: "TikTok duet videos. Download collaborative content." },
  { slug: "stitch", hashtag: "#stitch", category: "Trending", description: "TikTok stitch videos. Download reaction content." },
  { slug: "greenscreen", hashtag: "#greenscreen", category: "Trending", description: "TikTok green screen effect videos. Download creative content." },
]
