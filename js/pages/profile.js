import { state, mockReels } from '../state.js?v=7';

export const profileTemplate = `
    <div class="screen profile-screen" style="padding: 16px; padding-bottom: 80px; overflow-y: auto;">
        <header style="display: flex; justify-content: space-between; align-items: center;">
            <h2>Profile & Missions</h2>
            <button id="logout-btn" class="icon-btn" style="color: #ff4757;"><i data-lucide="log-out"></i></button>
        </header>
        <div class="nazar-card">
            <div class="nazar-icon">🧿</div>
            <div class="nazar-stats">
                <h3>Nazar Beads</h3>
                <p id="nazar-count">0</p>
            </div>
        </div>
        <div class="missions-section">
            <h3>Missions</h3>
            <ul class="mission-list" id="mission-list">
                <!-- Missions injected by JS -->
            </ul>
        </div>
        
        <div class="saved-reels-section" style="margin-top: 24px;">
            <h3 style="margin-bottom: 16px; font-size: 1.2rem;">Saved Videos</h3>
            <div class="saved-reels-grid" id="saved-reels-grid">
                <!-- Injected by JS -->
            </div>
        </div>
    </div>
`;

export function setupProfile(container, navigateTo) {
    container.innerHTML = profileTemplate;
    
    const nazarEl = container.querySelector('#nazar-count');
    const missionList = container.querySelector('#mission-list');
    const logoutBtn = container.querySelector('#logout-btn');
    
    logoutBtn.addEventListener('click', () => {
        state.logout();
        navigateTo('login');
    });
    
    function render() {
        nazarEl.textContent = state.nazarCount;
        
        missionList.innerHTML = '';
        const missions = [
            { title: 'Save 1 word', reward: 2, completed: state.savedReels.size > 0 },
            { title: 'Login 5 days in a row', reward: 20, completed: false }
        ];

        missions.forEach(m => {
            const li = document.createElement('li');
            li.className = `mission-item ${m.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div>
                    <h4>${m.title}</h4>
                    <small>+${m.reward} 🧿</small>
                </div>
                <div>
                    ${m.completed ? '<i data-lucide="check-circle" style="color: #4cd137"></i>' : '<div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--text-secondary)"></div>'}
                </div>
            `;
            missionList.appendChild(li);
        });
        
        // Render Saved Reels
        const savedGrid = container.querySelector('#saved-reels-grid');
        savedGrid.innerHTML = '';
        
        if (state.savedReels.size === 0) {
            savedGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1; padding: 20px;">No saved videos yet.</p>';
        } else {
            [...state.savedReels].forEach(reelId => {
                const reelData = mockReels.find(r => r.id === reelId);
                if (reelData) {
                    const thumb = document.createElement('div');
                    thumb.className = 'saved-reel-thumb';
                    thumb.innerHTML = `<img src="https://img.youtube.com/vi/${reelData.youtubeId}/0.jpg" alt="${reelData.series}">`;
                    thumb.addEventListener('click', () => {
                        navigateTo('reels', { targetReelId: reelId });
                    });
                    savedGrid.appendChild(thumb);
                }
            });
        }
        
        if(window.lucide) window.lucide.createIcons();
    }
    
    // Initial render
    render();
    
    // Listen to state changes
    state.subscribe(() => {
        // Only re-render if the container is still in the DOM
        if (document.body.contains(nazarEl)) {
            render();
        }
    });
}
