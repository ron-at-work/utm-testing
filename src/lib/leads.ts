export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export type MarketingAttribution = Partial<
  Record<UtmKey, string> & {
    campaign_id: string;
    campaign_name: string;
    ad_group_id: string;
    ad_group_name: string;
    ad_id: string;
    ad_name: string;
    landing_page_url: string;
  }
>;

export type LeadPayload = {
  lead: {
    name: string;
    email?: string;
    notes?: string[];
    marketing_attribution: MarketingAttribution;
  };
};

export const DEFAULT_API = {
  apiBase: "http://api-dev.houseofapps.ai",
  apiPath: "/v1/integrations/leads",
  licenseKey: "lic-IMK4C8FcTTgK+BdNCD2FaLDq4pUNo8EFW4d",
  appSecret:
    "SFMyNTY.g3QAAAACZAAEZGF0YXQAAAADbQAAAAlhY2NvdW50SWRtAAAAGDY5MWFkMjdjMzQ4ZjcwZjUxOGVlMDA1M20AAAAIa2V5c2V0SWRtAAAAJGExMjMzMGM1LWFiZjQtNDZhOS05ZGRkLWNkNzZhYTUzYTlhNW0AAAAJcHJvamVjdElkbQAAACQxYWRkNmQ0Ni1jODg2LTQ3MzYtOTMxMi01NmJiOWM3NDRkOWZkAAZzaWduZWRuBgBTnDHbmwE.qR_VXQByMMqOI3H2qenPSdwF-pAP7JbbA-RXD4X1I58",
};

export const GOOGLE_ADS_UTMS: Record<UtmKey, string> = {
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "dental-leads",
  utm_content: "dental-implants",
  utm_term: "dental implants",
};

export const GOOGLE_ADS_CAMPAIGN = {
  campaign_id: "123456",
  campaign_name: "Dental Leads",
  ad_group_id: "789012",
  ad_group_name: "Dental Implants",
  ad_id: "456789",
  ad_name: "Dental Implants - Free Consultation",
};

export function readUtmsFromSearch(search: string): Partial<Record<UtmKey, string>> {
  const params = new URLSearchParams(search);
  const out: Partial<Record<UtmKey, string>> = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

export function omitEmpty<T extends Record<string, string | undefined>>(
  obj: T,
): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v != null && String(v).trim() !== "") {
      (out as Record<string, string>)[k] = String(v).trim();
    }
  }
  return out;
}

export function buildLeadPayload(input: {
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  attribution: MarketingAttribution;
}): LeadPayload {
  const notes: string[] = [];
  if (input.phone.trim()) notes.push("Phone: " + input.phone.trim());
  if (input.city.trim()) notes.push("City: " + input.city.trim());
  if (input.message.trim()) notes.push(input.message.trim());

  const lead: LeadPayload["lead"] = {
    name: input.name.trim(),
    marketing_attribution: omitEmpty(
      input.attribution as Record<string, string>,
    ) as MarketingAttribution,
  };
  if (input.email.trim()) lead.email = input.email.trim();
  if (notes.length) lead.notes = notes;
  return { lead };
}

export function shellEscapeSingle(s: string) {
  return "'" + String(s).replace(/'/g, "'\\''") + "'";
}

export function buildCurl(
  url: string,
  headers: Record<string, string>,
  body: unknown,
) {
  const lines = [`curl --location ${shellEscapeSingle(url)}`];
  for (const [k, v] of Object.entries(headers)) {
    lines.push(`--header ${shellEscapeSingle(`${k}: ${v}`)}`);
  }
  lines.push(`--data ${shellEscapeSingle(JSON.stringify(body, null, 2))}`);
  return lines.join(" \\\n");
}

export async function createLead(opts: {
  apiBase: string;
  apiPath: string;
  licenseKey: string;
  appSecret: string;
  body: LeadPayload;
}) {
  const base = opts.apiBase.trim().replace(/\/+$/, "");
  let path = opts.apiPath.trim() || "/v1/integrations/leads";
  if (!path.startsWith("/")) path = "/" + path;
  const url = base + path;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    licenseKey: opts.licenseKey.trim(),
    appSecret: opts.appSecret.trim(),
  };
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(opts.body),
  });
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* raw */
  }
  return { url, headers, res, parsed, curl: buildCurl(url, headers, opts.body) };
}
