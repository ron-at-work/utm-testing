import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import InquireDrawer from "../components/InquireDrawer";
import { UTM_KEYS, readUtmsFromSearch } from "../lib/leads";
import "../styles/college.css";

export default function College() {
  const [formOpen, setFormOpen] = useState(false);
  const location = useLocation();
  const utms = readUtmsFromSearch(location.search);
  const hasUtms = UTM_KEYS.some((k) => utms[k]);
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.origin + location.pathname + location.search
      : location.pathname + location.search;

  return (
    <div className="shell">
      <div className="main">
        <nav className="nav">
          <Link className="brand" to="/college">
            <span className="mark">N</span>
            Northline College
          </Link>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#campus">Campus</a>
            <a href="#events">Events</a>
            <button type="button" className="nav-apply" onClick={() => setFormOpen(true)}>
              Apply
            </button>
          </div>
        </nav>

        {hasUtms && (
          <div className="utm-banner">
            Landed from ad ·{" "}
            {UTM_KEYS.filter((k) => utms[k])
              .map((k) => `${k.replace("utm_", "")}=${utms[k]}`)
              .join(" · ")}
          </div>
        )}

        <header className="hero">
          <div className="hero-bg" aria-hidden />
          <div className="hero-copy">
            <p className="eyebrow">Undergraduate · Graduate · Continuing ed</p>
            <h1>Learn boldly. Lead locally.</h1>
            <p>
              A modern college for builders and thinkers — studios, labs, and mentors
              who push you past “good enough.”
            </p>
            <div className="hero-meta">
              <span className="chip">12,400 students</span>
              <span className="chip">80+ majors</span>
              <span className="chip">Urban campus</span>
            </div>
            <div className="hero-actions">
              <button type="button" className="open-form" onClick={() => setFormOpen(true)}>
                Start an inquiry
              </button>
              <a className="btn-ghost-link" href="#campus">
                Tour the campus
              </a>
            </div>
          </div>
        </header>

        <section className="block alt" id="about">
          <p className="eyebrow accent">Why Northline</p>
          <h2>College that feels like a launchpad</h2>
          <p className="lede">
            Research-ready faculty, career studios from year one, and a city campus
            plugged into real industry partners.
          </p>
          <div className="stats">
            <div className="stat">
              <strong>14:1</strong>
              <span>student–faculty</span>
            </div>
            <div className="stat">
              <strong>92%</strong>
              <span>job / grad school</span>
            </div>
            <div className="stat">
              <strong>60+</strong>
              <span>countries</span>
            </div>
            <div className="stat">
              <strong>#1</strong>
              <span>internship density*</span>
            </div>
          </div>
        </section>

        <section className="block" id="programs">
          <p className="eyebrow accent">Academics</p>
          <h2>Schools &amp; programs</h2>
          <p className="lede">Pick a path — or design one across colleges with your advisor.</p>
          <div className="grid-3">
            {[
              ["STEM", "Engineering & Computing", "CS, data science, robotics — paid co-ops from year two."],
              ["Business", "School of Commerce", "Finance, marketing analytics, and a live venture studio."],
              ["Arts", "Media & Design", "Film, UX, architecture foundations, downtown gallery circuit."],
              ["Health", "Health Sciences", "Nursing, public health, and pre-med with hospital partners."],
              ["Liberal arts", "Humanities & Social Science", "Policy, psychology, languages — internship-backed."],
              ["Grad", "Master’s & certificates", "Evening MBA, M.S. AI, stackable certificates."],
            ].map(([tag, title, body]) => (
              <article className="card" key={title}>
                <span className="tag">{tag}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="campus" id="campus">
          <h2>Campus life</h2>
          <p className="lede">
            Residence halls, maker spaces, and a riverfront quad five minutes from downtown.
          </p>
          <div className="campus-grid">
            <figure className="tall">
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80"
                alt="College campus"
                loading="lazy"
              />
              <figcaption>Main quad</figcaption>
            </figure>
            <div className="stack">
              <figure>
                <img
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80"
                  alt="Graduation"
                  loading="lazy"
                />
                <figcaption>Commencement</figcaption>
              </figure>
              <figure>
                <img
                  src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80"
                  alt="Students studying"
                  loading="lazy"
                />
                <figcaption>Library &amp; labs</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="block alt" id="events">
          <p className="eyebrow accent">Visit</p>
          <h2>Upcoming events</h2>
          <p className="lede">Tour campus, then open the inquiry form when you’re ready.</p>
          <div className="events-list">
            {[
              ["Sep", "12", "Open house · Undergraduate", "Campus tour, faculty panels · 10am–2pm"],
              ["Sep", "26", "Graduate programs webinar", "MBA + M.S. tracks · Online 6pm"],
              ["Oct", "04", "STEM lab night", "Robotics & computing demos · RSVP required"],
            ].map(([mon, day, title, desc]) => (
              <div className="event" key={title}>
                <div className="date">
                  <small>{mon}</small>
                  {day}
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="open-form" onClick={() => setFormOpen(true)}>
              Inquire about admissions
            </button>
          </div>
        </section>

        <section className="utm-lab">
          <h2>UTM testing (dev)</h2>
          <p>
            Exact flow: start at <Link to="/">fake Google Ads</Link>, click Sponsored →
            land here with UTMs → Apply.
          </p>
          <p className="now">Current URL: {currentUrl}</p>
        </section>

        <footer className="site">
          <span>
            <strong>Northline College</strong> · Office of Admissions
          </span>
          <span>admissions@northline.example · Mon–Fri 9am–5pm</span>
        </footer>
      </div>

      <InquireDrawer open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
