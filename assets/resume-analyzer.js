/**
 * Multi-industry resume analyzer — detects field, skills, and recommendations
 * for tech, hospitality, healthcare, business, education, trades, and more.
 */
const ResumeAnalyzer = (() => {
    const UNIVERSAL_SKILLS = [
        { name: 'Communication', aliases: ['communication', 'written communication', 'verbal communication'] },
        { name: 'Leadership', aliases: ['leadership', 'team lead', 'supervised', 'managed team'] },
        { name: 'Problem Solving', aliases: ['problem solving', 'problem-solving', 'troubleshooting'] },
        { name: 'Time Management', aliases: ['time management', 'multitasking', 'prioritization'] },
        { name: 'Customer Service', aliases: ['customer service', 'client service', 'guest service'] }
    ];

    const INDUSTRIES = {
        technology: {
            label: 'Technology',
            signals: [
                'software', 'developer', 'engineer', 'programming', 'javascript', 'python',
                'web development', 'frontend', 'backend', 'full stack', 'full-stack', 'devops',
                'api', 'database', 'git', 'agile', 'scrum', 'typescript', 'react', 'node.js',
                'mobile app', 'cloud', 'aws', 'azure', 'cybersecurity', 'data science', 'machine learning'
            ],
            skills: [
                { name: 'JavaScript', aliases: ['javascript', 'js'] },
                { name: 'TypeScript', aliases: ['typescript'] },
                { name: 'React', aliases: ['react', 'react.js'] },
                { name: 'Python', aliases: ['python'] },
                { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node'] },
                { name: 'HTML/CSS', aliases: ['html', 'css', 'html5', 'css3'] },
                { name: 'SQL', aliases: ['sql', 'mysql', 'postgresql', 'postgres'] },
                { name: 'UI/UX', aliases: ['ui/ux', 'ux design', 'ui design', 'figma', 'user experience'] },
                { name: 'Git', aliases: ['git', 'github', 'gitlab'] },
                { name: 'Java', aliases: ['java'] }
            ],
            roles: [
                { title: 'Junior Frontend Developer', keywords: ['frontend', 'react', 'javascript', 'ui', 'web developer'] },
                { title: 'Junior Backend Developer', keywords: ['backend', 'python', 'node', 'java', 'api', 'server'] },
                { title: 'Full Stack Developer', keywords: ['full stack', 'full-stack', 'mern', 'mean stack'] },
                { title: 'Data Analyst', keywords: ['data analyst', 'data analysis', 'analytics', 'sql', 'excel'] },
                { title: 'QA Engineer', keywords: ['qa', 'quality assurance', 'testing', 'test automation'] }
            ],
            defaultRole: 'Junior Software Engineer',
            focus: (skills) => {
                if (skills.some(s => s.name === 'React' || s.name === 'UI/UX')) return 'Frontend engineering and user-facing products';
                if (skills.some(s => s.name === 'Python' || s.name === 'SQL')) return 'Backend systems and data-driven applications';
                return 'Building a strong technical portfolio in your strongest stack';
            },
            suggestion: (skills) => {
                if (skills.some(s => s.name === 'TypeScript')) return 'Ship a TypeScript portfolio project with tests and deployment';
                if (skills.some(s => s.name === 'React')) return 'Contribute to an open-source React project or build a capstone app';
                return 'Add measurable project outcomes and GitHub links to your resume';
            },
            courses: (skill) => [
                { title: `Advanced ${skill} Patterns`, provider: 'Frontend Masters', weeks: 4, match: '96%' },
                { title: `${skill} Professional Certificate`, provider: 'Coursera', weeks: 6, match: '91%' }
            ]
        },
        hospitality: {
            label: 'Hospitality & Culinary',
            signals: [
                'chef', 'cook', 'kitchen', 'culinary', 'restaurant', 'hotel', 'hospitality',
                'server', 'waiter', 'waitress', 'bartender', 'barista', 'catering', 'food service',
                'banquet', 'housekeeping', 'front desk', 'concierge', 'sous chef', 'line cook',
                'pastry', 'baker', 'food preparation', 'dining', 'resort', 'event catering'
            ],
            skills: [
                { name: 'Food Safety', aliases: ['servsafe', 'haccp', 'food safety', 'sanitation'] },
                { name: 'Menu Planning', aliases: ['menu planning', 'menu development', 'recipe'] },
                { name: 'Kitchen Operations', aliases: ['kitchen', 'prep', 'line cook', 'food prep', 'mise en place'] },
                { name: 'Customer Service', aliases: ['customer service', 'guest service', 'hospitality'] },
                { name: 'POS Systems', aliases: ['pos', 'point of sale', 'toast', 'square'] },
                { name: 'Inventory Management', aliases: ['inventory', 'stock', 'ordering supplies'] },
                { name: 'Wine & Beverage', aliases: ['wine', 'beverage', 'mixology', 'cocktail', 'bar'] },
                { name: 'Event Catering', aliases: ['catering', 'banquet', 'event service'] }
            ],
            roles: [
                { title: 'Line Cook', keywords: ['line cook', 'prep cook', 'kitchen assistant'] },
                { title: 'Sous Chef', keywords: ['sous chef', 'head cook', 'chef de partie'] },
                { title: 'Executive Chef', keywords: ['executive chef', 'head chef', 'culinary director'] },
                { title: 'Restaurant Server', keywords: ['server', 'waiter', 'waitress', 'food runner'] },
                { title: 'Hotel Front Desk Associate', keywords: ['front desk', 'reception', 'guest relations'] },
                { title: 'Pastry Chef', keywords: ['pastry', 'baker', 'baking', 'dessert'] }
            ],
            defaultRole: 'Hospitality Professional',
            focus: (skills) => {
                if (skills.some(s => s.name === 'Kitchen Operations' || s.name === 'Menu Planning')) return 'Culinary technique and kitchen leadership';
                if (skills.some(s => s.name === 'Customer Service')) return 'Guest experience and service excellence';
                return 'Growing expertise in food service and hospitality operations';
            },
            suggestion: (skills) => {
                if (skills.some(s => s.name === 'Food Safety')) return 'Pursue ServSafe or local food-handler certification if not already current';
                return 'Highlight volume served, team size managed, and any menu or cost improvements';
            },
            courses: (skill) => [
                { title: `Professional ${skill} Training`, provider: 'Escoffier Online', weeks: 4, match: '94%' },
                { title: 'Hospitality Management Basics', provider: 'AHLEI', weeks: 6, match: '89%' }
            ]
        },
        healthcare: {
            label: 'Healthcare',
            signals: [
                'nurse', 'nursing', 'patient', 'clinical', 'medical', 'healthcare', 'hospital',
                'cna', 'lpn', 'rn', 'emt', 'phlebotomy', 'medical assistant', 'caregiver',
                'physical therapy', 'dental', 'pharmacy', 'mental health', 'counseling', 'triage'
            ],
            skills: [
                { name: 'Patient Care', aliases: ['patient care', 'bedside', 'patient monitoring'] },
                { name: 'Clinical Documentation', aliases: ['documentation', 'charting', 'ehr', 'emr', 'epic', 'cerner'] },
                { name: 'Vital Signs', aliases: ['vital signs', 'vitals', 'blood pressure'] },
                { name: 'HIPAA Compliance', aliases: ['hipaa', 'privacy', 'confidentiality'] },
                { name: 'CPR/BLS', aliases: ['cpr', 'bls', 'first aid', 'acls'] },
                { name: 'Medication Administration', aliases: ['medication', 'med admin', 'pharmacology'] },
                { name: 'Infection Control', aliases: ['infection control', 'sterile', 'ppe'] }
            ],
            roles: [
                { title: 'Registered Nurse (RN)', keywords: ['registered nurse', ' rn ', 'rn,', 'bsn'] },
                { title: 'Certified Nursing Assistant', keywords: ['cna', 'nursing assistant', 'patient care assistant'] },
                { title: 'Medical Assistant', keywords: ['medical assistant', 'clinical assistant'] },
                { title: 'Patient Care Technician', keywords: ['patient care', 'pct', 'caregiver'] }
            ],
            defaultRole: 'Healthcare Support Professional',
            focus: (skills) => 'Safe, compassionate patient care and clinical accuracy',
            suggestion: () => 'Ensure certifications (CPR, license) are visible with expiration dates on your resume',
            courses: (skill) => [
                { title: `${skill} Refresher`, provider: 'MedCerts', weeks: 3, match: '93%' },
                { title: 'Healthcare Career Advancement', provider: 'Coursera', weeks: 5, match: '88%' }
            ]
        },
        business: {
            label: 'Business & Finance',
            signals: [
                'accounting', 'finance', 'marketing', 'sales', 'business analyst', 'consultant',
                'project manager', 'operations', 'hr', 'human resources', 'administrative',
                'bookkeeping', 'payroll', 'excel', 'quickbooks', 'crm', 'account manager'
            ],
            skills: [
                { name: 'Excel', aliases: ['excel', 'spreadsheet', 'pivot table'] },
                { name: 'Financial Analysis', aliases: ['financial analysis', 'budgeting', 'forecasting', 'p&l'] },
                { name: 'Marketing', aliases: ['marketing', 'digital marketing', 'seo', 'social media'] },
                { name: 'Sales', aliases: ['sales', 'business development', 'account management'] },
                { name: 'Project Management', aliases: ['project management', 'pmp', 'agile', 'scrum master'] },
                { name: 'QuickBooks', aliases: ['quickbooks', 'bookkeeping', 'accounts payable', 'accounts receivable'] },
                { name: 'CRM', aliases: ['crm', 'salesforce', 'hubspot'] }
            ],
            roles: [
                { title: 'Business Analyst', keywords: ['business analyst', 'data analyst', 'operations analyst'] },
                { title: 'Marketing Coordinator', keywords: ['marketing', 'content marketing', 'brand'] },
                { title: 'Accountant', keywords: ['accountant', 'accounting', 'bookkeeper'] },
                { title: 'Sales Representative', keywords: ['sales rep', 'sales representative', 'account executive'] }
            ],
            defaultRole: 'Business Professional',
            focus: (skills) => {
                if (skills.some(s => s.name === 'Marketing')) return 'Growth, branding, and customer acquisition';
                if (skills.some(s => s.name === 'Financial Analysis')) return 'Financial reporting and business decision support';
                return 'Operational efficiency and cross-functional collaboration';
            },
            suggestion: () => 'Quantify impact with revenue, cost savings, or process improvements',
            courses: (skill) => [
                { title: `${skill} for Professionals`, provider: 'LinkedIn Learning', weeks: 4, match: '92%' },
                { title: 'Business Fundamentals', provider: 'Wharton Online', weeks: 6, match: '87%' }
            ]
        },
        education: {
            label: 'Education',
            signals: [
                'teacher', 'teaching', 'tutor', 'education', 'classroom', 'curriculum',
                'instruction', 'professor', 'lecturer', 'school', 'student', 'lesson plan',
                'special education', 'esl', 'early childhood'
            ],
            skills: [
                { name: 'Lesson Planning', aliases: ['lesson plan', 'curriculum', 'instructional design'] },
                { name: 'Classroom Management', aliases: ['classroom management', 'behavior management'] },
                { name: 'Assessment', aliases: ['assessment', 'grading', 'evaluation'] },
                { name: 'Differentiated Instruction', aliases: ['differentiated', 'iep', 'special education'] },
                { name: 'Educational Technology', aliases: ['google classroom', 'canvas', 'lms', 'edtech'] }
            ],
            roles: [
                { title: 'Teacher', keywords: ['teacher', 'instructor', 'educator'] },
                { title: 'Teaching Assistant', keywords: ['teaching assistant', 'paraeducator', 'tutor'] },
                { title: 'Instructional Designer', keywords: ['instructional design', 'curriculum developer'] }
            ],
            defaultRole: 'Education Professional',
            focus: () => 'Student outcomes and engaging instruction',
            suggestion: () => 'Include grade levels, subjects taught, and measurable student improvements',
            courses: (skill) => [
                { title: `${skill} in Practice`, provider: 'Coursera', weeks: 4, match: '90%' },
                { title: 'Modern Teaching Methods', provider: 'edX', weeks: 5, match: '86%' }
            ]
        },
        trades: {
            label: 'Skilled Trades',
            signals: [
                'electrician', 'plumber', 'hvac', 'carpenter', 'welder', 'mechanic', 'automotive',
                'construction', 'contractor', 'technician', 'maintenance', 'blueprint', 'osha',
                'forklift', 'cdl', 'manufacturing', 'assembly'
            ],
            skills: [
                { name: 'OSHA Safety', aliases: ['osha', 'safety', 'workplace safety'] },
                { name: 'Blueprint Reading', aliases: ['blueprint', 'schematic', 'technical drawing'] },
                { name: 'Equipment Maintenance', aliases: ['maintenance', 'repair', 'troubleshooting equipment'] },
                { name: 'Power Tools', aliases: ['power tools', 'hand tools', 'machinery'] },
                { name: 'Quality Control', aliases: ['quality control', 'qc', 'inspection'] }
            ],
            roles: [
                { title: 'Electrician', keywords: ['electrician', 'electrical'] },
                { title: 'HVAC Technician', keywords: ['hvac', 'heating', 'cooling', 'refrigeration'] },
                { title: 'Maintenance Technician', keywords: ['maintenance technician', 'facilities maintenance'] },
                { title: 'Construction Worker', keywords: ['construction', 'carpenter', 'laborer'] }
            ],
            defaultRole: 'Skilled Trades Professional',
            focus: () => 'Safety compliance and hands-on technical expertise',
            suggestion: () => 'List licenses, apprenticeships, and equipment you are certified to operate',
            courses: (skill) => [
                { title: `${skill} Certification Prep`, provider: 'SkillCat', weeks: 3, match: '91%' },
                { title: 'Trade Skills Advancement', provider: 'Penn Foster', weeks: 8, match: '85%' }
            ]
        },
        creative: {
            label: 'Creative & Media',
            signals: [
                'designer', 'graphic design', 'photography', 'videography', 'video editor',
                'illustrator', 'animator', 'writer', 'copywriter', 'content creator',
                'social media', 'brand', 'creative director', 'adobe', 'photoshop'
            ],
            skills: [
                { name: 'Adobe Creative Suite', aliases: ['photoshop', 'illustrator', 'indesign', 'adobe'] },
                { name: 'Graphic Design', aliases: ['graphic design', 'visual design', 'layout'] },
                { name: 'Video Editing', aliases: ['video editing', 'premiere', 'final cut', 'davinci'] },
                { name: 'Photography', aliases: ['photography', 'lightroom', 'photo editing'] },
                { name: 'Copywriting', aliases: ['copywriting', 'content writing', 'copy editor'] },
                { name: 'Branding', aliases: ['branding', 'brand identity', 'logo'] }
            ],
            roles: [
                { title: 'Graphic Designer', keywords: ['graphic designer', 'visual designer'] },
                { title: 'Content Creator', keywords: ['content creator', 'influencer', 'youtube'] },
                { title: 'Video Editor', keywords: ['video editor', 'videographer', 'post-production'] }
            ],
            defaultRole: 'Creative Professional',
            focus: () => 'Visual storytelling and brand consistency',
            suggestion: () => 'Link to a portfolio with before/after examples and client results',
            courses: (skill) => [
                { title: `${skill} Masterclass`, provider: 'Skillshare', weeks: 3, match: '93%' },
                { title: 'Creative Portfolio Building', provider: 'Domestika', weeks: 4, match: '88%' }
            ]
        }
    };

    function normalizeText(text) {
        return text.toLowerCase().replace(/\s+/g, ' ');
    }

    function textIncludes(text, phrase) {
        return text.includes(phrase.toLowerCase());
    }

    function detectIndustry(text) {
        const normalized = normalizeText(text);
        let bestId = 'general';
        let bestScore = 0;

        Object.entries(INDUSTRIES).forEach(([id, industry]) => {
            let score = 0;
            industry.signals.forEach(signal => {
                if (normalized.includes(signal.toLowerCase())) score += 1;
            });
            if (score > bestScore) {
                bestScore = score;
                bestId = id;
            }
        });

        return bestScore > 0 ? bestId : 'general';
    }

    function detectSkills(text, industryId) {
        const normalized = normalizeText(text);
        const found = [];
        const seen = new Set();

        const skillPools = [];
        if (INDUSTRIES[industryId]) skillPools.push(...INDUSTRIES[industryId].skills);
        skillPools.push(...UNIVERSAL_SKILLS);

        // If few industry skills found, scan all industries
        skillPools.forEach(skill => {
            const matched = skill.aliases.some(alias => normalized.includes(alias.toLowerCase()));
            if (matched && !seen.has(skill.name)) {
                seen.add(skill.name);
                found.push({
                    name: skill.name,
                    level: Math.floor(Math.random() * 25) + 55
                });
            }
        });

        if (found.length < 2) {
            Object.values(INDUSTRIES).forEach(industry => {
                industry.skills.forEach(skill => {
                    const matched = skill.aliases.some(alias => normalized.includes(alias.toLowerCase()));
                    if (matched && !seen.has(skill.name)) {
                        seen.add(skill.name);
                        found.push({
                            name: skill.name,
                            level: Math.floor(Math.random() * 25) + 50
                        });
                    }
                });
            });
        }

        return found.sort((a, b) => b.level - a.level);
    }

    function detectRole(text, industryId, skillData) {
        const normalized = normalizeText(text);
        const industry = INDUSTRIES[industryId];

        if (!industry) {
            return inferRoleFromText(normalized) || 'Entry-level Professional';
        }

        let bestRole = null;
        let bestScore = 0;

        industry.roles.forEach(role => {
            let score = 0;
            role.keywords.forEach(kw => {
                if (normalized.includes(kw.toLowerCase())) score += 2;
            });
            if (score > bestScore) {
                bestScore = score;
                bestRole = role.title;
            }
        });

        if (bestRole) return bestRole;

        // Infer from common job title patterns in first few lines
        const titleFromText = inferRoleFromText(normalized);
        if (titleFromText) return titleFromText;

        return industry.defaultRole;
    }

    function inferRoleFromText(normalized) {
        const titlePatterns = [
            /(?:^|\n)\s*([a-z][a-z\s/&-]{2,40}(?:chef|cook|manager|developer|engineer|nurse|teacher|designer|analyst|assistant|technician|coordinator|specialist|director|supervisor|consultant|administrator))\s*(?:\n|$)/i
        ];
        for (const pattern of titlePatterns) {
            const match = normalized.match(pattern);
            if (match && match[1]) {
                return match[1].trim().replace(/\b\w/g, c => c.toUpperCase());
            }
        }
        return null;
    }

    function analyze(text) {
        const industryId = detectIndustry(text);
        const industry = INDUSTRIES[industryId];
        const skillData = detectSkills(text, industryId);
        const topSkillsStr = skillData.length
            ? skillData.slice(0, 5).map(s => s.name).join(', ')
            : extractFallbackTerms(text);

        const jobTitle = detectRole(text, industryId, skillData);
        const industryLabel = industry ? industry.label : 'General';

        let focus, suggestion, courses;
        if (industry) {
            focus = typeof industry.focus === 'function' ? industry.focus(skillData) : industry.focus;
            suggestion = typeof industry.suggestion === 'function' ? industry.suggestion(skillData) : industry.suggestion;
            const topSkill = skillData[0]?.name || industryLabel;
            courses = industry.courses(topSkill);
        } else {
            focus = 'Identifying your strongest experience and transferable skills';
            suggestion = 'Add specific achievements, tools used, and measurable outcomes to your resume';
            courses = [
                { title: 'Career Discovery Workshop', provider: 'Coursera', weeks: 3, match: '85%' },
                { title: 'Resume & Interview Skills', provider: 'LinkedIn Learning', weeks: 2, match: '82%' }
            ];
        }

        return {
            industry: industryId,
            industryLabel,
            skills: topSkillsStr,
            skillData,
            jobTitle,
            focus,
            suggestion,
            courses
        };
    }

    function extractFallbackTerms(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const bullets = lines
            .filter(l => /^[-•*]/.test(l) || l.length < 60)
            .slice(0, 3)
            .map(l => l.replace(/^[-•*]\s*/, '').split(/[,;–-]/)[0].trim())
            .filter(Boolean);
        return bullets.length ? bullets.join(', ') : 'Transferable experience — add more keywords for sharper matches';
    }

    return { analyze, INDUSTRIES };
})();
