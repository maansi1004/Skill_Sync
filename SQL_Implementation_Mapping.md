# SkillSync: Complete SQL Implementation & Feature Mapping

This document provides a comprehensive and exhaustive mapping of **every** SQL query executed in the SkillSync backend, grouped by the frontend features and modules they power.

---

## 1. User Authentication & Profile Management

### A. User Registration & Login
**Description:** Authenticates users and registers new accounts.
**SQL Implementation:**
```sql
-- Login Authentication
SELECT * FROM students WHERE email = ? AND password = ?;

-- Account Creation
INSERT INTO students (username, name, email, password, department, year_of_study) 
VALUES (?, ?, ?, ?, ?, ?);

-- Skill Registration (Iterative Insert)
INSERT INTO student_skills (student_id, skill_id) VALUES (?, ?);
```

### B. Profile Context & Skill Updates
**Description:** Fetches a user's profile and updates their dynamic skill stack.
**SQL Implementation:**
```sql
-- Fetch Full Student Profile with Skills (LEFT JOIN & GROUP_CONCAT)
SELECT st.id, st.name, st.email, st.department, st.year_of_study, GROUP_CONCAT(s.skill_name) AS skills
FROM students st
LEFT JOIN student_skills ss ON st.id = ss.student_id
LEFT JOIN skills s ON ss.skill_id = s.id
WHERE st.id = ? GROUP BY st.id;

-- Clear Old Skills Before Update
DELETE FROM student_skills WHERE student_id = ?;

-- Fetch Global Skills Dictionary for Modal
SELECT * FROM skills ORDER BY skill_name ASC;
```

---

## 2. Dashboard Recommendations (`dashboard.html`)

### A. Personalized Activity Stats & Profile Strength
**Description:** Calculates the user's activity metrics, such as teams joined and invites sent.
**SQL Implementation (Aggregations):**
```sql
-- Count Teams Joined
SELECT COUNT(*) as count FROM team_members WHERE student_id = ?;

-- Count Invites Sent (Involving the user or teams they lead)
SELECT COUNT(*) as count FROM team_requests 
WHERE type = 'INVITE' AND (student_id = ? OR team_id IN (SELECT id FROM teams WHERE leader_id = ?));

-- Profile Strength (Skills Registered)
SELECT COUNT(*) as count FROM student_skills WHERE student_id = ?;
```

### B. Recommended Teams (Match Algorithm)
**Description:** Recommends teams that actively need the skills the logged-in user possesses.
**SQL Implementation (Complex Joins & Arithmetic Math):**
```sql
SELECT t.id, t.team_name, e.event_name,
ROUND(COUNT(er.skill_id) * 100.0 / (SELECT COUNT(*) FROM event_requirements WHERE event_id = t.event_id), 0) as match_percentage
FROM teams t
JOIN events e ON t.event_id = e.id
JOIN event_requirements er ON e.id = er.event_id
JOIN student_skills ss ON er.skill_id = ss.skill_id
WHERE ss.student_id = ?
AND t.id NOT IN (SELECT team_id FROM team_members WHERE student_id = ?)
GROUP BY t.id
ORDER BY match_percentage DESC LIMIT 2;
```

### C. Suggested Teammates (Complementary Skills)
**Description:** Suggests available students who possess skills that the current user lacks.
**SQL Implementation (Correlated Subqueries):**
```sql
SELECT s.id, s.name, 
(SELECT COUNT(*) FROM student_skills ss2 
 WHERE ss2.student_id = s.id 
 AND ss2.skill_id NOT IN (SELECT skill_id FROM student_skills WHERE student_id = ?)) as score
FROM students s
WHERE s.id != ?
AND s.id NOT IN (SELECT student_id FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE leader_id = ?))
ORDER BY score DESC LIMIT 2;
```

---

## 3. Event Discovery & Match System (`events.html`)

### A. Event Browsing & Countdowns
**Description:** Fetches all upcoming events and dynamically calculates time remaining.
**SQL Implementation:**
```sql
-- Standard Fetch
SELECT * FROM events ORDER BY event_date ASC;

-- Event Countdown (Date Functions)
SELECT event_name, TIMESTAMPDIFF(HOUR, NOW(), event_date) AS hours_left
FROM events WHERE event_date > NOW();
```

### B. Personal Skill Gap Analysis
**Description:** Calculates exactly which required skills a user is missing for a specific event.
**SQL Implementation (NOT IN Subquery):**
```sql
SELECT s.skill_name AS missing_skill
FROM event_requirements er JOIN skills s ON er.skill_id = s.id
WHERE er.event_id = ? AND er.skill_id NOT IN (
    SELECT skill_id FROM student_skills WHERE student_id = ?
);
```

### C. Match System Flow (Fast Builder)
**Description:** Recommends the top available students who match an event's requirements.
**SQL Implementation (Subqueries & Grouping):**
```sql
SELECT st.id, st.name, COUNT(ss.skill_id) AS matched_skills
FROM students st
JOIN student_skills ss ON st.id = ss.student_id
JOIN event_requirements er ON ss.skill_id = er.skill_id
WHERE er.event_id = ? 
AND st.id NOT IN (
    -- Exclude students already in a team for this specific event
    SELECT tm.student_id FROM team_members tm 
    JOIN teams t ON tm.team_id = t.id WHERE t.event_id = ?
)
GROUP BY st.id ORDER BY matched_skills DESC LIMIT 10;
```

---

## 4. Search & Filters (`search.html`)

### A. General Search Users
**Description:** Search directory logic matching partial strings on name or department.
**SQL Implementation (Pattern Matching & Group Concat):**
```sql
SELECT st.id, st.name, st.department, st.year_of_study, GROUP_CONCAT(sk.skill_name SEPARATOR ', ') AS skills
FROM students st
LEFT JOIN student_skills ss ON st.id = ss.student_id
LEFT JOIN skills sk ON ss.skill_id = sk.id
WHERE st.name LIKE ? OR st.department LIKE ?
GROUP BY st.id;
```

### B. Filter: Available Students (No Team)
**Description:** Finds all users who are strictly not participating in any team.
**SQL Implementation (Anti-Join / NOT IN):**
```sql
SELECT st.id, st.name, st.department, st.year_of_study, GROUP_CONCAT(sk.skill_name SEPARATOR ', ') AS skills
FROM students st
LEFT JOIN student_skills ss ON st.id = ss.student_id
LEFT JOIN skills sk ON ss.skill_id = sk.id
WHERE st.id NOT IN (SELECT student_id FROM team_members)
GROUP BY st.id;
```

### C. Filter: Students with Many Skills
**Description:** Identifies highly versatile students.
**SQL Implementation (HAVING Clause):**
```sql
SELECT st.name, COUNT(ss.skill_id) AS skill_count
FROM students st
JOIN student_skills ss ON st.id = ss.student_id
GROUP BY st.id
HAVING COUNT(ss.skill_id) > 5
ORDER BY skill_count DESC;
```

---

## 5. Team Discovery & Application (`browse-teams.html`)

### A. Global Team Directory & Live Skill Needs
**Description:** Lists recruiting teams and calculates exactly what skills the team is currently lacking based on the collective pool of their current members.
**SQL Implementation (Correlated Subqueries against Team Roster):**
```sql
-- Fetch missing skills per team dynamically
SELECT s.skill_name AS missing_skill FROM event_requirements er
JOIN skills s ON er.skill_id = s.id
WHERE er.event_id = ? AND er.skill_id NOT IN (
    SELECT ss.skill_id FROM student_skills ss
    JOIN team_members tm ON ss.student_id = tm.student_id
    WHERE tm.team_id = ?
);
```

### B. Filter: Empty Teams
**Description:** Finds teams created with a leader but exactly zero added members.
**SQL Implementation:**
```sql
SELECT t.id, t.team_name, s.name AS leader_name
FROM teams t JOIN students s ON t.leader_id = s.id
WHERE t.id NOT IN (SELECT team_id FROM team_members GROUP BY team_id HAVING COUNT(*) > 1);
```

---

## 6. Team Management & Safeguards (`teams.html`)

### A. Fetch My Teams & Roster
**Description:** Fetches all teams the user is in and lists the current team members.
**SQL Implementation:**
```sql
-- Get Teams user is in
SELECT t.id, t.team_name, t.leader_id, t.event_id, e.event_name, s.name as leader_name,
       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count
FROM teams t
JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN events e ON t.event_id = e.id
JOIN students s ON t.leader_id = s.id
WHERE tm.student_id = ?;

-- Get other members in those teams
SELECT s.name, s.id as student_id, s.username
FROM students s JOIN team_members tm ON s.id = tm.student_id
WHERE tm.team_id = ? AND s.id != ?;
```

### B. Pending Invites & Requests Queue
**Description:** Fetches relevant pending invites/requests for a user to process.
**SQL Implementation (Multi-Table Joins):**
```sql
SELECT tr.id, t.id AS team_id, t.team_name, s.name AS student_name, tr.createdAt, tr.type, tr.student_id, t.leader_id, sl.name AS leader_name, e.event_name
FROM team_requests tr
JOIN teams t ON tr.team_id = t.id
JOIN students s ON tr.student_id = s.id
JOIN students sl ON t.leader_id = sl.id
LEFT JOIN events e ON t.event_id = e.id
WHERE tr.status = 'PENDING' AND tr.createdAt >= NOW() - INTERVAL 7 DAY;
```

### C. Backend Safeguards: Exclusivity & Capacity
**Description:** Enforces business logic on the database level before processing actions.
**SQL Implementation:**
```sql
-- Enforce Max 4 Members
SELECT COUNT(*) as count FROM team_members WHERE team_id = ?;

-- Prevent User from Joining Multiple Teams for the Same Event
SELECT t.id FROM teams t JOIN team_members tm ON t.id = tm.team_id
WHERE tm.student_id = ? AND t.event_id = ?;

-- Prevent Duplicate Invite/Request Limits (Max 5)
SELECT COUNT(*) as count FROM team_requests WHERE student_id = ? AND type = 'REQUEST' AND status = 'PENDING';
```

---

## 7. Advanced Administrator Analytics (`analytics.html`)

### A. Dynamic Duos / Top Collaborators
**Description:** Finds pairs of students who frequently team up together across multiple events.
**SQL Implementation (Self-Join & HAVING Clause):**
```sql
SELECT s1.name AS student1, s2.name AS student2, COUNT(*) AS times_teamed_up
FROM team_members a
JOIN team_members b ON a.team_id = b.team_id AND a.student_id < b.student_id
JOIN students s1 ON a.student_id = s1.id
JOIN students s2 ON b.student_id = s2.id
GROUP BY a.student_id, b.student_id
HAVING times_teamed_up >= 1
ORDER BY times_teamed_up DESC LIMIT 5;
```

### B. Active Networkers
**Description:** Unifies the stream of outgoing join requests and incoming team invites.
**SQL Implementation (UNION ALL):**
```sql
SELECT s.name, 'Outgoing Request' AS activity_type 
FROM team_requests tr JOIN students s ON tr.student_id = s.id 
WHERE tr.type='REQUEST' AND tr.status='PENDING'
UNION ALL
SELECT s.name, 'Incoming Invite' AS activity_type 
FROM team_requests tr JOIN students s ON tr.student_id = s.id 
WHERE tr.type='INVITE' AND tr.status='PENDING'
LIMIT 15;
```

### C. Global Participation Leaderboard
**Description:** Ranks students based on the total number of teams they have participated in.
**SQL Implementation (Window Functions / Ranking):**
```sql
SELECT st.name, st.department, COUNT(tm.team_id) AS total_participations,
RANK() OVER (ORDER BY COUNT(tm.team_id) DESC) AS global_rank
FROM students st
LEFT JOIN team_members tm ON st.id = tm.student_id
GROUP BY st.id
ORDER BY global_rank ASC LIMIT 15;
```

### D. System Demographics & Trends
**Description:** Summarizes user demographics, event popularity, and skill frequencies.
**SQL Implementation (Aggregations):**
```sql
-- Department Distribution
SELECT department, COUNT(*) AS student_count FROM students GROUP BY department ORDER BY student_count DESC;

-- Users By Year
SELECT year_of_study, COUNT(*) AS total_users FROM students GROUP BY year_of_study ORDER BY year_of_study ASC;

-- Skill Demand Analysis
SELECT s.skill_name, COUNT(*) AS demand
FROM event_requirements er JOIN skills s ON s.id = er.skill_id
GROUP BY s.skill_name ORDER BY demand DESC LIMIT 5;

-- Events by Month (Using Date Functions)
SELECT MONTHNAME(event_date) AS event_month, COUNT(*) AS total_events
FROM events GROUP BY MONTH(event_date), MONTHNAME(event_date) ORDER BY MONTH(event_date);
```

### E. Deadline Alerts
**Description:** Categorizes upcoming events based on urgency using CASE conditional logic.
**SQL Implementation (CASE Statements & Date Math):**
```sql
SELECT event_name, event_date, DATEDIFF(event_date, NOW()) AS days_remaining,
CASE 
    WHEN DATEDIFF(event_date, NOW()) < 7 THEN 'URGENT'
    WHEN DATEDIFF(event_date, NOW()) BETWEEN 7 AND 30 THEN 'UPCOMING'
    ELSE 'FUTURE'
END AS priority_level
FROM events
WHERE event_date > NOW() ORDER BY days_remaining ASC LIMIT 10;
```
