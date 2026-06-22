import { seriesData, state } from '../state.js?v=7';

export function setupHome(container, navigateTo) {
    const homeTemplate = `
        <div class="screen home-screen" style="padding: 16px; padding-bottom: 80px; overflow-y: auto;">
            <div class="hero-section" style="margin-top: 20px; margin-bottom: 30px;">
                <h1>What do you want to watch?</h1>
                <button class="primary-btn" id="random-swipe-btn">
                    <i data-lucide="shuffle"></i> Swipe Randomly
                </button>
            </div>

            <div class="top-nav" style="padding: 0 0 20px 0; background: transparent; position: relative;">
                <div class="filters" style="display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none;">
                    <button class="filter-pill active" data-genre="All">All</button>
                    <button class="filter-pill" data-genre="Romantic">Romantic</button>
                    <button class="filter-pill" data-genre="Comedy">Comedy</button>
                    <button class="filter-pill" data-genre="Drama">Drama</button>
                    <button class="filter-pill" data-genre="History">History</button>
                    <button class="filter-pill" data-genre="Crime">Crime</button>
                </div>
            </div>

            <section class="series-section">
                <h2>Popular Series</h2>
                <div class="series-grid" id="series-grid">
                    <!-- Populated by JS -->
                </div>
            </section>
        </div>
    `;

    container.innerHTML = homeTemplate;
    if(window.lucide) window.lucide.createIcons();

    const grid = container.querySelector('#series-grid');
    const genreButtons = container.querySelectorAll('.filter-pill');
    let selectedGenres = new Set(['All']);

    function renderSeries() {
        grid.innerHTML = '';
        
        const filteredSeries = seriesData.filter(s => {
            if (selectedGenres.has('All')) return true;
            if (!s.genres) return false;
            return s.genres.some(g => selectedGenres.has(g));
        });

        filteredSeries.forEach(series => {
            const isLocked = series.locked && !state.unlockedSeries.has(series.id);
            const card = document.createElement('div');
            card.className = `series-card ${isLocked ? 'locked' : ''}`;
            
            card.innerHTML = `
                <img src="${series.img}" alt="${series.title}">
                <div class="series-info">
                    <h3 style="margin-bottom: 4px;">${series.title}</h3>
                    ${isLocked ? `<div class="locked"><i data-lucide="lock" style="width: 14px; height: 14px;"></i> ${series.cost} 🧿</div>` : ''}
                </div>
                ${isLocked ? `
                    <div class="lock-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; font-size: 1.2rem; font-weight: 600; z-index: 5;">
                        <i data-lucide="lock" class="lock-icon" style="width: 48px; height: 48px; margin-bottom: 12px; color: #ff4757;"></i>
                        <span>${series.cost} Nazar</span>
                    </div>
                ` : ''}
            `;

            card.addEventListener('click', () => {
                const currentlyLocked = series.locked && !state.unlockedSeries.has(series.id);
                
                if (!currentlyLocked) {
                    navigateTo('reels', { seriesId: series.id });
                } else {
                    // Try to unlock
                    if (confirm(`Do you want to spend ${series.cost} Nazar to unlock ${series.title}?`)) {
                        if (state.unlockSeries(series.id, series.cost)) {
                            const lockOverlay = card.querySelector('.lock-overlay');
                            const lockIcon = lockOverlay.querySelector('.lock-icon');
                            
                            lockIcon.classList.add('shatter-animation');
                            
                            setTimeout(() => {
                                lockOverlay.style.opacity = '0';
                                setTimeout(() => {
                                    lockOverlay.remove();
                                    card.classList.remove('locked');
                                }, 300);
                            }, 600); // Wait for shatter animation
                        } else {
                            alert(`Not enough Nazar! You need ${series.cost} Nazar to unlock this series.`);
                        }
                    }
                }
            });

            grid.appendChild(card);
        });
        if(window.lucide) window.lucide.createIcons();
    }

    genreButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const genre = btn.getAttribute('data-genre');
            
            if (genre === 'All') {
                selectedGenres.clear();
                selectedGenres.add('All');
                genreButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                if (selectedGenres.has('All')) {
                    selectedGenres.delete('All');
                    container.querySelector('[data-genre="All"]').classList.remove('active');
                }
                
                if (selectedGenres.has(genre)) {
                    selectedGenres.delete(genre);
                    btn.classList.remove('active');
                    
                    // If no genres selected, fallback to All
                    if (selectedGenres.size === 0) {
                        selectedGenres.add('All');
                        container.querySelector('[data-genre="All"]').classList.add('active');
                    }
                } else {
                    selectedGenres.add(genre);
                    btn.classList.add('active');
                }
            }
            renderSeries();
        });
    });

    container.querySelector('#random-swipe-btn').addEventListener('click', () => {
        navigateTo('reels', { random: true });
    });

    renderSeries();
}
