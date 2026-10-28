'use client';

import { useState, useEffect } from 'react';

interface Evaluation {
  id: number;
  repo_url: string;
  score: number;
  ai_review: string;
  created_at: string;
}

export default function Dashboard() {
  const [repoUrl, setRepoUrl] = useState('');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch evaluation history on mount
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/evaluations');
      const data = await res.json();
      setEvaluations(data);
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Submit new repo for analysis
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
      if (res.ok) {
        setRepoUrl('');
        await fetchEvaluations(); // Refresh history table
      }
    } catch (err) {
      console.error('Error analyzing repository:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>RP2 Code Evaluation Dashboard</h1>
      
      {/* Input Form */}
      <form onSubmit={handleAnalyze} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Enter GitHub Repository URL..."
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
        <button
          type="submit"
          disabled={analyzing}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {analyzing ? 'Analyzing...' : 'Analyze Repo'}
        </button>
      </form>

      {/* History Table */}
      <h2>Evaluation History</h2>
      {loading ? (
        <p>Loading history...</p>
      ) : evaluations.length === 0 ? (
        <p>No evaluations recorded yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Repository</th>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>Score</th>
              <th style={{ padding: '0.75rem', border: '1px solid #ddd' }}>AI Review</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(evaluations) && evaluations.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{item.id}</td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{item.repo_url}</td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{item.score}</td>
                <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>{item.ai_review}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}