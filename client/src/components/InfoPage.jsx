import "../assets/styles/info-pages.css";

export default function InfoPage({ title, intro, updated, children }) {
  return (
    <div className="ip-page">
      <header className="ip-header">
        <h1>{title}</h1>
        {intro && <p className="ip-intro">{intro}</p>}
        {updated && <p className="ip-updated">Last updated: {updated}</p>}
      </header>
      <div className="ip-body">{children}</div>
    </div>
  );
}