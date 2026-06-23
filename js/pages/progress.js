/**
 * progress.js — İlerleme Takibi / Progress Dashboard
 * Streak, günlük görevler, toplam istatistikler, haftalık aktivite
 */

import { state, mockReels, seriesData } from '../state.js?v=15';

export function setupProgress(container) {
    container.innerHTML = renderProgressHTML();
    if (window.lucide) window.lucide.createIcons();

    // Streak check on open
    state.checkStreak();

    populate(container);

    state.subscribe(() => {
        if (document.body.contains(container)) populate(container);
    });
}

function populate(container) {
    const prog = state.getDailyProgress();

    // ── Streak ──────────────────────────────────────────────────────────────
    const streakEl = container.querySelector('#prog-streak-count');
    if (streakEl) streakEl.textContent = state.streak;

    const streakMsgEl = container.querySelector('#prog-streak-msg');
    if (streakMsgEl) {
        if (state.streak === 0) streakMsgEl.textContent = 'Bugün başla!';
        else if (state.streak < 7) streakMsgEl.textContent = `${7 - state.streak} gün daha: 7 gün ödülü!`;
        else if (state.streak < 30) streakMsgEl.textContent = `${30 - state.streak} gün daha: 30 gün ödülü!`;
        else streakMsgEl.textContent = 'Efsane seri! 🔥';
    }

    // ── Haftalık aktivite ────────────────────────────────────────────────────
    const weekGrid = container.querySelector('#prog-week-grid');
    if (weekGrid) {
        const today = state.getToday();
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const entry = state.weeklyActivity.find(x => x.date === dateStr);
            const isToday = dateStr === today;
            days.push({ dateStr, active: entry?.active || false, isToday });
        }

        const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
        weekGrid.innerHTML = days.map((d, i) => {
            const dayOfWeek = new Date(d.dateStr).getDay(); // 0=Sun
            const adjusted = (dayOfWeek + 6) % 7; // Mon=0
            return `
                <div class="week-cell ${d.active ? 'active' : ''} ${d.isToday ? 'today' : ''}">
                    <div class="week-square"></div>
                    <div class="week-label">${dayNames[adjusted]}</div>
                </div>
            `;
        }).join('');
    }

    // ── Günlük Görevler ──────────────────────────────────────────────────────
    const goalReelEl  = container.querySelector('#goal-reel-fill');
    const goalQuizEl  = container.querySelector('#goal-quiz-fill');
    const goalSortEl  = container.querySelector('#goal-sort-fill');
    const goalReelTxt = container.querySelector('#goal-reel-txt');
    const goalQuizTxt = container.querySelector('#goal-quiz-txt');
    const goalSortTxt = container.querySelector('#goal-sort-txt');

    if (goalReelEl) {
        goalReelEl.style.width = `${prog.reelPct * 100}%`;
        goalReelTxt.textContent = `${state.dailyStats.reelsWatched} / 3`;
    }
    if (goalQuizEl) {
        goalQuizEl.style.width = `${prog.quizPct * 100}%`;
        goalQuizTxt.textContent = `${state.dailyStats.quizCompleted} / 1`;
    }
    if (goalSortEl) {
        goalSortEl.style.width = `${prog.sortPct * 100}%`;
        goalSortTxt.textContent = `${state.dailyStats.wordsSorted} / 2`;
    }

    // Genel ilerleme halkası
    const overallEl = container.querySelector('#prog-overall');
    if (overallEl) overallEl.textContent = `${prog.overall}%`;

    // ── Toplam İstatistikler ─────────────────────────────────────────────────
    const totalReels = container.querySelector('#stat-total-reels');
    const totalWords = container.querySelector('#stat-total-words');
    const totalQuiz  = container.querySelector('#stat-total-quiz');
    const totalSort  = container.querySelector('#stat-total-sort');

    if (totalReels) totalReels.textContent = state.totalStats.reelsWatched;
    if (totalWords) totalWords.textContent = state.wordBank.size;
    if (totalQuiz)  totalQuiz.textContent  = state.quizCompleted.size;
    if (totalSort)  totalSort.textContent  = state.totalStats.wordsSorted;

    // ── Dizi bazında ilerleme ────────────────────────────────────────────────
    const seriesProgressEl = container.querySelector('#series-progress-list');
    if (seriesProgressEl) {
        const seriesNames = ['Kuzey Güney', 'Prens', 'Ezel', 'Muhteşem Yüzyıl'];
        seriesProgressEl.innerHTML = seriesNames.map(name => {
            const total   = mockReels.filter(r => r.series === name).length;
            const watched = [...state.quizCompleted].filter(id =>
                mockReels.find(r => r.id === id && r.series === name)
            ).length;
            const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
            const seriesImg = seriesData.find(s => s.title === name)?.img || '';

            return `
                <div class="series-prog-item">
                    <div class="series-prog-left">
                        <img src="${seriesImg}" class="series-prog-img" alt="${name}">
                        <div>
                            <div class="series-prog-name">${name}</div>
                            <div class="series-prog-count">${watched}/${total} klip tamamlandı</div>
                        </div>
                    </div>
                    <div class="series-prog-right">
                        <div class="series-prog-bar-wrap">
                            <div class="series-prog-bar-fill" style="width: ${pct}%"></div>
                        </div>
                        <span class="series-prog-pct">${pct}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function renderProgressHTML() {
    return `
        <div class="screen progress-screen">
            <!-- Streak Kartı -->
            <div class="prog-streak-card">
                <div class="prog-streak-left">
                    <div class="prog-streak-fire">🔥</div>
                    <div>
                        <div class="prog-streak-num" id="prog-streak-count">0</div>
                        <div class="prog-streak-label">Günlük Seri</div>
                    </div>
                </div>
                <div class="prog-streak-msg" id="prog-streak-msg">Bugün başla!</div>
            </div>

            <!-- Haftalık Aktivite -->
            <div class="prog-section">
                <h3 class="prog-section-title">Bu Hafta</h3>
                <div class="week-grid" id="prog-week-grid"></div>
            </div>

            <!-- Günlük Görevler -->
            <div class="prog-section">
                <div class="prog-section-header">
                    <h3 class="prog-section-title">Bugünün Görevleri</h3>
                    <span class="prog-overall-badge" id="prog-overall">0%</span>
                </div>

                <div class="daily-goals">
                    <div class="daily-goal-item">
                        <div class="daily-goal-info">
                            <span class="daily-goal-icon">🎬</span>
                            <div>
                                <div class="daily-goal-name">Klip İzle</div>
                                <div class="daily-goal-sub">Bugün 3 klip</div>
                            </div>
                        </div>
                        <span class="daily-goal-txt" id="goal-reel-txt">0 / 3</span>
                    </div>
                    <div class="daily-goal-bar">
                        <div class="daily-goal-fill" id="goal-reel-fill" style="width:0%"></div>
                    </div>

                    <div class="daily-goal-item">
                        <div class="daily-goal-info">
                            <span class="daily-goal-icon">🧠</span>
                            <div>
                                <div class="daily-goal-name">Quiz Yap</div>
                                <div class="daily-goal-sub">1 quiz tamamla</div>
                            </div>
                        </div>
                        <span class="daily-goal-txt" id="goal-quiz-txt">0 / 1</span>
                    </div>
                    <div class="daily-goal-bar">
                        <div class="daily-goal-fill" id="goal-quiz-fill" style="width:0%"></div>
                    </div>

                    <div class="daily-goal-item">
                        <div class="daily-goal-info">
                            <span class="daily-goal-icon">🧩</span>
                            <div>
                                <div class="daily-goal-name">Cümle Sırala</div>
                                <div class="daily-goal-sub">2 sıralama oyunu oyna</div>
                            </div>
                        </div>
                        <span class="daily-goal-txt" id="goal-sort-txt">0 / 2</span>
                    </div>
                    <div class="daily-goal-bar">
                        <div class="daily-goal-fill" id="goal-sort-fill" style="width:0%"></div>
                    </div>
                </div>
            </div>

            <!-- Toplam İstatistikler -->
            <div class="prog-section">
                <h3 class="prog-section-title">Tüm Zamanlar</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-icon">🎬</div>
                        <div class="stat-card-num" id="stat-total-reels">0</div>
                        <div class="stat-card-label">Klip İzlendi</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">📖</div>
                        <div class="stat-card-num" id="stat-total-words">0</div>
                        <div class="stat-card-label">Kelime Öğrenildi</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">🧠</div>
                        <div class="stat-card-num" id="stat-total-quiz">0</div>
                        <div class="stat-card-label">Quiz Tamamlandı</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-icon">🧩</div>
                        <div class="stat-card-num" id="stat-total-sort">0</div>
                        <div class="stat-card-label">Cümle Sıralandı</div>
                    </div>
                </div>
            </div>

            <!-- Dizi bazında ilerleme -->
            <div class="prog-section" style="padding-bottom: 100px;">
                <h3 class="prog-section-title">Dizi İlerlemesi</h3>
                <div id="series-progress-list"></div>
            </div>
        </div>
    `;
}
