import { state, mockReels } from '../state.js?v=15';
import { setupFlashcards } from '../flashcard.js';

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

        <!-- Kelime Defteri Kısayolu -->
        <div class="wordbank-card" id="wordbank-card">
            <div class="wordbank-card-left">
                <div class="wordbank-icon">🃏</div>
                <div>
                    <div class="wordbank-title">Kelime Defterim</div>
                    <div class="wordbank-sub" id="wordbank-sub">0 kelime</div>
                </div>
            </div>
            <div class="wordbank-card-right">
                <span class="wordbank-due" id="wordbank-due"></span>
                <i data-lucide="chevron-right"></i>
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
    
    const nazarEl       = container.querySelector('#nazar-count');
    const missionList   = container.querySelector('#mission-list');
    const logoutBtn     = container.querySelector('#logout-btn');
    const wordbankCard  = container.querySelector('#wordbank-card');
    const wordbankSub   = container.querySelector('#wordbank-sub');
    const wordbankDue   = container.querySelector('#wordbank-due');
    
    logoutBtn.addEventListener('click', () => {
        state.logout();
        navigateTo('login');
    });

    // Kelime defteri kartına tıkla → flashcard ekranı
    wordbankCard.addEventListener('click', () => {
        const screenEl = container.querySelector('.profile-screen');
        screenEl.style.display = 'none';

        const fcContainer = document.createElement('div');
        fcContainer.style.cssText = 'position:absolute;inset:0;z-index:300;background:#0d0f14;';
        container.appendChild(fcContainer);

        setupFlashcards(fcContainer, () => {
            fcContainer.remove();
            screenEl.style.display = '';
            render();
        });
    });
    
    function render() {
        nazarEl.textContent = state.nazarCount;

        // Kelime defteri istatistikleri
        const wbCount = state.wordBank.size;
        const dueCount = state.getDueWords().length;
        wordbankSub.textContent = `${wbCount} kelime öğrenildi`;
        if (dueCount > 0) {
            wordbankDue.textContent = `${dueCount} tekrar bekliyor`;
            wordbankDue.style.display = 'inline';
        } else {
            wordbankDue.textContent = '';
            wordbankDue.style.display = 'none';
        }
        
        missionList.innerHTML = '';
        const quizDone = state.quizCompleted.size;
        const missions = [
            { title: 'İlk kelimeni ekle', reward: 2, completed: state.wordBank.size > 0 },
            { title: '5 kelime öğren', reward: 10, completed: state.wordBank.size >= 5 },
            { title: 'İlk quiz\'i tamamla', reward: 5, completed: quizDone > 0 },
            { title: '3 klip için quiz yap', reward: 15, completed: quizDone >= 3 },
            { title: '5 gün üst üste giriş', reward: 20, completed: false }
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
    
    render();
    
    state.subscribe(() => {
        if (document.body.contains(nazarEl)) render();
    });
}
