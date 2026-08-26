/** Decorative Road to Billions motif inspired by the TB4L Brand Building Framework. */
export function RoadToBillionsMotif() {
  return (
    <div className="rtb-motif welcome-hero__anim" aria-hidden="true">
      <div className="rtb-motif__glow" />
      <div className="rtb-motif__ring rtb-motif__ring--outer" />
      <div className="rtb-motif__ring rtb-motif__ring--mid" />
      <div className="rtb-motif__arc rtb-motif__arc--discover" />
      <div className="rtb-motif__arc rtb-motif__arc--define" />
      <div className="rtb-motif__arc rtb-motif__arc--design" />
      <div className="rtb-motif__arc rtb-motif__arc--deliver" />

      <div className="rtb-motif__core">
        <span className="rtb-motif__core-eyebrow">Road to</span>
        <strong className="rtb-motif__core-title">Billions</strong>
        <span className="rtb-motif__bars" aria-hidden="true">
          <i className="rtb-motif__bar rtb-motif__bar--teal" />
          <i className="rtb-motif__bar rtb-motif__bar--amber" />
          <i className="rtb-motif__bar rtb-motif__bar--green" />
        </span>
      </div>

      <span className="rtb-motif__node rtb-motif__node--discover" title="Discover">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="rtb-motif__node rtb-motif__node--define" title="Define">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="rtb-motif__node rtb-motif__node--design" title="Design">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="rtb-motif__node rtb-motif__node--deliver" title="Deliver">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <ul className="rtb-motif__stages">
        <li className="rtb-motif__stage rtb-motif__stage--discover">Discover</li>
        <li className="rtb-motif__stage rtb-motif__stage--define">Define</li>
        <li className="rtb-motif__stage rtb-motif__stage--design">Design</li>
        <li className="rtb-motif__stage rtb-motif__stage--deliver">Deliver</li>
      </ul>
    </div>
  );
}
