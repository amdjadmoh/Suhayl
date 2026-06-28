import { Country } from "./models/Country"
import { University } from "./models/University"
import { City } from "./models/City"

const countries = [
  {
    name: "Germany",
    currency: "EUR",
    livingCostEstimate: 934,
    visaRequirements:
      "National Visa D (student visa). Blocked account (Sperrkonto) with €11,208/year mandatory — funds released monthly at €934. Health insurance required (public ~€125/month or private ~€35/month). Appointment at German embassy with admission letter, CV, motivation, and proof of funds. Processing: 4–8 weeks. Allows 120 full/240 half days of work per year. After graduation: 18-month job seeker visa.",
    visaAcceptanceRate: 92,
    visaBankAccountAmount: 11208,
    visaBankAccountLocked: true,
    pros: [
      "Tuition-free at public universities (only semester fee ~€150–350)",
      "Strong economy with excellent job prospects after graduation",
      "18-month post-study job seeker visa",
      "Central European location — easy travel",
      "World-class engineering and technical education",
    ],
    cons: [
      "Blocked account required (€11,208 locked upfront)",
      "Bureaucracy can be slow — lots of paperwork",
      "Housing crisis in major cities (Munich, Berlin, Hamburg)",
      "Health insurance mandatory (~€120/month)",
      "German language helpful for daily life outside university",
    ],
  },
  {
    name: "France",
    currency: "EUR",
    livingCostEstimate: 850,
    visaRequirements:
      "VLS-TS (long-stay student visa). Proof of funds €615/month (~€7,380/year). Campus France pre-registration required for most non-EU applicants. OFII validation required within 3 months of arrival. Valid 1 year, renewable. Allows 964 hours/year work (60% of full-time). After Master's: 1-year post-study visa (APS). Processing: 2–8 weeks depending on country. No blocked account — bank statement accepted.",
    visaAcceptanceRate: 89,
    visaBankAccountAmount: 7380,
    visaBankAccountLocked: false,
    pros: [
      "VLS-TS visa — relatively straightforward process",
      "Tuition €2,770/year for Master's at public universities",
      "12-month post-study visa (APS) for Master's graduates",
      "Campus France facilitates applications from many countries",
      "Rich culture, food, and central European travel hub",
    ],
    cons: [
      "Campus France pre-registration required for most non-EU applicants",
      "OFII validation within 3 months — extra paperwork step",
      "Paris is expensive for housing",
      "French language strongly recommended for daily life",
      "Bureaucracy can be slow and disorganized",
    ],
  },
  {
    name: "Netherlands",
    currency: "EUR",
    livingCostEstimate: 1100,
    visaRequirements:
      "MVV (entry visa) + VVR (residence permit). University usually applies on your behalf. Proof of funds €1,200/month (€14,400/year) via bank statement or scholarship letter. TB test required for certain nationalities. Health insurance mandatory (~€100/month). Allows 16 hours/week work or full-time in summer. After graduation: Orientation Year (zoekjaar) — 1 year to find work. Processing: 4–8 weeks.",
    visaAcceptanceRate: 88,
    visaBankAccountAmount: 14400,
    visaBankAccountLocked: false,
    pros: [
      "University handles visa application for you",
      "Orientation Year visa after graduation (1 year to find work)",
      "Excellent English proficiency everywhere",
      "Strong tech sector (ASML, Philips, Booking.com)",
      "Central location, excellent train connections"
    ],
    cons: [
      "Tuition high for non-EU (€10,000–22,000/year)",
      "Housing shortage in Amsterdam, Utrecht, Delft",
      "Health insurance mandatory (~€100/month)",
      "Limited scholarships available",
      "Rainy and grey much of the year"
    ],
  },
  {
    name: "Sweden",
    currency: "EUR",
    livingCostEstimate: 920,
    visaRequirements:
      "Residence permit for studies. Proof of funds €11,050/year (SEK 10,314/month for 2025). Must show funds for entire study period upfront. Apply online via Migration Agency (Migrationsverket), biometrics at embassy. Processing: 2–4 months — apply early. Allows unlimited work hours alongside studies. After graduation: 12-month job search permit. No blocked account — bank statement or scholarship letter accepted.",
    visaAcceptanceRate: 85,
    visaBankAccountAmount: 11050,
    visaBankAccountLocked: false,
    pros: [
      "Unlimited work hours alongside studies",
      "12-month job search permit after graduation",
      "High quality of life and work-life balance",
      "Innovation hub (Spotify, Klarna, King)",
      "English widely spoken"
    ],
    cons: [
      "Tuition €8,000–30,000/year for non-EU",
      "Long permit processing (2–4 months)",
      "Dark winters — seasonal affective disorder risk",
      "Competitive Stockholm housing market",
      "High cost of living"
    ],
  },
  {
    name: "Denmark",
    currency: "EUR",
    livingCostEstimate: 1100,
    visaRequirements:
      "Student residence permit (ST1). Proof of funds ~€10,300/year (DKK 76,764). Online application via SIRI portal, biometrics at Danish embassy or in Denmark. Processing: 2–3 months. Allows 20 hours/week work (full-time June–August). After graduation: 2-year Establishment Card to seek work. Tuition-free for EU/EEA; non-EU pay tuition. No blocked account required.",
    visaAcceptanceRate: 82,
    visaBankAccountAmount: 10300,
    visaBankAccountLocked: false,
    pros: [
      "2-year Establishment Card after graduation",
      "Tuition-free for EU/EEA students",
      "High English proficiency everywhere",
      "Excellent work-life balance (37h week norm)",
      "Bicycle-friendly cities, sustainable living"
    ],
    cons: [
      "Tuition €6,700–17,500/year for non-EU",
      "Proof of €10,300/year upfront",
      "Limited scholarships",
      "High taxes and cost of living",
      "Tough Copenhagen housing market"
    ],
  },
  {
    name: "Norway",
    currency: "EUR",
    livingCostEstimate: 1200,
    visaRequirements:
      "Student residence permit. Proof of funds ~€11,900/year (NOK 137,907 in 2025) — must be deposited into an UDI account or shown as bank statement + guaranteed income. Tuition-free for all nationalities at public universities. Allows 20 hours/week work. Processing: 2–8 weeks. After graduation: 1-year job search visa. Note: Norway is not EU but participates in Erasmus+ and Schengen. High cost of living but no tuition fees.",
    visaAcceptanceRate: 84,
    visaBankAccountAmount: 11900,
    visaBankAccountLocked: true,
    pros: [
      "Tuition-free for ALL nationalities",
      "No blocked account needed",
      "Stunning nature (fjords, Northern Lights)",
      "High English proficiency",
      "1-year job search visa after graduation"
    ],
    cons: [
      "Extremely high cost of living (~€1,200/month)",
      "Cold, dark winters",
      "Limited English Master’s programs",
      "Non-EU — separate visa from Schengen",
      "Competitive non-Norwegian job market"
    ],
  },
  {
    name: "Finland",
    currency: "EUR",
    livingCostEstimate: 800,
    visaRequirements:
      "Student residence permit. Proof of funds €6,720/year (€560/month). Apply via Enter Finland online portal, biometrics at Finnish embassy. Processing: 1–2 months. Allows 30 hours/week work (unlimited in your field). After graduation: 2-year post-study permit. Note: tuition fees for non-EU students (€4,000–18,000/year) but generous scholarship programs available. Health insurance required for non-EU.",
    visaAcceptanceRate: 87,
    visaBankAccountAmount: 6720,
    visaBankAccountLocked: false,
    pros: [
      "2-year post-study residence permit",
      "30h/week work (unlimited in your field)",
      "Top-ranked education system",
      "Safe, clean, well-functioning society",
      "Growing startup ecosystem (Slush, Wolt)"
    ],
    cons: [
      "Tuition €4,000–18,000/year for non-EU",
      "Cold, dark winters",
      "Finnish language difficult to learn",
      "Smaller job market vs Central Europe",
      "Remote location — long travel to rest of EU"
    ],
  },
  {
    name: "Switzerland",
    currency: "EUR",
    livingCostEstimate: 1600,
    visaRequirements:
      "National D visa for studies. Proof of ~€22,100/year (CHF 21,000) minimum. Must apply from home country at Swiss embassy — you cannot enter as tourist and switch. Cantonal migration office processes permits. Processing: 8–12 weeks (slow). Allows 15 hours/week work only after 6 months of residence. After graduation: 6-month job search period. High living costs but low tuition (CHF 500–2,000/semester). Note: Switzerland is Schengen but not EU — separate visa needed.",
    visaAcceptanceRate: 78,
    visaBankAccountAmount: 22100,
    visaBankAccountLocked: false,
    pros: [
      "Very high post-graduation salaries",
      "Low tuition (CHF 500–2,000/semester)",
      "Strong banking/pharma/tech economy",
      "Multilingual environment",
      "Stunning Alps and outdoor lifestyle"
    ],
    cons: [
      "Very high cost of living (~€1,600/month)",
      "Slow visa processing (8–12 weeks)",
      "Only 15h/week work, after 6 months",
      "Only 6-month job search after graduation",
      "Not EU — separate work authorization"
    ],
  },
  {
    name: "Austria",
    currency: "EUR",
    livingCostEstimate: 950,
    visaRequirements:
      "Student residence permit (Aufenthaltsbewilligung). Proof of funds €585/month (€7,020/year) via bank statement or blocked account. Apply at Austrian embassy before travel. Quota system applies for some nationalities — limited spots. Processing: 4–8 weeks. Allows 20 hours/week work. After graduation: 12-month job search visa (Rot-Weiß-Rot Karte). Low tuition (~€750/semester for non-EU at public universities). Vienna consistently ranked world's most livable city.",
    visaAcceptanceRate: 83,
    visaBankAccountAmount: 7020,
    visaBankAccountLocked: false,
    pros: [
      "Public unis ~€750/semester for non-EU",
      "12-month job search visa after graduation",
      "Central European hub location",
      "Vienna #1 most livable city worldwide",
      "Rich cultural heritage"
    ],
    cons: [
      "Quota system limits spots for some",
      "Proof of €7,020/year required",
      "Austrian German differs from standard German",
      "Smaller job market than Germany",
      "Conservative norms in some regions"
    ],
  },
  {
    name: "Belgium",
    currency: "EUR",
    livingCostEstimate: 900,
    visaRequirements:
      "Long-stay student visa (Type D). Proof of funds €800/month (€9,600/year). Medical certificate required. University assists with residence permit application. Apply at Belgian embassy. Processing: 4–8 weeks. Allows 20 hours/week work. After graduation: 12-month orientation year. Located in Brussels — EU institutions create unique internship opportunities. Three official languages (Dutch, French, German) but most Master's in English.",
    visaAcceptanceRate: 86,
    visaBankAccountAmount: 9600,
    visaBankAccountLocked: false,
    pros: [
      "EU institutions in Brussels (internships)",
      "12-month orientation year after graduation",
      "Trilingual exposure (Dutch, French, German)",
      "Affordable tuition vs Netherlands/UK",
      "Paris, London, Amsterdam all close"
    ],
    cons: [
      "Proof of €9,600/year required",
      "Complex political/administrative structure",
      "Brussels housing market tightening",
      "Grey, rainy weather",
      "Language divide between regions"
    ],
  },
  {
    name: "Ireland",
    currency: "EUR",
    livingCostEstimate: 1200,
    visaRequirements:
      "Student visa (Stamp 2). Proof of funds €7,000/year minimum. Private health insurance required (~€500/year). Apply online via AVATS, submit documents at Irish embassy/VFS. GNIB registration within 90 days of arrival (€300 fee). Processing: 4–8 weeks. Allows 20 hours/week work during term, 40 hours/week during holidays. After graduation: 2-year Third Level Graduate Scheme for Bachelor's/Master's. Only English-speaking country in EU post-Brexit. Strong tech sector — European HQ of Google, Meta, Apple, Stripe.",
    visaAcceptanceRate: 95,
    visaBankAccountAmount: 7000,
    visaBankAccountLocked: false,
    pros: [
      "Only native English EU country (post-Brexit)",
      "2-year graduate scheme after study",
      "European HQ: Google, Meta, Apple, Stripe",
      "Welcoming, friendly culture",
      "20h work term / 40h holiday"
    ],
    cons: [
      "Dublin accommodation crisis",
      "Tuition €10,000–30,000/year non-EU",
      "Private health insurance (~€500/year)",
      "GNIB registration fee (€300)",
      "Limited public transport outside Dublin"
    ],
  },
  {
    name: "Italy",
    currency: "EUR",
    livingCostEstimate: 750,
    visaRequirements:
      "Student visa (Type D). Proof of funds €600/month (€7,200/year). Accommodation proof required. Apply at Italian consulate — known for long wait times, book appointment months ahead. Processing: 4–12 weeks. Permesso di soggiorno (residence permit) must be applied for within 8 days of arrival. Allows 20 hours/week work. After graduation: 12-month 'attesa occupazione' permit. Tuition at public universities is income-based (ISEE) — can be as low as €156/year. Rich culture, affordable lifestyle.",
    visaAcceptanceRate: 90,
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
    pros: [
      "Income-based tuition (as low as €156/year)",
      "Rich cultural experience",
      "Affordable living (especially small cities)",
      "12-month job search after graduation",
      "Warm climate, Mediterranean lifestyle"
    ],
    cons: [
      "Visa appointment wait: months",
      "Permesso di soggiorno bureaucracy",
      "Weaker job market than Northern Europe",
      "Italian needed for most jobs",
      "Public transport strikes common"
    ],
  },
  {
    name: "Spain",
    currency: "EUR",
    livingCostEstimate: 700,
    visaRequirements:
      "Student visa (Type D). Proof of funds €600/month (€7,200/year). Medical certificate and criminal record check required. Initial 90-day visa, then apply for TIE (foreigner identity card) within 30 days of arrival. Processing: 4–8 weeks. Allows 30 hours/week work. After graduation: 1-year job search permit. Affordable cost of living, especially outside Madrid/Barcelona. Warm climate. Second most popular Erasmus destination.",
    visaAcceptanceRate: 91,
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
    pros: [
      "30h/week work allowed during studies",
      "1-year job search after graduation",
      "Affordable (€700/month average)",
      "Warm climate, beaches, vibrant culture",
      "2nd most popular Erasmus destination"
    ],
    cons: [
      "Proof of €7,200/year required",
      "TIE ID card bureaucracy (within 30 days)",
      "Higher unemployment vs EU average",
      "Spanish needed for most jobs",
      "Slow administrative processes"
    ],
  },
  {
    name: "Portugal",
    currency: "EUR",
    livingCostEstimate: 650,
    visaRequirements:
      "Student visa (Type D). Proof of funds ~€600/month (€7,200/year). Apply at Portuguese consulate with admission letter, proof of accommodation, and bank statements. SEF (immigration) appointment required within 3 months of arrival. Processing: 4–8 weeks. Allows 20 hours/week work during studies, full-time during breaks. After graduation: 1-year job search visa. One of the most affordable Western European countries. Fast-growing tech hub in Lisbon (Web Summit host). Warm climate, high safety index.",
    visaAcceptanceRate: 92,
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
    pros: [
      "Most affordable Western EU country",
      "1-year job search visa after graduation",
      "Fast-growing tech hub (Lisbon/Web Summit)",
      "Warm climate, safe, friendly",
      "English widely spoken in tech/tourism"
    ],
    cons: [
      "Lower salaries vs Northern/Central Europe",
      "Proof of €7,200/year required",
      "SEF immigration appointment waits",
      "Less developed public transport",
      "Portuguese helps for better prospects"
    ],
  },
  {
    name: "Czech Republic",
    currency: "EUR",
    livingCostEstimate: 550,
    visaRequirements:
      "Long-term residence permit for studies. Proof of funds ~€3,400/year (CZK 81,400). Criminal record extract from home country required. Purpose-built accommodation proof helps application. Processing: 60–90 days at Czech embassy, then visit Ministry of Interior in person within 3 days of arrival. Allows 20 hours/week work. After graduation: 9-month job search. Very affordable. Strong engineering and IT programs. EU member, Schengen area.",
    visaAcceptanceRate: 94,
    visaBankAccountAmount: 3400,
    visaBankAccountLocked: false,
    pros: [
      "Extremely affordable (~€550/month)",
      "Low proof of funds (~€3,400/year)",
      "9-month job search after graduation",
      "Prague — beautiful, strong IT sector",
      "Central European travel hub"
    ],
    cons: [
      "Czech needed outside Prague",
      "Limited English-taught programs",
      "Bureaucratic visa (multiple office visits)",
      "Lower post-grad salaries vs West",
      "Winter air pollution (coal heating)"
    ],
  },
  {
    name: "Poland",
    currency: "EUR",
    livingCostEstimate: 450,
    visaRequirements:
      "National D visa for studies. Proof of funds ~€2,800/year (PLN 12,000). Apply at Polish consulate with admission letter and proof of funds. Processing: 2–4 weeks — one of the fastest in EU. Temporary residence permit required after first year. Allows 20 hours/week work during studies. After graduation: stay under regular work permit rules. Lowest cost of living in EU among developed economies. Growing tech sector. EU member, Schengen area.",
    visaAcceptanceRate: 93,
    visaBankAccountAmount: 2800,
    visaBankAccountLocked: false,
    pros: [
      "Lowest EU cost of living (~€450/month)",
      "Low proof of funds (~€2,800/year)",
      "Fastest visa processing (2–4 weeks)",
      "Growing IT hub (Warsaw, Krakow, Wroclaw)",
      "English common in cities and tech"
    ],
    cons: [
      "Polish language difficult to learn",
      "Lower salaries vs Western Europe",
      "Temporary permit renewal after 1st year",
      "Conservative political climate",
      "Winter air quality in some cities"
    ],
  },
]

const cities = [
  {
    name: "Munich", country: "Germany", population: 1472000, isCapital: false,
    averageRentSingle: 950, averageRentShared: 550, monthlyLivingCost: 1100,
    qualityOfLifeScore: 9, safetyScore: 9, publicTransportScore: 9, studentFriendliness: 8,
    internetSpeed: 120, language: "German", englishFriendliness: 7,
    climate: "Continental, cold winters, warm summers",
    pros: ["Excellent public transport (MVV)", "Beautiful parks and beer gardens", "Strong job market in tech and automotive", "Close to Alps for skiing/hiking", "Very safe city"],
    cons: ["Most expensive city in Germany for rent", "Finding apartments is extremely competitive", "Can feel conservative compared to Berlin", "Bureaucracy in German only"],
  },
  {
    name: "Berlin", country: "Germany", population: 3645000, isCapital: true,
    averageRentSingle: 750, averageRentShared: 450, monthlyLivingCost: 950,
    qualityOfLifeScore: 8, safetyScore: 7, publicTransportScore: 9, studentFriendliness: 9,
    internetSpeed: 100, language: "German", englishFriendliness: 8,
    climate: "Continental, cold winters, mild summers",
    pros: ["Affordable for a capital city", "Massive startup and tech scene", "Very international and English-friendly", "Vibrant nightlife and culture", "Public transport ticket included in semester fee"],
    cons: ["Housing market getting tighter", "Winter is grey and cold", "Some areas feel rough", "Bureaucracy is slow"],
  },
  {
    name: "Aachen", country: "Germany", population: 249000, isCapital: false,
    averageRentSingle: 550, averageRentShared: 350, monthlyLivingCost: 800,
    qualityOfLifeScore: 7, safetyScore: 8, publicTransportScore: 7, studentFriendliness: 9,
    internetSpeed: 90, language: "German", englishFriendliness: 6,
    climate: "Oceanic, mild winters, cool summers, rainy",
    pros: ["Very affordable student city", "Strong engineering community", "Close to Belgium and Netherlands borders", "Compact walkable city center", "Large student population relative to city size"],
    cons: ["Small city — limited nightlife", "Rainy weather year-round", "Limited English outside university", "Fewer job opportunities than larger cities"],
  },
  {
    name: "Delft", country: "Netherlands", population: 103000, isCapital: false,
    averageRentSingle: 850, averageRentShared: 500, monthlyLivingCost: 1000,
    qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 8, studentFriendliness: 9,
    internetSpeed: 150, language: "Dutch", englishFriendliness: 9,
    climate: "Maritime, mild winters, cool summers",
    pros: ["Charming historic canal city", "Everyone speaks English", "Great cycling infrastructure", "Close to The Hague and Rotterdam", "Strong tech community around TU Delft"],
    cons: ["Student housing shortage", "Small city with limited nightlife", "Expensive for its size", "Rainy and windy weather"],
  },
  {
    name: "Amsterdam", country: "Netherlands", population: 873000, isCapital: true,
    averageRentSingle: 1200, averageRentShared: 700, monthlyLivingCost: 1300,
    qualityOfLifeScore: 9, safetyScore: 8, publicTransportScore: 9, studentFriendliness: 8,
    internetSpeed: 200, language: "Dutch", englishFriendliness: 10,
    climate: "Maritime, mild year-round, windy",
    pros: ["Most English-friendly city in non-English Europe", "World-class cultural scene", "Excellent cycling and public transport", "Major tech hub (Booking.com, Adyen)", "Diverse and tolerant culture"],
    cons: ["Very expensive housing", "Extremely competitive rental market", "Tourist overcrowding in center", "Flat and grey weather"],
  },
  {
    name: "Zurich", country: "Switzerland", population: 421000, isCapital: false,
    averageRentSingle: 1800, averageRentShared: 1000, monthlyLivingCost: 1700,
    qualityOfLifeScore: 10, safetyScore: 10, publicTransportScore: 10, studentFriendliness: 7,
    internetSpeed: 200, language: "German", englishFriendliness: 8,
    climate: "Continental, cold winters, warm summers, lake effect",
    pros: ["Highest quality of life globally", "Stunning lake and mountain scenery", "Excellent public transport", "Very high salaries after graduation", "Extremely safe"],
    cons: ["Most expensive city in Europe", "Social life can feel reserved/closed", "Limited work hours for students (15h/week after 6 months)", "Small city for its cost level"],
  },
  {
    name: "Stockholm", country: "Sweden", population: 975000, isCapital: true,
    averageRentSingle: 900, averageRentShared: 550, monthlyLivingCost: 950,
    qualityOfLifeScore: 9, safetyScore: 8, publicTransportScore: 9, studentFriendliness: 8,
    internetSpeed: 180, language: "Swedish", englishFriendliness: 9,
    climate: "Continental, very cold dark winters, mild bright summers",
    pros: ["Beautiful archipelago city", "Strong tech ecosystem (Spotify, Klarna)", "Unlimited work hours for students", "High English proficiency", "Great work-life balance culture"],
    cons: ["Dark winters (6h daylight in December)", "Severe housing shortage", "High cost of living", "Can feel socially reserved"],
  },
  {
    name: "Copenhagen", country: "Denmark", population: 794000, isCapital: true,
    averageRentSingle: 1000, averageRentShared: 600, monthlyLivingCost: 1100,
    qualityOfLifeScore: 9, safetyScore: 9, publicTransportScore: 9, studentFriendliness: 8,
    internetSpeed: 170, language: "Danish", englishFriendliness: 9,
    climate: "Maritime, mild winters, cool summers, windy",
    pros: ["World's best cycling infrastructure", "Excellent work-life balance", "Very English-friendly", "Clean and sustainable city", "2-year Establishment Card after graduation"],
    cons: ["Very expensive cost of living", "Tough housing market", "Dark winters", "Danish is hard to learn", "High taxes"],
  },
  {
    name: "Paris", country: "France", population: 2161000, isCapital: true,
    averageRentSingle: 1100, averageRentShared: 650, monthlyLivingCost: 1200,
    qualityOfLifeScore: 8, safetyScore: 7, publicTransportScore: 9, studentFriendliness: 8,
    internetSpeed: 150, language: "French", englishFriendliness: 5,
    climate: "Oceanic, mild winters, warm summers",
    pros: ["World-class culture, food, and architecture", "Excellent Metro system", "Many prestigious universities", "Central European travel hub", "Rich student life and social scene"],
    cons: ["Expensive housing especially in center", "French strongly expected in daily life", "Bureaucracy is legendary", "Some areas feel unsafe at night", "Crowded and noisy"],
  },
  {
    name: "Milan", country: "Italy", population: 1352000, isCapital: false,
    averageRentSingle: 850, averageRentShared: 500, monthlyLivingCost: 900,
    qualityOfLifeScore: 7, safetyScore: 7, publicTransportScore: 7, studentFriendliness: 7,
    internetSpeed: 100, language: "Italian", englishFriendliness: 5,
    climate: "Humid subtropical, foggy winters, hot summers",
    pros: ["Fashion and design capital", "Strong economy — best job market in Italy", "Good international flight connections", "Income-based tuition at public universities", "Close to lakes and Alps"],
    cons: ["Expensive by Italian standards", "Air pollution and fog in winter", "Italian needed for most daily interactions", "Public transport strikes", "Hot and humid summers"],
  },
  {
    name: "Bologna", country: "Italy", population: 394000, isCapital: false,
    averageRentSingle: 600, averageRentShared: 350, monthlyLivingCost: 700,
    qualityOfLifeScore: 8, safetyScore: 8, publicTransportScore: 7, studentFriendliness: 9,
    internetSpeed: 80, language: "Italian", englishFriendliness: 4,
    climate: "Humid subtropical, cold foggy winters, hot summers",
    pros: ["Very student-friendly (oldest university in Western world)", "Excellent food scene (food capital of Italy)", "Affordable by Western European standards", "Compact and walkable", "Vibrant nightlife for students"],
    cons: ["Italian essential for daily life", "Hot and humid summers", "Foggy winters", "Limited English-speaking community", "Smaller job market"],
  },
  {
    name: "Barcelona", country: "Spain", population: 1621000, isCapital: false,
    averageRentSingle: 800, averageRentShared: 450, monthlyLivingCost: 850,
    qualityOfLifeScore: 9, safetyScore: 7, publicTransportScore: 8, studentFriendliness: 9,
    internetSpeed: 120, language: "Spanish/Catalan", englishFriendliness: 6,
    climate: "Mediterranean, mild winters, hot summers, sunny",
    pros: ["Excellent weather and beaches", "Vibrant culture and nightlife", "Growing tech scene", "Affordable compared to Northern Europe", "30h/week work allowed"],
    cons: ["Pickpocketing and petty crime", "Tourist overcrowding", "Spanish/Catalan needed for most jobs", "Summer heat waves", "Housing prices rising fast"],
  },
  {
    name: "Lisbon", country: "Portugal", population: 545000, isCapital: true,
    averageRentSingle: 700, averageRentShared: 400, monthlyLivingCost: 750,
    qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 7, studentFriendliness: 8,
    internetSpeed: 110, language: "Portuguese", englishFriendliness: 7,
    climate: "Mediterranean, mild winters, hot dry summers, sunny",
    pros: ["Affordable Western European capital", "Growing tech hub (Web Summit host)", "Excellent weather year-round", "Very safe", "Friendly and welcoming people"],
    cons: ["Salaries are low compared to cost", "Housing prices rising rapidly", "Hilly — tough on foot", "Portuguese helps for better prospects", "Public transport could be better"],
  },
  {
    name: "Prague", country: "Czech Republic", population: 1309000, isCapital: true,
    averageRentSingle: 550, averageRentShared: 320, monthlyLivingCost: 600,
    qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 9, studentFriendliness: 9,
    internetSpeed: 100, language: "Czech", englishFriendliness: 7,
    climate: "Continental, cold winters, warm summers",
    pros: ["Extremely affordable for students", "Beautiful historic city", "Excellent public transport", "Central European location", "Strong and growing IT sector"],
    cons: ["Czech language barrier outside center", "Tourism crowds in old town", "Air pollution in winter", "Bureaucratic visa processes", "Lower salaries than Western Europe"],
  },
  {
    name: "Warsaw", country: "Poland", population: 1794000, isCapital: true,
    averageRentSingle: 500, averageRentShared: 300, monthlyLivingCost: 550,
    qualityOfLifeScore: 7, safetyScore: 8, publicTransportScore: 8, studentFriendliness: 8,
    internetSpeed: 130, language: "Polish", englishFriendliness: 7,
    climate: "Continental, cold winters, warm summers",
    pros: ["Lowest cost of living among EU capitals", "Fastest-growing tech hub in CEE", "Modern city with lots of development", "Good English in tech/business", "Fast visa processing"],
    cons: ["Polish is difficult to learn", "Cold grey winters", "Less charming than Krakow/Prague", "Air quality issues in winter", "Conservative political climate"],
  },
  {
    name: "Oslo", country: "Norway", population: 697000, isCapital: true,
    averageRentSingle: 1100, averageRentShared: 650, monthlyLivingCost: 1300,
    qualityOfLifeScore: 9, safetyScore: 9, publicTransportScore: 8, studentFriendliness: 7,
    internetSpeed: 160, language: "Norwegian", englishFriendliness: 9,
    climate: "Continental/subarctic, cold dark winters, mild bright summers",
    pros: ["Free tuition for all nationalities", "Stunning nature nearby (fjords, forests)", "High English proficiency", "Very safe and clean", "Excellent outdoor lifestyle"],
    cons: ["Extremely expensive cost of living", "Dark winters (6h daylight December)", "Limited English-taught Master's options", "Small and quiet city", "Difficult to find part-time work"],
  },
  {
    name: "Espoo", country: "Finland", population: 292000, isCapital: false,
    averageRentSingle: 750, averageRentShared: 450, monthlyLivingCost: 850,
    qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 8, studentFriendliness: 9,
    internetSpeed: 150, language: "Finnish", englishFriendliness: 8,
    climate: "Subarctic/continental, very cold dark winters, mild bright summers",
    pros: ["Aalto University campus is excellent", "Safe and clean environment", "Good public transport to Helsinki", "2-year post-study permit", "Growing startup ecosystem"],
    cons: ["Very cold and dark winters", "Finnish is extremely difficult", "Small city — limited nightlife", "Remote location in Europe", "Limited job market outside tech"],
  },
  {
    name: "Vienna", country: "Austria", population: 1912000, isCapital: true,
    averageRentSingle: 700, averageRentShared: 420, monthlyLivingCost: 900,
    qualityOfLifeScore: 10, safetyScore: 9, publicTransportScore: 10, studentFriendliness: 9,
    internetSpeed: 120, language: "German", englishFriendliness: 7,
    climate: "Continental, cold winters, warm summers",
    pros: ["#1 most livable city in the world", "Excellent and cheap public transport (365€/year)", "Rich cultural scene (opera, museums)", "Affordable for Western European capital", "Central location for European travel"],
    cons: ["Austrian German differs from standard German", "Can feel formal/reserved socially", "Smaller job market than Germany", "Bureaucracy in German only", "Some areas outside center are dull"],
  },
  {
    name: "Leuven", country: "Belgium", population: 101000, isCapital: false,
    averageRentSingle: 650, averageRentShared: 400, monthlyLivingCost: 850,
    qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 7, studentFriendliness: 10,
    internetSpeed: 120, language: "Dutch", englishFriendliness: 8,
    climate: "Maritime, mild winters, cool summers, rainy",
    pros: ["Ultimate student city — 1 in 3 residents is a student", "KU Leuven campus integrated into city", "Very safe and compact", "Close to Brussels (25 min train)", "Affordable for Belgium"],
    cons: ["Very small — can feel limiting", "Rainy grey weather", "Quiet during summer/holidays", "Dutch language barrier", "Limited job market locally"],
  },
  {
    name: "Dublin", country: "Ireland", population: 1228000, isCapital: true,
    averageRentSingle: 1400, averageRentShared: 800, monthlyLivingCost: 1300,
    qualityOfLifeScore: 8, safetyScore: 7, publicTransportScore: 6, studentFriendliness: 7,
    internetSpeed: 130, language: "English", englishFriendliness: 10,
    climate: "Maritime, mild wet winters, cool summers, rainy",
    pros: ["Native English-speaking — no language barrier", "European HQ of Google, Meta, Apple, Stripe", "Friendly welcoming culture", "2-year graduate visa", "Strong tech job market"],
    cons: ["Severe housing crisis — highest rents in EU", "Expensive cost of living overall", "Poor public transport", "Rainy weather year-round", "GNIB registration fee (€300)"],
  },
]

const universities = [
  {
    name: "Technical University of Munich",
    country: "Germany",
    city: "Munich",
    ranking: 28,
    program: "MSc Computer Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 240,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Semester",
    livingCostEstimate: 1100,
    applicationDeadline: new Date("2026-05-31"),
    applicationStatus: "Accepted",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Bachelor's degree",
      "Statement of purpose",
      "Letters of recommendation",
    ],
    gpaRequirement: 2.5,
    ieltsRequirement: 6.5,
    scholarshipAvailable: false,
    websiteUrl: "https://www.tum.de",
    notes:
      "No tuition for EU students, only semester contribution. Strong research focus.",
  },
  {
    name: "Delft University of Technology",
    country: "Netherlands",
    city: "Delft",
    ranking: 48,
    program: "MSc Robotics",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 21500,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 1000,
    applicationDeadline: new Date("2026-04-01"),
    applicationStatus: "Applied",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Reference letters",
      "BSc thesis summary",
    ],
    gpaRequirement: 3.0,
    ieltsRequirement: 7.0,
    scholarshipAvailable: true,
    scholarshipDetails:
      "Holland Scholarship (€5,000 one-time), TU Delft Excellence Scholarship",
    websiteUrl: "https://www.tudelft.nl",
    notes:
      "Highly competitive program. Requires specific course credits in control systems and mathematics.",
  },
  {
    name: "ETH Zurich",
    country: "Switzerland",
    city: "Zurich",
    ranking: 7,
    program: "MSc Data Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 1460,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 1600,
    applicationDeadline: new Date("2025-12-15"),
    applicationStatus: "Rejected",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Reference letters",
      "BSc diploma",
    ],
    gpaRequirement: 3.5,
    ieltsRequirement: 7.0,
    scholarshipAvailable: true,
    scholarshipDetails: "ETH-D Scholarship, ESOP",
    websiteUrl: "https://www.ethz.ch",
    notes: "Rejected — extremely competitive. Requires top 10% class ranking.",
  },
  {
    name: "KTH Royal Institute of Technology",
    country: "Sweden",
    city: "Stockholm",
    ranking: 73,
    program: "MSc Machine Learning",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 27000,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 860,
    applicationDeadline: new Date("2026-01-15"),
    applicationStatus: "Applied",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Letters of recommendation",
    ],
    gpaRequirement: 3.0,
    ieltsRequirement: 6.5,
    scholarshipAvailable: true,
    scholarshipDetails:
      "KTH Scholarship (covers tuition), Swedish Institute Scholarship",
    websiteUrl: "https://www.kth.se",
    notes:
      "Scholarship deadline earlier than admission deadline. Strong industry connections in Stockholm.",
  },
  {
    name: "University of Amsterdam",
    country: "Netherlands",
    city: "Amsterdam",
    ranking: 53,
    program: "MSc Artificial Intelligence",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 17700,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 1200,
    applicationDeadline: new Date("2026-03-01"),
    applicationStatus: "Preparing",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Writing sample",
    ],
    ieltsRequirement: 7.0,
    scholarshipAvailable: true,
    scholarshipDetails: "Amsterdam Merit Scholarship, Holland Scholarship",
    websiteUrl: "https://www.uva.nl",
    notes:
      "Two-year program. First year coursework, second year thesis + internship.",
  },
  {
    name: "Politecnico di Milano",
    country: "Italy",
    city: "Milan",
    ranking: 111,
    program: "MSc Computer Science & Engineering",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 3900,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 800,
    applicationDeadline: new Date("2026-05-31"),
    applicationStatus: "Wishlist",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Reference letters",
    ],
    gpaRequirement: 2.8,
    ieltsRequirement: 6.0,
    scholarshipAvailable: true,
    scholarshipDetails: "Merit-based tuition reduction, DSU regional scholarship",
    websiteUrl: "https://www.polimi.it",
    notes:
      "Income-based tuition — can be reduced significantly. Milan is expensive but great lifestyle.",
  },
  {
    name: "University of Copenhagen",
    country: "Denmark",
    city: "Copenhagen",
    ranking: 79,
    program: "MSc Computer Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 16800,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 1100,
    applicationDeadline: new Date("2026-01-15"),
    applicationStatus: "Wishlist",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Statement of purpose",
      "Course descriptions",
    ],
    gpaRequirement: 3.0,
    ieltsRequirement: 6.5,
    scholarshipAvailable: false,
    websiteUrl: "https://www.ku.dk",
    notes:
      "Free for EU/EEA students. Non-EU tuition is steep. Copenhagen consistently ranked most livable city.",
  },
  {
    name: "TU Berlin",
    country: "Germany",
    city: "Berlin",
    ranking: 147,
    program: "MSc Scientific Computing",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 310,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Semester",
    livingCostEstimate: 950,
    applicationDeadline: new Date("2026-06-15"),
    applicationStatus: "Wishlist",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "BSc certificate",
    ],
    ieltsRequirement: 6.0,
    scholarshipAvailable: false,
    websiteUrl: "https://www.tu.berlin",
    notes:
      "No tuition fees in Berlin, only semester contribution including public transport ticket. Strong startup scene.",
  },
  {
    name: "Aalto University",
    country: "Finland",
    city: "Espoo",
    ranking: 109,
    program: "MSc Human-Computer Interaction",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 15000,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 850,
    applicationDeadline: new Date("2026-01-02"),
    applicationStatus: "Preparing",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Portfolio recommended",
    ],
    gpaRequirement: 3.2,
    ieltsRequirement: 6.5,
    scholarshipAvailable: true,
    scholarshipDetails:
      "Aalto Excellence Scholarship (full or partial tuition waiver)",
    websiteUrl: "https://www.aalto.fi",
    notes:
      "Strong design focus. Portfolio is highly recommended even though not mandatory. Early deadline.",
  },
  {
    name: "Sorbonne University",
    country: "France",
    city: "Paris",
    ranking: 41,
    program: "MSc Computer Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 3770,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 1100,
    applicationDeadline: new Date("2026-05-15"),
    applicationStatus: "Wishlist",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Cover letter",
      "Reference letters",
    ],
    ieltsRequirement: 6.0,
    scholarshipAvailable: true,
    scholarshipDetails: "Eiffel Excellence Scholarship, Erasmus+",
    websiteUrl: "https://www.sorbonne-universite.fr",
    notes:
      "Public university with low tuition. Living in Paris is the main cost factor.",
  },
  {
    name: "University of Warsaw",
    country: "Poland",
    city: "Warsaw",
    ranking: 262,
    program: "BSc Computer Science",
    degreeLevel: "Bachelor",
    languageOfInstruction: "English",
    tuitionFee: 3500,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 500,
    applicationDeadline: new Date("2026-07-15"),
    applicationStatus: "Wishlist",
    requiredDocuments: [
      "High school diploma",
      "Transcripts",
      "English proficiency proof",
    ],
    ieltsRequirement: 6.0,
    scholarshipAvailable: false,
    websiteUrl: "https://www.uw.edu.pl",
    notes:
      "Very affordable cost of living. Warsaw is a growing tech hub in Eastern Europe.",
  },
  {
    name: "KU Leuven",
    country: "Belgium",
    city: "Leuven",
    ranking: 63,
    program: "MSc Computer Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 7000,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 850,
    applicationDeadline: new Date("2026-06-01"),
    applicationStatus: "Preparing",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Course descriptions",
    ],
    gpaRequirement: 3.0,
    ieltsRequirement: 6.5,
    scholarshipAvailable: true,
    scholarshipDetails: "VLIR-UOS Scholarship, Master Mind Scholarship",
    websiteUrl: "https://www.kuleuven.be",
    notes:
      "Belgium's highest-ranked university. Strong in AI and security research.",
  },
  {
    name: "University of Barcelona",
    country: "Spain",
    city: "Barcelona",
    ranking: 149,
    program: "MSc Data Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 5700,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 750,
    applicationDeadline: new Date("2026-06-30"),
    applicationStatus: "Wishlist",
    requiredDocuments: ["CV", "Transcripts", "Motivation letter"],
    ieltsRequirement: 6.0,
    scholarshipAvailable: false,
    websiteUrl: "https://www.ub.edu",
    notes:
      "Great value for the cost. Barcelona has a growing tech scene and great weather.",
  },
  {
    name: "RWTH Aachen University",
    country: "Germany",
    city: "Aachen",
    ranking: 99,
    program: "MSc Software Systems Engineering",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 310,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Semester",
    livingCostEstimate: 800,
    applicationDeadline: new Date("2026-03-01"),
    applicationStatus: "Accepted",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "GRE recommended",
      "Statement of purpose",
      "Letters of recommendation",
    ],
    gpaRequirement: 2.5,
    ieltsRequirement: 6.5,
    toeflRequirement: 90,
    scholarshipAvailable: false,
    websiteUrl: "https://www.rwth-aachen.de",
    notes:
      "No tuition, only semester fee. Very strong in engineering. Aachen is cheaper than Munich or Berlin.",
  },
  {
    name: "University of Oslo",
    country: "Norway",
    city: "Oslo",
    ranking: 117,
    program: "MSc Informatics: Language Technology",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 0,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 1200,
    applicationDeadline: new Date("2025-12-01"),
    applicationStatus: "Rejected",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Reference letters",
    ],
    gpaRequirement: 3.0,
    ieltsRequirement: 6.5,
    scholarshipAvailable: false,
    websiteUrl: "https://www.uio.no",
    notes:
      "Free tuition for all students regardless of nationality. Norway is expensive to live in. Rejected due to limited spots.",
  },
  {
    name: "University of Bologna",
    country: "Italy",
    city: "Bologna",
    ranking: 133,
    program: "MSc Digital Humanities & Digital Knowledge",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 3300,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 700,
    applicationDeadline: new Date("2026-07-15"),
    applicationStatus: "Wishlist",
    requiredDocuments: ["CV", "Transcripts", "Cover letter", "Writing sample"],
    ieltsRequirement: 6.0,
    scholarshipAvailable: true,
    scholarshipDetails: "Unibo Action 1&2 (tuition waiver + grant), Erasmus+",
    websiteUrl: "https://www.unibo.it",
    notes:
      "Oldest university in the Western world. Bologna is very student-friendly and affordable.",
  },
  {
    name: "Charles University",
    country: "Czech Republic",
    city: "Prague",
    ranking: 246,
    program: "BSc Computer Science",
    degreeLevel: "Bachelor",
    languageOfInstruction: "English",
    tuitionFee: 7600,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 550,
    applicationDeadline: new Date("2026-06-30"),
    applicationStatus: "Enrolled",
    requiredDocuments: [
      "High school diploma",
      "Transcripts",
      "English proficiency proof",
      "Entrance exam",
    ],
    ieltsRequirement: 6.0,
    scholarshipAvailable: false,
    websiteUrl: "https://www.cuni.cz",
    notes:
      "Enrolled for fall 2026. Prague is beautiful and very affordable. Strong CS program.",
  },
  {
    name: "University of Lisbon",
    country: "Portugal",
    city: "Lisbon",
    ranking: 187,
    program: "MSc Data Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 7000,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 650,
    applicationDeadline: new Date("2026-06-15"),
    applicationStatus: "Wishlist",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Motivation letter",
      "Reference letters",
    ],
    ieltsRequirement: 6.5,
    scholarshipAvailable: false,
    websiteUrl: "https://www.ulisboa.pt",
    notes:
      "Growing tech hub — Web Summit host city. Affordable compared to Western Europe. Great weather and lifestyle.",
  },
  {
    name: "University of Vienna",
    country: "Austria",
    city: "Vienna",
    ranking: 137,
    program: "MSc Computer Science",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 750,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Semester",
    livingCostEstimate: 900,
    applicationDeadline: new Date("2026-06-05"),
    applicationStatus: "Wishlist",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "BSc diploma",
      "Course descriptions",
    ],
    ieltsRequirement: 6.5,
    scholarshipAvailable: false,
    websiteUrl: "https://www.univie.ac.at",
    notes:
      "Very affordable for EU students. Vienna consistently ranked world's most livable city.",
  },
  {
    name: "Trinity College Dublin",
    country: "Ireland",
    city: "Dublin",
    ranking: 87,
    program: "MSc Computer Science — Intelligent Systems",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 25600,
    tuitionCurrency: "EUR",
    tuitionPeriod: "Year",
    livingCostEstimate: 1200,
    applicationDeadline: new Date("2026-06-30"),
    applicationStatus: "Applied",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Personal statement",
      "References",
    ],
    gpaRequirement: 3.0,
    ieltsRequirement: 6.5,
    scholarshipAvailable: true,
    scholarshipDetails:
      "Trinity International Scholarship, Government of Ireland Scholarship",
    websiteUrl: "https://www.tcd.ie",
    notes:
      "Ireland's top university. Dublin has a strong tech sector (Google, Facebook, Stripe HQs).",
  },
]

export async function seedIfEmpty(): Promise<number> {
  const count = await University.countDocuments()
  if (count > 0) {
    console.log(`Skipping seed — ${count} universities already exist`)
    return 0
  }

  const countryResult = await Country.insertMany(countries)
  console.log(`Seeded ${countryResult.length} countries`)

  const cityResult = await City.insertMany(cities)
  console.log(`Seeded ${cityResult.length} cities`)

  const uniResult = await University.insertMany(universities)
  console.log(`Seeded ${uniResult.length} universities`)

  await seedProgress()

  return uniResult.length
}

export async function seedProgress(): Promise<void> {
  // Preparing: documents started, tests in progress, recommendations requested
  await University.updateMany(
    { applicationStatus: "Preparing" },
    {
      applicationProgress: {
        documentsObtained: ["CV", "Transcripts"],
        ieltsTaken: false,
        gpaVerified: true,
        recommendationsRequested: 2,
        recommendationsReceived: 1,
        sopStatus: "draft",
        applicationFeePaid: false,
        visaApplied: false,
        interviewCompleted: false,
      },
    }
  )

  // Applied: everything ready, submitted
  const january = new Date("2026-01-20")
  const march = new Date("2026-03-15")
  const june = new Date("2026-06-10")
  const now = new Date()
  const appliedDates = [january, march, june, now]

  const applied = await University.find({ applicationStatus: "Applied" })
  for (let i = 0; i < applied.length; i++) {
    const uni = applied[i]!
    const requiredDocs = uni.requiredDocuments ?? []
    await University.findByIdAndUpdate(uni._id, {
      applicationProgress: {
        documentsObtained: requiredDocs,
        ieltsTaken: true,
        ieltsScore: 7.5,
        toeflTaken: uni.toeflRequirement ? true : false,
        toeflScore: uni.toeflRequirement ? 100 : undefined,
        gpaVerified: true,
        recommendationsRequested: 2,
        recommendationsReceived: 2,
        sopStatus: "final",
        applicationFeePaid: true,
        applicationSubmittedDate: appliedDates[i] ?? now,
        visaApplied: false,
        interviewCompleted: false,
      },
    })
  }

  // Accepted: all docs, tests, fee paid, interview done, visa applied
  await University.updateMany(
    { applicationStatus: "Accepted" },
    {
      applicationProgress: {
        documentsObtained: [
          "CV",
          "Transcripts",
          "Bachelor's degree",
          "Statement of purpose",
          "Letters of recommendation",
        ],
        ieltsTaken: true,
        ieltsScore: 7.5,
        gpaVerified: true,
        recommendationsRequested: 2,
        recommendationsReceived: 2,
        sopStatus: "final",
        applicationFeePaid: true,
        applicationSubmittedDate: new Date("2026-02-01"),
        visaApplied: true,
        interviewCompleted: true,
        interviewScheduled: new Date("2026-03-10"),
      },
    }
  )

  // Rejected: all docs, submitted but rejected
  await University.updateMany(
    { applicationStatus: "Rejected" },
    {
      applicationProgress: {
        documentsObtained: [
          "CV",
          "Transcripts",
          "Motivation letter",
          "Reference letters",
          "BSc diploma",
        ],
        ieltsTaken: true,
        ieltsScore: 7.0,
        gpaVerified: true,
        recommendationsRequested: 2,
        recommendationsReceived: 2,
        sopStatus: "final",
        applicationFeePaid: true,
        applicationSubmittedDate: new Date("2025-10-15"),
        visaApplied: false,
        interviewCompleted: false,
      },
    }
  )

  // Enrolled: everything complete, visa approved
  await University.updateMany(
    { applicationStatus: "Enrolled" },
    {
      applicationProgress: {
        documentsObtained: [
          "High school diploma",
          "Transcripts",
          "English proficiency proof",
          "Entrance exam",
        ],
        ieltsTaken: true,
        ieltsScore: 6.5,
        gpaVerified: true,
        recommendationsRequested: 2,
        recommendationsReceived: 2,
        sopStatus: "final",
        applicationFeePaid: true,
        applicationSubmittedDate: new Date("2026-01-10"),
        visaApplied: true,
        visaApproved: true,
        interviewCompleted: true,
        interviewScheduled: new Date("2026-04-15"),
      },
    }
  )

  console.log("Seeded application progress data")
}

// Standalone runner: npx tsx src/seed.ts
async function run(): Promise<void> {
  const mongoose = await import("mongoose")
  const { MongoMemoryServer } = await import("mongodb-memory-server")

  const MONGODB_URI =
    process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/wannaout"

  try {
    await mongoose.connect(MONGODB_URI)
    console.log(`Connected to ${MONGODB_URI}`)
  } catch {
    console.log("Local MongoDB not available, starting in-memory server...")
    const memServer = await MongoMemoryServer.create()
    await mongoose.connect(memServer.getUri())
    console.log(`Connected to in-memory MongoDB at ${memServer.getUri()}`)
  }

  await Country.deleteMany({})
  await City.deleteMany({})
  await University.deleteMany({})
  console.log("Cleared existing data")

  await Country.insertMany(countries)
  console.log(`Inserted ${countries.length} countries`)

  await City.insertMany(cities)
  console.log(`Inserted ${cities.length} cities`)

  await University.insertMany(universities)
  console.log(`Inserted ${universities.length} universities`)

  await seedProgress()
  console.log("Progress data seeded")

  await mongoose.disconnect()
  console.log("Done.")
  process.exit(0)
}

// Only run standalone if this is the entry point
if (require.main === module) {
  run()
}
