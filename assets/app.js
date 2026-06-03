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
// For local testing: 'http://localhost:5005/webhooks/rest/webhook'
// For production: 'https://your-rasa-backend.onrender.com/webhooks/rest/webhook'
const RASA_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5005/webhooks/rest/webhook'
    : 'https://your-rasa-backend.onrender.com/webhooks/rest/webhook'; // <-- Replace with your deployed URL

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
        addChatMessage("⚠️ Connection Refused: I can't reach the Rasa server at http://localhost:5005.", false);
        addChatMessage("This usually means the server isn't running. Please follow these steps:", false);
        addChatMessage("1️⃣ Open a terminal and run: rasa run --enable-api --cors \"*\"", false);
        addChatMessage("2️⃣ Open another terminal and run: rasa run actions", false);
        addChatMessage("3️⃣ Make sure you are in the project folder: /Users/macbook/my-rasa-assistant", false);
        
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
        const keywords = ['React', 'TypeScript', 'UI/UX', 'JavaScript', 'Python', 'Node', 'HTML', 'CSS', 'Figma', 'Leadership', 'SQL', 'Design'];
        const found = keywords.filter(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(text));
        const skills = [...new Set(found)];
        const topSkills = skills.length ? skills.slice(0, 4).join(', ') : 'No clear skills found yet';
        const focus = skills.includes('React') ? 'Frontend engineering with React' : skills.includes('UI/UX') ? 'Product design and user experience' : 'building your strongest technical skills';
        const suggestion = skills.includes('TypeScript') ? 'Practice a TypeScript portfolio project' : 'Add more real project experience to your resume';
        return { skills: topSkills, focus, suggestion };
    };

    const showResumeSummary = (data) => {
        if (resumeSummary) resumeSummary.hidden = false;
        if (skillsOutput) skillsOutput.textContent = data.skills;
        if (focusOutput) focusOutput.textContent = data.focus;
        if (actionOutput) actionOutput.textContent = data.suggestion;
    };

    const handleFile = (file) => {
        if (!file) return;
        clearError();

        if (!file.name.match(/\.(txt|md)$/i)) {
            showError('Please upload a plain text resume file (.txt or .md).');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result.toString();
            const analysis = parseResumeText(text);
            showResumeSummary(analysis);
            addChatMessage('I uploaded my resume for analysis.', true);
            sendToRasa('I uploaded my resume for review.', {
                resume_text: text,
                filename: file.name,
                extracted_skills: analysis.skills
            });
        };
        reader.onerror = () => showError('Unable to read the file. Please try a text resume.');
        reader.readAsText(file);
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

function initializeWellbeing() {
    const moodButtons = document.querySelectorAll('.mood-button');
    const checkInButton = document.querySelector('.primary-button');
    let selectedMood = null;

    if (moodButtons.length) {
        moodButtons.forEach(button => {
            button.addEventListener('click', () => {
                moodButtons.forEach(item => item.classList.remove('active'));
                button.classList.add('active');
                selectedMood = button.dataset.mood || button.textContent;
            });
        });
    }

    if (checkInButton) {
        checkInButton.addEventListener('click', () => {
            if (!selectedMood) {
                alert('Select how you are feeling before submitting your check-in.');
                return;
            }
            addChatMessage(`I feel ${selectedMood} today.`, true);
            sendToRasa(`I feel ${selectedMood} today.`);
            alert('Check-in recorded. Keep growing!');
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
