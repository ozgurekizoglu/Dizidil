import { setupHome } from './pages/home.js?v=14';
import { setupReels, cleanupPlayers } from './pages/reels.js?v=14';
import { setupProfile } from './pages/profile.js?v=14';
import { setupIdioms } from './pages/idioms.js?v=14';
import { state } from './state.js?v=14';

const screenContainer = document.getElementById('screen-container');
const bottomNav = document.getElementById('bottom-nav');
const navButtons = document.querySelectorAll('.nav-btn');

function initApp() {
    console.log("App initializing...");
    if(window.lucide) {
        window.lucide.createIcons();
    } else {
        console.warn("Lucide not loaded yet");
    }
    
    navigateTo('home');

    // Nav Listeners
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.dataset.target;
            navigateTo(target);
        });
    });
}

function navigateTo(screenId, data = null) {
    console.log("Navigating to:", screenId);
    
    // Auth Guard removed

    if (state.currentScreen === 'reels' && screenId !== 'reels') {
        cleanupPlayers();
    }
    
    state.currentScreen = screenId;
    
    // Update nav UI
    navButtons.forEach(btn => {
        if(btn.dataset.target === screenId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Hide/Show bottom nav based on screen
    if(screenId === 'reels') {
        bottomNav.style.display = 'none';
    } else {
        bottomNav.style.display = 'flex';
    }

    // Render logic
    screenContainer.innerHTML = ''; // Clear current
    
    try {
        if (screenId === 'home') {
            setupHome(screenContainer, navigateTo);
        } else if (screenId === 'reels') {
            setupReels(screenContainer, navigateTo, data);
        } else if (screenId === 'profile') {
            setupProfile(screenContainer, navigateTo);
        } else if (screenId === 'idioms') {
            setupIdioms(screenContainer);
        }
    } catch (error) {
        console.error("Navigation error:", error);
    }
    
    if(window.lucide) window.lucide.createIcons();
}

// Call directly for modules
initApp();
