/*
 * Plain, readable emails for the agency features: one heading, a few lines,
 * one button. Inline styles only, because most email apps ignore stylesheets.
 */

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export function simpleEmail({
  heading,
  lines,
  buttonText,
  url,
  footer,
}: {
  heading: string
  lines: string[]
  buttonText: string
  url: string
  footer?: string
}): { html: string; text: string } {
  const html = `<!doctype html><html><body style="margin:0;background:#f4f5f9;font-family:Arial,Helvetica,sans-serif;color:#17181d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:32px">
<tr><td style="font-size:15px;font-weight:bold;color:#2952cc;padding-bottom:20px">&#10022; Suhayl</td></tr>
<tr><td style="font-size:22px;font-weight:bold;line-height:1.3;padding-bottom:12px">${escape(heading)}</td></tr>
${lines.map((l) => `<tr><td style="font-size:15px;line-height:1.6;color:#474b57;padding-bottom:10px">${escape(l)}</td></tr>`).join("")}
<tr><td style="padding:18px 0 22px"><a href="${escape(url)}" style="display:inline-block;background:#2952cc;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 22px;border-radius:999px">${escape(buttonText)}</a></td></tr>
<tr><td style="font-size:12px;line-height:1.5;color:#6f7381">If the button doesn't work, copy this link:<br><span style="word-break:break-all">${escape(url)}</span></td></tr>
${footer ? `<tr><td style="font-size:12px;line-height:1.5;color:#6f7381;padding-top:14px">${escape(footer)}</td></tr>` : ""}
</table></td></tr></table></body></html>`
  const text = [heading, "", ...lines, "", `${buttonText}: ${url}`, ...(footer ? ["", footer] : [])].join("\n")
  return { html, text }
}

/** "Your agency needs …" with the family link, in French first since families read French. */
export function documentRequestEmail({
  studentName,
  agencyName,
  titles,
  portalUrl,
  dueDate,
}: {
  studentName: string
  agencyName: string
  titles: string[]
  portalUrl: string
  dueDate?: Date
}): { subject: string; html: string; text: string } {
  const list = titles.join(", ")
  const due = dueDate ? ` avant le ${dueDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}` : ""
  const { html, text } = simpleEmail({
    heading: `Documents demandés pour ${studentName}`,
    lines: [
      `${agencyName} a besoin de : ${list}${due}.`,
      "Ouvrez votre lien privé pour envoyer un PDF ou une photo. Aucun compte n'est nécessaire.",
      `${agencyName} needs: ${list}. Open your private link to upload them.`,
    ],
    buttonText: "Envoyer les documents",
    url: portalUrl,
    footer: "Ce lien est privé : ne le partagez qu'avec votre famille.",
  })
  return { subject: `${agencyName} : documents à envoyer pour ${studentName}`, html, text }
}
