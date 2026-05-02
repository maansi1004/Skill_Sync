-- ============================================================================ --
-- SKILLSYNC ORACLE PL/SQL DATABASE PROCEDURES & TRIGGERS
-- Translated from MySQL to Oracle PL/SQL syntax
-- ============================================================================ --

-- 1. LOGIN PROCEDURE
-- Uses: Variables, OUT parameters, SQL selection
CREATE OR REPLACE PROCEDURE login_user(
    p_email IN VARCHAR2,
    p_password IN VARCHAR2,
    p_status OUT VARCHAR2,
    p_user_id OUT NUMBER
) AS
    v_count NUMBER;
BEGIN
    -- Check if user exists
    SELECT COUNT(*) INTO v_count 
    FROM students 
    WHERE email = p_email AND password = p_password;
    
    IF v_count = 1 THEN
        SELECT id INTO p_user_id 
        FROM students 
        WHERE email = p_email AND password = p_password;
        
        p_status := 'SUCCESS';
    ELSE
        p_status := 'FAILURE';
        p_user_id := NULL;
    END IF;
END;
/

-- 2. SKILL VALIDATION PROCEDURE
-- Uses: Control statements (IF/ELSE)
CREATE OR REPLACE PROCEDURE validate_student_skill(
    p_student_id IN NUMBER,
    p_event_id IN NUMBER,
    p_is_eligible OUT NUMBER -- 1 for True, 0 for False (Oracle SQL standard)
) AS
    v_matching_skills NUMBER := 0;
BEGIN
    -- Check how many event-required skills the student actually has
    SELECT COUNT(*) INTO v_matching_skills
    FROM event_requirements er
    JOIN student_skills ss ON er.skill_id = ss.skill_id
    WHERE er.event_id = p_event_id AND ss.student_id = p_student_id;
    
    IF v_matching_skills > 0 THEN
        p_is_eligible := 1;
    ELSE
        p_is_eligible := 0;
    END IF;
END;
/

-- 3. RECOMMENDATION PROCEDURE
-- Uses: CURSORS and Looping mechanisms
CREATE OR REPLACE PROCEDURE recommend_and_invite_students(
    p_team_id IN NUMBER,
    p_event_id IN NUMBER
) AS
    -- Define the Cursor for matching students
    CURSOR student_cursor IS
        SELECT DISTINCT ss.student_id 
        FROM student_skills ss
        JOIN event_requirements er ON ss.skill_id = er.skill_id
        WHERE er.event_id = p_event_id
        AND ss.student_id NOT IN (SELECT student_id FROM team_members WHERE team_id = p_team_id)
        AND ROWNUM <= 5; -- Oracle equivalent of LIMIT 5
        
    v_request_exists NUMBER;
BEGIN
    -- Oracle FOR loop handles OPEN, FETCH, and CLOSE automatically
    FOR r_student IN student_cursor LOOP
        
        -- Check if request already exists
        SELECT COUNT(*) INTO v_request_exists 
        FROM team_requests 
        WHERE team_id = p_team_id 
        AND student_id = r_student.student_id 
        AND type = 'INVITE';

        IF v_request_exists = 0 THEN
            INSERT INTO team_requests (team_id, student_id, type, status)
            VALUES (p_team_id, r_student.student_id, 'INVITE', 'PENDING');
        END IF;
        
    END LOOP;
    
    COMMIT; -- PL/SQL explicit commit
END;
/

-- 4. AUTO-JOIN TRIGGER
-- Uses: AFTER UPDATE Trigger logic
CREATE OR REPLACE TRIGGER trg_auto_join_on_accept
AFTER UPDATE ON team_requests
FOR EACH ROW
BEGIN
    -- If a request was just updated from PENDING to ACCEPTED
    IF :OLD.status = 'PENDING' AND :NEW.status = 'ACCEPTED' THEN
        
        -- Attempt to add member (using error handling instead of INSERT IGNORE)
        BEGIN
            INSERT INTO team_members (team_id, student_id)
            VALUES (:NEW.team_id, :NEW.student_id);
        EXCEPTION
            WHEN DUP_VAL_ON_INDEX THEN
                NULL; -- Equivalent to INSERT IGNORE
        END;
        
    END IF;
END;
/

-- 5. AUDIT LOG TRIGGER
-- Uses: String Concatenation and Column Mapping
CREATE OR REPLACE TRIGGER log_member_exit 
AFTER DELETE ON team_members 
FOR EACH ROW 
BEGIN
    INSERT INTO audit_logs (student_id, action) 
    VALUES (:OLD.student_id, 'Left Team ID: ' || :OLD.team_id);
END;
/

-- ============================================================================ --
-- Audit Table Example (Oracle Syntax)
-- CREATE TABLE audit_logs (
--     id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     student_id NUMBER,
--     action VARCHAR2(255),
--     timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- ============================================================================ --

-- ============================================================================ --
-- 6. DATABASE INTEGRITY CONSTRAINTS (CHECK & TRIGGERS)
-- ============================================================================ --

-- A. Standard CHECK Constraints (Enforcing Data Domains)
ALTER TABLE students ADD CONSTRAINT chk_year_of_study CHECK (year_of_study BETWEEN 1 AND 4);
ALTER TABLE team_requests ADD CONSTRAINT chk_request_type CHECK (type IN ('REQUEST', 'INVITE'));
ALTER TABLE team_requests ADD CONSTRAINT chk_request_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED'));
ALTER TABLE teams ADD CONSTRAINT chk_team_status CHECK (status IN ('Recruiting', 'Closed', 'Active'));

-- B. Complex Constraint: Max 4 Members Per Team
-- Note: Oracle row-level triggers throw "Mutating Table" (ORA-04091) if you query 
-- the same table you are inserting into. We use PRAGMA AUTONOMOUS_TRANSACTION to bypass this.
CREATE OR REPLACE TRIGGER trg_check_max_team_members
BEFORE INSERT ON team_members
FOR EACH ROW
DECLARE
    PRAGMA AUTONOMOUS_TRANSACTION;
    v_member_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_member_count 
    FROM team_members 
    WHERE team_id = :NEW.team_id;
    
    IF v_member_count >= 4 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Database Constraint Violation: A team cannot exceed 4 members.');
    END IF;
    
    -- In an autonomous transaction, you must commit or rollback before exiting
    COMMIT;
END;
/
