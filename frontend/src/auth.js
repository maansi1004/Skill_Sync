import './style.css';

const API_BASE = 'http://localhost:5000/api';

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.userId) {
            localStorage.setItem('skillsync_user_id', data.userId);
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error connecting to backend.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API_BASE}/auth/skills`);
        const skills = await res.json();
        const sc = document.getElementById('skills-container');
        if (sc) {
            sc.innerHTML = skills.map(s => `
                <label style="display:inline-flex; align-items:center; gap:0.25rem; font-size:0.85rem; background:var(--panel-bg); padding:0.4rem 0.8rem; border-radius:1rem; cursor:pointer; border:1px solid var(--panel-border);">
                   <input type="checkbox" name="reg-skill" value="${s.id}" style="accent-color:var(--accent);" /> ${s.skill_name}
                </label>
            `).join('');
        }
    } catch (e) { }
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('reg-name').value,
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        department: document.getElementById('reg-dept').value,
        year_of_study: document.getElementById('reg-year').value,
        password: document.getElementById('reg-password').value,
        skills: Array.from(document.querySelectorAll('input[name="reg-skill"]:checked')).map(el => parseInt(el.value))
    };

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok && data.userId) {
            localStorage.setItem('skillsync_user_id', data.userId);
            window.location.href = '/dashboard.html';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error connecting to backend.');
    }
});
