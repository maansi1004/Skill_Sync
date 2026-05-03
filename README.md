# SkillSync: Event Management & Team Sync Platform 🚀

**SkillSync** is a full-stack database management system (DBMS) project designed to help university students discover technical events (like hackathons), identify skill gaps, and dynamically form balanced teams based on specific event requirements. 

---


https://github.com/user-attachments/assets/c2a57b00-5fac-48d5-961b-c596db5b06b4

<img width="1024" height="1536" alt="ER_Diagram" src="https://github.com/user-attachments/assets/cef0c3ca-2584-431c-8097-dc8e3abd8ac4" />




## 🌟 Key Features

1. **Intelligent Event Discovery:** 
   - Browse through upcoming technical events and hackathons.
   - Dynamic sorting algorithms (e.g., "Deadline: Soonest" auto-filters expired events using database-level date math).
   - Instant "My Skills Match" filtering to find events tailored to a student's profile.

2. **Automated Skill Gap Analysis:** 
   - When viewing a team or an event, the system mathematically computes the "Missing Requirements" by running deep correlated subqueries against the event's required skills versus the user's or team's possessed skills.

3. **Smart Team Building (Match System Flow):**
   - Team leaders can view automated candidate recommendations via a **Fast Builder** that finds completely available students who possess the exact missing skills required to complete the team.

4. **Advanced Administrator Analytics:**
   - Visualizes complex database metrics such as Top Collaborators, Active Networkers, Skill Demand, and a Global Participation Leaderboard.

5. **Interactive Student Dashboard:**
   - Real-time management of active teams, pending join requests, and received invitations heavily protected by backend database exclusivity constraints.

---

## 🗄️ Database Architecture & SQL Implementation

This project was built to exceed standard academic DBMS requirements, heavily utilizing advanced SQL concepts alongside standard PL/SQL triggers and constraints.

### Part A: Advanced SQL Query Implementation
The backend Node.js server seamlessly integrates complex SQL operations directly into the frontend workflow. Below is an overview of the core DBMS concepts applied:

#### 1. Correlated Subqueries & Anti-Joins (`NOT IN`)
*   **Match Algorithm & Missing Skills:** To dynamically calculate exactly what skills a recruiting team is lacking, the system runs an Anti-Join comparing the event's requirements against the collective skills currently held by the team's roster. This logic ensures accurate, live calculations without storing redundant data.

#### 2. Self-Joins
*   **Top Collaborators (Dynamic Duos):** The analytics engine identifies pairs of students who frequently team up together across multiple different events. This is achieved by joining the team members relationship table against itself.

#### 3. Set Operations (`UNION ALL`)
*   **Active Networkers Feed:** To create a unified activity feed, the system combines a student's outgoing join "Requests" and incoming team "Invites" using a highly performant `UNION ALL` operation, presenting diverse data from different relationships as a single stream.

#### 4. Window Functions / Analytical Functions
*   **Global Participation Leaderboard:** Uses the `RANK() OVER()` analytical function to mathematically rank students based on their total volume of platform participation. This calculates positional standings dynamically on the fly.

#### 5. Conditional Logic (`CASE`) & Date Math
*   **Deadline Alerts & Grouping:** Evaluates the difference between an event's date and the current server timestamp, dynamically assigning priority levels (`URGENT`, `UPCOMING`, `FUTURE`) via `CASE WHEN`. It also heavily utilizes aggregate date functions (like extracting months) to find system-wide event trends.

---

### Part B: Physical Constraints, Triggers & Procedures

#### 1. Advanced Physical Constraints
*   **CHECK Constraints:** Domain enforcement at the database level (e.g., `year_of_study BETWEEN 1 AND 4`, valid `status` and `type` enforcements).
*   **Exclusivity & Capacity Rules:** The backend actively prevents users from creating or joining multiple teams for the exact same event using pre-insertion query validations.

#### 2. Database Triggers
*   **Capacity Enforcement:** The absolute max limit of 4 members per team is physically enforced using a `BEFORE INSERT` Trigger that dynamically counts team sizes and throws a `SIGNAL SQLSTATE '45000'` (or Oracle `RAISE_APPLICATION_ERROR`) if the cap is exceeded.
*   **Auto-Join Workflow:** An `AFTER UPDATE` trigger that monitors `team_requests`. When a request flips to 'ACCEPTED', the trigger automatically fires to insert the student into the `team_members` relationship table.
*   **Audit Logging:** Tracks exits and deletions for platform accountability.

#### 3. Stored Procedures & Cursors
*   Modularized business logic implemented directly in the database.
*   Complex looping mechanisms utilizing `CURSOR` blocks to iterate through potential student candidates, automatically generate pending invites, and manage row-by-row business logic safely.

#### 4. Multi-Dialect Support
*   The repository includes a highly optimized **MySQL script** (`skillsync_100_entries.sql`) loaded with hundreds of rows of realistic seeded data.
*   A fully translated **Oracle PL/SQL script** (`skillsync_oracle_procedures.sql`) demonstrating advanced handling of Oracle-specific environments, including the use of `PRAGMA AUTONOMOUS_TRANSACTION` to securely bypass Mutating Table exceptions (ORA-04091).

---

## 🛠️ Technology Stack

*   **Frontend:** HTML5, CSS3 (Custom Variables, Flexbox, Modern UI/UX), Vanilla JavaScript (Module pattern, asynchronous DOM manipulation)
*   **Backend:** Node.js, Express.js
*   **Database:** MySQL (Primary execution), Oracle PL/SQL (Translated logic & procedures)
*   **Data Access:** `mysql2/promise` for asynchronous, parameterized SQL query execution preventing SQL Injection.

---

## 🚀 How to Run

1. **Database Setup:** 
   - Open MySQL Workbench (or your preferred SQL client).
   - Execute the entire `skillsync_100_entries.sql` script to generate the database, tables, relationships, procedures, triggers, and 100+ rows of sample data.
2. **Backend Server:**
   - Navigate into the `/backend` directory.
   - Run `npm install` to grab dependencies.
   - Start the server using `npm run start` or `node server.js` (Ensure your database credentials in the environment match your local SQL setup).
3. **Frontend Client:**
   - Navigate to the `/frontend` directory.
   - Open `index.html` or `dashboard.html` in your browser (preferably via a Live Server extension) to explore the platform.
