import { Country } from "./models/Country"
import { University } from "./models/University"

const countries = [
  {
    name: "Germany",
    currency: "EUR",
    livingCostEstimate: 900,
    visaRequirements:
      "Student visa (National Visa D). Proof of funds via blocked account (Sperrkonto) with €11,208/year. Health insurance mandatory. Visa interview at German embassy required.",
    visaAcceptanceRate: 92,
    visaBankAccountAmount: 11208,
    visaBankAccountLocked: true,
  },
  {
    name: "Netherlands",
    currency: "EUR",
    livingCostEstimate: 1100,
    visaRequirements:
      "MVV entry visa + residence permit. Proof of funds €1,200/month. TB test required for some nationalities. University sponsors the visa application.",
    visaAcceptanceRate: 88,
    visaBankAccountAmount: 14400,
    visaBankAccountLocked: false,
  },
  {
    name: "Switzerland",
    currency: "CHF",
    livingCostEstimate: 1800,
    visaRequirements:
      "National D visa for studies. Proof of sufficient funds (CHF 21,000/year). Cantonal migration office processes permits. Must leave Schengen to apply from home country.",
    visaAcceptanceRate: 78,
    visaBankAccountAmount: 21000,
    visaBankAccountLocked: false,
  },
  {
    name: "Sweden",
    currency: "SEK",
    livingCostEstimate: 900,
    visaRequirements:
      "Residence permit for studies. Proof of funds SEK 10,314/month. Online application via Migration Agency. Biometrics required at embassy.",
    visaAcceptanceRate: 85,
    visaBankAccountAmount: 123768,
    visaBankAccountLocked: false,
  },
  {
    name: "Italy",
    currency: "EUR",
    livingCostEstimate: 750,
    visaRequirements:
      "Student visa (Type D). Proof of funds €600/month, accommodation proof, and return flight. Visa appointment at Italian consulate — often long wait times.",
    visaAcceptanceRate: 90,
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
  },
  {
    name: "Denmark",
    currency: "DKK",
    livingCostEstimate: 1300,
    visaRequirements:
      "Student residence permit (ST1). Proof of funds DKK 6,397/month. Online application with biometrics. Processing time 2-3 months.",
    visaAcceptanceRate: 82,
    visaBankAccountAmount: 76764,
    visaBankAccountLocked: false,
  },
  {
    name: "Finland",
    currency: "EUR",
    livingCostEstimate: 850,
    visaRequirements:
      "Student residence permit. Proof of funds €6,720/year. Apply online via Enter Finland portal. Biometrics at Finnish embassy. Processing 1-2 months.",
    visaAcceptanceRate: 87,
    visaBankAccountAmount: 6720,
    visaBankAccountLocked: false,
  },
  {
    name: "United Kingdom",
    currency: "GBP",
    livingCostEstimate: 1100,
    visaRequirements:
      "Student visa (Tier 4). Proof of funds £1,023/month outside London (£1,334 in London). CAS from university required. NHS surcharge £776/year. Biometrics required.",
    visaAcceptanceRate: 96,
    visaBankAccountAmount: 12276,
    visaBankAccountLocked: false,
  },
  {
    name: "France",
    currency: "EUR",
    livingCostEstimate: 1000,
    visaRequirements:
      "VLS-TS student visa. Proof of funds €615/month. Campus France process for many countries. OFII validation within 3 months of arrival.",
    visaAcceptanceRate: 89,
    visaBankAccountAmount: 7380,
    visaBankAccountLocked: false,
  },
  {
    name: "Poland",
    currency: "PLN",
    livingCostEstimate: 500,
    visaRequirements:
      "National D visa for studies. Proof of funds PLN 800/month. Simple process compared to Western Europe. Visa processed in 2-4 weeks typically.",
    visaAcceptanceRate: 93,
    visaBankAccountAmount: 9600,
    visaBankAccountLocked: false,
  },
  {
    name: "Belgium",
    currency: "EUR",
    livingCostEstimate: 850,
    visaRequirements:
      "Long-stay student visa (Type D). Proof of funds €800/month. Medical certificate required. University assists with residence permit application.",
    visaAcceptanceRate: 86,
    visaBankAccountAmount: 9600,
    visaBankAccountLocked: false,
  },
  {
    name: "Spain",
    currency: "EUR",
    livingCostEstimate: 750,
    visaRequirements:
      "Student visa (Type D). Proof of funds €600/month. Medical certificate and criminal record check. Initial 90-day visa, then apply for TIE card in Spain.",
    visaAcceptanceRate: 91,
    visaBankAccountAmount: 7200,
    visaBankAccountLocked: false,
  },
  {
    name: "Norway",
    currency: "NOK",
    livingCostEstimate: 1400,
    visaRequirements:
      "Student residence permit. Proof of funds NOK 137,907/year. Must deposit to UDI account or show bank statement. Tuition-free but high living costs.",
    visaAcceptanceRate: 84,
    visaBankAccountAmount: 137907,
    visaBankAccountLocked: true,
  },
  {
    name: "Czech Republic",
    currency: "CZK",
    livingCostEstimate: 550,
    visaRequirements:
      "Long-term residence permit for studies. Proof of funds CZK 81,400/year. Criminal record extract required. Purpose-built accommodation proof helps application.",
    visaAcceptanceRate: 94,
    visaBankAccountAmount: 81400,
    visaBankAccountLocked: false,
  },
  {
    name: "Austria",
    currency: "EUR",
    livingCostEstimate: 900,
    visaRequirements:
      "Student residence permit. Proof of funds €585/month. Pre-approval from university needed. Quota system applies for some nationalities.",
    visaAcceptanceRate: 83,
    visaBankAccountAmount: 7020,
    visaBankAccountLocked: false,
  },
  {
    name: "Ireland",
    currency: "EUR",
    livingCostEstimate: 1200,
    visaRequirements:
      "Student visa (Stamp 2). Proof of funds €7,000/year. Private health insurance required. GNIB registration within 90 days. Strong English-speaking tech hub.",
    visaAcceptanceRate: 95,
    visaBankAccountAmount: 7000,
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
    tuitionFee: 730,
    tuitionCurrency: "CHF",
    tuitionPeriod: "Semester",
    livingCostEstimate: 1800,
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
    tuitionFee: 310000,
    tuitionCurrency: "SEK",
    tuitionPeriod: "Year",
    livingCostEstimate: 900,
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
    tuitionFee: 125000,
    tuitionCurrency: "DKK",
    tuitionPeriod: "Year",
    livingCostEstimate: 1300,
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
    name: "University of Edinburgh",
    country: "United Kingdom",
    city: "Edinburgh",
    ranking: 27,
    program: "MSc Artificial Intelligence",
    degreeLevel: "Master",
    languageOfInstruction: "English",
    tuitionFee: 38500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "Year",
    livingCostEstimate: 1000,
    applicationDeadline: new Date("2026-07-31"),
    applicationStatus: "Applied",
    requiredDocuments: [
      "CV",
      "Transcripts",
      "Personal statement",
      "References",
    ],
    gpaRequirement: 3.3,
    ieltsRequirement: 7.0,
    scholarshipAvailable: true,
    scholarshipDetails: "Edinburgh Global Masters Scholarship, Chevening",
    websiteUrl: "https://www.ed.ac.uk",
    notes:
      "Rolling admissions — earlier application recommended. One-year intensive program.",
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
    tuitionCurrency: "NOK",
    tuitionPeriod: "Year",
    livingCostEstimate: 1400,
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
