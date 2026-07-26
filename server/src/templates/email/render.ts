import { render } from "@react-email/render"
import DeadlineReminder, {
  type DeadlineReminderProps,
} from "./DeadlineReminder"
import ForgotPassword, {
  type ForgotPasswordProps,
} from "./ForgotPassword"

// ── Render ──────────────────────────────────────────────────────────────────

export async function renderDeadlineReminder(
  props: DeadlineReminderProps,
): Promise<{ html: string; text: string }> {
  const component = DeadlineReminder(props)
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true }),
  ])
  return { html, text }
}

export async function renderForgotPassword(
  props: ForgotPasswordProps,
): Promise<{ html: string; text: string }> {
  const component = ForgotPassword(props)
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true }),
  ])
  return { html, text }
}
