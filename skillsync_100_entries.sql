-- ============================================================================ --
-- SKILLSYNC: EVENT MANAGEMENT & TEAM SYNC PLATFORM                            --
-- DATABASE: MySQL (Workbench Optimized)                                        --
-- AUTHOR: MS (Legion)                                                         --
-- SEEDED WITH 100 ENTRIES PER TABLE                                           --
-- ============================================================================ --

-- --------------------------------------------------------- --
-- 1. DATABASE INITIALIZATION                                --
-- --------------------------------------------------------- --
DROP DATABASE IF EXISTS skillsync;
CREATE DATABASE skillsync;
USE skillsync;

-- --------------------------------------------------------- --
-- 2. CORE MASTER TABLES                                     --
-- --------------------------------------------------------- --

CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL DEFAULT '123',
    `department` VARCHAR(191) NOT NULL,
    `year_of_study` INTEGER NOT NULL,
    UNIQUE INDEX `students_username_key`(`username`),
    UNIQUE INDEX `students_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `skills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skill_name` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `skills_skill_name_key`(`skill_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_name` VARCHAR(191) NOT NULL,
    `event_date` DATETIME(3) NOT NULL,
    `description` TEXT,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- --------------------------------------------------------- --
-- 3. INTERMEDIATE (RELATIONSHIP) TABLES                     --
-- --------------------------------------------------------- --

CREATE TABLE `student_skills` (
    `student_id` INTEGER NOT NULL,
    `skill_id` INTEGER NOT NULL,
    PRIMARY KEY (`student_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `event_requirements` (
    `event_id` INTEGER NOT NULL,
    `skill_id` INTEGER NOT NULL,
    PRIMARY KEY (`event_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- --------------------------------------------------------- --
-- 4. TEAM MANAGEMENT TABLES                                 --
-- --------------------------------------------------------- --

CREATE TABLE `teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_name` VARCHAR(191) NOT NULL,
    `event_id` INTEGER NULL,
    `leader_id` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Recruiting',
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `team_members` (
    `team_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    PRIMARY KEY (`team_id`, `student_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `team_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `team_requests_team_id_student_id_type_key`(`team_id`, `student_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================================================ --
-- 6. SAMPLE DATA SEEDING (100 ENTRIES PER TABLE)                              --
-- ============================================================================ --

-- --------------------------------------------------------- --
-- SEED: students (100 rows)                                 --
-- --------------------------------------------------------- --
INSERT INTO `students` (`id`, `name`, `username`, `email`, `password`, `department`, `year_of_study`) VALUES
(1,  'Aman',       'aman123',     'aman@mail.com',     '123', 'CSE', 3),
(2,  'Riya',       'riya123',     'riya@mail.com',     '123', 'IT',  2),
(3,  'Karan',      'karan123',    'karan@mail.com',    '123', 'ECE', 4),
(4,  'Neha',       'neha123',     'neha@mail.com',     '123', 'CSE', 1),
(5,  'Arjun',      'arjun123',    'arjun@mail.com',    '123', 'IT',  3),
(6,  'Simran',     'simran123',   'simran@mail.com',   '123', 'ECE', 2),
(7,  'Rahul',      'rahul123',    'rahul@mail.com',    '123', 'CSE', 4),
(8,  'Priya',      'priya123',    'priya@mail.com',    '123', 'IT',  2),
(9,  'Dev',        'dev123',      'dev@mail.com',      '123', 'CSE', 3),
(10, 'Ankit',      'ankit123',    'ankit@mail.com',    '123', 'ECE', 4),
(11, 'Meera',      'meera123',    'meera@mail.com',    '123', 'CSE', 1),
(12, 'Yash',       'yash123',     'yash@mail.com',     '123', 'IT',  2),
(13, 'Pooja',      'pooja123',    'pooja@mail.com',    '123', 'CSE', 3),
(14, 'Rohan',      'rohan123',    'rohan@mail.com',    '123', 'ECE', 4),
(15, 'Divya',      'divya123',    'divya@mail.com',    '123', 'IT',  1),
(16, 'Nikhil',     'nikhil123',   'nikhil@mail.com',   '123', 'CSE', 2),
(17, 'Shreya',     'shreya123',   'shreya@mail.com',   '123', 'ECE', 3),
(18, 'Varun',      'varun123',    'varun@mail.com',    '123', 'IT',  4),
(19, 'Anjali',     'anjali123',   'anjali@mail.com',   '123', 'CSE', 2),
(20, 'Siddharth',  'siddharth123','siddharth@mail.com','123', 'ECE', 1),
(21, 'Kavya',      'kavya123',    'kavya@mail.com',    '123', 'IT',  3),
(22, 'Aditya',     'aditya123',   'aditya@mail.com',   '123', 'CSE', 4),
(23, 'Tanvi',      'tanvi123',    'tanvi@mail.com',    '123', 'ECE', 2),
(24, 'Harsh',      'harsh123',    'harsh@mail.com',    '123', 'IT',  1),
(25, 'Ishita',     'ishita123',   'ishita@mail.com',   '123', 'CSE', 3),
(26, 'Kunal',      'kunal123',    'kunal@mail.com',    '123', 'ECE', 4),
(27, 'Nandini',    'nandini123',  'nandini@mail.com',  '123', 'IT',  2),
(28, 'Vivek',      'vivek123',    'vivek@mail.com',    '123', 'CSE', 1),
(29, 'Sneha',      'sneha123',    'sneha@mail.com',    '123', 'ECE', 3),
(30, 'Mohit',      'mohit123',    'mohit@mail.com',    '123', 'IT',  4),
(31, 'Pallavi',    'pallavi123',  'pallavi@mail.com',  '123', 'CSE', 2),
(32, 'Gaurav',     'gaurav123',   'gaurav@mail.com',   '123', 'ECE', 1),
(33, 'Swati',      'swati123',    'swati@mail.com',    '123', 'IT',  3),
(34, 'Rajat',      'rajat123',    'rajat@mail.com',    '123', 'CSE', 4),
(35, 'Bhavna',     'bhavna123',   'bhavna@mail.com',   '123', 'ECE', 2),
(36, 'Sumit',      'sumit123',    'sumit@mail.com',    '123', 'IT',  1),
(37, 'Deepika',    'deepika123',  'deepika@mail.com',  '123', 'CSE', 3),
(38, 'Ashish',     'ashish123',   'ashish@mail.com',   '123', 'ECE', 4),
(39, 'Kritika',    'kritika123',  'kritika@mail.com',  '123', 'IT',  2),
(40, 'Abhinav',    'abhinav123',  'abhinav@mail.com',  '123', 'CSE', 1),
(41, 'Mansi',      'mansi123',    'mansi@mail.com',    '123', 'ECE', 3),
(42, 'Shivam',     'shivam123',   'shivam@mail.com',   '123', 'IT',  4),
(43, 'Jyoti',      'jyoti123',    'jyoti@mail.com',    '123', 'CSE', 2),
(44, 'Kartik',     'kartik123',   'kartik@mail.com',   '123', 'ECE', 1),
(45, 'Ruchi',      'ruchi123',    'ruchi@mail.com',    '123', 'IT',  3),
(46, 'Piyush',     'piyush123',   'piyush@mail.com',   '123', 'CSE', 4),
(47, 'Aishwarya',  'aishwarya123','aishwarya@mail.com','123', 'ECE', 2),
(48, 'Nitin',      'nitin123',    'nitin@mail.com',    '123', 'IT',  1),
(49, 'Garima',     'garima123',   'garima@mail.com',   '123', 'CSE', 3),
(50, 'Tushar',     'tushar123',   'tushar@mail.com',   '123', 'ECE', 4),
(51, 'Sakshi',     'sakshi123',   'sakshi@mail.com',   '123', 'IT',  2),
(52, 'Parth',      'parth123',    'parth@mail.com',    '123', 'CSE', 1),
(53, 'Lakshmi',    'lakshmi123',  'lakshmi@mail.com',  '123', 'ECE', 3),
(54, 'Dhruv',      'dhruv123',    'dhruv@mail.com',    '123', 'IT',  4),
(55, 'Muskan',     'muskan123',   'muskan@mail.com',   '123', 'CSE', 2),
(56, 'Akash',      'akash123',    'akash@mail.com',    '123', 'ECE', 1),
(57, 'Ruhi',       'ruhi123',     'ruhi@mail.com',     '123', 'IT',  3),
(58, 'Pranav',     'pranav123',   'pranav@mail.com',   '123', 'CSE', 4),
(59, 'Sonal',      'sonal123',    'sonal@mail.com',    '123', 'ECE', 2),
(60, 'Ravi',       'ravi123',     'ravi@mail.com',     '123', 'IT',  1),
(61, 'Disha',      'disha123',    'disha@mail.com',    '123', 'CSE', 3),
(62, 'Amit',       'amit123',     'amit@mail.com',     '123', 'ECE', 4),
(63, 'Komal',      'komal123',    'komal@mail.com',    '123', 'IT',  2),
(64, 'Saurabh',    'saurabh123',  'saurabh@mail.com',  '123', 'CSE', 1),
(65, 'Prachi',     'prachi123',   'prachi@mail.com',   '123', 'ECE', 3),
(66, 'Vikash',     'vikash123',   'vikash@mail.com',   '123', 'IT',  4),
(67, 'Tanya',      'tanya123',    'tanya@mail.com',    '123', 'CSE', 2),
(68, 'Naveen',     'naveen123',   'naveen@mail.com',   '123', 'ECE', 1),
(69, 'Ritika',     'ritika123',   'ritika@mail.com',   '123', 'IT',  3),
(70, 'Anand',      'anand123',    'anand@mail.com',    '123', 'CSE', 4),
(71, 'Isha',       'isha123',     'isha@mail.com',     '123', 'ECE', 2),
(72, 'Suresh',     'suresh123',   'suresh@mail.com',   '123', 'IT',  1),
(73, 'Varsha',     'varsha123',   'varsha@mail.com',   '123', 'CSE', 3),
(74, 'Hemant',     'hemant123',   'hemant@mail.com',   '123', 'ECE', 4),
(75, 'Preeti',     'preeti123',   'preeti@mail.com',   '123', 'IT',  2),
(76, 'Kapil',      'kapil123',    'kapil@mail.com',    '123', 'CSE', 1),
(77, 'Seema',      'seema123',    'seema@mail.com',    '123', 'ECE', 3),
(78, 'Tarun',      'tarun123',    'tarun@mail.com',    '123', 'IT',  4),
(79, 'Poornima',   'poornima123', 'poornima@mail.com', '123', 'CSE', 2),
(80, 'Lalit',      'lalit123',    'lalit@mail.com',    '123', 'ECE', 1),
(81, 'Nisha',      'nisha123',    'nisha@mail.com',    '123', 'IT',  3),
(82, 'Sachin',     'sachin123',   'sachin@mail.com',   '123', 'CSE', 4),
(83, 'Vandana',    'vandana123',  'vandana@mail.com',  '123', 'ECE', 2),
(84, 'Deepak',     'deepak123',   'deepak@mail.com',   '123', 'IT',  1),
(85, 'Rashmi',     'rashmi123',   'rashmi@mail.com',   '123', 'CSE', 3),
(86, 'Anurag',     'anurag123',   'anurag@mail.com',   '123', 'ECE', 4),
(87, 'Sunita',     'sunita123',   'sunita@mail.com',   '123', 'IT',  2),
(88, 'Manoj',      'manoj123',    'manoj@mail.com',    '123', 'CSE', 1),
(89, 'Rekha',      'rekha123',    'rekha@mail.com',    '123', 'ECE', 3),
(90, 'Pankaj',     'pankaj123',   'pankaj@mail.com',   '123', 'IT',  4),
(91, 'Archana',    'archana123',  'archana@mail.com',  '123', 'CSE', 2),
(92, 'Girish',     'girish123',   'girish@mail.com',   '123', 'ECE', 1),
(93, 'Shalini',    'shalini123',  'shalini@mail.com',  '123', 'IT',  3),
(94, 'Rajesh',     'rajesh123',   'rajesh@mail.com',   '123', 'CSE', 4),
(95, 'Usha',       'usha123',     'usha@mail.com',     '123', 'ECE', 2),
(96, 'Alok',       'alok123',     'alok@mail.com',     '123', 'IT',  1),
(97, 'Savita',     'savita123',   'savita@mail.com',   '123', 'CSE', 3),
(98, 'Sanjeev',    'sanjeev123',  'sanjeev@mail.com',  '123', 'ECE', 4),
(99, 'Geeta',      'geeta123',    'geeta@mail.com',    '123', 'IT',  2),
(100,'Vikram',     'vikram123',   'vikram@mail.com',   '123', 'CSE', 1);

-- --------------------------------------------------------- --
-- SEED: skills (100 rows)                                   --
-- --------------------------------------------------------- --
INSERT INTO `skills` (`id`, `skill_name`) VALUES
(1,  'React.js'),
(2,  'Node.js'),
(3,  'Python'),
(4,  'UI/UX Design'),
(5,  'MySQL'),
(6,  'Cloud Computing'),
(7,  'Java'),
(8,  'C++'),
(9,  'MongoDB'),
(10, 'Django'),
(11, 'Flask'),
(12, 'Machine Learning'),
(13, 'Deep Learning'),
(14, 'Data Science'),
(15, 'TensorFlow'),
(16, 'PyTorch'),
(17, 'Kubernetes'),
(18, 'Docker'),
(19, 'DevOps'),
(20, 'Git'),
(21, 'Linux'),
(22, 'Bash Scripting'),
(23, 'AWS'),
(24, 'Azure'),
(25, 'Google Cloud'),
(26, 'Figma'),
(27, 'Adobe XD'),
(28, 'Photoshop'),
(29, 'Illustrator'),
(30, 'After Effects'),
(31, 'TypeScript'),
(32, 'GraphQL'),
(33, 'REST API'),
(34, 'PostgreSQL'),
(35, 'Redis'),
(36, 'Elasticsearch'),
(37, 'Kafka'),
(38, 'RabbitMQ'),
(39, 'Microservices'),
(40, 'Spring Boot'),
(41, 'Angular'),
(42, 'Vue.js'),
(43, 'Next.js'),
(44, 'Nuxt.js'),
(45, 'Svelte'),
(46, 'Tailwind CSS'),
(47, 'Bootstrap'),
(48, 'SASS'),
(49, 'WebSockets'),
(50, 'Blockchain'),
(51, 'Solidity'),
(52, 'Ethereum'),
(53, 'Smart Contracts'),
(54, 'Web3.js'),
(55, 'Cybersecurity'),
(56, 'Ethical Hacking'),
(57, 'Penetration Testing'),
(58, 'Network Security'),
(59, 'Cryptography'),
(60, 'OpenCV'),
(61, 'Computer Vision'),
(62, 'NLP'),
(63, 'BERT'),
(64, 'Transformer Models'),
(65, 'Data Visualization'),
(66, 'Power BI'),
(67, 'Tableau'),
(68, 'Excel'),
(69, 'R Programming'),
(70, 'MATLAB'),
(71, 'Arduino'),
(72, 'Raspberry Pi'),
(73, 'IoT'),
(74, 'Embedded Systems'),
(75, 'FPGA'),
(76, 'Circuit Design'),
(77, 'PCB Design'),
(78, 'VLSI'),
(79, 'Signal Processing'),
(80, 'Control Systems'),
(81, 'Swift'),
(82, 'Kotlin'),
(83, 'Flutter'),
(84, 'React Native'),
(85, 'Android Development'),
(86, 'iOS Development'),
(87, 'Unity'),
(88, 'Unreal Engine'),
(89, 'Game Development'),
(90, 'Augmented Reality'),
(91, 'Virtual Reality'),
(92, 'Blender'),
(93, '3D Modeling'),
(94, 'Prompt Engineering'),
(95, 'LangChain'),
(96, 'Agile Methodology'),
(97, 'Scrum'),
(98, 'Project Management'),
(99, 'Public Speaking'),
(100,'Technical Writing');

-- --------------------------------------------------------- --
-- SEED: events (100 rows)                                   --
-- --------------------------------------------------------- --
INSERT INTO `events` (`id`, `event_name`, `event_date`, `description`) VALUES
(1,   'Smart India Hackathon',         '2026-06-15 10:00:00', 'World largest open innovation model.'),
(2,   'Google Code Jam',               '2026-03-20 09:00:00', 'Annual algorithmic programming contest by Google.'),
(3,   'HackBITS',                      '2026-07-10 09:00:00', 'National level hackathon by BITS Pilani.'),
(4,   'CodeChef SnackDown',            '2026-08-05 10:00:00', 'Multi-round competitive programming challenge.'),
(5,   'HackMIT',                       '2026-09-12 08:00:00', 'Premier hackathon hosted by MIT students.'),
(6,   'DevFest India',                 '2026-10-01 09:00:00', 'Google-backed developer festival across India.'),
(7,   'Codeforces Round #900',         '2026-05-18 17:00:00', 'Competitive programming round on Codeforces.'),
(8,   'Microsoft Imagine Cup',         '2026-04-22 10:00:00', 'Global student technology competition by Microsoft.'),
(9,   'Facebook Hacker Cup',           '2026-06-30 11:00:00', 'Annual programming competition hosted by Meta.'),
(10,  'HackerEarth Sprints',           '2026-03-25 10:00:00', 'Monthly sprint coding challenges.'),
(11,  'ICPC Regional Finals',          '2026-11-15 09:00:00', 'ACM International Collegiate Programming Contest.'),
(12,  'Hack the North',                '2026-09-20 10:00:00', 'Canada largest hackathon at University of Waterloo.'),
(13,  'MLH Local Hack Day',            '2026-12-07 08:00:00', 'Major League Hacking global hack day event.'),
(14,  'TechGig Code Gladiators',       '2026-07-20 09:00:00', 'India largest coding contest by TechGig.'),
(15,  'AngelHack Global Hackathon',    '2026-05-30 10:00:00', 'Series of hackathons across major global cities.'),
(16,  'Tata Crucible Campus Quiz',     '2026-04-15 10:00:00', 'Business and technology quiz for college students.'),
(17,  'E-Summit IIT Bombay',           '2026-02-14 09:00:00', 'Annual entrepreneurship summit by IIT Bombay.'),
(18,  'Hack-A-BIT',                    '2026-08-20 10:00:00', 'Annual hackathon by NIT Warangal.'),
(19,  'Data Science Summit',           '2026-06-05 09:00:00', 'Conference and hackathon focused on data science.'),
(20,  'CyberSec Challenge India',      '2026-07-01 10:00:00', 'National cybersecurity capture-the-flag contest.'),
(21,  'Blockchain Builders Cup',       '2026-09-08 09:00:00', 'Build decentralized apps in 48 hours.'),
(22,  'IoT Innovation Sprint',         '2026-10-20 10:00:00', 'Hackathon focused on Internet of Things projects.'),
(23,  'AI for Good Hackathon',         '2026-11-05 09:00:00', 'Build AI solutions for social impact.'),
(24,  'Open Source Day',               '2026-04-05 10:00:00', 'Day-long event contributing to open source projects.'),
(25,  'Cloud Computing Olympiad',      '2026-05-10 09:00:00', 'Competition testing cloud architecture skills.'),
(26,  'UI/UX Design Sprint',           '2026-06-22 10:00:00', '24-hour design sprint focused on user experience.'),
(27,  'Game Jam India',                '2026-07-15 09:00:00', '72-hour game development competition.'),
(28,  'Mobile App Challenge',          '2026-08-10 10:00:00', 'National competition for best student mobile app.'),
(29,  'HackPSG',                       '2026-09-25 09:00:00', 'Hackathon organized by PSG College of Technology.'),
(30,  'Flipkart Grid',                 '2026-03-10 10:00:00', 'Flipkart engineering challenge for students.'),
(31,  'Myntra HackerRamp',             '2026-04-18 09:00:00', 'Fashion-tech hackathon by Myntra.'),
(32,  'Deutsche Bank CODE-a-thon',     '2026-05-22 10:00:00', 'FinTech hackathon by Deutsche Bank.'),
(33,  'Goldman Sachs HackFin',         '2026-06-10 09:00:00', 'Financial technology hackathon.'),
(34,  'JPMorgan Code for Good',        '2026-07-25 10:00:00', 'Hackathon for building social good applications.'),
(35,  'Accenture Innovation Challenge','2026-08-15 09:00:00', 'Innovation challenge for engineering students.'),
(36,  'SAP Labs Hackathon',            '2026-09-05 10:00:00', 'Enterprise solutions hackathon by SAP.'),
(37,  'Adobe Creative Jam',            '2026-10-10 09:00:00', 'Design and creativity competition by Adobe.'),
(38,  'Qualcomm Innovation Fellowship','2026-11-20 10:00:00', 'Research fellowship and innovation challenge.'),
(39,  'NVidia AI Hackathon',           '2026-12-01 09:00:00', 'Build GPU-accelerated AI applications.'),
(40,  'NASSCOM Student Code Sprint',   '2026-04-30 10:00:00', 'NASSCOM coding challenge for engineering students.'),
(41,  'Infosys InfyTQ Hackathon',      '2026-05-15 09:00:00', 'Hackathon by Infosys for campus students.'),
(42,  'Wipro Vizathon',                '2026-06-20 10:00:00', 'Data visualization challenge by Wipro.'),
(43,  'HCL TechBee Challenge',         '2026-07-05 09:00:00', 'Technology and coding challenge by HCL.'),
(44,  'TCS CodeVita',                  '2026-08-25 10:00:00', 'Global coding contest by Tata Consultancy Services.'),
(45,  'Capgemini Tech Challenge',      '2026-09-15 09:00:00', 'Annual tech challenge for engineering colleges.'),
(46,  'L&T Build India Hackathon',     '2026-10-25 10:00:00', 'Infrastructure and engineering innovation hack.'),
(47,  'DRDO Innovation Challenge',     '2026-11-10 09:00:00', 'Defence research and development challenge.'),
(48,  'ISRO Space Hackathon',          '2026-12-15 10:00:00', 'Space technology innovation challenge by ISRO.'),
(49,  'IIT Delhi TechFest Hack',       '2026-03-05 09:00:00', 'Flagship hackathon at IIT Delhi TechFest.'),
(50,  'IIT Kharagpur Kshitij Hack',    '2026-02-20 10:00:00', 'Hackathon at Kshitij, IIT Kharagpur TechFest.'),
(51,  'IIT Madras Shaastra Hack',      '2026-01-15 09:00:00', 'Hackathon at Shaastra, IIT Madras.'),
(52,  'IIT Roorkee Cognizance',        '2026-04-02 10:00:00', 'Annual technical fest hackathon at IIT Roorkee.'),
(53,  'VIT Gravitas Hackathon',        '2026-09-30 09:00:00', 'National level hackathon at VIT Gravitas.'),
(54,  'SRM Techofes Hack',             '2026-10-15 10:00:00', 'Hackathon at SRM Techofes tech fest.'),
(55,  'Manipal TechTatva',             '2026-11-25 09:00:00', 'Annual tech hackathon at Manipal University.'),
(56,  'BITS Pilani Apogee Hack',       '2026-03-28 10:00:00', 'Hackathon at BITS Pilani Apogee fest.'),
(57,  'NIT Trichy Pragyan Hack',       '2026-02-10 09:00:00', 'Hackathon at NIT Trichy Pragyan fest.'),
(58,  'IIIT Hyderabad Felicity Hack',  '2026-01-25 10:00:00', 'Hackathon at IIIT Hyderabad Felicity.'),
(59,  'PESIT Chaos Hackathon',         '2026-08-05 09:00:00', 'Multi-track hackathon at PESIT Chaos fest.'),
(60,  'Open Data Hackathon India',     '2026-07-30 10:00:00', 'Build apps using government open data APIs.'),
(61,  'HealthTech Innovation Cup',     '2026-06-12 09:00:00', 'Hackathon to solve healthcare problems with tech.'),
(62,  'EdTech Builder Bash',           '2026-05-05 10:00:00', 'Build innovative education technology solutions.'),
(63,  'AgriHack India',                '2026-04-25 09:00:00', 'Technology solutions for Indian agriculture.'),
(64,  'FinHack 2026',                  '2026-03-15 10:00:00', 'Fintech solutions hackathon for startups & students.'),
(65,  'GreenTech Hackathon',           '2026-02-28 09:00:00', 'Build sustainable and eco-friendly tech solutions.'),
(66,  'Smart City Hack',               '2026-01-20 10:00:00', 'Solutions for smart city infrastructure problems.'),
(67,  'LegalTech Innovation Hack',     '2026-12-10 09:00:00', 'Technology solutions for the legal domain.'),
(68,  'HRTech Challenge',              '2026-11-30 10:00:00', 'Build HR and workforce management tech solutions.'),
(69,  'LogiTech Supply Chain Hack',    '2026-10-05 09:00:00', 'Logistics and supply chain hackathon.'),
(70,  'RetailTech Hackathon',          '2026-09-10 10:00:00', 'Innovation challenge for retail industry tech.'),
(71,  'TravelTech Builders Meet',      '2026-08-01 09:00:00', 'Build the next travel and hospitality tech app.'),
(72,  'MediaTech Hackathon',           '2026-07-20 10:00:00', 'Media, journalism, and content technology hack.'),
(73,  'SportsTech Innovation Cup',     '2026-06-25 09:00:00', 'Technology solutions for sports and fitness.'),
(74,  'EduAI Challenge',               '2026-05-20 10:00:00', 'AI-powered solutions for education sector.'),
(75,  'AR/VR Developers Challenge',    '2026-04-10 09:00:00', 'Build immersive AR and VR experiences.'),
(76,  'Robotics Challenge India',      '2026-03-20 10:00:00', 'Robotics and automation hackathon.'),
(77,  'Drone Tech Sprint',             '2026-02-15 09:00:00', 'Drone software and hardware hackathon.'),
(78,  'EV Tech Hackathon',             '2026-01-10 10:00:00', 'Electric vehicle technology solutions hackathon.'),
(79,  'SpaceTech Student Cup',         '2026-12-20 09:00:00', 'Satellite and space tech challenge for students.'),
(80,  'Quantum Computing Challenge',   '2026-11-08 10:00:00', 'Introductory quantum computing hackathon.'),
(81,  'National Coding League S1',     '2026-10-12 09:00:00', 'Season 1 of national college coding league.'),
(82,  'HackStreet Boys Edition',       '2026-09-02 10:00:00', 'Fun-themed 24-hour hackathon for undergrads.'),
(83,  'Capture The Flag — CTF 2026',   '2026-08-22 09:00:00', 'Cybersecurity CTF competition for all levels.'),
(84,  'Bug Bounty Bowl',               '2026-07-12 10:00:00', 'Find vulnerabilities in real apps for rewards.'),
(85,  'Web3 Builders Hackathon',       '2026-06-02 09:00:00', 'Decentralized web and Web3 development contest.'),
(86,  'DeFi Dev Sprint',               '2026-05-25 10:00:00', 'Build DeFi protocols in 36 hours.'),
(87,  'NFT & Metaverse Builders',      '2026-04-28 09:00:00', 'Create metaverse and NFT applications.'),
(88,  'Open AI Hackathon',             '2026-03-30 10:00:00', 'Build apps powered by OpenAI APIs.'),
(89,  'LLM Apps Challenge',            '2026-02-22 09:00:00', 'Build real-world apps using large language models.'),
(90,  'GenAI Sprint',                  '2026-01-28 10:00:00', 'Generative AI product hackathon.'),
(91,  'HackForHumanity',               '2026-12-25 09:00:00', 'Humanitarian technology solutions hackathon.'),
(92,  'Zero Carbon Hackathon',         '2026-11-18 10:00:00', 'Climate tech and carbon neutrality solutions.'),
(93,  'WaterTech Innovation Sprint',   '2026-10-28 09:00:00', 'Tech solutions for water conservation.'),
(94,  'AgroBot Challenge',             '2026-09-18 10:00:00', 'Autonomous farming robots competition.'),
(95,  'DisasterTech Response Hack',    '2026-08-28 09:00:00', 'Emergency response technology hackathon.'),
(96,  'AccessibilityTech Build Day',   '2026-07-28 10:00:00', 'Build inclusive tech for differently-abled users.'),
(97,  'Mental Health Tech Hack',       '2026-06-28 09:00:00', 'Technology solutions for mental wellness.'),
(98,  'SeniorCare Innovation Cup',     '2026-05-28 10:00:00', 'Tech for elder care and support systems.'),
(99,  'ChildSafe Tech Hackathon',      '2026-04-28 09:00:00', 'Child safety and parental control tech solutions.'),
(100, 'PeaceTech Global Hack',         '2026-03-28 10:00:00', 'Technology for peacebuilding and conflict resolution.');

-- --------------------------------------------------------- --
-- SEED: student_skills (100 rows, unique student_id+skill_id)--
-- --------------------------------------------------------- --
INSERT INTO `student_skills` (`student_id`, `skill_id`) VALUES
(1,  1),  (1,  2),  (2,  4),  (3,  3),  (4,  1),
(5,  5),  (6,  6),  (7,  7),  (8,  8),  (9,  9),
(10, 10), (11, 11), (12, 12), (13, 13), (14, 14),
(15, 15), (16, 16), (17, 17), (18, 18), (19, 19),
(20, 20), (21, 21), (22, 22), (23, 23), (24, 24),
(25, 25), (26, 26), (27, 27), (28, 28), (29, 29),
(30, 30), (31, 31), (32, 32), (33, 33), (34, 34),
(35, 35), (36, 36), (37, 37), (38, 38), (39, 39),
(40, 40), (41, 41), (42, 42), (43, 43), (44, 44),
(45, 45), (46, 46), (47, 47), (48, 48), (49, 49),
(50, 50), (51, 51), (52, 52), (53, 53), (54, 54),
(55, 55), (56, 56), (57, 57), (58, 58), (59, 59),
(60, 60), (61, 61), (62, 62), (63, 63), (64, 64),
(65, 65), (66, 66), (67, 67), (68, 68), (69, 69),
(70, 70), (71, 71), (72, 72), (73, 73), (74, 74),
(75, 75), (76, 76), (77, 77), (78, 78), (79, 79),
(80, 80), (81, 81), (82, 82), (83, 83), (84, 84),
(85, 85), (86, 86), (87, 87), (88, 88), (89, 89),
(90, 90), (91, 91), (92, 92), (93, 93), (94, 94),
(95, 95), (96, 96), (97, 97), (98, 98), (99, 99),
(100,100);

-- --------------------------------------------------------- --
-- SEED: event_requirements (100 rows, unique event+skill)   --
-- --------------------------------------------------------- --
INSERT INTO `event_requirements` (`event_id`, `skill_id`) VALUES
(1,  3),  (1,  5),  (2,  8),  (3,  1),  (3,  2),
(4,  3),  (5,  1),  (5,  31), (6,  19), (6,  17),
(7,  8),  (7,  3),  (8,  12), (9,  3),  (10, 5),
(11, 8),  (11, 3),  (12, 1),  (12, 2),  (13, 1),
(14, 3),  (14, 8),  (15, 1),  (16, 98), (17, 98),
(18, 2),  (18, 5),  (19, 14), (19, 65), (20, 55),
(20, 57), (21, 50), (21, 51), (22, 73), (22, 74),
(23, 12), (23, 62), (24, 20), (25, 23), (25, 24),
(26, 4),  (26, 26), (27, 87), (27, 89), (28, 83),
(28, 84), (29, 1),  (29, 2),  (30, 3),  (31, 4),
(32, 5),  (33, 5),  (33, 64), (34, 1),  (35, 39),
(36, 40), (37, 4),  (37, 26), (38, 15), (39, 15),
(40, 3),  (40, 7),  (41, 1),  (42, 65), (42, 67),
(43, 7),  (44, 3),  (44, 8),  (45, 39), (46, 6),
(47, 79), (48, 25), (49, 3),  (49, 1),  (50, 3),
(51, 12), (52, 1),  (53, 1),  (53, 31), (54, 2),
(55, 43), (56, 1),  (57, 3),  (58, 12), (59, 1),
(60, 3),  (61, 12), (62, 1),  (63, 73), (64, 5),
(65, 6),  (66, 6),  (67, 3),  (68, 98), (69, 6),
(70, 1),  (71, 1),  (72, 62), (73, 3),  (74, 12),
(75, 90), (76, 79), (77, 6),  (78, 6),  (79, 25),
(80, 3),  (81, 3),  (82, 1),  (83, 55), (84, 56),
(85, 54), (86, 50), (87, 90), (88, 12), (89, 94),
(90, 12), (91, 3),  (92, 6),  (93, 73), (94, 71),
(95, 3),  (96, 1),  (97, 12), (98, 73), (99, 1),
(100,98);

-- --------------------------------------------------------- --
-- SEED: teams (100 rows)                                    --
-- leader_id references students(id) 1-100                  --
-- event_id references events(id) 1-100 or NULL             --
-- --------------------------------------------------------- --
INSERT INTO `teams` (`id`, `team_name`, `event_id`, `leader_id`, `status`) VALUES
(1,  'Cyber Sentinels',      1,    1,   'Recruiting'),
(2,  'Bug Wizards',          2,    2,   'Complete'),
(3,  'Pixel Pirates',        3,    3,   'Recruiting'),
(4,  'Code Crushers',        4,    4,   'Complete'),
(5,  'Data Dragons',         5,    5,   'Recruiting'),
(6,  'Cloud Chasers',        6,    6,   'Complete'),
(7,  'Neural Ninjas',        7,    7,   'Recruiting'),
(8,  'Stack Smashers',       8,    8,   'Complete'),
(9,  'Kernel Pandas',        9,    9,   'Recruiting'),
(10, 'Syntax Error',         10,   10,  'Complete'),
(11, 'Quantum Coders',       11,   11,  'Recruiting'),
(12, 'Null Pointers',        12,   12,  'Complete'),
(13, 'Binary Beasts',        13,   13,  'Recruiting'),
(14, 'Fork Bombers',         14,   14,  'Complete'),
(15, 'Loop Legends',         15,   15,  'Recruiting'),
(16, 'Heap Hackers',         16,   16,  'Complete'),
(17, 'Runtime Rebels',       17,   17,  'Recruiting'),
(18, 'Cache Kings',          18,   18,  'Complete'),
(19, 'Async Avengers',       19,   19,  'Recruiting'),
(20, 'Mutex Masters',        20,   20,  'Complete'),
(21, 'Segfault Squad',       21,   21,  'Recruiting'),
(22, 'Lambda Legends',       22,   22,  'Complete'),
(23, 'API Assassins',        23,   23,  'Recruiting'),
(24, 'Overflow Ops',         24,   24,  'Complete'),
(25, 'Hash Heroes',          25,   25,  'Recruiting'),
(26, 'Pointer Panthers',     26,   26,  'Complete'),
(27, 'Bool Bandits',         27,   27,  'Recruiting'),
(28, 'Array Aces',           28,   28,  'Complete'),
(29, 'Scope Sorcerers',      29,   29,  'Recruiting'),
(30, 'Token Tribe',          30,   30,  'Complete'),
(31, 'Recursive Raptors',    31,   31,  'Recruiting'),
(32, 'Exception Eagles',     32,   32,  'Complete'),
(33, 'Deadlock Drifters',    33,   33,  'Recruiting'),
(34, 'Pipeline Predators',   34,   34,  'Complete'),
(35, 'Refactor Rangers',     35,   35,  'Recruiting'),
(36, 'Merge Mavericks',      36,   36,  'Complete'),
(37, 'Docker Dinos',         37,   37,  'Recruiting'),
(38, 'Kubernetes Knights',   38,   38,  'Complete'),
(39, 'Terminal Tigers',      39,   39,  'Recruiting'),
(40, 'Debug Demons',         40,   40,  'Complete'),
(41, 'Compile Crew',         41,   41,  'Recruiting'),
(42, 'Packet Pushers',       42,   42,  'Complete'),
(43, 'Firewall Phantoms',    43,   43,  'Recruiting'),
(44, 'Root Access Raiders',  44,   44,  'Complete'),
(45, 'Protocol Pirates',     45,   45,  'Recruiting'),
(46, 'Shell Sharks',         46,   46,  'Complete'),
(47, 'Byte Blazers',         47,   47,  'Recruiting'),
(48, 'Neon Nodes',           48,   48,  'Complete'),
(49, 'Crypto Crusaders',     49,   49,  'Recruiting'),
(50, 'Web Warriors',         50,   50,  'Complete'),
(51, 'Silicon Serpents',     51,   51,  'Recruiting'),
(52, 'Logic Lords',          52,   52,  'Complete'),
(53, 'Phantom Functions',    53,   53,  'Recruiting'),
(54, 'Zero Day Zeros',       54,   54,  'Complete'),
(55, 'Stack Overflows',      55,   55,  'Recruiting'),
(56, 'Circuit Breakers',     56,   56,  'Complete'),
(57, 'Dark Mode Devs',       57,   57,  'Recruiting'),
(58, 'SSH Savages',          58,   58,  'Complete'),
(59, 'Regex Rockstars',      59,   59,  'Recruiting'),
(60, 'Lazy Loaders',         60,   60,  'Complete'),
(61, 'Infinite Loops',       61,   61,  'Recruiting'),
(62, 'Git Pushers',          62,   62,  'Complete'),
(63, 'Pipeline Punks',       63,   63,  'Recruiting'),
(64, 'Deploy Dudes',         64,   64,  'Complete'),
(65, 'Rollback Rangers',     65,   65,  'Recruiting'),
(66, 'Branch Managers',      66,   66,  'Complete'),
(67, 'Commit Commanders',    67,   67,  'Recruiting'),
(68, 'PR Predators',         68,   68,  'Complete'),
(69, 'Sprint Sprinters',     69,   69,  'Recruiting'),
(70, 'Agile Aliens',         70,   70,  'Complete'),
(71, 'Scrum Lords',          71,   71,  'Recruiting'),
(72, 'Kanban Killers',       72,   72,  'Complete'),
(73, 'Standup Strikers',     73,   73,  'Recruiting'),
(74, 'Velocity Vipers',      74,   74,  'Complete'),
(75, 'Sprint Slayers',       75,   75,  'Recruiting'),
(76, 'Burndown Bandits',     76,   76,  'Complete'),
(77, 'Epic Editors',         77,   77,  'Recruiting'),
(78, 'Story Pointers',       78,   78,  'Complete'),
(79, 'Backlog Brawlers',     79,   79,  'Recruiting'),
(80, 'Retro Rockets',        80,   80,  'Complete'),
(81, 'Demo Day Demons',      81,   81,  'Recruiting'),
(82, 'UX Unicorns',          82,   82,  'Complete'),
(83, 'Design Drifters',      83,   83,  'Recruiting'),
(84, 'Wireframe Wolves',     84,   84,  'Complete'),
(85, 'Prototype Pack',       85,   85,  'Recruiting'),
(86, 'Persona Pilots',       86,   86,  'Complete'),
(87, 'Figma Fighters',       87,   87,  'Recruiting'),
(88, 'Shadow DOM Squad',     88,   88,  'Complete'),
(89, 'Responsive Rebels',    89,   89,  'Recruiting'),
(90, 'Dark Pattern Busters', 90,   90,  'Complete'),
(91, 'Gradient Gang',        91,   91,  'Recruiting'),
(92, 'Font Fanatics',        92,   92,  'Complete'),
(93, 'Contrast Crew',        93,   93,  'Recruiting'),
(94, 'Pixel Perfect',        94,   94,  'Complete'),
(95, 'Color Theory Club',    95,   95,  'Recruiting'),
(96, 'Motion Makers',        96,   96,  'Complete'),
(97, 'Icon Icons',           97,   97,  'Recruiting'),
(98, 'SVG Samurai',          98,   98,  'Complete'),
(99, 'Grid Gladiators',      99,   99,  'Recruiting'),
(100,'Flex Force',           100,  100, 'Complete');

-- --------------------------------------------------------- --
-- SEED: team_members (100 rows)                             --
-- PK is (team_id, student_id) — must be unique             --
-- leader is already a member implicitly; add distinct pairs --
-- --------------------------------------------------------- --
INSERT INTO `team_members` (`team_id`, `student_id`) VALUES
(1,  1),  (1,  4),  (1,  9),
(2,  2),  (2,  8),
(3,  3),  (3,  11),
(4,  4),  (4,  20),
(5,  5),  (5,  21),
(6,  6),  (6,  22),
(7,  7),  (7,  23),
(8,  8),  (8,  24),
(9,  9),  (9,  25),
(10, 10), (10, 26),
(11, 11), (11, 27),
(12, 12), (12, 28),
(13, 13), (13, 29),
(14, 14), (14, 30),
(15, 15), (15, 31),
(16, 16), (16, 32),
(17, 17), (17, 33),
(18, 18), (18, 34),
(19, 19), (19, 35),
(20, 20), (20, 36),
(21, 21), (21, 37),
(22, 22), (22, 38),
(23, 23), (23, 39),
(24, 24), (24, 40),
(25, 25), (25, 41),
(26, 26), (26, 42),
(27, 27), (27, 43),
(28, 28), (28, 44),
(29, 29), (29, 45),
(30, 30), (30, 46),
(31, 31), (31, 47),
(32, 32), (32, 48),
(33, 33), (33, 49),
(34, 34), (34, 50),
(35, 35), (35, 51),
(36, 36), (36, 52),
(37, 37), (37, 53),
(38, 38), (38, 54),
(39, 39), (39, 55),
(40, 40), (40, 56),
(41, 41), (41, 57),
(42, 42), (42, 58),
(43, 43), (43, 59),
(44, 44), (44, 60),
(45, 45), (45, 61),
(46, 46), (46, 62),
(47, 47), (47, 63),
(48, 48), (48, 64),
(49, 49), (49, 65),
(50, 50), (50, 66);

-- --------------------------------------------------------- --
-- SEED: team_requests (100 rows)                            --
-- PK is id; UNIQUE on (team_id, student_id, type)          --
-- type in ('INVITE','REQUEST'); student must exist in team  --
-- the student must NOT already be a member for JOIN REQUEST --
-- --------------------------------------------------------- --
INSERT INTO `team_requests` (`id`, `team_id`, `student_id`, `type`, `status`, `createdAt`) VALUES
(1,   1,  2,  'REQUEST', 'PENDING',  '2026-01-01 10:00:00'),
(2,   1,  3,  'INVITE',  'ACCEPTED', '2026-01-02 10:00:00'),
(3,   2,  1,  'REQUEST', 'REJECTED', '2026-01-03 10:00:00'),
(4,   2,  3,  'INVITE',  'PENDING',  '2026-01-04 10:00:00'),
(5,   3,  4,  'REQUEST', 'PENDING',  '2026-01-05 10:00:00'),
(6,   3,  5,  'INVITE',  'ACCEPTED', '2026-01-06 10:00:00'),
(7,   4,  6,  'REQUEST', 'REJECTED', '2026-01-07 10:00:00'),
(8,   4,  7,  'INVITE',  'PENDING',  '2026-01-08 10:00:00'),
(9,   5,  8,  'REQUEST', 'PENDING',  '2026-01-09 10:00:00'),
(10,  5,  9,  'INVITE',  'ACCEPTED', '2026-01-10 10:00:00'),
(11,  6,  10, 'REQUEST', 'REJECTED', '2026-01-11 10:00:00'),
(12,  6,  11, 'INVITE',  'PENDING',  '2026-01-12 10:00:00'),
(13,  7,  12, 'REQUEST', 'PENDING',  '2026-01-13 10:00:00'),
(14,  7,  13, 'INVITE',  'ACCEPTED', '2026-01-14 10:00:00'),
(15,  8,  14, 'REQUEST', 'REJECTED', '2026-01-15 10:00:00'),
(16,  8,  15, 'INVITE',  'PENDING',  '2026-01-16 10:00:00'),
(17,  9,  16, 'REQUEST', 'PENDING',  '2026-01-17 10:00:00'),
(18,  9,  17, 'INVITE',  'ACCEPTED', '2026-01-18 10:00:00'),
(19,  10, 18, 'REQUEST', 'REJECTED', '2026-01-19 10:00:00'),
(20,  10, 19, 'INVITE',  'PENDING',  '2026-01-20 10:00:00'),
(21,  11, 20, 'REQUEST', 'PENDING',  '2026-01-21 10:00:00'),
(22,  11, 21, 'INVITE',  'ACCEPTED', '2026-01-22 10:00:00'),
(23,  12, 22, 'REQUEST', 'REJECTED', '2026-01-23 10:00:00'),
(24,  12, 23, 'INVITE',  'PENDING',  '2026-01-24 10:00:00'),
(25,  13, 24, 'REQUEST', 'PENDING',  '2026-01-25 10:00:00'),
(26,  13, 25, 'INVITE',  'ACCEPTED', '2026-01-26 10:00:00'),
(27,  14, 26, 'REQUEST', 'REJECTED', '2026-01-27 10:00:00'),
(28,  14, 27, 'INVITE',  'PENDING',  '2026-01-28 10:00:00'),
(29,  15, 28, 'REQUEST', 'PENDING',  '2026-01-29 10:00:00'),
(30,  15, 29, 'INVITE',  'ACCEPTED', '2026-01-30 10:00:00'),
(31,  16, 30, 'REQUEST', 'REJECTED', '2026-02-01 10:00:00'),
(32,  16, 31, 'INVITE',  'PENDING',  '2026-02-02 10:00:00'),
(33,  17, 32, 'REQUEST', 'PENDING',  '2026-02-03 10:00:00'),
(34,  17, 33, 'INVITE',  'ACCEPTED', '2026-02-04 10:00:00'),
(35,  18, 34, 'REQUEST', 'REJECTED', '2026-02-05 10:00:00'),
(36,  18, 35, 'INVITE',  'PENDING',  '2026-02-06 10:00:00'),
(37,  19, 36, 'REQUEST', 'PENDING',  '2026-02-07 10:00:00'),
(38,  19, 37, 'INVITE',  'ACCEPTED', '2026-02-08 10:00:00'),
(39,  20, 38, 'REQUEST', 'REJECTED', '2026-02-09 10:00:00'),
(40,  20, 39, 'INVITE',  'PENDING',  '2026-02-10 10:00:00'),
(41,  21, 40, 'REQUEST', 'PENDING',  '2026-02-11 10:00:00'),
(42,  21, 41, 'INVITE',  'ACCEPTED', '2026-02-12 10:00:00'),
(43,  22, 42, 'REQUEST', 'REJECTED', '2026-02-13 10:00:00'),
(44,  22, 43, 'INVITE',  'PENDING',  '2026-02-14 10:00:00'),
(45,  23, 44, 'REQUEST', 'PENDING',  '2026-02-15 10:00:00'),
(46,  23, 45, 'INVITE',  'ACCEPTED', '2026-02-16 10:00:00'),
(47,  24, 46, 'REQUEST', 'REJECTED', '2026-02-17 10:00:00'),
(48,  24, 47, 'INVITE',  'PENDING',  '2026-02-18 10:00:00'),
(49,  25, 48, 'REQUEST', 'PENDING',  '2026-02-19 10:00:00'),
(50,  25, 49, 'INVITE',  'ACCEPTED', '2026-02-20 10:00:00'),
(51,  26, 50, 'REQUEST', 'REJECTED', '2026-02-21 10:00:00'),
(52,  26, 51, 'INVITE',  'PENDING',  '2026-02-22 10:00:00'),
(53,  27, 52, 'REQUEST', 'PENDING',  '2026-02-23 10:00:00'),
(54,  27, 53, 'INVITE',  'ACCEPTED', '2026-02-24 10:00:00'),
(55,  28, 54, 'REQUEST', 'REJECTED', '2026-02-25 10:00:00'),
(56,  28, 55, 'INVITE',  'PENDING',  '2026-02-26 10:00:00'),
(57,  29, 56, 'REQUEST', 'PENDING',  '2026-02-27 10:00:00'),
(58,  29, 57, 'INVITE',  'ACCEPTED', '2026-02-28 10:00:00'),
(59,  30, 58, 'REQUEST', 'REJECTED', '2026-03-01 10:00:00'),
(60,  30, 59, 'INVITE',  'PENDING',  '2026-03-02 10:00:00'),
(61,  31, 60, 'REQUEST', 'PENDING',  '2026-03-03 10:00:00'),
(62,  31, 61, 'INVITE',  'ACCEPTED', '2026-03-04 10:00:00'),
(63,  32, 62, 'REQUEST', 'REJECTED', '2026-03-05 10:00:00'),
(64,  32, 63, 'INVITE',  'PENDING',  '2026-03-06 10:00:00'),
(65,  33, 64, 'REQUEST', 'PENDING',  '2026-03-07 10:00:00'),
(66,  33, 65, 'INVITE',  'ACCEPTED', '2026-03-08 10:00:00'),
(67,  34, 66, 'REQUEST', 'REJECTED', '2026-03-09 10:00:00'),
(68,  34, 67, 'INVITE',  'PENDING',  '2026-03-10 10:00:00'),
(69,  35, 68, 'REQUEST', 'PENDING',  '2026-03-11 10:00:00'),
(70,  35, 69, 'INVITE',  'ACCEPTED', '2026-03-12 10:00:00'),
(71,  36, 70, 'REQUEST', 'REJECTED', '2026-03-13 10:00:00'),
(72,  36, 71, 'INVITE',  'PENDING',  '2026-03-14 10:00:00'),
(73,  37, 72, 'REQUEST', 'PENDING',  '2026-03-15 10:00:00'),
(74,  37, 73, 'INVITE',  'ACCEPTED', '2026-03-16 10:00:00'),
(75,  38, 74, 'REQUEST', 'REJECTED', '2026-03-17 10:00:00'),
(76,  38, 75, 'INVITE',  'PENDING',  '2026-03-18 10:00:00'),
(77,  39, 76, 'REQUEST', 'PENDING',  '2026-03-19 10:00:00'),
(78,  39, 77, 'INVITE',  'ACCEPTED', '2026-03-20 10:00:00'),
(79,  40, 78, 'REQUEST', 'REJECTED', '2026-03-21 10:00:00'),
(80,  40, 79, 'INVITE',  'PENDING',  '2026-03-22 10:00:00'),
(81,  41, 80, 'REQUEST', 'PENDING',  '2026-03-23 10:00:00'),
(82,  41, 81, 'INVITE',  'ACCEPTED', '2026-03-24 10:00:00'),
(83,  42, 82, 'REQUEST', 'REJECTED', '2026-03-25 10:00:00'),
(84,  42, 83, 'INVITE',  'PENDING',  '2026-03-26 10:00:00'),
(85,  43, 84, 'REQUEST', 'PENDING',  '2026-03-27 10:00:00'),
(86,  43, 85, 'INVITE',  'ACCEPTED', '2026-03-28 10:00:00'),
(87,  44, 86, 'REQUEST', 'REJECTED', '2026-03-29 10:00:00'),
(88,  44, 87, 'INVITE',  'PENDING',  '2026-03-30 10:00:00'),
(89,  45, 88, 'REQUEST', 'PENDING',  '2026-03-31 10:00:00'),
(90,  45, 89, 'INVITE',  'ACCEPTED', '2026-04-01 10:00:00'),
(91,  46, 90, 'REQUEST', 'REJECTED', '2026-04-02 10:00:00'),
(92,  46, 91, 'INVITE',  'PENDING',  '2026-04-03 10:00:00'),
(93,  47, 92, 'REQUEST', 'PENDING',  '2026-04-04 10:00:00'),
(94,  47, 93, 'INVITE',  'ACCEPTED', '2026-04-05 10:00:00'),
(95,  48, 94, 'REQUEST', 'REJECTED', '2026-04-06 10:00:00'),
(96,  48, 95, 'INVITE',  'PENDING',  '2026-04-07 10:00:00'),
(97,  49, 96, 'REQUEST', 'PENDING',  '2026-04-08 10:00:00'),
(98,  49, 97, 'INVITE',  'ACCEPTED', '2026-04-09 10:00:00'),
(99,  50, 98, 'REQUEST', 'REJECTED', '2026-04-10 10:00:00'),
(100, 50, 99, 'INVITE',  'PENDING',  '2026-04-11 10:00:00');

-- ============================================================================ --
--               FOREIGN KEY CONSTRAINTS (DB INTEGRITY)                        --
-- ============================================================================ --
ALTER TABLE `student_skills`    ADD CONSTRAINT `student_skills_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `student_skills`    ADD CONSTRAINT `student_skills_skill_id_fkey`   FOREIGN KEY (`skill_id`)   REFERENCES `skills`(`id`)   ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `event_requirements` ADD CONSTRAINT `event_requirements_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`)   ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `event_requirements` ADD CONSTRAINT `event_requirements_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`)   ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `teams`             ADD CONSTRAINT `teams_event_id_fkey`            FOREIGN KEY (`event_id`)   REFERENCES `events`(`id`)   ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `teams`             ADD CONSTRAINT `teams_leader_id_fkey`           FOREIGN KEY (`leader_id`)  REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `team_requests`     ADD CONSTRAINT `team_requests_team_id_fkey`     FOREIGN KEY (`team_id`)    REFERENCES `teams`(`id`)    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `team_requests`     ADD CONSTRAINT `team_requests_student_id_fkey`  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `team_members`      ADD CONSTRAINT `team_members_team_id_fkey`      FOREIGN KEY (`team_id`)    REFERENCES `teams`(`id`)    ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `team_members`      ADD CONSTRAINT `team_members_student_id_fkey`   FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================ --
-- 7. ADVANCED DB FEATURES (PROCEDURES, TRIGGERS, CURSORS, CONTROL FLOW)       --
-- ============================================================================ --

-- ----------------------------------------------------------------------------
-- FEATURE 1: BLOCK / VARIABLES (Login / Register)
-- MySQL Equivalent: Stored Procedure Using Variables
-- ----------------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE login_user(
    IN user_email VARCHAR(191),
    IN user_password VARCHAR(191),
    OUT login_status VARCHAR(50),
    OUT logged_in_user_id INT
)
BEGIN
    -- Block defining local variables for operation
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_user_id INT DEFAULT NULL;
    
    -- Check if user exists
    SELECT COUNT(*) INTO v_count 
    FROM students 
    WHERE email = user_email AND password = user_password;
    
    IF v_count = 1 THEN
        SELECT id INTO v_user_id 
        FROM students 
        WHERE email = user_email AND password = user_password;
        
        -- Return success mapping
        SET login_status = 'SUCCESS';
        SET logged_in_user_id = v_user_id;
    ELSE
        -- Return failure mapping
        SET login_status = 'FAILURE';
        SET logged_in_user_id = NULL;
    END IF;
END //

DELIMITER ;


-- ----------------------------------------------------------------------------
-- FEATURE 2: CONTROL STATEMENTS  (Skill validation / conditions)
-- MySQL Equivalent: IF / ELSE Statements inside a Stored Procedure
-- ----------------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE validate_student_skill(
    IN p_student_id INT,
    IN p_event_id INT,
    OUT p_is_eligible BOOLEAN
)
BEGIN
    DECLARE v_matching_skills INT DEFAULT 0;
    
    -- Check how many event-required skills the student actually has
    SELECT COUNT(*) INTO v_matching_skills
    FROM event_requirements er
    JOIN student_skills ss ON er.skill_id = ss.skill_id
    WHERE er.event_id = p_event_id AND ss.student_id = p_student_id;
    
    -- Control Statement Check: Need at least 1 matching skill
    IF v_matching_skills > 0 THEN
        SET p_is_eligible = TRUE;
    ELSE
        SET p_is_eligible = FALSE;
    END IF;
END //

DELIMITER ;


-- ----------------------------------------------------------------------------
-- FEATURE 3: CURSORS (Iterate students / matching)
-- MySQL Equivalent: Cursor with Looping mechanisms
-- ----------------------------------------------------------------------------
DELIMITER //

CREATE PROCEDURE recommend_and_invite_students(
    IN p_team_id INT,
    IN p_event_id INT
)
BEGIN
    -- Variable declaration for the Cursor Block
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_student_id INT;
    
    -- 1. Declare the Cursor that finds all suitable matching students
    DECLARE student_cursor CURSOR FOR 
        SELECT DISTINCT ss.student_id 
        FROM student_skills ss
        JOIN event_requirements er ON ss.skill_id = er.skill_id
        WHERE er.event_id = p_event_id
        AND ss.student_id NOT IN (SELECT student_id FROM team_members WHERE team_id = p_team_id)
        LIMIT 5; -- Match up to 5 students
        
    -- Check for end of cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- 2. Open the Cursor
    OPEN student_cursor;
    
    -- 3. Control Loop to iterate students
    read_loop: LOOP
        FETCH student_cursor INTO v_student_id;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Business Logic per Row: Avoid duplicate requests
        IF NOT EXISTS (SELECT 1 FROM team_requests WHERE team_id = p_team_id AND student_id = v_student_id AND type = 'INVITE') THEN
            INSERT INTO team_requests (team_id, student_id, type, status)
            VALUES (p_team_id, v_student_id, 'INVITE', 'PENDING');
        END IF;
        
    END LOOP;
    
    -- 4. Close the cursor when done
    CLOSE student_cursor;
END //

DELIMITER ;


-- ----------------------------------------------------------------------------
-- FEATURE 4: TRIGGERS (Auto actions)
-- MySQL Equivalent: Database Triggers AFTER UPDATE / AFTER INSERT
-- ----------------------------------------------------------------------------
DELIMITER //

-- We attach an auto-action to the team_requests table
CREATE TRIGGER trg_auto_join_on_accept
AFTER UPDATE ON team_requests
FOR EACH ROW
BEGIN
    -- If a request was just updated to 'ACCEPTED'
    IF OLD.status = 'PENDING' AND NEW.status = 'ACCEPTED' THEN
        
        -- Automatically insert the student into the team_members table
        INSERT IGNORE INTO team_members (team_id, student_id)
        VALUES (NEW.team_id, NEW.student_id);
        
    END IF;
END //

DELIMITER ;

-- ============================================================================ --
-- 8. DATABASE INTEGRITY CONSTRAINTS (CHECK & TRIGGERS)                        --
-- ============================================================================ --

-- A. Standard CHECK Constraints (Enforcing Data Domains)
ALTER TABLE `students` ADD CONSTRAINT `chk_year_of_study` CHECK (`year_of_study` BETWEEN 1 AND 4);
ALTER TABLE `team_requests` ADD CONSTRAINT `chk_request_type` CHECK (`type` IN ('REQUEST', 'INVITE'));
ALTER TABLE `team_requests` ADD CONSTRAINT `chk_request_status` CHECK (`status` IN ('PENDING', 'ACCEPTED', 'REJECTED'));
ALTER TABLE `teams` ADD CONSTRAINT `chk_team_status` CHECK (`status` IN ('Recruiting', 'Closed', 'Active'));

-- B. Complex Constraint: Max 4 Members Per Team
-- Note: MySQL does not support subqueries in CHECK constraints. 
-- To enforce this physically at the database level, we use a BEFORE INSERT Trigger.
DELIMITER //

CREATE TRIGGER trg_check_max_team_members
BEFORE INSERT ON team_members
FOR EACH ROW
BEGIN
    DECLARE v_member_count INT;
    
    SELECT COUNT(*) INTO v_member_count 
    FROM team_members 
    WHERE team_id = NEW.team_id;
    
    IF v_member_count >= 4 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Database Constraint Violation: A team cannot exceed 4 members.';
    END IF;
END //

DELIMITER ;

-- ============================================================================ --
--                              END OF SCRIPT                                   --
-- ============================================================================ --
