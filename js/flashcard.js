/**
 * flashcard.js — Flashcard (Hafıza Kartı) Sistemi
 * SM-2 tabanlı aralıklı tekrar, dönen kart animasyonu
 */

import { state } from './state.js?v=14';

// ── Ana flashcard ekranı ──────────────────────────────────────────────────────

export function setupFlashcards(container, onBack) {
    const dueWords = state.getDueWords();
    const allWords = [...state.wordBank.values()];

    container.innerHTML = `
        <div class="flashcard-screen">
            <div class="flashcard-header">
                <button class="back-btn-fc" id="fc-back">
                    <i data-lucide="chevron-left"></i>
                </button>
                <div class="fc-header-info">
                    <h2>Kelime Defterim</h2>
                    <span class="fc-stats">${allWords.length} kelime · ${dueWords.length} tekrar bekliyor</span>
                </div>
                <div></div>
            </div>

            <div class="fc-tab-row">
                <button class="fc-tab active" data-tab="review">
                    <i data-lucide="refresh-cw"></i> Tekrar (${dueWords.length})
                </button>
                <button class="fc-tab" data-tab="browse">
                    <i data-lucide="list"></i> Tüm Kelimeler (${allWords.length})
                </button>
            </div>

            <div id="fc-tab-content"></div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#fc-back').addEventListener('click', onBack);

    // Tab switching
    const tabs = container.querySelectorAll('.fc-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderTab(container, tab.dataset.tab, onBack);
        });
    });

    // İlk tab
    renderTab(container, 'review', onBack);
}

function renderTab(container, tab, onBack) {
    const tabContent = container.querySelector('#fc-tab-content');
    if (tab === 'review') renderReviewTab(tabContent, onBack);
    else renderBrowseTab(tabContent);
}

// ── TEKRAR MODU ───────────────────────────────────────────────────────────────

function renderReviewTab(container, onBack) {
    const dueWords = state.getDueWords();

    if (dueWords.length === 0) {
        container.innerHTML = `
            <div class="fc-empty">
                <div class="fc-empty-emoji">🎯</div>
                <h3>Harika! Bugünlük hepsi tamam.</h3>
                <p>Yeni kelimeler ekledikçe burada tekrar için bekleyecekler.</p>
                <div class="fc-streak-info">
                    <i data-lucide="award"></i>
                    <span>${[...state.wordBank.values()].length} kelime öğrenildi</span>
                </div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    // Sıradaki kelimeyi göster
    let currentIdx = 0;

    function showCard(idx) {
        if (idx >= dueWords.length) {
            renderReviewComplete(container, dueWords.length, onBack);
            return;
        }

        const word    = dueWords[idx];
        const remaining = dueWords.length - idx;

        container.innerHTML = `
            <div class="fc-review-wrap">
                <div class="fc-progress-row">
                    <div class="fc-progress-bar">
                        <div class="fc-progress-fill" style="width:${(idx / dueWords.length) * 100}%"></div>
                    </div>
                    <span class="fc-progress-label">${idx}/${dueWords.length}</span>
                </div>

                <div class="fc-card-scene" id="fc-scene">
                    <div class="fc-card" id="fc-card">
                        <!-- Ön yüz: Türkçe -->
                        <div class="fc-face fc-front">
                            <div class="fc-face-label">Türkçe</div>
                            <div class="fc-word-tr">${word.trMeaning || word.word}</div>
                            <div class="fc-word-source">${word.series || ''}</div>
                            <button class="fc-flip-btn" id="fc-flip">
                                <i data-lucide="rotate-cw"></i> Çevir
                            </button>
                        </div>
                        <!-- Arka yüz: İngilizce -->
                        <div class="fc-face fc-back">
                            <div class="fc-face-label">İngilizce</div>
                            <div class="fc-word-en">${word.meaning}</div>
                            <div class="fc-word-tr-hint">${word.trMeaning || ''}</div>
                            <div class="fc-word-original">Kelime: <strong>${word.word}</strong></div>
                        </div>
                    </div>
                </div>

                <div class="fc-rating-row" id="fc-rating" style="display:none">
                    <p class="fc-rating-label">Ne kadar kolaydı?</p>
                    <div class="fc-rating-btns">
                        <button class="fc-rate-btn fc-rate-hard" data-quality="1">
                            😓<br>Zor
                        </button>
                        <button class="fc-rate-btn fc-rate-medium" data-quality="3">
                            🤔<br>Orta
                        </button>
                        <button class="fc-rate-btn fc-rate-easy" data-quality="5">
                            😊<br>Kolay
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) window.lucide.createIcons();

        const card     = container.querySelector('#fc-card');
        const flipBtn  = container.querySelector('#fc-flip');
        const ratingEl = container.querySelector('#fc-rating');
        let flipped    = false;

        flipBtn.addEventListener('click', () => {
            if (flipped) return;
            flipped = true;
            card.classList.add('flipped');
            // Kart döndükten sonra derecelendirme butonlarını göster
            setTimeout(() => {
                ratingEl.style.display = 'flex';
                ratingEl.style.flexDirection = 'column';
                ratingEl.style.alignItems = 'center';
            }, 350);
        });

        // Kart dokunuşla da döner
        container.querySelector('#fc-scene').addEventListener('click', (e) => {
            if (!flipped && !e.target.closest('button')) {
                flipBtn.click();
            }
        });

        ratingEl.querySelectorAll('.fc-rate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = parseInt(btn.dataset.quality);
                state.reviewWord(word.word, quality);
                showCard(idx + 1);
            });
        });
    }

    showCard(currentIdx);
}

function renderReviewComplete(container, count, onBack) {
    container.innerHTML = `
        <div class="fc-review-done">
            <div class="fc-done-emoji">🏆</div>
            <h3>${count} kelime tekrar edildi!</h3>
            <p>Harika iş! Düzenli tekrar dil öğrenmeni kalıcı hale getirir.</p>
            <div class="fc-done-reward">
                <span>+${count} 🧿 Nazar</span>
            </div>
            <button class="fc-done-btn" id="fc-done-back">Kelime Defterime Dön</button>
        </div>
    `;

    state.addNazar(count);
    container.querySelector('#fc-done-back').addEventListener('click', onBack);
}

// ── GÖZ AT MODU ───────────────────────────────────────────────────────────────

function renderBrowseTab(container) {
    const allWords = [...state.wordBank.values()].sort((a, b) => b.addedAt - a.addedAt);

    if (allWords.length === 0) {
        container.innerHTML = `
            <div class="fc-empty">
                <div class="fc-empty-emoji">📚</div>
                <h3>Henüz kelime eklemedin.</h3>
                <p>Klipleri izlerken vocab kelimelerinin yanındaki <strong>+</strong> butonuna tıkla.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="fc-browse-list">
            ${allWords.map(w => {
                const nextDate = new Date(w.nextReview);
                const isDue    = w.nextReview <= Date.now();
                const dateStr  = isDue ? 'Tekrar bekliyor' : `Sonraki: ${nextDate.toLocaleDateString('tr-TR')}`;
                return `
                    <div class="fc-browse-item">
                        <div class="fc-browse-main">
                            <span class="fc-browse-word">${w.word}</span>
                            <span class="fc-browse-meaning">${w.meaning}</span>
                        </div>
                        <div class="fc-browse-meta">
                            <span class="fc-browse-series">${w.series || ''}</span>
                            <span class="fc-browse-next ${isDue ? 'due' : ''}">${dateStr}</span>
                        </div>
                        <button class="fc-remove-btn" data-word="${w.word}" title="Sil">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelectorAll('.fc-remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const word = btn.dataset.word;
            state.removeWord(word);
            renderBrowseTab(container);
        });
    });
}
