import { render } from "@react-email/render"
import DeadlineReminder, {
  type DeadlineReminderProps,
} from "./DeadlineReminder"

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
