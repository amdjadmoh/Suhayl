/** Something a counsellor has to do for this student. */
export interface StudentTask {
  _id: string
  text: string
  dueDate?: string
  done: boolean
  doneAt?: string
  createdAt: string
}

/** Money the family has paid the agency. */
export interface StudentPayment {
  _id: string
  amount: number
  paidAt: string
  method?: string
  note?: string
}

export interface Student {
  _id: string
  name: string
  email: string
  phone?: string
  notes?: string
  // Academic profile, used to match programs to the student
  gpa?: number | null
  ieltsScore?: number | null
  monthlyBudget?: number | null
  preferredCountries?: string[]
  degreeLevel?: string
  targetIntake?: string
  /** Set while the family link is on */
  portalToken?: string
  portalEnabledAt?: string
  portalExpiresAt?: string
  // The agency's own work and money for this student
  tasks?: StudentTask[]
  feeAgreed?: number | null
  feeCurrency?: string
  payments?: StudentPayment[]
  /** The counsellor looking after this student */
  counsellorId?: string | null
  agencyId: string
  createdAt: string
  updatedAt: string
}
