import { mockReels, state } from '../state.js?v=15';
import { showQuiz } from '../quiz.js';
import { showWordOrder } from '../word-order.js';

export const reelsTemplate = `
    <div class="reels-screen">
        <button class="back-btn" id="reels-back-btn"><i data-lucide="chevron-left"></i></button>
        <div class="reels-container" id="reels-container"></div>
    </div>
`;

// Modül seviyesi state — her setupReels çağrısında sıfırlanır
let players = {};
let subtitleIntervals = {};
let initializedPlayers = new Set();
let activeReelId = null;

export function setupReels(container, navigateTo, data) {
    // Temizle
    cleanupPlayers();

    container.innerHTML = reelsTemplate;
    const reelsContainer = container.querySelector('#reels-container');
    const backBtn = container.querySelector('#reels-back-btn');
    if (window.lucide) window.lucide.createIcons();

    backBtn.addEventListener('click', () => {
        cleanupPlayers();
        navigateTo('home');
    });

    // Hangi dizinin reelleri gösterilecek?
    const seriesMap = { 1: 'Kuzey Güney', 2: 'Prens', 3: 'Ezel', 4: 'Muhteşem Yüzyıl' };
    const seriesName = data && data.seriesId ? seriesMap[data.seriesId] : null;

    let filteredReels = mockReels;
    if (seriesName) {
        filteredReels = mockReels.filter(r => r.series === seriesName);
    } else if (data && data.random) {
        filteredReels = [...mockReels]
            .filter(r => r.series !== 'Ezel')
            .sort(() => Math.random() - 0.5);
    }

    // Reel DOM elemanlarını oluştur
    filteredReels.forEach((reel, idx) => {
        const isSaved = state.savedReels.has(reel.id);
        const saveIcon = isSaved ? 'bookmark-check' : 'bookmark';
        const saveLabel = isSaved ? 'Kaydedildi' : 'Kaydet';

        // Altyazı zaman çizelgesi kartları oluştur
        const timelineCards = (reel.subtitles || []).map((sub, i) => `
            <div class="timeline-card" data-reel-id="${reel.id}" data-start="${sub.start}">
                <div class="timeline-time">${formatTime(sub.start)}</div>
                <div class="timeline-text">
                    <span class="timeline-tr">${sub.trText}</span>
                    <span class="timeline-en">${sub.enText || ''}</span>
                </div>
            </div>
        `).join('');

        // Kelime highlight kartları
        const allVocab = [];
        (reel.subtitles || []).forEach(sub => {
            (sub.vocab || []).forEach(v => {
                if (allVocab.length < 4 && !allVocab.find(x => x.word === v.word)) {
                    allVocab.push(v);
                }
            });
        });
        const vocabChips = allVocab.map(v => `
            <div class="vocab-chip">
                <div class="vocab-chip-text">
                    <span class="vocab-chip-word">${v.word}</span>
                    <span class="vocab-chip-meaning">${v.meaning}</span>
                </div>
                <button class="vocab-add-btn ${state.wordBank.has(v.word.toLowerCase()) ? 'added' : ''}"
                        data-word="${v.word}"
                        data-tr="${escapeAttr(v.trMeaning || '')}"
                        data-meaning="${escapeAttr(v.meaning)}"
                        data-series="${escapeAttr(reel.series)}"
                        data-reel-id="${reel.id}"
                        title="${state.wordBank.has(v.word.toLowerCase()) ? 'Zaten eklendi' : 'Kelime defterime ekle'}">
                    <i data-lucide="${state.wordBank.has(v.word.toLowerCase()) ? 'check' : 'plus'}"></i>
                </button>
            </div>
        `).join('');

        const reelEl = document.createElement('div');
        reelEl.className = 'reel-item';
        reelEl.id = `reel-item-${reel.id}`;

        reelEl.innerHTML = `
            <!-- 1. Video alanı: ekranın üstüne yapışık -->
            <div class="video-section" id="video-section-${reel.id}" ${reel.widescreen ? 'data-widescreen="true"' : ''}>
                <div class="yt-wrapper">
                    <div id="yt-player-${reel.id}"></div>
                    <!-- iframe üstünü örten kara bantlar (YT logosu / üst bar) -->
                    <div class="yt-top-mask"></div>
                    <div class="yt-bottom-mask"></div>
                </div>
                <!-- Dokunma yakalayıcı — iframe üzerinde -->
                <div class="yt-touch-overlay" id="touch-${reel.id}"></div>
                <!-- Altyazı -->
                <div class="custom-subtitle-container" id="subtitle-${reel.id}"></div>
                <!-- Video üzerinde oynat/duraklat ikonu -->
                <div class="play-pause-indicator" id="play-indicator-${reel.id}">
                    <i data-lucide="play"></i>
                </div>
            </div>

            <!-- 2. Bilgi paneli: kalan alt alan -->
            <div class="info-section">
                <!-- Seri başlığı ve kaydet butonu -->
                <div class="info-top">
                    <div class="series-badge">
                        <i data-lucide="tv-2"></i>
                        <span>${reel.series}</span>
                    </div>
                    <button class="action-btn save-btn" id="save-${reel.id}">
                        <i data-lucide="${saveIcon}"></i>
                        <span>${saveLabel}</span>
                    </button>
                </div>

                <!-- Mevcut altyazı önizlemesi -->
                <div class="subtitle-preview" id="preview-${reel.id}">
                    <span class="preview-tr" id="preview-tr-${reel.id}">—</span>
                    <span class="preview-en" id="preview-en-${reel.id}"></span>
                </div>

                <!-- Altyazı zaman çizelgesi -->
                <div class="subtitle-timeline">
                    <div class="timeline-header">
                        <i data-lucide="captions"></i>
                        <span>Sahneler</span>
                    </div>
                    <div class="timeline-cards">
                        ${timelineCards}
                    </div>
                </div>

                <!-- Kelime önizleme -->
                ${vocabChips ? `
                <div class="vocab-highlights">
                    <div class="vocab-highlights-header">
                        <i data-lucide="sparkles"></i>
                        <span>Bu klipteki kelimeler</span>
                    </div>
                    <div class="vocab-chips">
                        ${vocabChips}
                    </div>
                </div>
                ` : ''}

                <!-- Sonraki göstergesi -->
                ${idx < filteredReels.length - 1 ? `
                <div class="next-hint">
                    <i data-lucide="chevron-down"></i>
                    <span>Sonraki klip için kaydır</span>
                </div>
                ` : `
                <div class="next-hint end-hint">
                    <i data-lucide="check-circle"></i>
                    <span>Son klip — tebrikler!</span>
                </div>
                `}

                <!-- Quiz butonu -->
                ${!state.quizCompleted.has(reel.id) ? `
                <button class="quiz-trigger-btn" id="quiz-btn-${reel.id}">
                    <i data-lucide="brain"></i>
                    <span>Quiz'e Başla</span>
                    <span class="quiz-reward-badge">+5 🧿</span>
                </button>
                ` : `
                <div class="quiz-done-badge">
                    <i data-lucide="check-circle-2"></i>
                    <span>Quiz Tamamlandı</span>
                </div>
                `}
            </div>

            <!-- 3. Öğren paneli (üstten kayarak açılır) -->
            <div class="learning-panel" id="panel-${reel.id}">
                <div class="panel-handle"></div>
                <button class="close-panel-btn" id="close-panel-${reel.id}">
                    <i data-lucide="x"></i>
                </button>
                <div class="learning-content">
                    <h2>Gramer & Kelime</h2>
                    <div class="panel-subtitle">
                        <div class="panel-subtitle-tr" id="panel-tr-${reel.id}"></div>
                        <div class="panel-subtitle-en" id="panel-en-${reel.id}"></div>
                    </div>
                    <div class="grammar-box">
                        <h4>📐 Gramer Kuralı</h4>
                        <p class="grammar-text" id="grammar-${reel.id}"></p>
                    </div>
                    <div class="vocab-box">
                        <h4>📖 Kelimeler</h4>
                        <ul class="vocab-list" id="vocab-${reel.id}"></ul>
                    </div>
                </div>
            </div>
        `;

        reelsContainer.appendChild(reelEl);

        // Event listener'ları bağla
        bindReelEvents(reelEl, reel);
    });

    // Lucide ikonlarını render et
    if (window.lucide) window.lucide.createIcons();

    // YT API hazır olduğunda başlat
    waitForYT(() => {
        // Sadece ilk reeli başlat
        if (filteredReels.length > 0) {
            initPlayer(filteredReels[0]);
            activeReelId = String(filteredReels[0].id);
        }
        // Intersection observer — kaydırma mantığı
        setupIntersectionObserver(reelsContainer, filteredReels);

        // Belirli bir reele git
        if (data && data.targetReelId) {
            const targetEl = reelsContainer.querySelector(`#reel-item-${data.targetReelId}`);
            if (targetEl) targetEl.scrollIntoView({ behavior: 'auto' });
        }
    });
}

// ─── Yardımcı: zaman formatlama ──────────────────────────────────────────────
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Yardımcı: HTML attribute escape ─────────────────────────────────────────
function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── Event Binding ───────────────────────────────────────────────────────────
function bindReelEvents(reelEl, reel) {
    const reelId = reel.id;

    // Dokunma / tıklama → oynat/durdur
    const touch = reelEl.querySelector(`#touch-${reelId}`);
    if (touch) {
        touch.addEventListener('click', () => {
            const p = players[reelId];
            if (!p || typeof p.getPlayerState !== 'function') return;
            const indicator = reelEl.querySelector(`#play-indicator-${reelId}`);
            if (p.getPlayerState() === YT.PlayerState.PLAYING) {
                p.pauseVideo();
                if (indicator) {
                    indicator.innerHTML = '<i data-lucide="play"></i>';
                    indicator.classList.add('show');
                    if (window.lucide) window.lucide.createIcons();
                }
            } else {
                p.playVideo();
                if (indicator) {
                    indicator.innerHTML = '<i data-lucide="pause"></i>';
                    indicator.classList.add('show');
                    if (window.lucide) window.lucide.createIcons();
                    setTimeout(() => indicator.classList.remove('show'), 600);
                }
            }
        });
    }

    // Öğren paneli referansı (panel hâlâ DOM'da, sadece buton kaldırıldı)
    const panel = reelEl.querySelector(`#panel-${reelId}`);

    // Kapat butonu
    const closeBtn = reelEl.querySelector(`#close-panel-${reelId}`);
    if (closeBtn && panel) {
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('open');
            const p = players[reelId];
            if (p && typeof p.playVideo === 'function') p.playVideo();
        });
    }

    // Panel içi kaydırma feed'e yansımasın
    if (panel) {
        ['touchmove', 'wheel'].forEach(evt =>
            panel.addEventListener(evt, e => e.stopPropagation(), { passive: false })
        );
    }

    // Kaydet butonu
    const saveBtn = reelEl.querySelector(`#save-${reelId}`);
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.toggleSaveReel(reelId);
            const saved = state.savedReels.has(reelId);
            saveBtn.innerHTML = saved
                ? `<i data-lucide="bookmark-check" style="color:var(--accent-blue)"></i><span>Kaydedildi</span>`
                : `<i data-lucide="bookmark"></i><span>Kaydet</span>`;
            if (window.lucide) window.lucide.createIcons();
            
            // Kaydetme animasyonu
            saveBtn.classList.add('save-bounce');
            setTimeout(() => saveBtn.classList.remove('save-bounce'), 400);
        });
    }

    // Zaman çizelgesi kartlarına tıklama — o sahneye atla
    reelEl.querySelectorAll('.timeline-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const startTime = parseFloat(card.dataset.start);
            const p = players[reelId];
            if (p && typeof p.seekTo === 'function') {
                p.seekTo(startTime, true);
                p.playVideo();
            }
            // Aktif kartı vurgula
            reelEl.querySelectorAll('.timeline-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
    });

    // ── Vocab "+" butonları → kelime defterine ekle ──────────────────────────
    reelEl.querySelectorAll('.vocab-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btn.classList.contains('added')) return;

            const added = state.addWord({
                word:      btn.dataset.word,
                trMeaning: btn.dataset.tr,
                meaning:   btn.dataset.meaning,
                reelId:    btn.dataset.reelId,
                series:    btn.dataset.series
            });

            if (added) {
                btn.classList.add('added');
                btn.innerHTML = '<i data-lucide="check"></i>';
                btn.title = 'Kelime defterime eklendi';
                if (window.lucide) window.lucide.createIcons();

                // Mini toast bildirimi
                showToast(reelEl, `"${btn.dataset.word}" kelime defterine eklendi! +1 🧿`);
            }
        });
    });

    // ── Quiz tetikleyici ─────────────────────────────────────────────────────
    const quizBtn = reelEl.querySelector(`#quiz-btn-${reelId}`);
    if (quizBtn) {
        quizBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const p = players[reelId];
            if (p && typeof p.pauseVideo === 'function') p.pauseVideo();

            // Önce Cümle Sıralama Oyunu, sonra Quiz
            showWordOrder(reel, reelEl, () => {
                showQuiz(reel, reelEl, () => {
                    quizBtn.outerHTML = `
                        <div class="quiz-done-badge">
                            <i data-lucide="check-circle-2"></i>
                            <span>Tamamlandı!</span>
                        </div>
                    `;
                    if (window.lucide) window.lucide.createIcons();
                    if (p && typeof p.playVideo === 'function') p.playVideo();
                });
            });
        });
    }
}

// ─── Toast bildirimi ──────────────────────────────────────────────────────────
function showToast(parent, message) {
    const toast = document.createElement('div');
    toast.className = 'reel-toast';
    toast.textContent = message;
    parent.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

// ─── YouTube Player ───────────────────────────────────────────────────────────
function waitForYT(callback) {
    if (typeof YT !== 'undefined' && YT.Player) {
        callback();
    } else {
        const t = setInterval(() => {
            if (typeof YT !== 'undefined' && YT.Player) {
                clearInterval(t);
                callback();
            }
        }, 100);
    }
}

function initPlayer(reel) {
    const reelId = reel.id;
    if (initializedPlayers.has(reelId)) return;
    initializedPlayers.add(reelId);

    // iframe'in yerleşeceği div hâlâ DOM'da mı?
    const mountEl = document.getElementById(`yt-player-${reelId}`);
    if (!mountEl) return;

    players[reelId] = new YT.Player(`yt-player-${reelId}`, {
        videoId: reel.youtubeId,
        playerVars: {
            playsinline: 1,
            controls:    0,   // YT kontrolleri gizli
            disablekb:   1,
            fs:          0,
            rel:         0,
            modestbranding: 1,
            iv_load_policy: 3,
            cc_load_policy: 0,
            showinfo:    0,
            autohide:    1,
            origin: window.location.origin
        },
        events: {
            onReady: (ev) => {
                // Başlangıçta mute et (autoplay policy)
                ev.target.mute();
                // Sadece aktif reel'se oynat
                if (String(reelId) === String(activeReelId)) {
                    ev.target.playVideo();
                } else {
                    // Aktif değilse kesinlikle durdur
                    ev.target.pauseVideo();
                }
                startSubtitleSync(reelId, reel.subtitles, ev.target);
            },
            onStateChange: (ev) => {
                // Eğer bu reel aktif değilse ve oynatılmaya başladıysa, durdur
                if (String(reelId) !== String(activeReelId) && ev.data === YT.PlayerState.PLAYING) {
                    ev.target.pauseVideo();
                    if (typeof ev.target.mute === 'function') ev.target.mute();
                    return;
                }
                // Autoplay kısıtını aşmak için: çalmaya başlayınca unmute et
                if (ev.data === YT.PlayerState.PLAYING && ev.target.isMuted() && String(reelId) === String(activeReelId)) {
                    ev.target.unMute();
                    ev.target.setVolume(100);
                }
                if (ev.data === YT.PlayerState.ENDED) {
                    ev.target.seekTo(0);
                    ev.target.playVideo();
                }
            }
        }
    });
}

// ─── Altyazı ─────────────────────────────────────────────────────────────────
function startSubtitleSync(reelId, subtitles, player) {
    if (subtitleIntervals[reelId]) {
        clearInterval(subtitleIntervals[reelId]);
    }

    const subEl   = document.getElementById(`subtitle-${reelId}`);
    const prevTr  = document.getElementById(`preview-tr-${reelId}`);
    const prevEn  = document.getElementById(`preview-en-${reelId}`);
    const panTr   = document.getElementById(`panel-tr-${reelId}`);
    const panEn   = document.getElementById(`panel-en-${reelId}`);
    const gramEl  = document.getElementById(`grammar-${reelId}`);
    const vocabEl = document.getElementById(`vocab-${reelId}`);

    subtitleIntervals[reelId] = setInterval(() => {
        if (!player || typeof player.getCurrentTime !== 'function') return;
        const t    = player.getCurrentTime();
        const sub  = subtitles.find(s => t >= s.start && t <= s.end);

        if (sub) {
            if (subEl)  { subEl.textContent = sub.trText; subEl.style.opacity = 1; }
            if (prevTr) prevTr.textContent = sub.trText;
            if (prevEn) prevEn.textContent = sub.enText || '';
            if (panTr)  panTr.textContent  = sub.trText;
            if (panEn)  panEn.textContent  = sub.enText || '';
            if (gramEl) gramEl.textContent = sub.grammar || '';
            if (vocabEl) vocabEl.innerHTML = (sub.vocab || []).map(v => `
                <li>
                    <strong>${v.word}</strong>
                    ${v.trMeaning ? `<span class="vocab-tr">🇹🇷 ${v.trMeaning}</span>` : ''}
                    <span class="vocab-en">🇬🇧 ${v.meaning}</span>
                </li>`).join('');

            // Aktif sahne kartını güncelle
            const reelEl = document.getElementById(`reel-item-${reelId}`);
            if (reelEl) {
                reelEl.querySelectorAll('.timeline-card').forEach(card => {
                    const cardStart = parseFloat(card.dataset.start);
                    if (Math.abs(cardStart - sub.start) < 0.1) {
                        card.classList.add('active');
                    } else {
                        card.classList.remove('active');
                    }
                });
            }
        } else {
            if (subEl) subEl.style.opacity = 0;
        }
    }, 200);
}

// ─── Intersection Observer (kaydırma yönetimi) ───────────────────────────────
function setupIntersectionObserver(container, reels) {
    const reelsById = new Map(reels.map(r => [String(r.id), r]));

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const reelId = entry.target.id.replace('reel-item-', '');
            const reel   = reelsById.get(reelId);

            if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
                // Eğer zaten aktif reel ise tekrar tetikleme
                if (activeReelId === reelId) return;
                
                activeReelId = reelId;

                // ÖNCE: Diğer tüm reelleri durdur ve sesini kapat
                Object.keys(players).forEach(id => {
                    if (id !== reelId) {
                        const op = players[id];
                        if (op && typeof op.pauseVideo === 'function') {
                            op.pauseVideo();
                            if (typeof op.mute === 'function') op.mute();
                        }
                        if (subtitleIntervals[id]) {
                            clearInterval(subtitleIntervals[id]);
                            delete subtitleIntervals[id];
                        }
                    }
                });

                // Player henüz init edilmediyse yükle
                if (reel && !initializedPlayers.has(reel.id)) {
                    initPlayer(reel);
                }

                // Bir sonraki reeli önceden yükle (init edip hemen durdur)
                const reelIdx = reels.findIndex(r => String(r.id) === reelId);
                if (reelIdx >= 0 && reelIdx + 1 < reels.length) {
                    const next = reels[reelIdx + 1];
                    if (!initializedPlayers.has(next.id)) {
                        setTimeout(() => initPlayer(next), 600);
                    }
                }

                // Aktif reeli oynat
                const p = players[reelId];
                if (p && typeof p.playVideo === 'function') {
                    if (typeof p.unMute === 'function') p.unMute();
                    if (typeof p.setVolume === 'function') p.setVolume(100);
                    p.playVideo();
                    if (!subtitleIntervals[reelId] && reel) {
                        startSubtitleSync(reelId, reel.subtitles, p);
                    }
                }

            } else if (!entry.isIntersecting) {
                // Ekran dışına çıktı: durdur, interval temizle
                const p = players[reelId];
                if (p && typeof p.pauseVideo === 'function') {
                    p.pauseVideo();
                    if (typeof p.mute === 'function') p.mute();
                }
                if (subtitleIntervals[reelId]) {
                    clearInterval(subtitleIntervals[reelId]);
                    delete subtitleIntervals[reelId];
                }
            }
        });
    }, {
        root: container,
        threshold: 0.7   // %70 görünür olunca tetikle
    });

    container.querySelectorAll('.reel-item').forEach(el => obs.observe(el));
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────
export function cleanupPlayers() {
    Object.values(subtitleIntervals).forEach(clearInterval);
    subtitleIntervals = {};
    initializedPlayers.clear();
    activeReelId = null;

    Object.values(players).forEach(p => {
        try { if (p && typeof p.destroy === 'function') p.destroy(); } catch (e) {}
    });
    players = {};
}
