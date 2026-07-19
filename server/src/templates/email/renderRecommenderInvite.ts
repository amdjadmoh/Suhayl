import { render } from "@react-email/render"
import RecommenderInvite, {
  type RecommenderInviteProps,
} from "./RecommenderInvite"

// ── Render ───────────────────────────────────────────────────────────────────

export async function renderRecommenderInvite(
  props: RecommenderInviteProps,
): Promise<{ html: string; text: string }> {
  const component = RecommenderInvite(props)
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true }),
  ])
  return { html, text }
}
