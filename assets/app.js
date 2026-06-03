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
    if (pageId === 'chat') {
        initializeChat();
    } else if (pageId === 'dashboard') {
        initializeDashboard();
    } else if (pageId === 'career') {
        initializeCareer();
    } else if (pageId === 'wellbeing') {
        initializeWellbeing();
    } else if (pageId === 'profile') {
        initializeProfile();
    } else if (pageId === 'terms') {
        // nothing special
    } else if (pageId === 'community') {
        initializeCommunity();
    } else if (pageId === 'login') {
        initializeLogin();
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
            const user = { name: 'Guest', email: '', guest: true };
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
    if (!userJson) {
        if (nameEl) nameEl.textContent = 'Guest';
        return;
    }
    try {
        const user = JSON.parse(userJson);
        if (nameEl) nameEl.textContent = user.name || 'User';
        // populate email if element exists
        const emailEl = document.querySelector('.profile-info-row strong');
        if (emailEl && user.email) emailEl.textContent = user.email;
    } catch (e) {
        console.error('profile init error', e);
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

// CHAT FUNCTIONALITY
const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';
const SENDER_ID = 'user_' + Math.random().toString(36).substr(2, 9);

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

    function addChatMessage(text, isUser) {
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
            addChatMessage("I'm having trouble connecting. Make sure Rasa server is running: rasa run --enable-api", false);
        }
        sendButton.disabled = false;
    }
}

function initializeDashboard() {
    // Add event listeners for quick action cards
    const actionCards = document.querySelectorAll('.quick-action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
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
