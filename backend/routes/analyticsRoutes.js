const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// ==========================================
// 1. JOINS & BASIC FILTERS
// ==========================================
router.get('/student-profile/:id', analyticsController.getStudentProfile);
router.get('/team-members/:teamId', analyticsController.getTeamMembersProfiles);
router.get('/event-reqs/:eventId', analyticsController.getEventRequirements);
router.get('/search', analyticsController.searchStudents);
// NEW ADDITIONS
router.get('/pending-invites/:studentId', analyticsController.getPendingInvites);
router.get('/user-skills/:studentId', analyticsController.getUserSkills);
router.get('/event-leaderboard/:eventId', analyticsController.getEventLeaderboard);
router.get('/team-status', analyticsController.getTeamStatus);

// ==========================================
// 2. SUBQUERIES & ADVANCED FILTERING
// ==========================================
router.get('/students-no-team', analyticsController.getStudentsWithoutTeam);
router.get('/events-no-teams', analyticsController.getEventsWithoutTeams);
// NEW ADDITIONS
router.get('/empty-teams', analyticsController.getEmptyTeams);
router.get('/students-lacking-skills/:eventId', analyticsController.getStudentsLackingSkills);
router.get('/most-recent-event', analyticsController.getMostRecentEvent);
router.get('/students-many-skills', analyticsController.getStudentsManySkills);

// ==========================================
// 3. AGGREGATIONS & GROUPING
// ==========================================
router.get('/popular-skills', analyticsController.getMostPopularSkills);
router.get('/avg-team-size', analyticsController.getAvgTeamSize);
router.get('/fully-staffed-teams', analyticsController.getFullyStaffedTeams);
// NEW ADDITIONS
router.get('/students-per-department', analyticsController.getCountPerDepartment);
router.get('/events-by-month', analyticsController.getEventsByMonth);
router.get('/active-departments', analyticsController.getMostActiveDepartments);
router.get('/skill-frequency', analyticsController.getSkillFrequency);
router.get('/request-acceptance-rate', analyticsController.getAcceptanceRate);
router.get('/users-by-year', analyticsController.getUsersByYear);

// ==========================================
// 4. ADVANCED / SMART FEATURES 
// ==========================================
router.get('/suggest-role/:teamId', analyticsController.suggestMissingRole);
router.get('/fast-builder/:eventId', analyticsController.lastMinuteFastBuilder);
router.get('/global-leaderboard', analyticsController.getGlobalLeaderboard);
router.get('/deadline-alerts', analyticsController.getDeadlineAlerts);
router.get('/event-timeline', analyticsController.getEventTimeline);
router.get('/formatted-directory', analyticsController.getFormattedDirectory);
// NEW ADDITIONS
router.get('/smart-recommendations/:eventId', analyticsController.getSmartRecommendations);
router.get('/skill-gap/:eventId/:studentId', analyticsController.getStudentSkillGap);
router.get('/match-percentage/:eventId', analyticsController.getMatchPercentage);
router.get('/event-countdown', analyticsController.getEventCountdown);

// SUPER ANALYTICS
router.get('/audit-logs', analyticsController.getAuditLogs);
router.get('/active-networkers', analyticsController.getActiveNetworkers);
router.get('/dynamic-duos', analyticsController.getDynamicDuos);

// NEW ANALYTICS
router.get('/skill-demand', analyticsController.getSkillDemand);
router.get('/all-event-reqs', analyticsController.getAllEventRequirements);
router.get('/team-trends', analyticsController.getTeamTrends);
router.get('/top-collaborators', analyticsController.getTopCollaborators);

// DASHBOARD SPECIFIC
router.get('/dashboard-recommendations/:studentId', analyticsController.getDashboardRecommendations);
router.get('/dashboard-activity/:studentId', analyticsController.getDashboardActivity);

module.exports = router;
