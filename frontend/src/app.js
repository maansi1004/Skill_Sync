import './style.css';

const API_BASE = 'http://localhost:5000/api';

// --- AUTH CHECK ---
const userId = localStorage.getItem('skillsync_user_id');
if (!userId && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
    window.location.href = '/index.html';
}

// Global Logout
document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('skillsync_user_id');
    window.location.href = '/index.html';
});

// --- CUSTOM UI ALERTS & MODALS ---
window.showToast = function(message, type = 'accent') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = `var(--${type === 'error' ? 'danger' : type})`;
    const colorVar = type === 'error' ? 'danger' : type;
    toast.innerHTML = `<span style="color:var(--${colorVar}); font-weight:bold; margin-right:0.5rem;">•</span> <span style="white-space: pre-line;">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

// Override default alert
window.alert = function(msg) {
    window.showToast(msg);
};

window.showConfirm = function(message, onConfirm) {
    let overlay = document.getElementById('custom-confirm-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'custom-confirm-modal';
        overlay.innerHTML = `
            <div class="modal-content">
                <h3 id="confirm-msg" style="color:white; font-size:1.1rem; font-weight:500; white-space: pre-line; line-height: 1.5;"></h3>
                <div class="btns">
                    <button class="btn secondary-btn" id="confirm-cancel" style="width:auto; padding: 0.5rem 1.5rem;">Cancel</button>
                    <button class="btn primary-btn" id="confirm-ok" style="width:auto; padding: 0.5rem 1.5rem;">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('confirm-msg').innerText = message;
    overlay.style.display = 'flex';
    
    document.getElementById('confirm-cancel').onclick = () => {
        overlay.style.display = 'none';
    };
    document.getElementById('confirm-ok').onclick = () => {
        overlay.style.display = 'none';
        if (onConfirm) onConfirm();
    };
};

// --- PAGE ROUTERS ---
const path = window.location.pathname;

if (path.includes('dashboard.html')) {
    initDashboard();
} else if (path.includes('events.html')) {
    initEvents();
} else if (path.includes('browse-teams.html')) {
    initBrowseTeams();
} else if (path.includes('teams.html')) {
    initTeams();
} else if (path.includes('search.html')) {
    initSearch();
} else if (path.includes('profile.html')) {
    initProfile();
} else if (path.includes('analytics.html')) {
    initAnalytics();
}

// ==========================================
// DASHBOARD LOGIC
// ==========================================
async function initDashboard() {
    try {
        // 1. Get Student Profile & Personalization
        const proRes = await fetch(`${API_BASE}/analytics/student-profile/${userId}`);
        const profiles = await proRes.json();
        
        if(profiles.length > 0) {
            const user = profiles[0];
            document.getElementById('user-firstname').textContent = user.name.split(' ')[0];
            document.getElementById('user-dept').textContent = user.department;
            document.getElementById('user-year').textContent = user.year_of_study || 'N/A';
            
            // Set Avatar Initial
            const avatar = document.getElementById('user-avatar-initial');
            if(avatar) avatar.textContent = user.name.charAt(0).toUpperCase();

            // 2. Visual Skill Stack
            const skills = [...new Set(profiles.map(p => p.skill_name).filter(Boolean))];
            const skillsVisual = document.getElementById('prof-skills-visual');
            if (skills.length > 0) {
                skillsVisual.innerHTML = skills.map(s => {
                    // Random-ish progress for demo visual impact
                    const progress = 70 + Math.floor(Math.random() * 25);
                    return `
                        <div class="skill-progress-row">
                            <div style="display:flex; justify-content:space-between; font-size:0.9rem;">
                                <span>${s}</span>
                                <span style="color:var(--accent)">${progress}%</span>
                            </div>
                            <div class="skill-progress-bg">
                                <div class="skill-progress-fill" style="width:0%" data-width="${progress}%"></div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                setTimeout(() => {
                    document.querySelectorAll('.skill-progress-fill').forEach(bar => {
                        bar.style.width = bar.dataset.width;
                    });
                }, 100);
            } else {
                skillsVisual.innerHTML = '<p style="color:var(--text-muted);">No skills added yet.</p>';
            }
        }

        // 3. Recommended For You (Teams & Teammates)
        const recRes = await fetch(`${API_BASE}/analytics/dashboard-recommendations/${userId}`);
        const recData = await recRes.json();
        
        const teamsList = document.getElementById('recommended-teams-list');
        if (recData.teams?.length > 0) {
            teamsList.innerHTML = recData.teams.map(t => `
                <div class="rec-item" onclick="window.location.href='/browse-teams.html'">
                    <div>
                        <strong style="color:white; display:block;">${t.team_name}</strong>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${t.event_name}</span>
                    </div>
                    <span class="match-tag" data-val="${t.match_percentage}">0% match</span>
                </div>
            `).join('');
        } else {
            teamsList.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No teams matching your exact skills right now.</p>';
        }

        const teammatesList = document.getElementById('recommended-teammates-list');
        if (recData.teammates?.length > 0) {
            teammatesList.innerHTML = recData.teammates.map(u => `
                <div class="rec-item" onclick="window.location.href='/search.html'">
                    <div>
                        <strong style="color:white; display:block;">${u.name}</strong>
                        <span style="font-size:0.75rem; color:var(--text-muted);">Top Candidate</span>
                    </div>
                    <span style="color:var(--accent); font-weight:bold;">8${Math.floor(Math.random()*9)}% fit</span>
                </div>
            `).join('');
        } else {
            teammatesList.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No students found matching your stack gap.</p>';
        }

        // 4. Activity & Profile Strength
        const actRes = await fetch(`${API_BASE}/analytics/dashboard-activity/${userId}`);
        const actData = await actRes.json();

        document.getElementById('activity-teams').textContent = actData.teamsJoined;
        document.getElementById('activity-invites').textContent = actData.invitesSent;
        document.getElementById('activity-strength-text').textContent = actData.profileStrength + '%';
        
        const strengthBar = document.getElementById('activity-strength-bar');
        if(strengthBar) strengthBar.style.width = actData.profileStrength + '%';

        // 5. Initialize Skill Modal Logic
        initSkillModal(profiles);

        // Animate match percentages
        setTimeout(() => {
            document.querySelectorAll('.match-tag').forEach(tag => {
                const target = parseInt(tag.dataset.val);
                let current = 0;
                const timer = setInterval(() => {
                    if (current >= target) {
                        tag.innerText = target + '% match';
                        clearInterval(timer);
                    } else {
                        current += 2;
                        tag.innerText = current + '% match';
                    }
                }, 20);
            });
        }, 300);

    } catch (e) {
        console.error('Dashboard Load Error:', e);
    }
}

async function initSkillModal(currentProfiles) {
    const modal = document.getElementById('skills-modal');
    const openBtn = document.getElementById('open-skills-modal');
    const closeBtn = document.getElementById('close-skills-modal');
    const cancelBtn = document.getElementById('cancel-skills-btn');
    const saveBtn = document.getElementById('save-skills-btn');
    const skillList = document.getElementById('skills-selection-list');

    if (!modal) return;

    const currentSkillIds = currentProfiles.map(p => p.id);

    openBtn.onclick = async () => {
        modal.style.display = 'flex';
        // Fetch all skills
        const res = await fetch(`${API_BASE}/students/meta/skills`);
        const allSkills = await res.json();
        
        skillList.innerHTML = allSkills.map(s => `
            <label class="skill-choice ${currentSkillIds.includes(s.id) ? 'selected' : ''}">
                <input type="checkbox" value="${s.id}" ${currentSkillIds.includes(s.id) ? 'checked' : ''} 
                       onchange="this.parentElement.classList.toggle('selected', this.checked)">
                ${s.skill_name}
            </label>
        `).join('');
    };

    const closeModal = () => modal.style.display = 'none';
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    saveBtn.onclick = async () => {
        const selectedIds = Array.from(skillList.querySelectorAll('input:checked')).map(i => parseInt(i.value));
        
        saveBtn.disabled = true;
        saveBtn.innerText = 'Saving...';
        
        try {
            const res = await fetch(`${API_BASE}/students/skills/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: userId, skillIds: selectedIds })
            });
            
            if (res.ok) {
                showToast('Skills updated successfully!', 'success');
                closeModal();
                initDashboard(); // Refresh
            }
        } catch (e) {
            showToast('Failed to update skills.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = 'Save Changes';
        }
    };
}

// ==========================================
// EVENTS LOGIC
// ==========================================
async function initEvents() {
    const grid = document.getElementById('events-grid');
    const searchInput = document.getElementById('search-events');
    const skillSelect = document.getElementById('filter-skill-req');
    const sortSelect = document.getElementById('sort-deadline');
    
    try {
        const [dateRes, evRes, reqRes] = await Promise.all([
            fetch(`${API_BASE}/analytics/event-countdown`),
            fetch(`${API_BASE}/events`),
            fetch(`${API_BASE}/analytics/all-event-reqs`)
        ]);
        
        if (!evRes.ok) throw new Error(`Events API Error: ${evRes.status}`);
        
        let countdowns = dateRes.ok ? await dateRes.json() : [];
        let allRequirements = reqRes.ok ? await reqRes.json() : [];
        let allEvents = await evRes.json();
        
        if (!Array.isArray(allEvents)) allEvents = [];
        if (!Array.isArray(countdowns)) countdowns = [];
        if (!Array.isArray(allRequirements)) allRequirements = [];
        
        allEvents = allEvents.map(ev => {
             const cd = countdowns.find(c => c.event_name === ev.event_name);
             const reqs = allRequirements.filter(s => s.event_id === ev.id).map(s => s.skill_name);
             
             let hLeft = 999999;
             if (cd && cd.hours_left !== null && cd.hours_left !== undefined) {
                 hLeft = cd.hours_left;
             } else if (ev.event_date) {
                 const diffMs = new Date(ev.event_date) - new Date();
                 hLeft = Math.floor(diffMs / (1000 * 60 * 60));
             }
             
             return { ...ev, hoursLeft: hLeft, requirements: reqs };
        });

        const renderEventsList = (eventsToRender) => {
            let html = '';
            
            // Do not show expired events if "Deadline: Soonest" (asc) is selected
            let filteredEvents = eventsToRender;
            if (sortSelect && sortSelect.value === 'asc') {
                filteredEvents = filteredEvents.filter(ev => ev.hoursLeft > 0);
            }

            const sorted = [...filteredEvents].sort((a, b) => {
                const order = sortSelect ? (sortSelect.value === 'asc' ? 1 : -1) : 1;
                return (a.hoursLeft - b.hoursLeft) * order;
            });

            for (let ev of sorted) {
                const hoursLeft = ev.hoursLeft;
                let formattedTime = "Deadline: ? ";
                let urgencyColor = 'var(--success)';

                if (hoursLeft !== 999999) {
                     if (hoursLeft <= 0) {
                          formattedTime = "Deadline Expired";
                          urgencyColor = 'var(--text-muted)';
                     } else if (hoursLeft >= 24) {
                          formattedTime = "Deadline: " + Math.floor(hoursLeft / 24) + ' Days';
                          urgencyColor = hoursLeft < 168 ? 'var(--danger)' : 'var(--success)';
                     } else {
                          formattedTime = "Deadline: " + hoursLeft + ' Hours';
                          urgencyColor = 'var(--danger)'; // < 24 hrs
                     }
                } else {
                     urgencyColor = 'var(--text-muted)';
                }
                
                html += `
                    <div class="card" style="display:flex; flex-direction:column;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h3>${ev.event_name}</h3>
                            <span class="pill" style="color:${urgencyColor}; border:1px solid ${urgencyColor}">${formattedTime}</span>
                        </div>
                        <p style="color:var(--text-muted); flex:1; font-size:0.9rem; margin-bottom:1rem;">${(ev.description || '').substring(0,60)}...</p>
                        <div style="margin-bottom:1rem; display:flex; flex-wrap:wrap; gap:0.3rem;">
                            ${ev.requirements.slice(0,3).map(r => `<span class="pill" style="font-size:0.7rem; background:rgba(255,255,255,0.05);">${r}</span>`).join('')}
                            ${ev.requirements.length > 3 ? `<span class="pill" style="font-size:0.7rem;">+${ev.requirements.length - 3}</span>` : ''}
                        </div>
                        <button class="btn secondary-btn view-ev-btn" data-id="${ev.id}" data-name="${ev.event_name}">Analyze & View Details</button>
                    </div>
                `;
            }
            grid.innerHTML = html || '<p style="grid-column: 1/-1; text-align:center; padding:2rem; color:var(--text-muted)">No events matched your criteria.</p>';
            
            document.querySelectorAll('.view-ev-btn').forEach(btn => {
                btn.addEventListener('click', () => openEventModal(btn.dataset.id, btn.dataset.name));
            });
        };

        const applyFilters = () => {
            const term = searchInput ? searchInput.value.toLowerCase() : '';
            const skill = skillSelect ? skillSelect.value : '';
            
            const filtered = allEvents.filter(ev => {
                const matchesSearch = (ev.event_name || '').toLowerCase().includes(term);
                const matchesSkill = !skill || (ev.requirements && ev.requirements.includes(skill));
                return matchesSearch && matchesSkill;
            });
            
            renderEventsList(filtered);
        };

        searchInput?.addEventListener('input', applyFilters);
        skillSelect?.addEventListener('change', applyFilters);
        sortSelect?.addEventListener('change', applyFilters);

        renderEventsList(allEvents);

        document.getElementById('filter-btn')?.addEventListener('click', async (e) => {
             const btn = e.target;
             btn.disabled = true;
             btn.innerText = 'Analyzing...';
             grid.innerHTML = '<div class="loading-state">Analyzing skill gaps across all events...</div>';
             
             const eligibleEvents = [];
             for (let ev of allEvents) {
                 try {
                     const gapRes = await fetch(`${API_BASE}/analytics/skill-gap/${ev.id}/${userId}`);
                     const gapData = await gapRes.json();
                     if (gapData.length === 0) eligibleEvents.push(ev);
                 } catch(e) {}
             }
             
             renderEventsList(eligibleEvents);
             btn.disabled = false;
             btn.innerText = 'My Skills Match';
        });
        
    } catch (e) {
        console.error('Events Load Error:', e);
        grid.innerHTML = `<div class="error">Failed to load events. Please check if the backend server is running. (${e.message})</div>`;
    }
}

async function openEventModal(eventId, eventName) {
    window.currentEventTeamId = null;
    const modal = document.getElementById('event-modal');
    modal.style.display = 'block';
    document.getElementById('modal-ev-title').textContent = eventName;
    
    // Eligibility List (Checks requirements)
    const elList = document.getElementById('modal-eligibility');
    elList.innerHTML = 'Analyzing...';
    try {
        // Find gap
        const gapRes = await fetch(`${API_BASE}/analytics/skill-gap/${eventId}/${userId}`);
        const gapData = await gapRes.json();
        
        const resReq = await fetch(`${API_BASE}/analytics/event-reqs/${eventId}`);
        const reqData = await resReq.json();
        const reqSkills = reqData.map(r => r.skill_name).join(', ') || 'None';
        
        const htmlReqs = `Skills Required: ${reqSkills}. `;
        if (gapData.length === 0) {
           elList.innerHTML = `<span style="color:var(--success)">[ Eligible ✅ ]</span> ${htmlReqs}`;
        } else {
           elList.innerHTML = `<span style="color:var(--warning)">[ Partial Math ]</span> ${htmlReqs}`;
        }
    } catch(e) {}

    // Skill Gap 
    const gapList = document.getElementById('modal-skill-gap');
    gapList.innerHTML = '<li>Analyzing gap...</li>';
    try {
        const gapRes = await fetch(`${API_BASE}/analytics/skill-gap/${eventId}/${userId}`);
        const gapData = await gapRes.json();
        gapList.innerHTML = gapData.length > 0 
           ? gapData.map(g => `<li class="pill danger-pill">${g.missing_skill}</li>`).join('')
           : '<li style="color:var(--success)">You have all required skills!</li>';
    } catch(e) {}

    // Fast Builder
    const builderList = document.getElementById('modal-fast-builder');
    builderList.innerHTML = '<li>Searching database...</li>';
    try {
        const fastRes = await fetch(`${API_BASE}/analytics/fast-builder/${eventId}`);
        const fastData = await fastRes.json();
        builderList.innerHTML = fastData.length > 0
            ? fastData.map(u => `
                <li style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.5rem;">
                   <div><strong>${u.name.split(' ')[0]}</strong> <span class="pill" style="font-size:0.75rem">${u.matched_skills} matches</span></div>
                   <button class="btn secondary-btn" style="padding:0.2rem 0.5rem; font-size:0.75rem; width:auto;" onclick="
                       if (!window.currentEventTeamId) {
                           if(window.showToast) window.showToast('Please create a team first using the section below!', 'warning');
                           else alert('Please create a team first using the section below!');
                           return;
                       }
                       const btn = this;
                       fetch('${API_BASE}/teams/requests', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ team_id: window.currentEventTeamId, student_id: ${u.id}, type: 'INVITE' })
                       }).then(async res => {
                           if(res.ok) {
                               btn.innerText = 'Sent!';
                               btn.style.backgroundColor = 'var(--success)';
                               btn.style.color = '#fff';
                               btn.style.border = 'none';
                               btn.disabled = true;
                               if(window.showToast) window.showToast('Invite sent successfully!', 'success');
                           } else {
                               const err = await res.json();
                               if(window.showToast) window.showToast(err.message || 'Invite failed', 'error');
                               else alert(err.message || 'Invite failed');
                           }
                       });
                   ">Invite</button>
                </li>`).join('')
            : '<li>No available students found.</li>';
    } catch(e) {}

    // Attach Event ID to create team button
    const cteamBtn = document.getElementById('create-team-btn');
    if (cteamBtn) {
        cteamBtn.onclick = async () => {
            const tname = document.getElementById('team-name').value;
            if(!tname) return alert('Enter team name');
            try {
                const res = await fetch(`${API_BASE}/teams`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ team_name: tname, event_id: eventId, leader_id: userId })
                });
                const data = await res.json();
                if(res.ok) {
                    window.currentEventTeamId = data.id;
                    const status = document.getElementById('team-creation-status');
                    status.style.display = 'block';
                    status.innerHTML = `→ Team '${tname}' created in database! You can now invite members above.`;
                    setTimeout(() => status.style.display = 'none', 5000);
                } else {
                    alert(data.message);
                }
            } catch(e) {}
        }
    }
}

document.querySelector('.close-btn')?.addEventListener('click', () => {
    document.getElementById('event-modal').style.display = 'none';
});

// ==========================================
// TEAMS LOGIC (Invites & My Teams)
// ==========================================
async function initTeams() {
    // Populate Teams I Contribute To initially
    async function renderMyTeams() {
        const myTeamsCont = document.getElementById('my-teams-container');
        try {
            const res = await fetch(`${API_BASE}/teams/my-teams/${userId}`);
            const myTeams = await res.json();
            if (myTeams.length === 0) {
                myTeamsCont.innerHTML = '<div class="card" style="padding:1rem;"><p style="color:var(--text-muted);">You haven\'t joined any teams yet.</p></div>';
            } else {
                myTeamsCont.innerHTML = myTeams.map(team => `
                    <div class="card" style="padding:1rem; margin-bottom:0.5rem; border-left: 3px solid var(--success)">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.5rem;">
                           <h3 style="margin:0; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                               ${team.team_name} 
                               <span class="pill" style="font-size: 0.75rem; font-weight: normal; background: rgba(255,255,255,0.05); color: var(--text-muted);">
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:2px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                   ${team.member_count || (team.members ? team.members.length + 1 : 1)}/4
                               </span>
                           </h3>
                           <span class="pill" style="color:var(--success); border:1px solid var(--success)">Active</span>
                        </div>
                       <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom: 0.5rem;">Leader: <strong>${team.leader_name}</strong> ${team.event_name ? `| Event: ${team.event_name}` : ''}</p>
                       <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom: 1rem;">
                           ${team.members && team.members.length > 0 ? 
                                team.members.map(m => `<span class="pill" style="background:#2a2b38">${m.name}</span>`).join('') 
                                : '<span style="color:var(--text-muted); font-size:0.8rem">No other members</span>'
                           }
                       </div>
                       
                       ${team.event_id ? `
                       <div style="background:rgba(0,0,0,0.2); padding:0.8rem; border-radius:6px; margin-bottom:1rem;">
                           <p style="color:var(--text-main); font-size:0.8rem; margin-bottom:0.5rem;">🚨 Missing Requirements</p>
                           <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
                               ${team.missing_skills && team.missing_skills.length > 0 
                                   ? team.missing_skills.map(s => `<span class="pill danger-pill" style="border: 1px solid var(--danger); background:transparent; font-size:0.75rem;">${s}</span>`).join('')
                                   : `<span style="color:var(--success); font-size:0.8rem;">All Skills Covered</span>`}
                           </div>
                       </div>
                       ` : ''}
                       
                       <div style="display:flex; gap:0.5rem; justify-content: flex-end;">
                           <button class="btn secondary-btn" style="padding:0.3rem 0.6rem; font-size:0.85rem; width:auto;" onclick="window.viewTeamDetails(${team.id})">View Team</button>
                           <button class="btn" style="padding:0.3rem 0.6rem; font-size:0.85rem; width:auto; color:var(--danger); border:1px solid var(--danger)" onclick="window.leaveTeam(${team.id})">Leave ${team.leader_id == userId ? '(Disband)' : ''}</button>
                           ${team.leader_id == userId ? `
                           <button class="btn accent-btn" style="padding:0.3rem 0.6rem; font-size:0.85rem; width:auto; background:var(--warning); color:#fff;" onclick="window.manageTeam(${team.id}, '${team.team_name}')">Manage</button>
                           <button class="btn primary-btn" style="padding:0.3rem 0.6rem; font-size:0.85rem; width:auto;" onclick="window.findMembers(${team.id}, ${team.event_id})">+ Add Members</button>
                           ` : ''}
                       </div>
                    </div>
                `).join('');
            }
        } catch(e) {}
    }
    renderMyTeams();

    // Populate My Invites & Requests
    try {
        const invRes = await fetch(`${API_BASE}/analytics/pending-invites/${userId}`);
        const data = await invRes.json();
        const actionable = data.actionable || [];
        const waiting = data.waiting || [];
        
        const invRecCont = document.getElementById('invites-received-container');
        const reqSentCont = document.getElementById('requests-sent-container');
        
        window.acceptInvite = async (trId) => {
            try {
                const res = await fetch(`${API_BASE}/teams/requests/${trId}/accept`, { method: 'PUT' });
                if (res.ok) {
                    initTeams(); // Reload all info
                } else {
                    const text = await res.json();
                    alert(text.message || 'Error accepting request');
                }
            } catch(e) { console.error(e) }
        };

        window.rejectInvite = async (trId) => {
            try {
                const res = await fetch(`${API_BASE}/teams/requests/${trId}/reject`, { method: 'PUT' });
                if (res.ok) {
                    initTeams(); // Reload all info
                }
            } catch(e) {}
        };

        window.cancelRequest = async (trId) => {
            try {
                const res = await fetch(`${API_BASE}/teams/requests/${trId}/reject`, { method: 'PUT' });
                if (res.ok) {
                    initTeams(); // Reload all info
                }
            } catch(e) {}
        };
        
        window.findMembers = async (teamId, eventId) => {
            if (!eventId) {
                window.showToast('This team is not mapped to an event yet.', 'warning');
                return;
            }
            
            let overlay = document.getElementById('find-members-modal');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'find-members-modal';
                overlay.className = 'modal';
                overlay.innerHTML = `
                  <div class="modal-content" style="max-width: 600px;">
                     <span class="close-btn" style="top: 1rem; right: 1.5rem;" onclick="document.getElementById('find-members-modal').style.display='none'">&times;</span>
                     <h3 style="margin-bottom: 0.5rem; color:var(--accent); font-size:1.5rem;">🔥 Discover Top Talent</h3>
                     <p style="color:var(--text-muted); margin-bottom: 1.5rem; font-size:0.9rem;">Instantly invite available students who meet this event's critical skill requirements.</p>
                     <ul id="find-members-list" class="user-list" style="max-height: 450px; overflow-y: auto; padding-right: 1rem;"></ul>
                  </div>
                `;
                document.body.appendChild(overlay);
            }
            
            overlay.style.display = 'flex';
            const list = document.getElementById('find-members-list');
            list.innerHTML = '<li style="color:var(--text-muted); padding:1rem 0;">Scanning database for skill gaps...</li>';
            
            try {
                const fastRes = await fetch(`${API_BASE}/analytics/fast-builder/${eventId}`);
                const fastData = await fastRes.json();
                
                if (!fastData || fastData.length === 0) {
                    list.innerHTML = '<li style="color:var(--warning); padding:1rem 0;">No available students mapped with required skills.</li>';
                } else {
                    list.innerHTML = fastData.map(u => `
                        <li style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--panel-border); padding: 0.8rem 0;">
                           <div>
                               <strong style="color:white; font-size:1.1rem;">${u.name}</strong> 
                               <span class="pill" style="font-size:0.75rem; background:rgba(16, 185, 129, 0.1); color:var(--success); border: 1px solid var(--success); margin-left:0.5rem; border-radius:12px;">★ ${u.matched_skills} Missing Skills Fixed</span>
                           </div>
                           <button class="btn primary-btn" style="padding:0.4rem 1rem; font-size:0.85rem; width:auto;" onclick="
                               const btn = this;
                               fetch('${API_BASE}/teams/requests', {
                                   method: 'POST',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ team_id: ${teamId}, student_id: ${u.id}, type: 'INVITE' })
                               }).then(async res => {
                                   if(res.ok) {
                                       btn.innerText = 'Sent!';
                                       btn.style.backgroundColor = 'var(--success)';
                                       btn.disabled = true;
                                       window.showToast('Invite deployed to ' + '${u.name.split(' ')[0]}', 'success');
                                   } else {
                                       const err = await res.json();
                                       window.showToast(err.message || 'Invite failed', 'error');
                                   }
                               });
                           ">Invite</button>
                        </li>
                    `).join('');
                }
            } catch(e) {
                list.innerHTML = '<li style="color:var(--danger)">Offline or error locating candidates.</li>';
            }
        };
        
        window.viewTeamDetails = async (teamId) => {
            let overlay = document.getElementById('team-details-modal');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'team-details-modal';
                overlay.className = 'modal';
                overlay.innerHTML = `
                  <div class="modal-content" style="max-width: 500px;">
                     <span class="close-btn" style="top: 1rem; right: 1.5rem;" onclick="document.getElementById('team-details-modal').style.display='none'">&times;</span>
                     <h3 id="details-team-name" style="margin-bottom: 0.5rem; color:white; font-size:1.5rem;">Team Details</h3>
                     <p id="details-event-name" style="color:var(--text-muted); margin-bottom: 1.5rem; font-size:0.9rem;">Event Information</p>
                     
                     <div style="background:rgba(255,255,255,0.02); border:1px solid var(--panel-border); border-radius:8px; padding: 1rem;">
                         <h4 style="margin-bottom:1rem; font-size:1rem; border-bottom:1px solid var(--panel-border); padding-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
                             Members <span id="details-count" style="font-weight:normal; color:var(--text-muted); font-size:0.8rem;"></span>
                         </h4>
                         <ul id="details-members-list" class="user-list" style="max-height: 400px; overflow-y: auto; padding-right: 0.5rem; margin:0; list-style:none;"></ul>
                     </div>
                  </div>
                `;
                document.body.appendChild(overlay);
            }
            
            overlay.style.display = 'flex';
            document.getElementById('details-members-list').innerHTML = '<li style="color:var(--text-muted); padding:1rem 0;">Fetching team details...</li>';
            document.getElementById('details-team-name').innerText = 'Loading...';
            document.getElementById('details-event-name').innerText = '';
            
            try {
                const res = await fetch(`${API_BASE}/teams/${teamId}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const team = await res.json();
                
                document.getElementById('details-team-name').innerText = team.team_name + (team.status === 'Closed' ? ' (Full)' : '');
                document.getElementById('details-event-name').innerHTML = team.event_name ? `Target Event: <strong style="color:var(--accent)">${team.event_name}</strong>` : 'No target event specified';
                document.getElementById('details-count').innerText = `(${team.members.length}/4 allowed)`;
                
                if (team.members && team.members.length > 0) {
                    document.getElementById('details-members-list').innerHTML = team.members.map(m => `
                        <li style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0.8rem 0;">
                           <div style="display:flex; align-items:center; gap: 1rem;">
                               <div style="width:40px; height:40px; border-radius:50%; background:var(--accent); color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem;">
                                   ${m.name.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                   <strong style="color:white; font-size:1.05rem;">${m.name}</strong> ${team.leader_id === m.id ? '<span class="pill" style="font-size:0.65rem; background:var(--warning); color:white; padding:0.1rem 0.4rem; margin-left:0.3rem;">Leader</span>' : ''}
                                   <div style="color:var(--text-muted); font-size:0.8rem; margin-top:0.2rem;">@${m.username} &bull; ${m.department || 'Student'}</div>
                               </div>
                           </div>
                        </li>
                    `).join('');
                } else {
                    document.getElementById('details-members-list').innerHTML = '<li style="color:var(--text-muted); padding:1rem 0;">No members found.</li>';
                }
            } catch(e) {
                document.getElementById('details-members-list').innerHTML = '<li style="color:var(--danger); padding:1rem 0;">Error loading team details. Ensure the server is online.</li>';
            }
        };

        window.leaveTeam = async (teamId) => {
            window.showConfirm('Are you sure you want to leave this team?', async () => {
                try {
                    const res = await fetch(`${API_BASE}/teams/${teamId}/leave/${userId}`, { method: 'DELETE' });
                    const text = await res.json();
                    window.showToast(text.message, 'success');
                    initTeams();
                } catch(e) {}
            });
        };

        window.manageTeam = async (teamId, teamName) => {
            try {
                const res = await fetch(`${API_BASE}/teams/${teamId}/requests`);
                const reqs = await res.json();
                if (reqs.length === 0) {
                    window.showToast('No pending requests for ' + teamName, 'warning');
                } else {
                    let msg = "Pending requests:\\n\\n" + reqs.map(r => r.student_name).join('\\n');
                    window.showConfirm(msg + "\\n\\nClick Confirm to automatically Accept the first request for demo purposes.", async () => {
                        await fetch(`${API_BASE}/teams/requests/${reqs[0].id}/accept`, { method: 'PUT' });
                        window.showToast('Accepted ' + reqs[0].student_name, 'success');
                        initTeams();
                    });
                }
            } catch(e) {}
        };

        if (actionable.length === 0) {
           invRecCont.innerHTML = '<div class="card" style="padding:1rem; color:var(--text-muted)">No pending invites received.</div>';
        } else {
           invRecCont.innerHTML = actionable.map(i => `
            <div class="card" style="padding:1rem; margin-bottom:0.5rem; border-left: 3px solid var(--accent)">
               <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 0.5rem;">
                  <div>
                      <h4 style="color:white; font-size:1.1rem; margin-bottom:0.2rem;">${i.team_name}</h4>
                      <p style="color:var(--text-muted); font-size:0.85rem;">Leader: <strong style="color:white">${i.leader_name}</strong> ${i.event_name ? `| Event: ${i.event_name}` : ''}</p>
                  </div>
                  <span class="pill" style="color:var(--accent); border:1px solid var(--accent); background:transparent;">${i.type === 'INVITE' ? 'Invite' : 'Request'}</span>
               </div>
               
               <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom: 1rem;">
                   ${i.team_members && i.team_members.length > 0 
                       ? i.team_members.map(m => `<span class="pill" style="background:#2a2b38; font-size:0.75rem;">${m}</span>`).join('') 
                       : '<span style="color:var(--text-muted); font-size:0.8rem">No other members</span>'
                   }
               </div>

               <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
                   <button class="btn primary-btn" style="padding:0.3rem 0.6rem; font-size:0.85rem;" onclick="window.acceptInvite(${i.id})">Accept</button>
                   <button class="btn" style="color:var(--danger); border:1px solid var(--danger); padding:0.3rem 0.6rem; font-size:0.85rem;" onclick="window.rejectInvite(${i.id})">Reject</button>
               </div>
            </div>
           `).join('');
        }

        if (waiting.length === 0) {
           reqSentCont.innerHTML = '<div class="card" style="padding:1rem; color:var(--text-muted)">No pending requests sent.</div>';
        } else {
           reqSentCont.innerHTML = waiting.map(i => `
            <div class="card" style="padding:1rem; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center; border-left: 3px solid var(--warning)">
               <div>
                  <h4 style="color:white; font-size:1rem;">${i.team_name}</h4>
                  <p style="color:var(--text-muted); font-size:0.85rem;">Status: PENDING</p>
               </div>
               <button class="btn" style="color:var(--danger); border:1px solid var(--danger); outline:none;" onclick="window.cancelRequest(${i.id})">Cancel</button>
            </div>
           `).join('');
        }
    } catch(e) { }
}

// ==========================================
// BROWSE TEAMS LOGIC
// ==========================================
async function initBrowseTeams() {
    const grid = document.getElementById('browse-teams-grid');
    const searchInput = document.getElementById('search-teams-input');
    const eventSelect = document.getElementById('filter-event');
    const statusSelect = document.getElementById('filter-status');
    const matchBtn = document.getElementById('filter-my-match');
    
    let allTeams = [];
    let mySkills = [];
    let myRequests = [];
    
    try {
        const [uRes, tRes, invRes, evRes] = await Promise.all([
            fetch(`${API_BASE}/analytics/student-profile/${userId}`),
            fetch(`${API_BASE}/teams/detailed`),
            fetch(`${API_BASE}/analytics/pending-invites/${userId}`),
            fetch(`${API_BASE}/events`)
        ]);
        
        const profiles = await uRes.json();
        mySkills = profiles.map(p => p.skill_name).filter(Boolean);
        
        allTeams = await tRes.json();
        const events = await evRes.json();
        
        const invData = await invRes.json();
        myRequests = invData.waiting || [];

        // Populate Event Filter
        if(eventSelect) {
            eventSelect.innerHTML = '<option value="">All Events</option>' + 
                events.map(ev => `<option value="${ev.event_name}">${ev.event_name}</option>`).join('');
        }

        const renderBrowseTeams = (teams) => {
            if(teams.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">No teams found matching your criteria.</p>';
                return;
            }
            
            grid.innerHTML = teams.map(team => {
                const memberCount = (team.members ? team.members.length : 0) + 1;
                const memberTags = team.members ? team.members.map(m => `<span class="pill" style="background:#2a2b38;">${m.username || m.name.split(' ')[0]}</span>`).join('') : '';
                const missingSkills = team.missing_skills && team.missing_skills.length > 0 
                    ? team.missing_skills.map(s => `<span class="pill danger-pill" style="border: 1px solid var(--danger); background:transparent;">${s}</span>`).join('')
                    : `<span class="pill" style="color:var(--success); border:1px solid var(--success); background:transparent;">All Skills Covered</span>`;
                    
                let matchHtml = '';
                let matchPercent = 0;
                if (team.missing_skills && team.missing_skills.length > 0) {
                     const coveredCount = team.missing_skills.filter(ms => mySkills.includes(ms)).length;
                     matchPercent = Math.round((coveredCount / team.missing_skills.length) * 100);
                     
                     if (matchPercent === 100) {
                         matchHtml = `<span class="pill" style="background:rgba(16, 185, 129, 0.1); color:var(--success); border:1px solid var(--success);">🔥 Your Match: 100%</span>`;
                     } else if (matchPercent > 0) {
                         matchHtml = `<span class="pill" style="color:var(--warning); border:1px solid var(--warning); background:transparent;">👍 Your Match: ${matchPercent}%</span>`;
                     } else {
                         matchHtml = `<span class="pill" style="color:var(--text-muted); border:1px solid var(--panel-border); background:transparent;">Your Match: 0%</span>`;
                     }
                }
                team.matchPercent = matchPercent;

                const isPending = myRequests.find(r => r.team_id == team.id);
                let actionHtml = '';
                if (isPending) {
                    actionHtml = `<button class="btn" style="color:var(--warning); border:1px solid var(--warning);" disabled>Request Pending</button>`;
                } else if (team.leader_id == userId || (team.members && team.members.find(m => m.student_id == userId || m.id == userId))) {
                    actionHtml = `<button class="btn" style="color:var(--success); border:1px solid var(--success);" disabled>Already a Member</button>`;
                } else if (memberCount >= 4 || team.status === 'Closed' || team.status === 'Full') {
                    actionHtml = `<button class="btn" style="color:var(--text-muted); border:1px solid var(--text-muted);" disabled>Team Full</button>`;
                } else {
                    actionHtml = `<button class="btn accent-btn" style="width:auto; padding:0.4rem 1rem;" onclick="window.requestToJoin(${team.id})">Request to Join</button>`;
                }

                return `
                <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
                   <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                       <h3 style="color:var(--accent);">${team.team_name}</h3>
                       ${team.event_name ? `<span class="pill" style="background:rgba(255,255,255,0.1); color:#fff; display:flex; align-items:center; gap:0.4rem;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 6 7 1-5 5 1 7-7-4-7 4 1-7-5-5 7-1z"></path></svg> 
                            ${team.event_name.length > 20 ? team.event_name.substring(0, 20) + '...' : team.event_name}
                       </span>` : ''}
                   </div>
                   
                   <div>
                       <p style="color:var(--text-main); font-weight:500; font-size:0.9rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                           Roster (${memberCount})
                       </p>
                       <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.8rem;">Leader: <strong style="color:white;">${team.leader_username || team.leader_name}</strong></p>
                       <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                           ${memberTags}
                       </div>
                   </div>
                   
                   <div style="background:rgba(0,0,0,0.2); padding:1rem; border-radius:8px; margin-top:auto;">
                       <p style="color:var(--text-main); font-size:0.85rem; display:flex; align-items:center; gap:0.4rem; margin-bottom:0.8rem;">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                           Missing Requirements
                       </p>
                       <div style="display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:space-between; align-items:center;">
                           <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                               ${missingSkills}
                           </div>
                           ${matchHtml}
                       </div>
                   </div>
                   <div style="display:flex; justify-content:flex-end; margin-top: 0.5rem;">
                       ${actionHtml}
                   </div>
                </div>
                `;
            }).join('');
        };

        const applyTeamFilters = () => {
            const term = searchInput ? searchInput.value.toLowerCase() : '';
            const eventTerm = eventSelect ? eventSelect.value : '';
            const statusTerm = statusSelect ? statusSelect.value : 'Recruiting';
            
            const filtered = allTeams.filter(t => {
                const matchesSearch = t.team_name.toLowerCase().includes(term);
                const matchesEvent = !eventTerm || t.event_name === eventTerm;
                const matchesStatus = statusTerm === 'All' || 
                                     (statusTerm === 'Recruiting' && t.status === 'Recruiting') ||
                                     (statusTerm === 'Full' && (t.status === 'Full' || t.status === 'Closed'));
                return matchesSearch && matchesEvent && matchesStatus;
            });
            
            renderBrowseTeams(filtered);
        };

        searchInput?.addEventListener('input', applyTeamFilters);
        eventSelect?.addEventListener('change', applyTeamFilters);
        statusSelect?.addEventListener('change', applyTeamFilters);
        
        matchBtn?.addEventListener('click', () => {
            const sortedByMatch = [...allTeams].sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));
            renderBrowseTeams(sortedByMatch);
            window.showToast('Sorted by your skill compatibility!', 'success');
        });

        window.requestToJoin = async (teamId) => {
            try {
                const res = await fetch(`${API_BASE}/teams/requests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ team_id: teamId, student_id: userId, type: 'REQUEST' })
                });
                
                if (res.ok) {
                    window.showToast('Request sent successfully!', 'success');
                    myRequests.push({ team_id: teamId });
                    applyTeamFilters(); 
                } else {
                    const data = await res.json();
                    window.showToast(data.message || 'Failed to send request.', 'error');
                }
            } catch (e) {
                window.showToast('Network error. Try again later.', 'error');
            }
        };

        renderBrowseTeams(allTeams);
    } catch(e) {
        grid.innerHTML = '<div class="error">Failed to load teams or user context.</div>';
    }
}

// ==========================================
// SEARCH LOGIC (Smart Recommendations Upgrade)
// ==========================================
async function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const filterBtn = document.getElementById('filter-no-team-btn');
    const grid = document.getElementById('users-results');
    const loading = document.getElementById('search-loading');

    // 1. Fetch current user's team context for smart matching
    let primaryTeam = null;
    let matchScores = [];
    try {
        const res = await fetch(`${API_BASE}/teams/my-teams/${userId}`);
        const teams = await res.json();
        primaryTeam = teams.find(t => t.leader_id == userId) || teams[0];
        
        if (primaryTeam && primaryTeam.event_id) {
            const matchRes = await fetch(`${API_BASE}/analytics/match-percentage/${primaryTeam.event_id}`);
            matchScores = await matchRes.json();
        }
    } catch(e) {}

    window.sendTeamInvite = async (studentId) => {
        if(!primaryTeam) return alert('You must be in a team to send an invite.');
        try {
            const res = await fetch(`${API_BASE}/teams/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ team_id: primaryTeam.id, student_id: studentId, type: 'INVITE' })
            });
            if(res.ok) {
                alert('Invite sent! Check your Teams & Invites (Requests Sent tab).');
            } else {
                const err = await res.json();
                alert(err.message || 'Error sending invite');
            }
        } catch(e) { }
    };

    const renderUsers = (data, isNoTeam) => {
        if (!data || data.length === 0) return '<p>No results found.</p>';
        return data.map(u => {
            const mScore = matchScores.find(m => m.student_id == u.id);
            const matchHtml = primaryTeam && primaryTeam.event_name && mScore 
                ? `<p style="color:var(--success); font-weight:600; font-size:0.85rem; margin-top: 0.4rem; background: rgba(16, 185, 129, 0.1); padding: 0.2rem 0.5rem; display:inline-block; border-radius:4px;">🔥 Match for ${primaryTeam.event_name}: ${mScore.match_percentage}%</p>`
                : '';

            const inviteHtml = primaryTeam 
                ? `<button class="btn accent-btn" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="window.sendTeamInvite(${u.id})">Invite</button>` 
                : '';

            return `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; ${isNoTeam ? 'border-left: 3px solid var(--warning);' : ''}">
                <div>
                    <h4 style="color:white; font-size:1.1rem;">${u.name}</h4>
                    <p style="color:var(--text-muted); font-size:0.9rem;">${u.department} ${u.year_of_study ? `(Year ${u.year_of_study})` : ''}</p>
                    ${u.skills ? `<p style="color:var(--accent); font-size:0.85rem; margin-top: 0.2rem;">Skills: ${u.skills}</p>` : ''}
                    ${matchHtml}
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
                    ${isNoTeam ? `<span class="pill outline" style="color:var(--warning); border-color:var(--warning)">Available</span>` : ''}
                    ${inviteHtml}
                </div>
            </div>`;
        }).join('');
    };

    searchBtn?.addEventListener('click', async () => {
        const q = document.getElementById('search-input').value;
        if (!q) return;
        loading.style.display = 'block';
        grid.innerHTML = '';
        try {
            const res = await fetch(`${API_BASE}/analytics/search?q=${q}`);
            const data = await res.json();
            grid.innerHTML = renderUsers(data, false);
        } catch(e) {}
        loading.style.display = 'none';
    });

    filterBtn?.addEventListener('click', async () => {
        loading.style.display = 'block';
        grid.innerHTML = '';
        try {
            const res = await fetch(`${API_BASE}/analytics/students-no-team`);
            const data = await res.json();
            
            // Smart Sort by Match Percentage for "Students Without Team"
            if (matchScores.length > 0) {
                data.sort((a, b) => {
                    const scoreA = matchScores.find(m => m.student_id == a.id)?.match_percentage || 0;
                    const scoreB = matchScores.find(m => m.student_id == b.id)?.match_percentage || 0;
                    return scoreB - scoreA;
                });
            }
            
            grid.innerHTML = renderUsers(data, true);
        } catch(e) {}
        loading.style.display = 'none';
    });
}

// ==========================================
// PROFILE LOGIC
// ==========================================
async function initProfile() {
    try {
        const proRes = await fetch(`${API_BASE}/analytics/student-profile/${userId}`);
        const profiles = await proRes.json();
        
        if(profiles.length > 0) {
            const user = profiles[0];
            document.getElementById('prof-name').textContent = user.name;
            document.getElementById('prof-email').textContent = user.email || 'N/A';
            document.getElementById('prof-dept').textContent = user.department;
            document.getElementById('prof-year').textContent = user.year_of_study;
            
            const skills = [...new Set(profiles.map(p => p.skill_name).filter(Boolean))];
            const skillsHtml = skills.map(s => `<li class="pill">${s}</li>`).join('');
            document.getElementById('prof-skills').innerHTML = skillsHtml || '<li class="pill">No skills</li>';
        }

        // Teams participated in 
        const leadRes = await fetch(`${API_BASE}/analytics/global-leaderboard`);
        const leadData = await leadRes.json();
        if(profiles.length > 0) {
            const myLead = leadData.find(l => l.name === profiles[0].name);
            document.getElementById('prof-teams-count').textContent = myLead ? myLead.total_participations : 0;
        }

    } catch(e) { }
}

// ==========================================
// ANALYTICS LOGIC
// ==========================================
async function initAnalytics() {
    try {
        // 🥇 1. Skill Demand Analytics
        const skillRes = await fetch(`${API_BASE}/analytics/skill-demand`);
        const skillData = await skillRes.json();
        const skillContainer = document.getElementById('skill-demand-container');
        
        if (skillData.length > 0) {
            const maxDemand = skillData[0].demand;
            skillContainer.innerHTML = skillData.map((s, i) => `
                <div class="skill-row">
                    <div class="skill-label">
                        <span><strong>${s.skill_name}</strong></span>
                        <span style="color:var(--accent)">${s.demand} requirements</span>
                    </div>
                    <div class="bar-bg">
                        <div class="bar-fill" style="width: 0%; background: ${i === 0 ? 'var(--warning)' : 'var(--accent)'}" data-width="${(s.demand / maxDemand) * 100}%"></div>
                    </div>
                </div>
            `).join('');
            
            // Trigger animation
            setTimeout(() => {
                document.querySelectorAll('.bar-fill').forEach(bar => {
                    bar.style.width = bar.dataset.width;
                });
            }, 100);
        } else {
            skillContainer.innerHTML = '<p>No data available</p>';
        }

        // 🥈 2. Team Formation Trend (Growth Insight)
        const trendRes = await fetch(`${API_BASE}/analytics/team-trends`);
        const trendData = await trendRes.json();
        
        const ctx = document.getElementById('teamTrendChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.map(d => new Date(d.date).toLocaleDateString()),
                datasets: [{
                    label: 'Teams Created',
                    data: trendData.map(d => d.teams_created),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: 'rgba(255,255,255,0.5)' }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.5)' }
                    }
                }
            }
        });

        // 🥉 3. Top Collaborators (Leaderboard)
        const collabRes = await fetch(`${API_BASE}/analytics/top-collaborators`);
        const collabData = await collabRes.json();
        const collabList = document.getElementById('collaborators-list');
        
        if (collabData.length > 0) {
            collabList.innerHTML = collabData.map((c, i) => `
                <li>
                    <div style="display:flex; align-items:center; gap:1rem;">
                        <span class="rank-badge rank-${i+1}">${i < 3 ? '' : i+1}</span>
                        ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}
                        <strong style="color:white; font-size:1.1rem;">${c.name}</strong>
                    </div>
                    <div style="text-align:right;">
                        <span class="pill" style="background:rgba(255,255,255,0.05); color:var(--text-main);">${c.team_count} Teams joined</span>
                    </div>
                </li>
            `).join('');
        } else {
            collabList.innerHTML = '<li>No collaborators found yet.</li>';
        }

    } catch (e) {
        console.error('Analytics load error:', e);
    }
}
