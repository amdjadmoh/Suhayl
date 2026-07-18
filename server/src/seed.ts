/// <reference types="node" />
import { Country } from "./models/Country"
import { University } from "./models/University"
import { Program } from "./models/Program"
import { Application } from "./models/Application"
import { City } from "./models/City"
import { User } from "./models/User"
import { Student } from "./models/Student"
import bcrypt from "bcryptjs"

const countries = [
  {
    name: "Germany",
    currency: "EUR",
    livingCostEstimate: 934,
    visaBankAccountAmount: 11208,
    visaBankAccountLocked: true,
    visaType: "National Visa D (student visa)",
    proofOfFundsMonthly: 934,
    whereToApply: "Appointment at German embassy with admission letter, CV, motivation, and proof of funds",
    processingTime: "4–8 weeks",
    workPermit: "120 full/240 half days per year",
    postGraduationVisa: "18-month job seeker visa",
    additionalVisaNotes: "Health insurance required (public ~€125/month or private ~€35/month)",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Completed national visa application form",
      "2 biometric passport photos",
      "Admission letter from German university",
      "Blocked account confirmation (Sperrkonto, EUR 11,208)",
      "Health insurance certificate (public or private)",
      "Proof of accommodation in Germany",
      "Academic certificates and transcripts",
      "Language proficiency certificate (German/English as per program)",
      "CV and motivational letter",
    ],
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
    visaBankAccountAmount: 7380,
    visaBankAccountLocked: false,
    visaType: "VLS-TS (long-stay student visa)",
    proofOfFundsMonthly: 615,
    whereToApply: "Campus France pre-registration required for most non-EU applicants. OFII validation within 3 months of arrival",
    processingTime: "2–8 weeks",
    workPermit: "964 hours/year (60% of full-time)",
    postGraduationVisa: "1-year post-study visa (APS) for Master's graduates",
    additionalVisaNotes: "Valid 1 year, renewable. No blocked account — bank statement accepted",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Long-stay visa application form (VLS-TS)",
      "2 passport photos (35x45mm)",
      "Campus France pre-registration certificate",
      "Admission letter from French university",
      "Bank statements showing EUR 7,380 (last 3 months)",
      "Health insurance (travel insurance + French registration)",
      "Proof of accommodation (rental contract or attestation d'accueil)",
      "Academic transcripts and diplomas (translated to French)",
      "Language proficiency (French/English per program)",
    ],
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
    visaBankAccountAmount: 14400,
    visaBankAccountLocked: false,
    visaType: "MVV (entry visa) + VVR (residence permit)",
    proofOfFundsMonthly: 1200,
    whereToApply: "University usually applies on your behalf",
    processingTime: "4–8 weeks",
    workPermit: "16 hours/week or full-time in summer",
    postGraduationVisa: "Orientation Year (zoekjaar) — 1 year to find work",
    additionalVisaNotes: "TB test required for certain nationalities. Health insurance mandatory (~€100/month)",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "MVV entry visa application form",
      "2 passport photos",
      "Admission letter from Dutch university",
      "Proof of financial means (bank statements or scholarship, EUR 12,000/year)",
      "Health insurance (Dutch basic insurance mandatory)",
      "Proof of accommodation in the Netherlands",
      "Academic certificates and transcripts",
      "Language proficiency (IELTS 6.0+/TOEFL 80+)",
      "TB test certificate (within 3 months, if applicable)",
    ],
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
    visaBankAccountAmount: 11050,
    visaBankAccountLocked: false,
    visaType: "Residence permit for studies",
    proofOfFundsMonthly: 921,
    whereToApply: "Apply online via Migration Agency (Migrationsverket), biometrics at embassy",
    processingTime: "2–4 months",
    workPermit: "Unlimited work hours alongside studies",
    postGraduationVisa: "12-month job search permit",
    additionalVisaNotes: "Must show funds for entire study period upfront. No blocked account — bank statement or scholarship letter accepted",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Residence permit application form (Migrationsverket)",
      "2 passport photos",
      "Admission letter from Swedish university",
      "Proof of financial means (bank statements SEK 102,246/year)",
      "Health insurance (university coverage or private)",
      "Proof of accommodation in Sweden",
      "Academic transcripts and certificates",
      "Language proficiency (IELTS 6.5+/TOEFL 90+)",
      "Statement of purpose",
    ],
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
    visaBankAccountAmount: 10300,
    visaBankAccountLocked: false,
    visaType: "Student residence permit (ST1)",
    proofOfFundsMonthly: 858,
    whereToApply: "Online application via SIRI portal, biometrics at Danish embassy or in Denmark",
    processingTime: "2–3 months",
    workPermit: "20 hours/week (full-time June–August)",
    postGraduationVisa: "2-year Establishment Card to seek work",
    additionalVisaNotes: "Tuition-free for EU/EEA; non-EU pay tuition",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "ST1 residence permit application form (SIRI)",
      "2 passport photos",
      "Admission letter from Danish university",
      "Proof of financial means (bank statements DKK 75,000/year)",
      "Health insurance (CPR/yellow card registration)",
      "Proof of accommodation in Denmark",
      "Academic certificates and transcripts",
      "Language proficiency (IELTS 6.5+/TOEFL 90+)",
      "Biometrics (fingerprints at Danish embassy)",
    ],
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
    visaBankAccountAmount: 11900,
    visaBankAccountLocked: true,
    visaType: "Student residence permit",
    proofOfFundsMonthly: 992,
    whereToApply: "Deposit funds into UDI account or show bank statement + guaranteed income",
    processingTime: "2–8 weeks",
    workPermit: "20 hours/week",
    postGraduationVisa: "1-year job search visa",
    additionalVisaNotes: "Tuition-free for ALL nationalities at public universities. Norway is not EU but participates in Erasmus+ and Schengen",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Student residence permit application (UDI portal)",
      "2 passport photos",
      "Admission letter from Norwegian university",
      "Proof of financial means (NOK 139,000/year bank deposit into UDI account)",
      "Health insurance (covered by national scheme after registration)",
      "Proof of accommodation in Norway",
      "Academic certificates and transcripts",
      "Language proficiency (IELTS 6.0+/TOEFL 80+)",
      "Police clearance certificate",
    ],
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
      "Limited English Master's programs",
      "Non-EU — separate visa from Schengen",
      "Competitive non-Norwegian job market"
    ],
  },
  {
    name: "Finland",
    currency: "EUR",
    livingCostEstimate: 800,
    visaBankAccountAmount: 6720,
    visaBankAccountLocked: false,
    visaType: "Student residence permit",
    proofOfFundsMonthly: 560,
    whereToApply: "Apply via Enter Finland online portal, biometrics at Finnish embassy",
    processingTime: "1–2 months",
    workPermit: "30 hours/week (unlimited in your field)",
    postGraduationVisa: "2-year post-study permit",
    additionalVisaNotes: "Tuition for non-EU (€4,000–18,000/year) but generous scholarships. Health insurance required for non-EU",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Residence permit application (Enter Finland portal)",
      "2 passport photos",
      "Admission letter from Finnish university",
      "Proof of financial means (bank statements EUR 6,720/year)",
      "Health insurance (minimum EUR 40,000 coverage)",
      "Proof of accommodation in Finland",
      "Academic certificates and transcripts",
      "Language proficiency (IELTS 6.5+/TOEFL 92+)",
      "CV and study plan",
    ],
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
    visaBankAccountAmount: 22100,
    visaBankAccountLocked: false,
    visaType: "National D visa for studies",
    proofOfFundsMonthly: 1842,
    whereToApply: "Must apply from home country at Swiss embassy — cannot enter as tourist and switch. Cantonal migration office processes permits",
    processingTime: "8–12 weeks",
    workPermit: "15 hours/week only after 6 months of residence",
    postGraduationVisa: "6-month job search period",
    additionalVisaNotes: "High living costs but low tuition (CHF 500–2,000/semester). Switzerland is Schengen but not EU",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Type D visa application form",
      "2 passport photos",
      "Admission letter from Swiss university",
      "Proof of financial means (bank statements CHF 21,000/year)",
      "Health insurance (mandatory Swiss health insurance after registration)",
      "Proof of accommodation (rental confirmation)",
      "Academic certificates and transcripts",
      "Language proficiency certificate",
      "Cantonal residence permit application (within 14 days of arrival)",
    ],
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
    visaBankAccountAmount: 7020,
    visaBankAccountLocked: false,
    visaType: "Student residence permit (Aufenthaltsbewilligung)",
    proofOfFundsMonthly: 585,
    whereToApply: "Apply at Austrian embassy before travel",
    processingTime: "4–8 weeks",
    workPermit: "20 hours/week",
    postGraduationVisa: "12-month job search visa (Rot-Weiß-Rot Karte)",
    additionalVisaNotes: "Quota system applies for some nationalities — limited spots. Low tuition (~€750/semester for non-EU at public universities)",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Visa D application form",
      "2 passport photos (35x45mm)",
      "Admission letter from Austrian university",
      "Proof of financial means (bank statements EUR 11,000/year)",
      "Health insurance (travel insurance + OeH student insurance)",
      "Proof of accommodation (rental contract or dormitory)",
      "Academic transcripts and certificates (apostille)",
      "Language proficiency (German/English per program)",
      "Police clearance certificate",
    ],
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
    visaBankAccountAmount: 9600,
    visaBankAccountLocked: false,
    visaType: "Long-stay student visa (Type D)",
    proofOfFundsMonthly: 800,
    whereToApply: "Apply at Belgian embassy. University assists with residence permit application",
    processingTime: "4–8 weeks",
    workPermit: "20 hours/week",
    postGraduationVisa: "12-month orientation year",
    additionalVisaNotes: "Medical certificate required. EU institutions in Brussels create unique internship opportunities",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Type D visa application form",
      "2 passport photos",
      "Admission letter from Belgian university",
      "Proof of financial means (blocked account or Annex 32 sponsor, EUR 7,920/year)",
      "Health insurance certificate",
      "Proof of accommodation",
      "Academic certificates and transcripts",
      "Language proficiency (French/Dutch/English per program)",
      "Medical certificate (from embassy-approved doctor)",
    ],
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
    visaBankAccountAmount: 7000,
    visaBankAccountLocked: false,
    visaType: "Student visa (Stamp 2)",
    proofOfFundsMonthly: 583,
    whereToApply: "Apply online via AVATS, submit documents at Irish embassy/VFS. GNIB registration within 90 days of arrival (€300 fee)",
    processingTime: "4–8 weeks",
    workPermit: "20 hours/week during term, 40 hours/week during holidays",
    postGraduationVisa: "2-year Third Level Graduate Scheme",
    additionalVisaNotes: "Private health insurance required (~€500/year). Only English-speaking country in EU post-Brexit",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Study visa application form (AVATS online)",
      "2 passport photos",
      "Letter of Acceptance from Irish university",
      "Proof of financial means (bank statements EUR 10,000/year)",
      "Proof of tuition fee payment or scholarship letter",
      "Private health insurance certificate",
      "Proof of accommodation",
      "Academic certificates and transcripts",
      "IELTS/TOEFL English proficiency certificate",
      "Police clearance certificate",
    ],
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
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
    visaType: "Student visa (Type D)",
    proofOfFundsMonthly: 600,
    whereToApply: "Apply at Italian consulate — book appointment months ahead",
    processingTime: "4–12 weeks",
    workPermit: "20 hours/week",
    postGraduationVisa: "12-month 'attesa occupazione' permit",
    additionalVisaNotes: "Permesso di soggiorno must be applied for within 8 days of arrival. Accommodation proof required. Income-based tuition (as low as €156/year)",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Type D visa application form",
      "2 passport photos",
      "Admission letter from Italian university",
      "Bank statements showing EUR 6,000/year minimum",
      "Health insurance (Italian NHS registration or private policy)",
      "Proof of accommodation in Italy",
      "Academic certificates and transcripts (translated to Italian)",
      "Language proficiency (Italian/English per program)",
      "Dichiarazione di Valore (declaration of value, from Italian embassy)",
    ],
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
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
    visaType: "Student visa (Type D)",
    proofOfFundsMonthly: 600,
    whereToApply: "Apply at Spanish consulate, then apply for TIE (foreigner identity card) within 30 days of arrival",
    processingTime: "4–8 weeks",
    workPermit: "30 hours/week",
    postGraduationVisa: "1-year job search permit",
    additionalVisaNotes: "Initial 90-day visa. Medical certificate and criminal record check required",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Type D visa application form (EX-00)",
      "2 passport photos",
      "Admission letter from Spanish university",
      "Proof of financial means (bank statements EUR 7,200/year)",
      "Health insurance (private policy with repatriation cover)",
      "Proof of accommodation",
      "Academic certificates and transcripts",
      "Language proficiency (Spanish/English per program)",
      "Medical certificate (issued within 3 months)",
      "Police clearance certificate (with apostille)",
    ],
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
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
    visaType: "Student visa (Type D)",
    proofOfFundsMonthly: 600,
    whereToApply: "Apply at Portuguese consulate with admission letter, proof of accommodation, and bank statements",
    processingTime: "4–8 weeks",
    workPermit: "20 hours/week during studies, full-time during breaks",
    postGraduationVisa: "1-year job search visa",
    additionalVisaNotes: "SEF (immigration) appointment required within 3 months of arrival. Fast-growing tech hub in Lisbon",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Type D visa application form",
      "2 passport photos",
      "Admission letter from Portuguese university",
      "Proof of financial means (bank statements EUR 6,000/year)",
      "Health insurance (travel + Portuguese coverage)",
      "Proof of accommodation",
      "Academic transcripts and certificates",
      "Language proficiency (Portuguese/English per program)",
      "Police clearance certificate (apostille)",
      "SEF appointment booking confirmation",
    ],
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
    visaBankAccountAmount: 3400,
    visaBankAccountLocked: false,
    visaType: "Long-term residence permit for studies",
    proofOfFundsMonthly: 283,
    whereToApply: "Apply at Czech embassy, then visit Ministry of Interior in person within 3 days of arrival",
    processingTime: "60–90 days",
    workPermit: "20 hours/week",
    postGraduationVisa: "9-month job search",
    additionalVisaNotes: "Criminal record extract from home country required. Purpose-built accommodation proof helps application",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Long-term residence permit application",
      "2 passport photos",
      "Admission letter from Czech university",
      "Proof of financial means (bank statements CZK 81,400/year)",
      "Health insurance (comprehensive Czech policy)",
      "Proof of accommodation (signed rental contract)",
      "Academic certificates and transcripts (nostrification may be required)",
      "Language proficiency (Czech/English per program)",
      "Police clearance certificate (with apostille)",
      "Confirmation of study from Ministry of Interior",
    ],
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
    visaBankAccountAmount: 2800,
    visaBankAccountLocked: false,
    visaType: "National D visa for studies",
    proofOfFundsMonthly: 233,
    whereToApply: "Apply at Polish consulate with admission letter and proof of funds",
    processingTime: "2–4 weeks",
    workPermit: "20 hours/week",
    postGraduationVisa: "Stay under regular work permit rules",
    additionalVisaNotes: "Temporary residence permit required after first year. Lowest cost of living in EU among developed economies",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "National D visa application form",
      "2 passport photos",
      "Admission letter from Polish university",
      "Proof of financial means (bank statements EUR 2,800/year)",
      "Health insurance (NFZ or private policy)",
      "Proof of accommodation (rental contract)",
      "Academic certificates and transcripts (apostille)",
      "Language proficiency (Polish/English per program)",
      "Police clearance certificate",
      "Confirmation of first-year tuition payment",
    ],
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
  {
    name: "Greece",
    currency: "EUR",
    livingCostEstimate: 550,
    visaBankAccountAmount: 5000,
    visaBankAccountLocked: false,
    visaType: "National D visa (student residence permit)",
    proofOfFundsMonthly: 420,
    whereToApply: "Apply at Greek embassy/consulate with admission letter. Residence permit from Decentralized Administration within 40 days of arrival. Biometrics required",
    processingTime: "4–8 weeks",
    workPermit: "20 hours/week during studies (part-time), full-time during summer",
    postGraduationVisa: "2-year job search visa after graduation (law 4825/2021)",
    additionalVisaNotes: "Very affordable living costs. Public university tuition: EUR 1,500/year for non-EU. Private universities: EUR 5,000–12,000/year. Residence permit renewed annually. Schengen visa — travel across EU",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "National D visa application form",
      "2 passport photos",
      "Admission letter from Greek university",
      "Proof of financial means (bank statements EUR 5,000/year)",
      "Health insurance (private or EHIC)",
      "Proof of accommodation",
      "Academic certificates and transcripts (translated to Greek/English)",
      "Language proficiency (Greek or English per program)",
      "Medical certificate (from recognized doctor)",
      "Police clearance certificate",
    ],
    pros: [
      "One of the most affordable Western European study destinations (EUR 550/month)",
      "Rich academic tradition — birthplace of university education",
      "2-year post-graduation job search visa",
      "Schengen area — travel across 27 European countries",
      "Mediterranean lifestyle, food, and 300+ days of sunshine per year",
    ],
    cons: [
      "Greek language essential outside university — limited English in daily life",
      "Economic challenges — youth unemployment remains high",
      "Bureaucracy can be slow and paper-heavy",
      "Limited English-taught Bachelor programs",
      "Summer heat can be extreme (35–40°C) in major cities",
    ],
  },
  {
    name: "Romania",
    currency: "RON",
    livingCostEstimate: 400,
    visaBankAccountAmount: 3000,
    visaBankAccountLocked: false,
    visaType: "Long-stay D/DS visa (student, converted to residence permit)",
    proofOfFundsMonthly: 250,
    whereToApply: "Apply at Romanian embassy with admission letter. Acceptance letter must confirm tuition payment or scholarship. Residence permit from IGI within 30 days of arrival",
    processingTime: "2–4 weeks",
    workPermit: "20 hours/week (part-time), full-time during holidays",
    postGraduationVisa: "1-year job search extension; path to permanent residence after 5 years",
    additionalVisaNotes: "Romania joined Schengen (land/sea Jan 2024, air March 2024). Exceptionally cheap — EUR 400/month all-in. IT sector booming (Cluj, Bucharest). Medical faculty popular among international students. Tuition EUR 2,500–5,000/year at public universities",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Long-stay visa D application form",
      "2 passport photos",
      "Admission letter from Romanian university (tuition payment confirmed)",
      "Proof of financial means (bank statements EUR 3,000/year)",
      "Health insurance (travel insurance + Romanian coverage)",
      "Proof of accommodation",
      "Academic certificates and transcripts (apostille & translated)",
      "Language proficiency (Romanian/English/French per program)",
      "Medical certificate",
      "Police clearance certificate",
    ],
    pros: [
      "Cheapest EU/Schengen destination — EUR 400/month total living cost",
      "Strong and growing IT sector (Cluj-Napoca is 'Silicon Valley of Eastern Europe')",
      "Very high visa acceptance rate (90%)",
      "Low proof of funds (only EUR 3,000/year)",
      "Fast visa processing (2–4 weeks)",
    ],
    cons: [
      "Romanian language essential for daily life — English limited outside cities",
      "Infrastructure still developing — slower internet in rural areas",
      "Discrimination reported against North African/Arab students in some areas",
      "Healthcare system has quality gaps",
      "Lower salaries after graduation compared to Western Europe",
    ],
  },
  {
    name: "Estonia",
    currency: "EUR",
    livingCostEstimate: 600,
    visaBankAccountAmount: 6600,
    visaBankAccountLocked: false,
    visaType: "Type D long-stay visa + Temporary Residence Permit (TRP)",
    proofOfFundsMonthly: 550,
    whereToApply: "Apply at Estonian embassy. TRP applied after arrival at Police and Border Guard Board. Online application via e-residency portal. Biometrics required",
    processingTime: "2–4 weeks for visa; 1 month for TRP",
    workPermit: "Unlimited work hours — students can work full-time alongside studies",
    postGraduationVisa: "9-month job search after graduation; easy path to EU Blue Card",
    additionalVisaNotes: "EU's most digital society — 99% of services online. Tallinn is a startup hub (Skype, Bolt, Wise). Tuition EUR 1,660–7,500/year. STEM programs strong. E-residency available. Very cold winters (-10°C to -20°C)",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Type D visa application form",
      "2 passport photos",
      "Admission letter from Estonian university",
      "Proof of financial means (bank statements EUR 6,600/year)",
      "Health insurance (EHIC or Estonian Health Insurance Fund)",
      "Proof of accommodation",
      "Academic certificates and transcripts",
      "Language proficiency (English per program)",
      "Police clearance certificate",
      "Biometrics (at embassy)",
    ],
    pros: [
      "Unlimited work rights — students can work full-time alongside studies",
      "EU's most advanced digital society — 99% e-services, e-residency available",
      "Thriving startup ecosystem (Skype, Bolt, Wise, TransferWise born here)",
      "Affordable living cost for Northern Europe (EUR 600/month)",
      "9-month job search after graduation with easy path to EU Blue Card",
    ],
    cons: [
      "Severe winter — temperatures drop to -20°C with 6h daylight in December",
      "Small country (1.3M population) — limited job market outside tech",
      "Estonian language is extremely difficult (Finno-Ugric, no relation to Arabic/French)",
      "Limited number of English-taught Bachelor programs",
      "Geographic isolation — far from Algeria with expensive flights",
    ],
  },
  {
    name: "Croatia",
    currency: "EUR",
    livingCostEstimate: 500,
    visaBankAccountAmount: 5000,
    visaBankAccountLocked: false,
    visaType: "Type D long-stay visa + Temporary Residence Permit (boravišna dozvola)",
    proofOfFundsMonthly: 420,
    whereToApply: "Apply at Croatian embassy/consulate. Residence permit from local police station (MUP) within 30 days of arrival. Certificate of enrollment required",
    processingTime: "4–8 weeks",
    workPermit: "Part-time allowed; student service contract (student servis) unlimited hours",
    postGraduationVisa: "1-year job search extension; can apply for work permit after",
    additionalVisaNotes: "Newest Schengen member (joined Jan 2023). Eurozone since 2023. Adriatic coast is stunning. Tuition EUR 2,000–8,000/year at public universities. Cheap living (EUR 500/month). Warm Mediterranean climate on coast. Growing tourism and hospitality sector",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Type D visa application form",
      "2 passport photos",
      "Admission/enrollment letter from Croatian university",
      "Proof of financial means (bank statements EUR 5,000/year)",
      "Health insurance (travel insurance + Croatian coverage)",
      "Proof of accommodation",
      "Academic certificates and transcripts (apostille & translated)",
      "Language proficiency (Croatian or English per program)",
      "Police clearance certificate",
      "Certificate of enrollment (potvrda o upisu)",
    ],
    pros: [
      "Newest Schengen + Eurozone member — free travel across Europe",
      "Beautiful Adriatic coastline and Mediterranean lifestyle",
      "Very affordable — EUR 500/month living costs in student cities",
      "Growing tourism sector with internship opportunities",
      "Low crime rate and safe cities",
    ],
    cons: [
      "Croatian language is Slavic — difficult for French/Arabic speakers",
      "Limited English-taught undergraduate programs",
      "Small country (4M population) — limited job market",
      "Tourism-focused economy — fewer opportunities in tech/R&D",
      "Infrastructure outside Zagreb/Split can be basic",
    ],
  },
  {
    name: "Slovakia",
    currency: "EUR",
    livingCostEstimate: 450,
    visaBankAccountAmount: 3600,
    visaBankAccountLocked: false,
    visaType: "National D visa + Temporary Residence Permit (pobyt)",
    proofOfFundsMonthly: 300,
    whereToApply: "Apply at Slovak embassy with admission letter. Residence permit from Foreign Police within 30 days. Biometrics required. Slovak language preparation year available",
    processingTime: "4–8 weeks",
    workPermit: "20 hours/week during studies; full-time during holidays",
    postGraduationVisa: "1-year job search after graduation; Blue Card eligibility for high-skilled",
    additionalVisaNotes: "Eurozone + Schengen member. Very affordable — EUR 450/month. Tuition EUR 1,500–5,000/year for non-EU. Strong automotive and engineering sectors. Bratislava is 1 hour from Vienna. Slovak language similar to Czech — mutually intelligible",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "National D visa application form",
      "2 passport photos",
      "Admission letter from Slovak university",
      "Proof of financial means (bank statements EUR 3,600/year)",
      "Health insurance (Slovak public or private)",
      "Proof of accommodation",
      "Academic certificates and transcripts (apostille)",
      "Language proficiency (Slovak/English per program)",
      "Police clearance certificate",
      "Confirmation of enrollment fee payment",
    ],
    pros: [
      "Very affordable — EUR 450/month total, EUR 3,600/year proof of funds",
      "Central European location — Bratislava is 1 hour from Vienna",
      "Eurozone + Schengen member with full EU benefits",
      "Growing automotive and engineering industries (VW, Kia, Jaguar)",
      "Slovak language free preparation year available at many universities",
    ],
    cons: [
      "Slovak language is Slavic — difficult for non-Slavic speakers",
      "Small country (5.5M population) — limited job market diversity",
      "Limited number of English-taught programs",
      "Cold winters and limited sunshine in winter months",
      "Fewer international student amenities than Western Europe",
    ],
  },
  {
    name: "Luxembourg",
    currency: "EUR",
    livingCostEstimate: 1300,
    visaBankAccountAmount: 12000,
    visaBankAccountLocked: false,
    visaType: "Type D long-stay visa + Temporary Residence Permit (autorisation de séjour)",
    proofOfFundsMonthly: 1000,
    whereToApply: "Apply for temporary authorization to stay (autorisation de séjour temporaire) from Immigration Directorate before visa. Then Type D visa at embassy. After arrival: declare at commune, medical check, residence permit",
    processingTime: "6–12 weeks (two-step process)",
    workPermit: "15 hours/week during studies (maximum); more during summer holidays",
    postGraduationVisa: "1-year job search after graduation; can convert to work permit",
    additionalVisaNotes: "Richest EU country per capita. Trilingual (Luxembourgish, French, German). University of Luxembourg tuition EUR 200–400/year only. High cost of living (EUR 1,300/month). EU institutions and finance hub. Very safe. Small but international",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Temporary authorization to stay (autorisation de séjour temporaire)",
      "Type D visa application form",
      "2 passport photos",
      "Admission letter from University of Luxembourg (or recognized institution)",
      "Proof of financial means (bank statements EUR 12,000/year)",
      "Health insurance certificate",
      "Proof of accommodation",
      "Academic certificates and transcripts (translated to French/German/English)",
      "Language proficiency (French/German/English per program)",
      "Medical certificate",
      "Declaration of arrival (déclaration darrivée) at commune",
    ],
    pros: [
      "Richest EU country — excellent infrastructure, healthcare, and safety",
      "Trilingual society (French, German, English) — ideal for Francophone Algerians",
      "University of Luxembourg tuition only EUR 200–400/year",
      "Major EU institutions + financial hub — excellent internship opportunities",
      "Very safe with highest multicultural population in Europe (47% foreign residents)",
    ],
    cons: [
      "High cost of living — EUR 1,300/month is among EU's most expensive",
      "Very small country — limited number of universities and programs",
      "Competitive housing market with high rents",
      "Social life can feel quiet — limited student nightlife",
      "15h/week work restriction is stricter than most of EU",
    ],
  },
  {
    name: "United States",
    currency: "USD",
    livingCostEstimate: 1200,
    visaBankAccountAmount: 40000,
    visaBankAccountLocked: false,
    visaType: "F-1 Student Visa (I-20 + SEVIS)",
    proofOfFundsMonthly: 1500,
    whereToApply: "Apply at US Embassy after SEVP-certified school issues Form I-20. Pay SEVIS I-901 fee ($350), complete DS-160 form, pay MRV fee ($185), attend in-person interview. Must show ties to Algeria",
    processingTime: "4–12 weeks (schedule interview early)",
    workPermit: "On-campus up to 20h/week during studies; OPT 12 months after graduation (STEM extension +24 months = 36 total)",
    postGraduationVisa: "OPT: 12 months (STEM: 36 months). H-1B lottery for long-term work",
    additionalVisaNotes: "No fixed minimum bank balance — I-20 shows total cost. Must prove funds for first year ($40,000–$90,000). Visa Integrity Fee ($250) enacted July 2025, not yet collected as of mid-2026. Strong home-country ties required. Algeria reciprocity fee may apply",
    requiredDocuments: [
      "Valid passport (6+ months validity beyond stay)",
      "Form I-20 from SEVP-certified school (signed)",
      "DS-160 online application + confirmation page",
      "SEVIS I-901 fee receipt ($350)",
      "MRV visa application fee receipt ($185)",
      "Acceptance/admission letter from university",
      "Bank statements (last 3–6 months, sufficient for I-20 amount)",
      "Academic transcripts and diplomas (prior education)",
      "TOEFL/IELTS/Duolingo English test scores",
      "Passport-size photos (2x2 inches, white background)",
    ],
    pros: [
      "World's #1 destination for international education — unmatched reputation",
      "OPT allows 12–36 months of work after graduation with no employer sponsorship",
      "Massive job market in tech, finance, healthcare, and research",
      "Diverse campus life with students from every country",
      "Career fairs and alumni networks are extremely well-connected",
    ],
    cons: [
      "Extremely expensive — $40,000–$90,000/year total cost",
      "Difficult visa interview — must prove non-immigrant intent and strong Algeria ties",
      "No guaranteed path to permanent residency after F-1",
      "Health insurance is expensive and mandatory ($1,500–$3,500/year)",
      "Limited work hours during studies — cannot work off-campus on F-1",
    ],
  },
  {
    name: "Canada",
    currency: "CAD",
    livingCostEstimate: 1200,
    visaBankAccountAmount: 22895,
    visaBankAccountLocked: false,
    visaType: "Study Permit (PAL required for undergrad/college)",
    proofOfFundsMonthly: 1200,
    whereToApply: "Apply online via IRCC portal. Quebec requires additional CAQ (4–6 weeks extra). Biometrics required. Provincial Attestation Letter (PAL) needed for most programs. GIC (CAD $20,635) required for SDS stream",
    processingTime: "8–12 weeks for Algerian applicants",
    workPermit: "20h/week off-campus during studies; full-time during scheduled breaks",
    postGraduationVisa: "PGWP (Post-Graduation Work Permit): up to 3 years depending on program length. Path to permanent residence via Express Entry",
    additionalVisaNotes: "2026 cap on study permits — PAL required from province. Master's/PhD exempt from PAL since Jan 2026. Proof of funds: CAD $22,895 + 1st year tuition + travel. Quebec has separate threshold. French-speaking Algerians benefit from Francophone mobility streams",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Letter of Acceptance from a Designated Learning Institution (DLI)",
      "Provincial Attestation Letter (PAL) — unless exempt (Master's/PhD)",
      "Proof of financial support (CAD $22,895 + tuition + travel)",
      "Statement of purpose explaining study plans and return intent",
      "Academic transcripts and certificates (all levels)",
      "IELTS/TOEFL/PTE language test scores",
      "Police clearance certificate from Algeria",
      "Passport-size photos",
      "Biometrics (fingerprints + photo) — CAD $85",
    ],
    pros: [
      "Clear path to permanent residency through Express Entry after PGWP",
      "Bilingual country — French-speaking Algerians have major advantage (Quebec/TEF)",
      "3-year open work permit after graduation (PGWP)",
      "Affordable compared to US (public university tuition CAD $15,000–$25,000/year)",
      "Very welcoming multicultural society with large Arab/Francophone communities",
    ],
    cons: [
      "2026 study permit cap means fewer approvals and strict PAL enforcement",
      "Winter is harsh (-20°C to -30°C) — very different from Algeria",
      "Housing crisis in major cities (Toronto, Vancouver, Montreal)",
      "Tuition for international students recently increased across provinces",
      "Processing times are long (8–12 weeks) and documents are extensive",
    ],
  },
  {
    name: "United Arab Emirates",
    currency: "AED",
    livingCostEstimate: 1100,
    visaBankAccountAmount: 20000,
    visaBankAccountLocked: false,
    visaType: "Student Residence Visa (university-sponsored)",
    proofOfFundsMonthly: 900,
    whereToApply: "University applies on your behalf through ICP/GDRFA Dubai. University issues entry permit → you enter → medical test → Emirates ID → residence visa stamping. Sponsorship through university (kafeel) or UAE-resident parent",
    processingTime: "10–15 working days for entry permit; 2–4 weeks total with Emirates ID",
    workPermit: "Part-time allowed with university permission; internships in free zones",
    postGraduationVisa: "Recent graduate sponsorship programs in some emirates; job seeker visa expansion expected",
    additionalVisaNotes: "Health insurance mandatory (DHA-compliant). Medical fitness test required (blood + chest X-ray, AED 310–430). Emirates ID issued alongside visa. Annual renewal with proof of enrollment. Convertible to work visa if employer sponsors you. No income tax",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Unconditional admission letter from accredited UAE university",
      "Passport-size photos (white background, 4x6 cm)",
      "Proof of tuition fee payment for first year",
      "Valid UAE-compliant health insurance",
      "Academic transcripts and attested certificates",
      "Medical fitness test results (in-country, AED 310–430)",
      "Police clearance certificate",
      "Proof of financial means (bank statements AED 20,000+)",
      "Visa application form through university PRO office",
    ],
    pros: [
      "World-class international campuses (NYU Abu Dhabi, Sorbonne Abu Dhabi, etc.)",
      "Tax-free income — work while studying with no deductions",
      "Arabic and English widely spoken — easy cultural transition for Algerians",
      "Modern infrastructure, safe cities, and excellent quality of life",
      "Strategic location between Europe, Africa, and Asia — good flight connections",
    ],
    cons: [
      "High cost of living — Dubai is one of the most expensive cities globally",
      "No clear path to permanent residency or citizenship",
      "Summer heat is extreme (45–50°C, June–September)",
      "Cultural conservatism — strict laws on behavior, dress, and social norms",
      "Tuition at top international campuses is high (AED 40,000–100,000+/year)",
    ],
  },
  {
    name: "Saudi Arabia",
    currency: "SAR",
    livingCostEstimate: 600,
    visaBankAccountAmount: 27000,
    visaBankAccountLocked: false,
    visaType: "Student Visa + Iqama (residence permit, university-sponsored)",
    proofOfFundsMonthly: 500,
    whereToApply: "University coordinates with Ministry of Education and Ministry of Foreign Affairs. After approval, apply at Saudi embassy. Document authentication chain required (Algeria Foreign Ministry → Saudi Embassy → Cultural Attaché → MOFA inside KSA)",
    processingTime: "14–45 business days",
    workPermit: "Generally not allowed for students; some internships with university permission",
    postGraduationVisa: "Must leave unless sponsored for employment. Saudi Vision 2030 increasing international graduate retention options",
    additionalVisaNotes: "Scholarships widely available (full tuition + stipend SAR 850–900/month undergrad, SAR 1,900 postgrad). KAUST offers fully-funded $70K–$80K/year fellowships. No income tax. Arabic-speaking Algerians have advantage. Religious and cultural norms are strictly enforced. Pre-travel medical certificate + confirmatory exam on arrival",
    requiredDocuments: [
      "Valid passport (12+ months validity, blank pages)",
      "Admission offer from recognized Saudi university (KSU, KAU, KFUPM, KAUST, etc.)",
      "Academic certificates (attested: home MOFA → Saudi Embassy → Cultural Attaché)",
      "Pre-travel medical certificate (3 months valid, no infectious diseases)",
      "Proof of funding (scholarship letter OR bank statements SAR 27,000+, 3–6 months)",
      "Police clearance certificate (6 months valid)",
      "Language test (IELTS 6+ / TOEFL 79+ or Arabic proficiency)",
      "Birth certificate (translated to Arabic/English)",
      "Passport photos",
      "Health insurance (university or private)",
    ],
    pros: [
      "Excellent full scholarships for Algerian students (including KAUST fully-funded),",
      "Arabic language environment — no language barrier for native speakers",
      "No income tax and low cost of living (SAR 2,500/month)",
      "World-class universities (KAUST ranked among top globally for research),",
      "Culturally and religiously familiar — large Algerian community, halal lifestyle",
    ],
    cons: [
      "Strict religious and social laws — very conservative public environment",
      "Women face significant restrictions on movement, dress, and daily life",
      "No post-graduation work visa — must leave or find employer sponsorship",
      "Document attestation chain is extremely bureaucratic (4–6 weeks),",
      "Summer heat is extreme (45–55°C) with sandstorms",
    ],
  },
  {
    name: "Hungary",
    currency: "HUF",
    livingCostEstimate: 500,
    visaBankAccountAmount: 2400000,
    visaBankAccountLocked: false,
    visaType: "Type D long-stay visa + residence permit (Stipendium Hungaricum available)",
    proofOfFundsMonthly: 400,
    whereToApply: "Apply at Hungarian embassy. Stipendium Hungaricum scholarship for Algerians covers tuition, dorm, monthly stipend (HUF 43,700), and health insurance. Application through Algerian sending partner + online platform (apply.stipendiumhungaricum.hu)",
    processingTime: "4–8 weeks",
    workPermit: "24 hours/week during studies (must not interfere with education)",
    postGraduationVisa: "9-month study-to-work visa after graduation; 2-year residence permit for job search for STEM graduates",
    additionalVisaNotes: "Stipendium Hungaricum scholarship: tuition-free + monthly stipend HUF 43,700 (Bachelor/Master) + accommodation + health insurance. Very affordable even without scholarship (~€500/month total). EU Schengen member — travel across Europe. Visa D required before entry, then residence permit in Hungary within 30 days",
    requiredDocuments: [
      "Valid passport (6+ months validity)",
      "Letter of Acceptance from Hungarian university",
      "Proof of accommodation (dorm reservation or rental contract)",
      "Proof of financial means (HUF 200,000/month = ~€500/month)",
      "Health insurance (EHIC or private, minimum €30,000 coverage)",
      "Academic transcripts and certificates (translated to English/Hungarian)",
      "Language proficiency (English IELTS/TOEFL or Hungarian if applicable)",
      "Visa D application form",
      "Passport photos (35mm x 45mm)",
      "Police clearance certificate",
    ],
    pros: [
      "Stipendium Hungaricum scholarship — full tuition + stipend + dorm for Algerians",
      "Ultra-low cost of living (~€500/month including rent) — cheapest in EU",
      "Schengen visa — travel freely across 27 European countries",
      "Growing international student hub (Budapest, Debrecen, Szeged)",
      "9-month post-graduation job search visa in the EU",
    ],
    cons: [
      "Hungarian language is extremely difficult (non-Indo-European) — English only at university",
      "Healthcare and bureaucracy can be slow and paperwork-heavy",
      "Some discrimination reported against North African students",
      "Job market for non-Hungarian speakers is limited after graduation",
      "Winter is cold and grey (-5°C to 5°C) with little sunshine",
    ],
  },
]

const cities = [
  { name: "Munich", country: "Germany", population: 1472000, isCapital: false, averageRentSingle: 950, averageRentShared: 550, monthlyLivingCost: 1100, qualityOfLifeScore: 9, safetyScore: 9, publicTransportScore: 9, studentFriendliness: 8, internetSpeed: 120, language: "German", englishFriendliness: 7, climate: "Continental, cold winters, warm summers", pros: ["Excellent public transport (MVV)", "Beautiful parks and beer gardens", "Strong job market in tech and automotive", "Close to Alps for skiing/hiking", "Very safe city"], cons: ["Most expensive city in Germany for rent", "Finding apartments is extremely competitive", "Can feel conservative compared to Berlin", "Bureaucracy in German only"] },
  { name: "Berlin", country: "Germany", population: 3645000, isCapital: true, averageRentSingle: 750, averageRentShared: 450, monthlyLivingCost: 950, qualityOfLifeScore: 8, safetyScore: 7, publicTransportScore: 9, studentFriendliness: 9, internetSpeed: 100, language: "German", englishFriendliness: 8, climate: "Continental, cold winters, mild summers", pros: ["Affordable for a capital city", "Massive startup and tech scene", "Very international and English-friendly", "Vibrant nightlife and culture", "Public transport ticket included in semester fee"], cons: ["Housing market getting tighter", "Winter is grey and cold", "Some areas feel rough", "Bureaucracy is slow"] },
  { name: "Aachen", country: "Germany", population: 249000, isCapital: false, averageRentSingle: 550, averageRentShared: 350, monthlyLivingCost: 800, qualityOfLifeScore: 7, safetyScore: 8, publicTransportScore: 7, studentFriendliness: 9, internetSpeed: 90, language: "German", englishFriendliness: 6, climate: "Oceanic, mild winters, cool summers, rainy", pros: ["Very affordable student city", "Strong engineering community", "Close to Belgium and Netherlands borders", "Compact walkable city center", "Large student population relative to city size"], cons: ["Small city — limited nightlife", "Rainy weather year-round", "Limited English outside university", "Fewer job opportunities than larger cities"] },
  { name: "Delft", country: "Netherlands", population: 103000, isCapital: false, averageRentSingle: 850, averageRentShared: 500, monthlyLivingCost: 1000, qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 8, studentFriendliness: 9, internetSpeed: 150, language: "Dutch", englishFriendliness: 9, climate: "Maritime, mild winters, cool summers", pros: ["Charming historic canal city", "Everyone speaks English", "Great cycling infrastructure", "Close to The Hague and Rotterdam", "Strong tech community around TU Delft"], cons: ["Student housing shortage", "Small city with limited nightlife", "Expensive for its size", "Rainy and windy weather"] },
  { name: "Amsterdam", country: "Netherlands", population: 873000, isCapital: true, averageRentSingle: 1200, averageRentShared: 700, monthlyLivingCost: 1300, qualityOfLifeScore: 9, safetyScore: 8, publicTransportScore: 9, studentFriendliness: 8, internetSpeed: 200, language: "Dutch", englishFriendliness: 10, climate: "Maritime, mild year-round, windy", pros: ["Most English-friendly city in non-English Europe", "World-class cultural scene", "Excellent cycling and public transport", "Major tech hub (Booking.com, Adyen)", "Diverse and tolerant culture"], cons: ["Very expensive housing", "Extremely competitive rental market", "Tourist overcrowding in center", "Flat and grey weather"] },
  { name: "Zurich", country: "Switzerland", population: 421000, isCapital: false, averageRentSingle: 1800, averageRentShared: 1000, monthlyLivingCost: 1700, qualityOfLifeScore: 10, safetyScore: 10, publicTransportScore: 10, studentFriendliness: 7, internetSpeed: 200, language: "German", englishFriendliness: 8, climate: "Continental, cold winters, warm summers, lake effect", pros: ["Highest quality of life globally", "Stunning lake and mountain scenery", "Excellent public transport", "Very high salaries after graduation", "Extremely safe"], cons: ["Most expensive city in Europe", "Social life can feel reserved/closed", "Limited work hours for students (15h/week after 6 months)", "Small city for its cost level"] },
  { name: "Stockholm", country: "Sweden", population: 975000, isCapital: true, averageRentSingle: 900, averageRentShared: 550, monthlyLivingCost: 950, qualityOfLifeScore: 9, safetyScore: 8, publicTransportScore: 9, studentFriendliness: 8, internetSpeed: 180, language: "Swedish", englishFriendliness: 9, climate: "Continental, very cold dark winters, mild bright summers", pros: ["Beautiful archipelago city", "Strong tech ecosystem (Spotify, Klarna)", "Unlimited work hours for students", "High English proficiency", "Great work-life balance culture"], cons: ["Dark winters (6h daylight in December)", "Severe housing shortage", "High cost of living", "Can feel socially reserved"] },
  { name: "Copenhagen", country: "Denmark", population: 794000, isCapital: true, averageRentSingle: 1000, averageRentShared: 600, monthlyLivingCost: 1100, qualityOfLifeScore: 9, safetyScore: 9, publicTransportScore: 9, studentFriendliness: 8, internetSpeed: 170, language: "Danish", englishFriendliness: 9, climate: "Maritime, mild winters, cool summers, windy", pros: ["World's best cycling infrastructure", "Excellent work-life balance", "Very English-friendly", "Clean and sustainable city", "2-year Establishment Card after graduation"], cons: ["Very expensive cost of living", "Tough housing market", "Dark winters", "Danish is hard to learn", "High taxes"] },
  { name: "Paris", country: "France", population: 2161000, isCapital: true, averageRentSingle: 1100, averageRentShared: 650, monthlyLivingCost: 1200, qualityOfLifeScore: 8, safetyScore: 7, publicTransportScore: 9, studentFriendliness: 8, internetSpeed: 150, language: "French", englishFriendliness: 5, climate: "Oceanic, mild winters, warm summers", pros: ["World-class culture, food, and architecture", "Excellent Metro system", "Many prestigious universities", "Central European travel hub", "Rich student life and social scene"], cons: ["Expensive housing especially in center", "French strongly expected in daily life", "Bureaucracy is legendary", "Some areas feel unsafe at night", "Crowded and noisy"] },
  { name: "Milan", country: "Italy", population: 1352000, isCapital: false, averageRentSingle: 850, averageRentShared: 500, monthlyLivingCost: 900, qualityOfLifeScore: 7, safetyScore: 7, publicTransportScore: 7, studentFriendliness: 7, internetSpeed: 100, language: "Italian", englishFriendliness: 5, climate: "Humid subtropical, foggy winters, hot summers", pros: ["Fashion and design capital", "Strong economy — best job market in Italy", "Good international flight connections", "Income-based tuition at public universities", "Close to lakes and Alps"], cons: ["Expensive by Italian standards", "Air pollution and fog in winter", "Italian needed for most daily interactions", "Public transport strikes", "Hot and humid summers"] },
  { name: "Bologna", country: "Italy", population: 394000, isCapital: false, averageRentSingle: 600, averageRentShared: 350, monthlyLivingCost: 700, qualityOfLifeScore: 8, safetyScore: 8, publicTransportScore: 7, studentFriendliness: 9, internetSpeed: 80, language: "Italian", englishFriendliness: 4, climate: "Humid subtropical, cold foggy winters, hot summers", pros: ["Very student-friendly (oldest university in Western world)", "Excellent food scene (food capital of Italy)", "Affordable by Western European standards", "Compact and walkable", "Vibrant nightlife for students"], cons: ["Italian essential for daily life", "Hot and humid summers", "Foggy winters", "Limited English-speaking community", "Smaller job market"] },
  { name: "Barcelona", country: "Spain", population: 1621000, isCapital: false, averageRentSingle: 800, averageRentShared: 450, monthlyLivingCost: 850, qualityOfLifeScore: 9, safetyScore: 7, publicTransportScore: 8, studentFriendliness: 9, internetSpeed: 120, language: "Spanish/Catalan", englishFriendliness: 6, climate: "Mediterranean, mild winters, hot summers, sunny", pros: ["Excellent weather and beaches", "Vibrant culture and nightlife", "Growing tech scene", "Affordable compared to Northern Europe", "30h/week work allowed"], cons: ["Pickpocketing and petty crime", "Tourist overcrowding", "Spanish/Catalan needed for most jobs", "Summer heat waves", "Housing prices rising fast"] },
  { name: "Lisbon", country: "Portugal", population: 545000, isCapital: true, averageRentSingle: 700, averageRentShared: 400, monthlyLivingCost: 750, qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 7, studentFriendliness: 8, internetSpeed: 110, language: "Portuguese", englishFriendliness: 7, climate: "Mediterranean, mild winters, hot dry summers, sunny", pros: ["Affordable Western European capital", "Growing tech hub (Web Summit host)", "Excellent weather year-round", "Very safe", "Friendly and welcoming people"], cons: ["Salaries are low compared to cost", "Housing prices rising rapidly", "Hilly — tough on foot", "Portuguese helps for better prospects", "Public transport could be better"] },
  { name: "Prague", country: "Czech Republic", population: 1309000, isCapital: true, averageRentSingle: 550, averageRentShared: 320, monthlyLivingCost: 600, qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 9, studentFriendliness: 9, internetSpeed: 100, language: "Czech", englishFriendliness: 7, climate: "Continental, cold winters, warm summers", pros: ["Extremely affordable for students", "Beautiful historic city", "Excellent public transport", "Central European location", "Strong and growing IT sector"], cons: ["Czech language barrier outside center", "Tourism crowds in old town", "Air pollution in winter", "Bureaucratic visa processes", "Lower salaries than Western Europe"] },
  { name: "Warsaw", country: "Poland", population: 1794000, isCapital: true, averageRentSingle: 500, averageRentShared: 300, monthlyLivingCost: 550, qualityOfLifeScore: 7, safetyScore: 8, publicTransportScore: 8, studentFriendliness: 8, internetSpeed: 130, language: "Polish", englishFriendliness: 7, climate: "Continental, cold winters, warm summers", pros: ["Lowest cost of living among EU capitals", "Fastest-growing tech hub in CEE", "Modern city with lots of development", "Good English in tech/business", "Fast visa processing"], cons: ["Polish is difficult to learn", "Cold grey winters", "Less charming than Krakow/Prague", "Air quality issues in winter", "Conservative political climate"] },
  { name: "Oslo", country: "Norway", population: 697000, isCapital: true, averageRentSingle: 1100, averageRentShared: 650, monthlyLivingCost: 1300, qualityOfLifeScore: 9, safetyScore: 9, publicTransportScore: 8, studentFriendliness: 7, internetSpeed: 160, language: "Norwegian", englishFriendliness: 9, climate: "Continental/subarctic, cold dark winters, mild bright summers", pros: ["Free tuition for all nationalities", "Stunning nature nearby (fjords, forests)", "High English proficiency", "Very safe and clean", "Excellent outdoor lifestyle"], cons: ["Extremely expensive cost of living", "Dark winters (6h daylight December)", "Limited English-taught Master's options", "Small and quiet city", "Difficult to find part-time work"] },
  { name: "Espoo", country: "Finland", population: 292000, isCapital: false, averageRentSingle: 750, averageRentShared: 450, monthlyLivingCost: 850, qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 8, studentFriendliness: 9, internetSpeed: 150, language: "Finnish", englishFriendliness: 8, climate: "Subarctic/continental, very cold dark winters, mild bright summers", pros: ["Aalto University campus is excellent", "Safe and clean environment", "Good public transport to Helsinki", "2-year post-study permit", "Growing startup ecosystem"], cons: ["Very cold and dark winters", "Finnish is extremely difficult", "Small city — limited nightlife", "Remote location in Europe", "Limited job market outside tech"] },
  { name: "Vienna", country: "Austria", population: 1912000, isCapital: true, averageRentSingle: 700, averageRentShared: 420, monthlyLivingCost: 900, qualityOfLifeScore: 10, safetyScore: 9, publicTransportScore: 10, studentFriendliness: 9, internetSpeed: 120, language: "German", englishFriendliness: 7, climate: "Continental, cold winters, warm summers", pros: ["#1 most livable city in the world", "Excellent and cheap public transport (365€/year)", "Rich cultural scene (opera, museums)", "Affordable for Western European capital", "Central location for European travel"], cons: ["Austrian German differs from standard German", "Can feel formal/reserved socially", "Smaller job market than Germany", "Bureaucracy in German only", "Some areas outside center are dull"] },
  { name: "Leuven", country: "Belgium", population: 101000, isCapital: false, averageRentSingle: 650, averageRentShared: 400, monthlyLivingCost: 850, qualityOfLifeScore: 8, safetyScore: 9, publicTransportScore: 7, studentFriendliness: 10, internetSpeed: 120, language: "Dutch", englishFriendliness: 8, climate: "Maritime, mild winters, cool summers, rainy", pros: ["Ultimate student city — 1 in 3 residents is a student", "KU Leuven campus integrated into city", "Very safe and compact", "Close to Brussels (25 min train)", "Affordable for Belgium"], cons: ["Very small — can feel limiting", "Rainy grey weather", "Quiet during summer/holidays", "Dutch language barrier", "Limited job market locally"] },
  { name: "Dublin", country: "Ireland", population: 1228000, isCapital: true, averageRentSingle: 1400, averageRentShared: 800, monthlyLivingCost: 1300, qualityOfLifeScore: 8, safetyScore: 7, publicTransportScore: 6, studentFriendliness: 7, internetSpeed: 130, language: "English", englishFriendliness: 10, climate: "Maritime, mild wet winters, cool summers, rainy", pros: ["Native English-speaking — no language barrier", "European HQ of Google, Meta, Apple, Stripe", "Friendly welcoming culture", "2-year graduate visa", "Strong tech job market"], cons: ["Severe housing crisis — highest rents in EU", "Expensive cost of living overall", "Poor public transport", "Rainy weather year-round", "GNIB registration fee (€300)"] },
]

// Institution-only university data
const institutionData = [
  { name: "Technical University of Munich", country: "Germany", city: "Munich", ranking: 28, websiteUrl: "https://www.tum.de", notes: "Strong research focus." },
  { name: "Delft University of Technology", country: "Netherlands", city: "Delft", ranking: 48, websiteUrl: "https://www.tudelft.nl", notes: "Leading technical university in the Netherlands." },
  { name: "ETH Zurich", country: "Switzerland", city: "Zurich", ranking: 7, websiteUrl: "https://www.ethz.ch", notes: "World-leading science and technology university." },
  { name: "KTH Royal Institute of Technology", country: "Sweden", city: "Stockholm", ranking: 73, websiteUrl: "https://www.kth.se", notes: "Sweden's largest technical university." },
  { name: "University of Amsterdam", country: "Netherlands", city: "Amsterdam", ranking: 53, websiteUrl: "https://www.uva.nl", notes: "Strong in AI and data science." },
  { name: "Politecnico di Milano", country: "Italy", city: "Milan", ranking: 111, websiteUrl: "https://www.polimi.it", notes: "Italy's largest technical university." },
  { name: "University of Copenhagen", country: "Denmark", city: "Copenhagen", ranking: 79, websiteUrl: "https://www.ku.dk", notes: "Denmark's oldest and largest university." },
  { name: "TU Berlin", country: "Germany", city: "Berlin", ranking: 147, websiteUrl: "https://www.tu.berlin", notes: "No tuition fees in Berlin." },
  { name: "Aalto University", country: "Finland", city: "Espoo", ranking: 109, websiteUrl: "https://www.aalto.fi", notes: "Strong design and technology focus." },
  { name: "Sorbonne University", country: "France", city: "Paris", ranking: 41, websiteUrl: "https://www.sorbonne-universite.fr", notes: "Public university with low tuition." },
  { name: "University of Warsaw", country: "Poland", city: "Warsaw", ranking: 262, websiteUrl: "https://www.uw.edu.pl", notes: "Very affordable cost of living." },
  { name: "KU Leuven", country: "Belgium", city: "Leuven", ranking: 63, websiteUrl: "https://www.kuleuven.be", notes: "Belgium's highest-ranked university." },
  { name: "University of Barcelona", country: "Spain", city: "Barcelona", ranking: 149, websiteUrl: "https://www.ub.edu", notes: "Great value for the cost." },
  { name: "RWTH Aachen University", country: "Germany", city: "Aachen", ranking: 99, websiteUrl: "https://www.rwth-aachen.de", notes: "No tuition, only semester fee." },
  { name: "University of Oslo", country: "Norway", city: "Oslo", ranking: 117, websiteUrl: "https://www.uio.no", notes: "Free tuition for all nationalities." },
  { name: "University of Bologna", country: "Italy", city: "Bologna", ranking: 133, websiteUrl: "https://www.unibo.it", notes: "Oldest university in the Western world." },
  { name: "Charles University", country: "Czech Republic", city: "Prague", ranking: 246, websiteUrl: "https://www.cuni.cz", notes: "Strong CS program." },
  { name: "University of Lisbon", country: "Portugal", city: "Lisbon", ranking: 187, websiteUrl: "https://www.ulisboa.pt", notes: "Growing tech hub." },
  { name: "University of Vienna", country: "Austria", city: "Vienna", ranking: 137, websiteUrl: "https://www.univie.ac.at", notes: "Very affordable for EU students." },
  { name: "Trinity College Dublin", country: "Ireland", city: "Dublin", ranking: 87, websiteUrl: "https://www.tcd.ie", notes: "Ireland's top university." },
]

// Program data (one per university)
const programData = [
  { name: "MSc Computer Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 240, tuitionCurrency: "EUR", tuitionPeriod: "Semester" as const, gpaRequirement: 2.5, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Bachelor's degree", "Statement of purpose", "Letters of recommendation"], scholarshipAvailable: false, applicationDeadline: new Date("2026-05-31"), notes: "No tuition for EU students." },
  { name: "MSc Robotics", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 21500, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.0, ieltsRequirement: 7.0, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Reference letters", "BSc thesis summary"], scholarshipAvailable: true, scholarshipDetails: "Holland Scholarship (€5,000 one-time)", applicationDeadline: new Date("2026-04-01"), notes: "Highly competitive." },
  { name: "MSc Data Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 1460, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.5, ieltsRequirement: 7.0, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Reference letters", "BSc diploma"], scholarshipAvailable: true, scholarshipDetails: "ETH-D Scholarship, ESOP", applicationDeadline: new Date("2025-12-15"), notes: "Extremely competitive." },
  { name: "MSc Machine Learning", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 27000, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.0, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Letters of recommendation"], scholarshipAvailable: true, scholarshipDetails: "KTH Scholarship, Swedish Institute Scholarship", applicationDeadline: new Date("2026-01-15"), notes: "Strong industry connections." },
  { name: "MSc Artificial Intelligence", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 17700, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, ieltsRequirement: 7.0, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Writing sample"], scholarshipAvailable: true, scholarshipDetails: "Amsterdam Merit Scholarship", applicationDeadline: new Date("2026-03-01"), notes: "Two-year program." },
  { name: "MSc Computer Science & Engineering", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 3900, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 2.8, ieltsRequirement: 6.0, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Reference letters"], scholarshipAvailable: true, scholarshipDetails: "Merit-based tuition reduction", applicationDeadline: new Date("2026-05-31"), notes: "Milan is expensive but great lifestyle." },
  { name: "MSc Computer Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 16800, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.0, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Statement of purpose", "Course descriptions"], scholarshipAvailable: false, applicationDeadline: new Date("2026-01-15"), notes: "Free for EU/EEA." },
  { name: "MSc Scientific Computing", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 310, tuitionCurrency: "EUR", tuitionPeriod: "Semester" as const, ieltsRequirement: 6.0, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "BSc certificate"], scholarshipAvailable: false, applicationDeadline: new Date("2026-06-15"), notes: "No tuition fees in Berlin." },
  { name: "MSc Human-Computer Interaction", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 15000, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.2, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Portfolio recommended"], scholarshipAvailable: true, scholarshipDetails: "Aalto Excellence Scholarship", applicationDeadline: new Date("2026-01-02"), notes: "Early deadline." },
  { name: "MSc Computer Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 3770, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, ieltsRequirement: 6.0, requiredDocuments: ["CV", "Transcripts", "Cover letter", "Reference letters"], scholarshipAvailable: true, scholarshipDetails: "Eiffel Excellence Scholarship", applicationDeadline: new Date("2026-05-15"), notes: "Low tuition." },
  { name: "BSc Computer Science", degreeLevel: "Bachelor" as const, languageOfInstruction: "English", tuitionFee: 3500, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, ieltsRequirement: 6.0, requiredDocuments: ["High school diploma", "Transcripts", "English proficiency proof"], scholarshipAvailable: false, applicationDeadline: new Date("2026-07-15"), notes: "Very affordable." },
  { name: "MSc Computer Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 7000, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.0, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Course descriptions"], scholarshipAvailable: true, scholarshipDetails: "VLIR-UOS Scholarship", applicationDeadline: new Date("2026-06-01"), notes: "Strong in AI research." },
  { name: "MSc Data Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 5700, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, ieltsRequirement: 6.0, requiredDocuments: ["CV", "Transcripts", "Motivation letter"], scholarshipAvailable: false, applicationDeadline: new Date("2026-06-30"), notes: "Great value." },
  { name: "MSc Software Systems Engineering", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 310, tuitionCurrency: "EUR", tuitionPeriod: "Semester" as const, gpaRequirement: 2.5, ieltsRequirement: 6.5, toeflRequirement: 90, requiredDocuments: ["CV", "Transcripts", "GRE recommended", "Statement of purpose", "Letters of recommendation"], scholarshipAvailable: false, applicationDeadline: new Date("2026-03-01"), notes: "No tuition." },
  { name: "MSc Informatics: Language Technology", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 0, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.0, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Reference letters"], scholarshipAvailable: false, applicationDeadline: new Date("2025-12-01"), notes: "Free tuition." },
  { name: "MSc Digital Humanities & Digital Knowledge", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 3300, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, ieltsRequirement: 6.0, requiredDocuments: ["CV", "Transcripts", "Cover letter", "Writing sample"], scholarshipAvailable: true, scholarshipDetails: "Unibo Action 1&2", applicationDeadline: new Date("2026-07-15"), notes: "Very student-friendly." },
  { name: "BSc Computer Science", degreeLevel: "Bachelor" as const, languageOfInstruction: "English", tuitionFee: 7600, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, ieltsRequirement: 6.0, requiredDocuments: ["High school diploma", "Transcripts", "English proficiency proof", "Entrance exam"], scholarshipAvailable: false, applicationDeadline: new Date("2026-06-30"), notes: "Strong CS program." },
  { name: "MSc Data Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 7000, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Motivation letter", "Reference letters"], scholarshipAvailable: false, applicationDeadline: new Date("2026-06-15"), notes: "Growing tech hub." },
  { name: "MSc Computer Science", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 750, tuitionCurrency: "EUR", tuitionPeriod: "Semester" as const, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "BSc diploma", "Course descriptions"], scholarshipAvailable: false, applicationDeadline: new Date("2026-06-05"), notes: "Very affordable." },
  { name: "MSc Computer Science — Intelligent Systems", degreeLevel: "Master" as const, languageOfInstruction: "English", tuitionFee: 25600, tuitionCurrency: "EUR", tuitionPeriod: "Year" as const, gpaRequirement: 3.0, ieltsRequirement: 6.5, requiredDocuments: ["CV", "Transcripts", "Personal statement", "References"], scholarshipAvailable: true, scholarshipDetails: "Trinity International Scholarship", applicationDeadline: new Date("2026-06-30"), notes: "Strong tech sector." },
]

// Application data (one per program)
const appMeta: Array<{
  status: string
  deadline: Date
  notes: string
  progress: Record<string, unknown>
}> = [
  { status: "Accepted", deadline: new Date("2026-05-31"), notes: "Strong research focus.", progress: { documentsObtained: ["CV", "Transcripts", "Bachelor's degree", "Statement of purpose", "Letters of recommendation"], ieltsTaken: true, ieltsScore: 7.5, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2026-02-01"), visaApplied: true, visaApproved: true, interviewCompleted: true, interviewScheduled: new Date("2026-03-10") } },
  { status: "Applied", deadline: new Date("2026-04-01"), notes: "Highly competitive program.", progress: { documentsObtained: ["CV", "Transcripts", "Motivation letter", "Reference letters", "BSc thesis summary"], ieltsTaken: true, ieltsScore: 7.5, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2026-01-20"), visaApplied: false, interviewCompleted: false } },
  { status: "Rejected", deadline: new Date("2025-12-15"), notes: "Extremely competitive.", progress: { documentsObtained: ["CV", "Transcripts", "Motivation letter", "Reference letters", "BSc diploma"], ieltsTaken: true, ieltsScore: 7.0, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2025-10-15"), visaApplied: false, interviewCompleted: false } },
  { status: "Applied", deadline: new Date("2026-01-15"), notes: "Strong industry connections.", progress: { documentsObtained: ["CV", "Transcripts", "Motivation letter", "Letters of recommendation"], ieltsTaken: true, ieltsScore: 7.0, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2026-03-15"), visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-03-01"), notes: "Two-year program.", progress: { documentsObtained: ["CV", "Transcripts"], ieltsTaken: false, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 1, sopStatus: "draft", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-05-31"), notes: "Income-based tuition.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-01-15"), notes: "Free for EU/EEA.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-06-15"), notes: "No tuition in Berlin.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-01-02"), notes: "Early deadline.", progress: { documentsObtained: ["CV", "Transcripts"], ieltsTaken: false, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 1, sopStatus: "draft", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-05-15"), notes: "Low tuition.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-07-15"), notes: "Very affordable.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-06-01"), notes: "Strong in AI.", progress: { documentsObtained: ["CV", "Transcripts"], ieltsTaken: false, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 1, sopStatus: "draft", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-06-30"), notes: "Great value.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Accepted", deadline: new Date("2026-03-01"), notes: "No tuition.", progress: { documentsObtained: ["CV", "Transcripts", "GRE recommended", "Statement of purpose", "Letters of recommendation"], ieltsTaken: true, ieltsScore: 7.5, toeflTaken: true, toeflScore: 100, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2026-02-01"), visaApplied: true, visaApproved: true, interviewCompleted: true, interviewScheduled: new Date("2026-03-10") } },
  { status: "Rejected", deadline: new Date("2025-12-01"), notes: "Free tuition.", progress: { documentsObtained: ["CV", "Transcripts", "Motivation letter", "Reference letters"], ieltsTaken: true, ieltsScore: 7.0, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2025-10-15"), visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-07-15"), notes: "Very student-friendly.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Enrolled", deadline: new Date("2026-06-30"), notes: "Enrolled for fall 2026.", progress: { documentsObtained: ["High school diploma", "Transcripts", "English proficiency proof", "Entrance exam"], ieltsTaken: true, ieltsScore: 6.5, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2026-01-10"), visaApplied: true, visaApproved: true, interviewCompleted: true, interviewScheduled: new Date("2026-04-15") } },
  { status: "Preparing", deadline: new Date("2026-06-15"), notes: "Growing tech hub.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Preparing", deadline: new Date("2026-06-05"), notes: "Very affordable.", progress: { documentsObtained: [], ieltsTaken: false, gpaVerified: false, recommendationsRequested: 0, recommendationsReceived: 0, sopStatus: "not_started", applicationFeePaid: false, visaApplied: false, interviewCompleted: false } },
  { status: "Applied", deadline: new Date("2026-06-30"), notes: "Strong tech sector.", progress: { documentsObtained: ["CV", "Transcripts", "Personal statement", "References"], ieltsTaken: true, ieltsScore: 7.0, gpaVerified: true, recommendationsRequested: 2, recommendationsReceived: 2, sopStatus: "final", applicationFeePaid: true, applicationSubmittedDate: new Date("2026-06-10"), visaApplied: false, interviewCompleted: false } },
]

export async function seedIfEmpty(): Promise<number> {
  const count = await University.countDocuments()
  if (count > 0) {
    console.log(`Skipping seed — ${count} universities already exist`)
    return 0
  }

  await Country.insertMany(countries)
  console.log(`Seeded ${countries.length} countries`)

  await City.insertMany(cities)
  console.log(`Seeded ${cities.length} cities`)

  // Seed default users
  const hashedPassword = await bcrypt.hash("password123", 10)

  const adminUser = await User.create({ email: "admin@test.com", passwordHash: hashedPassword, name: "Admin User", role: "admin" } as any)
  console.log(`Created admin user: ${adminUser.email}`)

  const agencyUser = await User.create({ email: "agency@test.com", passwordHash: hashedPassword, name: "Test Agency", role: "agency" } as any)
  console.log(`Created agency user: ${agencyUser.email}`)

  const studentUser = await User.create({ email: "student@test.com", passwordHash: hashedPassword, name: "Test Student", role: "student" } as any)
  console.log(`Created student user: ${studentUser.email}`)

  // Create Student records for the agency
  const ahmed = await Student.create({ name: "Ahmed Hassan", email: "ahmed@example.com", agencyId: agencyUser._id })
  const sarah = await Student.create({ name: "Sarah Miller", email: "sarah@example.com", agencyId: agencyUser._id })
  console.log(`Created 2 Student records for agency`)

  // Seed institutions (universities)
  const uniDocs = await University.insertMany(institutionData)
  console.log(`Seeded ${uniDocs.length} universities`)

  // Seed programs (one per university)
  const programDocs = await Program.insertMany(
    programData.map((p, i) => ({ ...p, universityId: uniDocs[i]!._id }))
  )
  console.log(`Seeded ${programDocs.length} programs`)

  // Seed applications (one per program)
  const appDocs = programDocs.map((prog, i) => {
    const meta = appMeta[i]!
    let extra: Record<string, unknown> = {}
    if (i < 5) {
      extra = { agencyId: agencyUser._id }
    } else if (i < 10) {
      extra = { agencyId: agencyUser._id }
    } else {
      extra = { createdBy: studentUser._id }
    }
    return {
      programId: prog._id,
      studentName: i < 5 ? "Ahmed Hassan" : i < 10 ? "Sarah Miller" : "Test Student",
      studentEmail: i < 5 ? "ahmed@example.com" : i < 10 ? "sarah@example.com" : "student@test.com",
      applicationStatus: meta.status,
      applicationDeadline: meta.deadline,
      applicationProgress: meta.progress,
      notes: meta.notes,
      ...extra,
    }
  })
  await Application.insertMany(appDocs)
  console.log(`Seeded ${appDocs.length} applications`)

  return uniDocs.length
}

// Standalone runner
async function run(): Promise<void> {
  const mongoose = await import("mongoose")
  const { MongoMemoryServer } = await import("mongodb-memory-server")

  const MONGODB_URI = process.env["MONGODB_URI"] ?? "mongodb://localhost:27017/wannaout"
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
  await Application.deleteMany({})
  await Program.deleteMany({})
  await University.deleteMany({})
  await Student.deleteMany({})
  await User.deleteMany({})
  console.log("Cleared existing data")

  await Country.insertMany(countries)
  console.log(`Inserted ${countries.length} countries`)

  await City.insertMany(cities)
  console.log(`Inserted ${cities.length} cities`)

  const hashedPassword = await bcrypt.hash("password123", 10)

  const adminUser = await User.create({ email: "admin@test.com", passwordHash: hashedPassword, name: "Admin User", role: "admin" } as any)
  console.log(`Created admin user: ${adminUser.email}`)

  const agencyUser = await User.create({ email: "agency@test.com", passwordHash: hashedPassword, name: "Test Agency", role: "agency" } as any)
  console.log(`Created agency user: ${agencyUser.email}`)

  const studentUser = await User.create({ email: "student@test.com", passwordHash: hashedPassword, name: "Test Student", role: "student" } as any)
  console.log(`Created student user: ${studentUser.email}`)

  const ahmed = await Student.create({ name: "Ahmed Hassan", email: "ahmed@example.com", agencyId: agencyUser._id })
  const sarah = await Student.create({ name: "Sarah Miller", email: "sarah@example.com", agencyId: agencyUser._id })
  console.log(`Created 2 Student records for agency`)

  const uniDocs = await University.insertMany(institutionData)
  console.log(`Inserted ${uniDocs.length} universities`)

  const programDocs = await Program.insertMany(
    programData.map((p, i) => ({ ...p, universityId: uniDocs[i]!._id }))
  )
  console.log(`Inserted ${programDocs.length} programs`)

  const appDocs = programDocs.map((prog, i) => {
    const meta = appMeta[i]!
    let extra: Record<string, unknown> = {}
    if (i < 5) { extra = { agencyId: agencyUser._id } }
    else if (i < 10) { extra = { agencyId: agencyUser._id } }
    else { extra = { createdBy: studentUser._id } }
    return {
      programId: prog._id,
      studentName: i < 5 ? "Ahmed Hassan" : i < 10 ? "Sarah Miller" : "Test Student",
      studentEmail: i < 5 ? "ahmed@example.com" : i < 10 ? "sarah@example.com" : "student@test.com",
      applicationStatus: meta.status,
      applicationDeadline: meta.deadline,
      applicationProgress: meta.progress,
      notes: meta.notes,
      ...extra,
    }
  })
  await Application.insertMany(appDocs)
  console.log(`Inserted ${appDocs.length} applications`)

  await mongoose.disconnect()
  console.log("Done.")
  ;(globalThis as any).process.exit(0)
}

if ((globalThis as any).require?.main === module) {
  run()
}
