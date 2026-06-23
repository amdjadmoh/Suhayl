import { Country } from "./models/Country"
import { University } from "./models/University"

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
  },
  {
    name: "Sweden",
    currency: "SEK",
    livingCostEstimate: 860,
    visaRequirements:
      "Residence permit for studies. Proof of funds SEK 10,314/month for 2025 (adjusted annually). Must show funds for entire study period upfront. Apply online via Migration Agency (Migrationsverket), biometrics at embassy. Processing: 2–4 months — apply early. Allows unlimited work hours alongside studies. After graduation: 12-month job search permit. No blocked account — bank statement or scholarship letter accepted.",
    visaAcceptanceRate: 85,
    visaBankAccountAmount: 123768,
    visaBankAccountLocked: false,
  },
  {
    name: "Denmark",
    currency: "DKK",
    livingCostEstimate: 1100,
    visaRequirements:
      "Student residence permit (ST1). Proof of funds DKK 6,397/month (~DKK 76,764/year). Online application via SIRI portal, biometrics at Danish embassy or in Denmark. Processing: 2–3 months. Allows 20 hours/week work (full-time June–August). After graduation: 2-year Establishment Card to seek work. Tuition-free for EU/EEA; non-EU pay DKK 50,000–130,000/year. No blocked account required.",
    visaAcceptanceRate: 82,
    visaBankAccountAmount: 76764,
    visaBankAccountLocked: false,
  },
  {
    name: "Norway",
    currency: "NOK",
    livingCostEstimate: 1200,
    visaRequirements:
      "Student residence permit. Proof of funds NOK 137,907/year (2025 rate) — must be deposited into an UDI account or shown as bank statement + guaranteed income. Tuition-free for all nationalities at public universities. Allows 20 hours/week work. Processing: 2–8 weeks. After graduation: 1-year job search visa. Note: Norway is not EU but participates in Erasmus+ and Schengen. High cost of living but no tuition fees.",
    visaAcceptanceRate: 84,
    visaBankAccountAmount: 137907,
    visaBankAccountLocked: true,
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
  },
  {
    name: "Switzerland",
    currency: "CHF",
    livingCostEstimate: 1600,
    visaRequirements:
      "National D visa for studies. Proof of CHF 21,000/year minimum. Must apply from home country at Swiss embassy — you cannot enter as tourist and switch. Cantonal migration office processes permits. Processing: 8–12 weeks (slow). Allows 15 hours/week work only after 6 months of residence. After graduation: 6-month job search period. High living costs but low tuition (CHF 500–2,000/semester). Note: Switzerland is Schengen but not EU — separate visa needed.",
    visaAcceptanceRate: 78,
    visaBankAccountAmount: 21000,
    visaBankAccountLocked: false,
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
  },
  {
    name: "Czech Republic",
    currency: "CZK",
    livingCostEstimate: 550,
    visaRequirements:
      "Long-term residence permit for studies. Proof of funds CZK 81,400/year (~€3,250). Criminal record extract from home country required. Purpose-built accommodation proof helps application. Processing: 60–90 days at Czech embassy, then visit Ministry of Interior in person within 3 days of arrival. Allows 20 hours/week work. After graduation: 9-month job search. Very affordable — Prague costs 50% less than Western European capitals. Strong engineering and IT programs. EU member, Schengen area.",
    visaAcceptanceRate: 94,
    visaBankAccountAmount: 81400,
    visaBankAccountLocked: false,
  },
  {
    name: "Poland",
    currency: "PLN",
    livingCostEstimate: 450,
    visaRequirements:
      "National D visa for studies. Proof of funds ~PLN 800–1,000/month (~PLN 12,000/year). Apply at Polish consulate with admission letter and proof of funds. Processing: 2–4 weeks — one of the fastest in EU. Temporary residence permit required after first year. Allows 20 hours/week work during studies. After graduation: stay under regular work permit rules. Lowest cost of living in EU among developed economies. Growing tech sector — Warsaw, Krakow, Wroclaw are major IT hubs. EU member, Schengen area.",
    visaAcceptanceRate: 93,
    visaBankAccountAmount: 12000,
    visaBankAccountLocked: false,
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
  await University.deleteMany({})
  console.log("Cleared existing data")

  await Country.insertMany(countries)
  console.log(`Inserted ${countries.length} countries`)

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
