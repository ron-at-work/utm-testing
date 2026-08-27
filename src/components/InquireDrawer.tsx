import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_API,
  GOOGLE_ADS_CAMPAIGN,
  UTM_KEYS,
  buildCurl,
  buildLeadPayload,
  createLead,
  omitEmpty,
  readUtmsFromSearch,
  type UtmKey,
} from "../lib/leads";

type Props = {
  open: boolean;
  onClose: () => void;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  message: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  landing_page_url: "",
  ...GOOGLE_ADS_CAMPAIGN,
};

export default function InquireDrawer({ open, onClose }: Props) {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(emptyForm);
  const [api, setApi] = useState(DEFAULT_API);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [debug, setDebug] = useState<{
    request: string;
    response: string;
    curl: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  const urlUtms = useMemo(
    () => readUtmsFromSearch(searchParams.toString() ? `?${searchParams.toString()}` : ""),
    [searchParams],
  );

  useEffect(() => {
    if (!open) return;
    const landing = window.location.href;
    setForm((prev) => ({
      ...prev,
      ...Object.fromEntries(UTM_KEYS.map((k) => [k, urlUtms[k] || ""])),
      landing_page_url: landing,
    }));
  }, [open, urlUtms]);

  useEffect(() => {
    document.body.classList.toggle("form-open", open);
    return () => document.body.classList.remove("form-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);

    if (!api.licenseKey.trim() || !api.appSecret.trim()) {
      setStatus({ kind: "err", text: "Dev settings → licenseKey + appSecret" });
      return;
    }

    const attribution = omitEmpty({
      utm_source: form.utm_source,
      utm_medium: form.utm_medium,
      utm_campaign: form.utm_campaign,
      utm_content: form.utm_content,
      utm_term: form.utm_term,
      campaign_id: form.campaign_id,
      campaign_name: form.campaign_name,
      ad_group_id: form.ad_group_id,
      ad_group_name: form.ad_group_name,
      ad_id: form.ad_id,
      ad_name: form.ad_name,
      landing_page_url: form.landing_page_url || window.location.href,
    });

    const body = buildLeadPayload({
      name: form.name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      message: form.message,
      attribution,
    });

    const redactedHeaders = {
      "Content-Type": "application/json",
      licenseKey: "***",
      appSecret: "***",
    };

    setSending(true);
    try {
      const result = await createLead({ ...api, body });
      setDebug({
        request: JSON.stringify(
          {
            method: "POST",
            url: result.url,
            headers: redactedHeaders,
            body,
          },
          null,
          2,
        ),
        response: JSON.stringify(result.parsed, null, 2),
        curl: result.res.ok
          ? result.curl
          : `# If CORS blocked, run:\n${result.curl}`,
      });

      if (result.res.ok) {
        setStatus({
          kind: "ok",
          text: "Inquiry sent — check CRM Marketing attribution",
        });
        setForm((prev) => ({
          ...emptyForm,
          ...Object.fromEntries(UTM_KEYS.map((k) => [k, urlUtms[k] || ""])),
          landing_page_url: window.location.href,
          campaign_id: prev.campaign_id,
          campaign_name: prev.campaign_name,
          ad_group_id: prev.ad_group_id,
          ad_group_name: prev.ad_group_name,
          ad_id: prev.ad_id,
          ad_name: prev.ad_name,
        }));
      } else {
        setStatus({
          kind: "err",
          text: `HTTP ${result.res.status} — see debug / curl`,
        });
      }
    } catch (err) {
      const bodyForCurl = body;
      const headers = {
        "Content-Type": "application/json",
        licenseKey: api.licenseKey,
        appSecret: api.appSecret,
      };
      const url =
        api.apiBase.replace(/\/+$/, "") +
        (api.apiPath.startsWith("/") ? api.apiPath : "/" + api.apiPath);
      setDebug({
        request: JSON.stringify({ url, headers: redactedHeaders, body }, null, 2),
        response: String(err),
        curl: `# Network / CORS — run:\n${buildCurl(url, headers, bodyForCurl)}`,
      });
      setStatus({ kind: "err", text: "Network / CORS — use curl below" });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div
        className={`backdrop${open ? " show" : ""}`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        className={`side${open ? " open" : ""}`}
        id="inquire"
        aria-label="Admissions inquiry form"
        aria-hidden={!open}
      >
        <div className="side-head">
          <div>
            <h2>Apply / inquire</h2>
            <p>Form sends a CRM lead with full marketing attribution.</p>
          </div>
          <button type="button" className="close-form" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="utm-strip">
          {UTM_KEYS.some((k) => urlUtms[k]) ? (
            UTM_KEYS.filter((k) => urlUtms[k]).map((k) => (
              <span key={k} className="utm-pill on">
                {k.replace("utm_", "")}: {urlUtms[k]}
              </span>
            ))
          ) : (
            <span className="utm-pill">No UTMs in URL yet</span>
          )}
        </div>

        <form id="leadForm" onSubmit={onSubmit}>
          <p className="section-label">Student / contact</p>
          <label>
            Full name *
            <input
              required
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Jordan Lee"
              autoComplete="name"
            />
          </label>
          <div className="row2">
            <label>
              Email *
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+1 555 0100"
                autoComplete="tel"
              />
            </label>
          </div>
          <label>
            City
            <input
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="Austin"
              autoComplete="address-level2"
            />
          </label>
          <label>
            Message
            <textarea
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              placeholder="Program interest, entry term…"
            />
          </label>

          <p className="section-label">UTM (from URL — editable)</p>
          <div className="row2">
            {(["utm_source", "utm_medium"] as UtmKey[]).map((k) => (
              <label key={k}>
                {k}
                <input value={form[k]} onChange={(e) => setField(k, e.target.value)} />
              </label>
            ))}
          </div>
          <div className="row2">
            {(["utm_campaign", "utm_content"] as UtmKey[]).map((k) => (
              <label key={k}>
                {k}
                <input value={form[k]} onChange={(e) => setField(k, e.target.value)} />
              </label>
            ))}
          </div>
          <label>
            utm_term
            <input
              value={form.utm_term}
              onChange={(e) => setField("utm_term", e.target.value)}
            />
          </label>
          <label>
            landing_page_url
            <input
              type="url"
              value={form.landing_page_url}
              onChange={(e) => setField("landing_page_url", e.target.value)}
            />
          </label>

          <p className="section-label">Campaign / ads (optional)</p>
          <div className="row2">
            <label>
              campaign_id
              <input
                value={form.campaign_id}
                onChange={(e) => setField("campaign_id", e.target.value)}
              />
            </label>
            <label>
              campaign_name
              <input
                value={form.campaign_name}
                onChange={(e) => setField("campaign_name", e.target.value)}
              />
            </label>
          </div>
          <div className="row2">
            <label>
              ad_group_id
              <input
                value={form.ad_group_id}
                onChange={(e) => setField("ad_group_id", e.target.value)}
              />
            </label>
            <label>
              ad_group_name
              <input
                value={form.ad_group_name}
                onChange={(e) => setField("ad_group_name", e.target.value)}
              />
            </label>
          </div>
          <div className="row2">
            <label>
              ad_id
              <input value={form.ad_id} onChange={(e) => setField("ad_id", e.target.value)} />
            </label>
            <label>
              ad_name
              <input
                value={form.ad_name}
                onChange={(e) => setField("ad_name", e.target.value)}
              />
            </label>
          </div>

          <button type="submit" className="btn" disabled={sending}>
            {sending ? "Sending…" : "Submit inquiry"}
          </button>
          <p className="fine">Secrets stay in this browser tab only.</p>
        </form>

        {status && (
          <div className={`status show ${status.kind}`} role="status">
            {status.text}
          </div>
        )}

        {debug && (
          <div className="debug open">
            <details open>
              <summary>Request / response / curl</summary>
              <pre>{debug.request}</pre>
              <pre>{debug.response}</pre>
              <pre>{debug.curl}</pre>
            </details>
          </div>
        )}

        <details className="dev-box">
          <summary>Dev · API keys</summary>
          <div className="dev-fields">
            <label>
              API_BASE
              <input
                value={api.apiBase}
                onChange={(e) => setApi((a) => ({ ...a, apiBase: e.target.value }))}
              />
            </label>
            <label>
              Path
              <input
                value={api.apiPath}
                onChange={(e) => setApi((a) => ({ ...a, apiPath: e.target.value }))}
              />
            </label>
            <label>
              licenseKey
              <input
                type="password"
                value={api.licenseKey}
                onChange={(e) => setApi((a) => ({ ...a, licenseKey: e.target.value }))}
              />
            </label>
            <label>
              appSecret
              <input
                type="password"
                value={api.appSecret}
                onChange={(e) => setApi((a) => ({ ...a, appSecret: e.target.value }))}
              />
            </label>
          </div>
        </details>
      </aside>
    </>
  );
}
