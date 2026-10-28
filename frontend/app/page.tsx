'use client';

import { useState, useEffect } from 'react';

interface Dimension {
  score: number;
  weight: string;
  comments: string;
}

interface EvaluationResult {
  owner: string;
  repo: string;
  default_branch: string;
  total_files: number;
  evaluation: {
    overall_score: number;
    dimensions: Record<string, Dimension>;
  };
  ai_review: string;
}

interface HistoryItem {
  id: number;
  repo_url: string;
  score: number;
  ai_review: string;
  created_at: string;
}

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState('');
  const [evaluations, setEvaluations] = useState<HistoryItem[]>([]);
  const [currentReport, setCurrentReport] = useState<EvaluationResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchEvaluations = async () => {
    try {
      const res = await fetch('http://localhost:8000/evaluations');
      const data = await res.json();
      setEvaluations(data);
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;

    setAnalyzing(true);
    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentReport(data);
        await fetchEvaluations();
      }
    } catch (err) {
      console.error('Error analyzing repository:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Triggers browser print-to-PDF functionality tailored for printable layouts
  const handleDownloadPDF = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <main style={{ padding: '2.5rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Hide search bar & headers during PDF printing */}
      <style jsx global>{`
        @media print {
          form, .no-print, header, footer { display: none !important; }
          main { padding: 0 !important; background: transparent !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>RP2 Code Evaluation Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Automated repository static metrics and qualitative AI code review.</p>
      </div>
      
      {/* Search Input Form */}
      <form className="no-print" onSubmit={handleAnalyze} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <input
          type="text"
          placeholder="Paste GitHub Repository URL (e.g., https://github.com/fastapi/fastapi)..."
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          style={{ flex: 1, padding: '0.875rem 1rem', fontSize: '1rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
          required
        />
        <button
          type="submit"
          disabled={analyzing}
          style={{ padding: '0.875rem 1.75rem', fontSize: '1rem', fontWeight: 600, backgroundColor: analyzing ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: analyzing ? 'not-allowed' : 'pointer' }}
        >
          {analyzing ? 'Analyzing Code...' : 'Analyze Repo'}
        </button>
      </form>

      {/* Active Analysis Report Card */}
      {currentReport && (
        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '2.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                {currentReport.owner}/{currentReport.repo}
              </h2>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Branch: {currentReport.default_branch} | Files Analyzed: {currentReport.total_files}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <button 
                onClick={handleDownloadPDF}
                className="no-print"
                style={{ padding: '0.6rem 1rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                📥 Download PDF
              </button>

              <div style={{ textAlign: 'center', backgroundColor: '#f1f5f9', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Overall Score</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: getScoreColor(currentReport.evaluation.overall_score) }}>
                  {currentReport.evaluation.overall_score}
                </span>
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '1rem' }}>5 Dimension Score Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.entries(currentReport.evaluation.dimensions).map(([key, dim]) => (
              <div key={key} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#475569', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 'bold', color: getScoreColor(dim.score) }}>{dim.score}/100</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0284c7', marginBottom: '0.25rem' }}>Weight: {dim.weight}</div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{dim.comments}</p>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#eff6ff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '1rem' }}>🤖 AI Qualitative Review</h4>
            <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.95rem', lineHeight: '1.5' }}>{currentReport.ai_review}</p>
          </div>
        </div>
      )}

      {/* Evaluation History Table */}
      <div className="no-print" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginTop: 0, marginBottom: '1rem' }}>Evaluation History</h2>
        {evaluations.length === 0 ? (
          <p style={{ color: '#64748b' }}>No evaluations recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>ID</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Repository</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Score</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{item.id}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500, color: '#2563eb' }}>{item.repo_url}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: getScoreColor(item.score) }}>{item.score}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.875rem' }}>{item.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}