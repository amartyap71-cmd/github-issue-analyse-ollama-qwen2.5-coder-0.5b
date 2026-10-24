import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [repoUrl, setRepoUrl] = useState("https://github.com/owner/repository");
  const [issueNumber, setIssueNumber] = useState("1");
  const [runTests, setRunTests] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
        const response = await fetch(
        "http://localhost:4000/api/investigate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoUrl,
            issueNumber: Number(issueNumber),
            runTests,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Investigation failed");
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function downloadReport() {
    if (!result?.report) return;
    const url = URL.createObjectURL(new Blob([result.report], { type: "text/markdown" }));
    const a = document.createElement("a"); a.href = url; a.download = "investigation-report.md"; a.click();
    URL.revokeObjectURL(url);
  }

  const a = result?.analysis;
  return <main className="shell">
    <header><div className="eyebrow">DEVELOPER TOOLING / AI AGENTS</div><h1>Issue Investigator<span>.</span></h1>
      <p className="subtitle">Turn a GitHub bug report into an evidence-backed debugging investigation.</p></header>
    <section className="panel">
      <form onSubmit={submit}>
        <label>GitHub repository URL<input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/owner/repo" required /></label>
        <label>Issue number<input type="number" min="1" value={issueNumber} onChange={e => setIssueNumber(e.target.value)} required /></label>
        <label className="check"><input type="checkbox" checked={runTests} onChange={e => setRunTests(e.target.checked)} /> Run detected npm tests in an isolated Docker container (optional)</label>
        <button disabled={loading}>{loading ? "Investigating repository…" : "Investigate issue →"}</button>
        <small>Public repositories only · Review all generated patches before use.</small>
      </form>
    </section>
    {error && <div className="error"><strong>Investigation failed</strong><p>{error}</p><small>Check that the API server is running on port 4000 and that the repository/issue are public.</small></div>}
    {result && <div className="results">
      <section className="panel issue"><div className="row"><span className="pill">ISSUE #{result.issue.html_url.split("/").pop()}</span><span className="muted">{result.issue.state}</span></div>
        <h2>{result.issue.title}</h2><p>{result.issue.body || "No issue description supplied."}</p><a href={result.issue.html_url} target="_blank" rel="noreferrer">Open issue on GitHub ↗</a>
      </section>
      <section className="panel"><div className="row"><h2>Investigation</h2><span className="pill">{a?.confidence || "unknown"} confidence</span></div>
        <h3>Summary</h3><p>{a?.summary}</p><h3>Likely cause</h3><p>{a?.likelyCause}</p><h3>Explanation</h3><p>{a?.explanation}</p>
        <h3>Evidence</h3><ul>{(a?.evidence || []).map((e, i) => <li key={i}><code>{e.file}</code><p>{e.reason}</p></li>)}</ul>
      </section>
      <section className="panel"><div className="row"><h2>Repository files</h2><span className="muted">{result.inspectedFiles.length} inspected</span></div>
        {result.inspectedFiles.map(f => <details key={f.path}><summary><code>{f.path}</code><span className="muted"> relevance {f.relevanceScore}</span></summary><pre>{f.preview}</pre></details>)}
      </section>
      <section className="panel"><h2>Proposed patch</h2><pre>{a?.proposedPatch || "No patch generated. Add an OpenAI API key and retry for model-based analysis."}</pre>
        <h3>Test results</h3>{result.tests ? <><span className={`pill ${result.tests.status}`}>{result.tests.status}</span><pre>{result.tests.stdout || result.tests.reason || ""}{result.tests.stderr || ""}</pre></> : <p className="muted">Tests not run.</p>}
        <h3>Suggested tests</h3><ul>{(a?.suggestedTests || []).map((t, i) => <li key={i}>{t}</li>)}</ul>
        <h3>Limitations</h3><ul>{(a?.limitations || []).map((t, i) => <li key={i}>{t}</li>)}</ul>
        <button onClick={downloadReport} className="secondary">Download Markdown report ↓</button>
      </section>
    </div>}
    <footer>Built for careful debugging: evidence first, human approval always.</footer>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
