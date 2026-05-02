import './style.css';

const API_BASE = 'http://localhost:5000/api/analytics';

// Define the queries grouped by category
const queries = {
  joins: [
    { title: 'Pending Invites', url: '/pending-invites', type: 'table' },
    { title: 'Team Status', url: '/team-status', type: 'table' },
    { title: 'Sample Event Req (Ev 1)', url: '/event-reqs/1', type: 'table' },
    { title: 'Sample Search (q=CSE)', url: '/search?q=CSE', type: 'table' },
    { title: 'All Students w/o Teams', url: '/students-no-team', type: 'table' },
    { title: 'All Events w/o Teams', url: '/events-no-teams', type: 'table' }
  ],
  subqueries: [
    { title: 'Empty Teams (Only Leader)', url: '/empty-teams', type: 'table' },
    { title: 'Most Recent Event', url: '/most-recent-event', type: 'table' },
    { title: 'Students Lacking Event 1 Skills', url: '/students-lacking-skills/1', type: 'table' },
    { title: 'Elite Students (>5 Skills)', url: '/students-many-skills', type: 'table' }
  ],
  aggregations: [
    { title: 'Most Popular Skills', url: '/popular-skills', type: 'table' },
    { title: 'Students Per Dept', url: '/students-per-department', type: 'table' },
    { title: 'Agv Team Size', url: '/avg-team-size', type: 'table' },
    { title: 'Skill Frequency Request', url: '/skill-frequency', type: 'table' },
    { title: 'Request Acceptance Rate', url: '/request-acceptance-rate', type: 'table' },
    { title: 'Active Departments', url: '/active-departments', type: 'table' },
    { title: 'Events By Month', url: '/events-by-month', type: 'table' },
    { title: 'Users By Year', url: '/users-by-year', type: 'table' }
  ],
  smart: [
    { title: 'Global Leaderboard', url: '/global-leaderboard', type: 'table' },
    { title: 'Event Countdown', url: '/event-countdown', type: 'table' },
    { title: 'Smart Match (Ev 1)', url: '/smart-recommendations/1', type: 'table' },
    { title: 'Skill Gap (Ev 1, Stu 1)', url: '/skill-gap/1/1', type: 'table' },
    { title: 'Participant Match Pct (Ev 1)', url: '/match-percentage/1', type: 'table' },
    { title: 'Suggest Role (Team 1)', url: '/suggest-role/1', type: 'table' },
    { title: 'Deadline Alerts', url: '/deadline-alerts', type: 'table' }
  ]
};

export async function loadQueries(group) {
  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  contentArea.innerHTML = `<div class="loading-state"><div class="spinner"></div>Executing queries for ${group}...</div>`;
  
  const endpoints = queries[group];
  if (!endpoints) {
    contentArea.innerHTML = `<div class="loading-state">Invalid query group selected.</div>`;
    return;
  }
  let html = '';

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${API_BASE}${endpoint.url}`);
      const data = await res.json();
      
      html += buildCard(endpoint.title, data);
    } catch (err) {
      html += `<div class="card error"><h3>${endpoint.title}</h3><p>Failed to fetch data. Ensure backend is running.</p></div>`;
    }
  }

  contentArea.innerHTML = html;
}

function buildCard(title, data) {
  if (!data || data.length === 0) {
    return `
      <div class="card">
        <h3>${title} <span class="pill">0 rows</span></h3>
        <p style="color:var(--text-muted); padding: 1rem 0;">No data found.</p>
      </div>`;
  }

  const columns = Object.keys(data[0]);
  
  let tableHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>${columns.map(col => `<th>${formatCol(col)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>${columns.map(col => `<td>${row[col] !== null ? row[col] : '-'}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  return `
    <div class="card">
      <h3>${title} <span class="pill">${data.length} rows</span></h3>
      ${tableHTML}
    </div>
  `;
}

function formatCol(str) {
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
