import { Link } from "react-router-dom";
import { GOOGLE_ADS_UTMS } from "../lib/leads";
import "../styles/google-ads.css";

function collegeHref() {
  const params = new URLSearchParams(GOOGLE_ADS_UTMS);
  return `/college?${params.toString()}`;
}

export default function GoogleAds() {
  const href = collegeHref();

  return (
    <div className="gads">
      <div className="gads-top">
        <div className="gads-logo" aria-label="Google">
          <span>G</span>
          <span>o</span>
          <span>o</span>
          <span>g</span>
          <span>l</span>
          <span>e</span>
        </div>
        <div className="gads-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#9aa0a6" aria-hidden>
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input type="text" value="northline college inquiry" readOnly />
        </div>
      </div>

      <div className="gads-wrap">
        <p className="gads-hint">
          Dev test: click the <strong>Sponsored</strong> ad. You land on the college
          site with Google Ads UTM params — same as a real click.
        </p>

        <p className="gads-stats">About 1,240,000 results (0.38 seconds)</p>

        <div className="gads-result gads-ad">
          <div>
            <span className="gads-badge">Sponsored</span>
            <span className="gads-cite">
              <strong>northline.example</strong> · https://northline.example/admissions
            </span>
          </div>
          <Link className="gads-title" to={href}>
            Northline College — Fall Admissions Open House
          </Link>
          <p className="gads-snippet">
            Tour campus, meet faculty, and start your inquiry online. Small classes.
            Big horizons. Apply or request info in minutes.
          </p>
        </div>

        <div className="gads-result">
          <div className="gads-cite">www.collegetips.example › admissions</div>
          <span className="gads-title muted">How to compare college open houses</span>
          <p className="gads-snippet">
            A checklist for parents and students visiting campuses this fall…
          </p>
        </div>

        <div className="gads-result">
          <div className="gads-cite">www.rankings.example › regional</div>
          <span className="gads-title muted">Top regional colleges for internships 2026</span>
          <p className="gads-snippet">
            See which schools place students into paid co-ops by junior year…
          </p>
        </div>

        <p className="gads-footer">
          Landing after click:
          <br />
          <code>{href}</code>
        </p>
      </div>
    </div>
  );
}
