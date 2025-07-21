import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Template = {
  id: string;
  name: string;
};

type Status = {
  open_issues: number;
};

export function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available templates
    fetch('/config/templates.json')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setTemplates(data.templates))
      .catch(() => setError('Error: Could not load templates.json.'));

    // Fetch GitHub status from our backend
    fetch('/api/status')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data.message) {
          // Handle errors returned from our API
          setError(`API Error: ${data.message}`);
        } else {
          setStatus(data);
        }
      })
      .catch(async (res) => {
        const errText = await res.text();
        setError(`Error: Could not connect to the API. Is the backend running? Details: ${errText}`);
      });
  }, []);

  return (
    <div>
      <h2>System Status</h2>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>
          GitHub Connection Verified. Open Issues: {' '}
          <strong>{status ? status.open_issues : 'Loading...'}</strong>
        </p>
      )}
      <hr />
      <h2>Available Request Templates</h2>
      {templates.length > 0 ? (
        <ul>
          {templates.map((template) => (
            <li key={template.id}>
              <a href={`/request#${template.id}`}>{template.name}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading templates...</p>
      )}
    </div>
  );
}
