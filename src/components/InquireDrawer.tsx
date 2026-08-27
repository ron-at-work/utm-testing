import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_API,
  buildCurl,
  buildLeadPayload,
  createLead,
  omitEmpty,
  readUtmsFromSearch,
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
};

export default function InquireDrawer({ open, onClose }: Props) {
  const location = useLocation();
  const [form, setForm] = useState(emptyForm);
  const [api, setApi] = useState(DEFAULT_API);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [debug, setDebug] = useState<{
    request: string;
    response: string;
    curl: string;
  } | null>(null);
  const [sending, setSending] = useState(false);

  // UTMs stay in URL only — not shown in the form UI
  const urlUtms = useMemo(() => readUtmsFromSearch(location.search), [location.search]);

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

  function setField(key: keyof typeof emptyForm, value: string) {
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
      ...urlUtms,
      landing_page_url: window.location.href,
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
          { method: "POST", url: result.url, headers: redactedHeaders, body },
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
          text: "Thanks — your inquiry was sent.",
        });
        setForm(emptyForm);
      } else {
        setStatus({
          kind: "err",
          text: `Something went wrong (HTTP ${result.res.status}).`,
        });
      }
    } catch (err) {
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
        curl: `# Network / CORS — run:\n${buildCurl(url, headers, body)}`,
      });
      setStatus({ kind: "err", text: "Network error — try again." });
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
            <p>Admissions replies within two school days.</p>
          </div>
          <button type="button" className="close-form" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form id="leadForm" onSubmit={onSubmit}>
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

          <button type="submit" className="btn" disabled={sending}>
            {sending ? "Sending…" : "Submit inquiry"}
          </button>
          <p className="fine">We’ll never share your info with third parties.</p>
        </form>

        {status && (
          <div className={`status show ${status.kind}`} role="status">
            {status.text}
          </div>
        )}

        {debug && (
          <div className="debug open">
            <details>
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
