// NAVIGATION SYSTEM
function navigateTo(pageId) {
    // Hide current page
    const currentPage = document.querySelector('.page-container');
    if (currentPage) {
        currentPage.style.display = 'none';
    }

    // Update nav highlighting
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.querySelector(`[data-page="${pageId}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }

    // If profile requires login, redirect to login page
    if (pageId === 'profile' && !isLoggedIn()) {
        showLogin();
        return;
    }

    // Load page
    loadPage(pageId);
}

function loadPage(pageId) {
    const contentArea = document.querySelector('.app-content');

    fetch(`pages/${pageId}.html`)
        .then(response => response.text())
        .then(html => {
            contentArea.innerHTML = html;

            // Initialize page-specific functionality
            initializePageFunctionality(pageId);
            // Hide header/nav for login and terms pages
            const header = document.querySelector('.app-header');
            const nav = document.querySelector('.app-nav');
            if (pageId === 'login' || pageId === 'terms') {
                if (header) header.style.display = 'none';
                if (nav) nav.style.display = 'none';
            } else {
                if (header) header.style.display = '';
                if (nav) nav.style.display = '';
            }
        })
        .catch(error => {
            console.error(`Error loading page ${pageId}:`, error);
            contentArea.innerHTML = '<p>Error loading page. Please try again.</p>';
        });
}

function initializePageFunctionality(pageId) {
    switch (pageId) {
        case 'chat':
            initializeChat();
            break;
        case 'dashboard':
            initializeDashboard();
            break;
        case 'career':
            initializeCareer();
            break;
        case 'wellbeing':
            initializeWellbeing();
            break;
        case 'profile':
            initializeProfile();
            break;
        case 'community':
            initializeCommunity();
            break;
        case 'login':
            initializeLogin();
            break;
        case 'edit-profile':
            initializeEditProfile();
            break;
        case 'terms':
            // nothing special
            break;
    }
}

function initializeLogin() {
    const pwdInput = document.getElementById('login-password');
    const toggleBtn = document.getElementById('toggle-password');
    const loginSubmit = document.getElementById('login-submit');
    const loginGuest = document.getElementById('login-guest');
    const termsLink = document.getElementById('terms-link');

    if (toggleBtn && pwdInput) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (pwdInput.type === 'password') {
                pwdInput.type = 'text';
                toggleBtn.classList.add('visible');
            } else {
                pwdInput.type = 'password';
                toggleBtn.classList.remove('visible');
            }
        });
    }

    if (loginSubmit) {
        loginSubmit.addEventListener('click', function () {
            const nameEl = document.getElementById('login-username');
            const emailEl = document.getElementById('login-email');
            const passwordEl = document.getElementById('login-password');
            
            const name = nameEl ? nameEl.value.trim() : '';
            const email = emailEl ? emailEl.value.trim() : '';
            const password = passwordEl ? passwordEl.value.trim() : '';
            
            if (!name || !email || !password) {
                alert('Please provide name, email and password to sign in.');
                return;
            }
            // store a minimal user object
            const user = { name: name, email: email, guest: false };
            localStorage.setItem('steadypath_user', JSON.stringify(user));
            setLoggedIn(true);
            // navigate to dashboard
            navigateTo('dashboard');
        });
    }

    if (loginGuest) {
        loginGuest.addEventListener('click', function () {
            const user = { name: 'Guest', email: 'guest@steadypath.app', guest: true, location: 'Everywhere' };
            localStorage.setItem('steadypath_user', JSON.stringify(user));
            setLoggedIn(true);
            navigateTo('dashboard');
        });
    }

    if (termsLink) {
        termsLink.addEventListener('click', function (e) {
            e.preventDefault();
            navigateTo('terms');
        });
    }
}

function initializeProfile() {
    const userJson = localStorage.getItem('steadypath_user');
    let nameEl = document.querySelector('.profile-name');
    let avatarEl = document.querySelector('.profile-main-card .profile-avatar-large');
    
    if (!userJson) {
        if (nameEl) nameEl.textContent = 'Guest';
        return;
    }
    try {
        const user = JSON.parse(userJson);
        if (nameEl) nameEl.textContent = user.name || 'User';
        
        // Update avatar if photo exists
        if (avatarEl && user.photo) {
            avatarEl.style.backgroundImage = `url(${user.photo})`;
            avatarEl.style.backgroundSize = 'cover';
            avatarEl.textContent = '';
        }

        // populate email if element exists
        const emailEl = document.querySelector('.profile-info-row strong');
        if (emailEl && user.email) emailEl.textContent = user.email;

        // populate location if element exists
        const locationRows = document.querySelectorAll('.profile-info-row');
        locationRows.forEach(row => {
            if (row.querySelector('span')?.textContent === 'Location') {
                row.querySelector('strong').textContent = user.location || 'Not set';
            }
        });
    } catch (e) {
        console.error('profile init error', e);
    }

    // Logout listener
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('steadypath_logged_in');
            localStorage.removeItem('steadypath_user');
            window.location.reload();
        });
    }
}

function initializeEditProfile() {
    const userJson = localStorage.getItem('steadypath_user');
    const nameInput = document.getElementById('edit-name');
    const emailInput = document.getElementById('edit-email');
    const locationInput = document.getElementById('edit-location');
    const saveBtn = document.getElementById('save-profile');
    const photoBtn = document.querySelector('.profile-main-card .secondary-button');
    const avatarEl = document.querySelector('.profile-main-card .profile-avatar-large');

    let currentUser = {};
    if (userJson) {
        try {
            currentUser = JSON.parse(userJson);
            if (nameInput) nameInput.value = currentUser.name || '';
            if (emailInput) emailInput.value = currentUser.email || '';
            if (locationInput) locationInput.value = currentUser.location || '';
            if (avatarEl && currentUser.photo) {
                avatarEl.style.backgroundImage = `url(${currentUser.photo})`;
                avatarEl.style.backgroundSize = 'cover';
                avatarEl.textContent = '';
            }
        } catch (e) {
            console.error('edit profile init error', e);
        }
    }

    // Handle Photo Change
    if (photoBtn) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        photoBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    currentUser.photo = base64;
                    if (avatarEl) {
                        avatarEl.style.backgroundImage = `url(${base64})`;
                        avatarEl.style.backgroundSize = 'cover';
                        avatarEl.textContent = '';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const updatedUser = {
                ...currentUser,
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                location: locationInput.value.trim(),
                guest: false
            };
            
            if (!updatedUser.name || !updatedUser.email) {
                alert('Please provide at least a username and email.');
                return;
            }

            localStorage.setItem('steadypath_user', JSON.stringify(updatedUser));
            alert('Profile updated successfully!');
            navigateTo('profile');
        });
    }
}

// LOGIN HANDLING
function showLogin() {
    loadPage('login');
}

function isLoggedIn() {
    return localStorage.getItem('steadypath_logged_in') === '1';
}

function setLoggedIn(val) {
    if (val) localStorage.setItem('steadypath_logged_in', '1'); else localStorage.removeItem('steadypath_logged_in');
}

function toggleSettings() {
    alert('Settings are coming soon in SteadyPath.');
}

// CHAT CONFIGURATION
// For local testing: 'http://localhost:8080/webhooks/rest/webhook/'
// For production: 'https://steadypath-production.up.railway.app/webhooks/rest/webhook/'
const RASA_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/webhooks/rest/webhook/'
    : 'https://steadypath-production.up.railway.app/webhooks/rest/webhook/';

const SENDER_ID = 'user_' + Math.random().toString(36).substr(2, 9);

function addChatMessage(text, isUser) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageGroup = document.createElement('div');
    messageGroup.className = `message-group ${isUser ? 'user' : 'bot'}`;

    if (!isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '🤖';
        messageGroup.appendChild(avatar);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    messageGroup.appendChild(contentDiv);

    chatMessages.appendChild(messageGroup);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showChatTyping() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group bot';
    messageGroup.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    messageGroup.appendChild(avatar);

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }

    messageGroup.appendChild(typingDiv);
    chatMessages.appendChild(messageGroup);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
}

async function sendToRasa(message, metadata = null) {
    try {
        const payload = { sender: SENDER_ID, message: message };
        if (metadata) {
            payload.metadata = metadata;
        }

        const response = await fetch(RASA_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'cors',
            cache: 'no-cache'
        });
        const data = await response.json();
        hideTyping();
        if (data && data.length > 0) {
            data.forEach(botResponse => {
                if (botResponse.text) addChatMessage(botResponse.text, false);
            });
        } else {
            addChatMessage("I understand. How else can I help you?", false);
        }
    } catch (error) {
        console.error('Error:', error);
        hideTyping();
        addChatMessage(`⚠️ Connection Failed: I can't reach the Rasa server at ${RASA_URL}`, false);
        
        if (RASA_URL.includes('localhost')) {
            addChatMessage("This usually means your local Rasa server isn't running. Please run:", false);
            addChatMessage("rasa run --enable-api --cors \"*\"", false);
        } else {
            addChatMessage("This usually means your deployed backend on Railway is either starting up or having an issue. Please check your Railway logs.", false);
        }
        
        // Add a retry button
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            const btn = document.createElement('button');
            btn.className = 'primary-button';
            btn.style.marginTop = '10px';
            btn.textContent = '🔄 Retry Connection';
            btn.onclick = () => window.location.reload();
            chatMessages.appendChild(btn);
        }
    }
    const sendButton = document.getElementById('send-button');
    if (sendButton) sendButton.disabled = false;
}

function initializeChat() {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    if (!chatMessages || !chatInput || !sendButton) return;

    // Clear previous messages
    chatMessages.innerHTML = '';

    // Initial greeting
    addChatMessage("Hi! I'm your personal assistant. How can I help you with your career or personal development today?", false);

    // Event listeners
    sendButton.addEventListener('click', handleChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatMessage();
        }
    });

    const suggestionButtons = document.querySelectorAll('.suggestion-button');
    suggestionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const message = button.getAttribute('data-message');
            if (!message) return;
            addChatMessage(message, true);
            showChatTyping();
            sendToRasa(message);
        });
    });

    function handleChatMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addChatMessage(message, true);
        chatInput.value = '';
        sendButton.disabled = true;

        showChatTyping();
        sendToRasa(message);
    }
}

function initializeDashboard() {
    const greetingEl = document.querySelector('.dashboard-greeting');
    const userJson = localStorage.getItem('steadypath_user');
    
    if (greetingEl && userJson) {
        try {
            const user = JSON.parse(userJson);
            const hour = new Date().getHours();
            let timeOfDay = 'morning';
            if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
            else if (hour >= 17) timeOfDay = 'evening';
            
            greetingEl.textContent = `Good ${timeOfDay}, ${user.name || 'User'}`;
        } catch (e) {
            console.error('dashboard greeting error', e);
        }
    }

    // Set profile photo if exists
    const avatarEl = document.querySelector('.dashboard-header .profile-avatar-large');
    if (avatarEl && userJson) {
        const user = JSON.parse(userJson);
        if (user.photo) {
            avatarEl.style.backgroundImage = `url(${user.photo})`;
            avatarEl.style.backgroundSize = 'cover';
            avatarEl.textContent = '';
        }
    }

    // Dashboard quick actions
    document.querySelectorAll('.quick-action-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
}

function initializeCareer() {
    const uploadInput = document.getElementById('resume-upload');
    const uploadZone = document.getElementById('resume-drop-zone');
    const uploadButton = document.getElementById('upload-resume-button');
    const uploadError = document.getElementById('upload-error');
    const resumeSummary = document.getElementById('resume-summary');
    const skillsOutput = document.getElementById('resume-skills');
    const focusOutput = document.getElementById('resume-focus');
    const actionOutput = document.getElementById('resume-action');

    if (!uploadInput || !uploadZone || !uploadButton) return;

    const clearError = () => {
        if (uploadError) uploadError.textContent = '';
    };

    const showError = (message) => {
        if (uploadError) uploadError.textContent = message;
    };

    const parseResumeText = (text) => {
        const skillList = [
            { name: 'React', level: 0 },
            { name: 'TypeScript', level: 0 },
            { name: 'UI/UX', level: 0 },
            { name: 'JavaScript', level: 0 },
            { name: 'Python', level: 0 },
            { name: 'Node', level: 0 },
            { name: 'HTML', level: 0 },
            { name: 'CSS', level: 0 },
            { name: 'Figma', level: 0 },
            { name: 'SQL', level: 0 }
        ];

        skillList.forEach(skill => {
            const regex = new RegExp(`\\b${skill.name}\\b`, 'i');
            if (regex.test(text)) {
                // Randomize a realistic progress based on detection
                skill.level = Math.floor(Math.random() * 30) + 50; 
            }
        });

        const foundSkills = skillList.filter(s => s.level > 0);
        const topSkillsStr = foundSkills.length ? foundSkills.slice(0, 4).map(s => s.name).join(', ') : 'No clear skills found yet';
        const focus = foundSkills.some(s => s.name === 'React') ? 'Frontend engineering with React' : foundSkills.some(s => s.name === 'UI/UX') ? 'Product design and user experience' : 'building your strongest technical skills';
        const suggestion = foundSkills.some(s => s.name === 'TypeScript') ? 'Practice a TypeScript portfolio project' : 'Add more real project experience to your resume';
        
        return { skills: topSkillsStr, focus, suggestion, skillData: foundSkills };
    };

    const updateSkillProgressUI = (skillData) => {
        const progressList = document.querySelector('.skill-progress-list');
        const courseSection = document.querySelector('.career-content');
        if (!progressList) return;

        if (skillData.length === 0) {
            progressList.innerHTML = '<p style="font-size: 13px; color: #94a3b8; text-align: center;">No skills detected yet. Upload a resume to see progress.</p>';
            return;
        }

        progressList.innerHTML = '';
        skillData.slice(0, 3).forEach(skill => {
            const target = Math.min(100, skill.level + 20);
            const row = document.createElement('div');
            row.className = 'skill-progress-row';
            row.innerHTML = `<span>${skill.name}</span><span>${skill.level}% → ${target}%</span>`;
            
            const bar = document.createElement('div');
            bar.className = 'progress-bar';
            bar.innerHTML = `<div class="progress-fill" style="width: ${skill.level}%;"></div>`;
            
            progressList.appendChild(row);
            progressList.appendChild(bar);
        });

        // Update courses based on top skill
        const topSkill = skillData[0].name;
        const courses = [
            { title: `Advanced ${topSkill} Patterns`, provider: 'Frontend Masters', match: '98%' },
            { title: `${topSkill} for Professionals`, provider: 'Coursera', match: '92%' }
        ];

        const existingCourses = document.querySelectorAll('.course-card');
        existingCourses.forEach((card, index) => {
            if (courses[index]) {
                card.querySelector('.course-title').textContent = courses[index].title;
                card.querySelector('.course-subtitle').textContent = `${courses[index].provider} • 4 weeks`;
                card.querySelector('.course-badge').textContent = `${courses[index].match} match`;
            }
        });
    };

    const showResumeSummary = (data) => {
        if (resumeSummary) resumeSummary.hidden = false;
        if (skillsOutput) skillsOutput.textContent = data.skills;
        if (focusOutput) focusOutput.textContent = data.focus;
        if (actionOutput) actionOutput.textContent = data.suggestion;
        
        if (data.skillData) {
            updateSkillProgressUI(data.skillData);
            localStorage.setItem('steadypath_career_data', JSON.stringify(data));
        }
    };

    // Load persisted career data if it exists
    const savedData = localStorage.getItem('steadypath_career_data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            showResumeSummary(data);
        } catch (e) {
            console.error('Error loading saved career data', e);
        }
    }

    const extractTextFromPDF = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        return fullText;
    };

    const extractTextFromImage = async (file) => {
        const result = await Tesseract.recognize(file, 'eng');
        return result.data.text;
    };

    const handleFile = async (file) => {
        if (!file) return;
        clearError();

        const isText = file.name.match(/\.(txt|md)$/i);
        const isPDF = file.name.match(/\.pdf$/i);
        const isImage = file.name.match(/\.(png|jpg|jpeg)$/i);

        if (!isText && !isPDF && !isImage) {
            showError('Please upload a resume in PDF, Image, or Text format.');
            return;
        }

        showError('Scanning document... please wait.'); // Use error area as status
        
        try {
            let text = '';
            if (isText) {
                text = await file.text();
            } else if (isPDF) {
                text = await extractTextFromPDF(file);
            } else if (isImage) {
                text = await extractTextFromImage(file);
            }

            if (!text.trim()) {
                showError('Could not extract text from this file. Please try a different format.');
                return;
            }

            const analysis = parseResumeText(text);
            showResumeSummary(analysis);
            clearError();

            addChatMessage(`I've scanned your ${file.name.split('.').pop().toUpperCase()} resume.`, false);
            sendToRasa('I uploaded my resume for review.', {
                resume_text: text,
                filename: file.name,
                extracted_skills: analysis.skills
            });
        } catch (err) {
            console.error('Extraction error:', err);
            showError('Error scanning file. Make sure it is not corrupted.');
        }
    };

    uploadZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFile(event.dataTransfer.files[0]);
    });

    uploadButton.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', (event) => handleFile(event.target.files[0]));
}

function showToast(message, duration = 3000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function initializeWellbeing() {
    const moodButtons = document.querySelectorAll('.mood-button');
    const checkInButton = document.querySelector('.checkin-card .primary-button');
    let selectedMood = null;

    if (moodButtons.length) {
        moodButtons.forEach(button => {
            // Using both click and touchend for mobile responsiveness
            const handleSelection = (e) => {
                e.preventDefault();
                moodButtons.forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                selectedMood = button.textContent.trim();
                console.log('Selected mood:', selectedMood);
            };

            button.addEventListener('click', handleSelection);
            button.addEventListener('touchend', handleSelection, { passive: false });
        });
    }

    if (checkInButton) {
        checkInButton.addEventListener('click', () => {
            if (!selectedMood) {
                showToast('Please select a mood first!');
                return;
            }

            if (selectedMood.toLowerCase() === 'stressed') {
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.style.background = '#cc0000';
                toast.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:8px;">
                        <span>Feeling stressed? Let's talk.</span>
                        <button id="toast-chat-btn" style="background:white; color:#cc0000; border:none; padding:4px 10px; border-radius:8px; font-weight:700;">Open Chat</button>
                    </div>
                `;
                
                let container = document.querySelector('.toast-container');
                if (!container) {
                    container = document.createElement('div');
                    container.className = 'toast-container';
                    document.body.appendChild(container);
                }
                container.appendChild(toast);

                document.getElementById('toast-chat-btn').onclick = () => {
                    navigateTo('chat');
                    setTimeout(() => {
                        addChatMessage("I'm feeling quite stressed about my career journey today.", true);
                        showChatTyping();
                        sendToRasa("I am feeling stressed. Can we talk?");
                    }, 500);
                    toast.remove();
                };

                setTimeout(() => {
                    toast.classList.add('fade-out');
                    setTimeout(() => toast.remove(), 300);
                }, 5000);
                return;
            }

            addChatMessage(`I feel ${selectedMood} today.`, true);
            sendToRasa(`I feel ${selectedMood} today.`);
            showToast(`Check-in recorded: ${selectedMood}. Keep growing!`);
            
            // Visual reset
            moodButtons.forEach(item => item.classList.remove('active'));
            selectedMood = null;
        });
    }
}

function initializeCommunity() {
    const searchInput = document.getElementById('community-search');
    if (!searchInput) return;
    searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase();
        document.querySelectorAll('.group-card').forEach(card => {
            const title = card.querySelector('.group-card-title').textContent.toLowerCase();
            card.style.display = title.includes(value) ? 'block' : 'none';
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // If user is not logged in, show login; otherwise load dashboard
    if (!isLoggedIn()) {
        loadPage('login');
    } else {
        loadPage('dashboard');
    }
});
