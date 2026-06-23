/**
 * word-order.js — Cümle Sıralama Oyunu
 * Klipten bir altyazı cümlesi alır, kelimeleri karıştırır,
 * kullanıcı doğru sırayla tıklayarak yerleştirir.
 */

import { state } from './state.js?v=15';

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function pickSentence(reel) {
    const subs = (reel.subtitles || []).filter(s =>
        s.trText && s.trText.trim().split(/\s+/).length >= 3
    );
    if (subs.length === 0) return null;
    return subs[Math.floor(Math.random() * subs.length)];
}

export function showWordOrder(reel, container, onComplete) {
    const sub = pickSentence(reel);
    if (!sub) { onComplete(); return; }

    const words = sub.trText.trim().split(/\s+/);
    if (words.length < 3) { onComplete(); return; }

    const shuffled = shuffle(words);

    const overlay = document.createElement('div');
    overlay.className = 'wo-overlay';
    overlay.id = `wo-overlay-${reel.id}`;
    container.appendChild(overlay);

    renderGame(overlay, words, shuffled, sub, reel, onComplete);
}

function renderGame(overlay, correctWords, shuffled, sub, reel, onComplete) {
    overlay.innerHTML = `
        <div class="wo-card">
            <div class="wo-header">
                <span class="wo-badge">🧩 Cümleyi Sırala</span>
                <button class="wo-skip-btn" id="wo-skip">Atla</button>
            </div>

            <div class="wo-instruction">
                <p class="wo-hint-en">"${sub.enText || ''}"</p>
                <p class="wo-hint-label">↑ Türkçe karşılığını oluştur</p>
            </div>

            <!-- Cevap slotları -->
            <div class="wo-answer-zone" id="wo-answer"></div>

            <!-- Karışık kelimeler -->
            <div class="wo-word-bank" id="wo-bank">
                ${shuffled.map((w, i) => `
                    <button class="wo-word-chip" data-word="${w}" data-idx="${i}">${w}</button>
                `).join('')}
            </div>

            <div class="wo-feedback" id="wo-feedback" style="display:none"></div>
        </div>
    `;

    const answerZone = overlay.querySelector('#wo-answer');
    const wordBank   = overlay.querySelector('#wo-bank');
    const feedback   = overlay.querySelector('#wo-feedback');
    const skipBtn    = overlay.querySelector('#wo-skip');

    // Seçili kelimeler sırası
    let selected = [];

    skipBtn.addEventListener('click', () => {
        overlay.classList.add('wo-exit');
        setTimeout(() => { overlay.remove(); onComplete(); }, 300);
    });

    function updateAnswerZone() {
        answerZone.innerHTML = selected.length === 0
            ? `<div class="wo-answer-placeholder">Kelimelere tıkla...</div>`
            : selected.map((w, i) => `
                <button class="wo-answer-chip" data-pos="${i}">${w}</button>
              `).join('');

        // Cevap chipine tıkla → geri al
        answerZone.querySelectorAll('.wo-answer-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const pos = parseInt(btn.dataset.pos);
                const removed = selected.splice(pos, 1)[0];
                // Bankadaki o kelimeyi tekrar göster
                const bankChip = [...wordBank.querySelectorAll('.wo-word-chip.used')]
                    .find(c => c.textContent === removed && c.dataset.used !== 'done');
                if (bankChip) { bankChip.classList.remove('used'); bankChip.removeAttribute('data-used'); }
                updateAnswerZone();
                checkAnswer();
            });
        });

        checkAnswer();
    }

    function checkAnswer() {
        if (selected.length !== correctWords.length) return;

        const isCorrect = selected.join(' ') === correctWords.join(' ');

        feedback.style.display = 'flex';
        if (isCorrect) {
            feedback.className = 'wo-feedback wo-correct';
            feedback.innerHTML = `
                <span class="wo-feedback-icon">✅</span>
                <span>Harika! Doğru sıra!</span>
            `;
            // Doğru chipları yeşile boyala
            answerZone.querySelectorAll('.wo-answer-chip').forEach(c => c.classList.add('correct'));

            state.recordActivity('word_sort');

            setTimeout(() => {
                showComplete(overlay, true, onComplete);
            }, 1500);
        } else {
            feedback.className = 'wo-feedback wo-wrong';
            feedback.innerHTML = `
                <span class="wo-feedback-icon">❌</span>
                <span>Yanlış! Tekrar dene veya atla.</span>
            `;
            answerZone.querySelectorAll('.wo-answer-chip').forEach(c => c.classList.add('wrong'));

            // 1sn sonra sıfırla
            setTimeout(() => {
                selected = [];
                wordBank.querySelectorAll('.wo-word-chip').forEach(c => {
                    c.classList.remove('used');
                    c.removeAttribute('data-used');
                });
                feedback.style.display = 'none';
                updateAnswerZone();
            }, 1200);
        }
    }

    // Kelime bankasından tıklama
    wordBank.querySelectorAll('.wo-word-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (chip.classList.contains('used')) return;
            if (selected.length >= correctWords.length) return;

            chip.classList.add('used');
            chip.dataset.used = 'pending';
            selected.push(chip.dataset.word);
            updateAnswerZone();
        });
    });

    // İlk render
    updateAnswerZone();
}

function showComplete(overlay, success, onComplete) {
    overlay.innerHTML = `
        <div class="wo-card wo-complete-card">
            <div class="wo-complete-emoji">${success ? '🎉' : '💪'}</div>
            <h2 class="wo-complete-title">${success ? 'Mükemmel!' : 'Devam Et!'}</h2>
            <p class="wo-complete-sub">${success ? 'Cümleyi doğru sıraladın!' : 'Bir dahaki sefere!'}</p>
            ${success ? `<div class="wo-reward"><span class="nazar-badge">+3 🧿 Nazar</span></div>` : ''}
            <button class="wo-continue-btn" id="wo-continue">
                <i data-lucide="play"></i>
                Devam Et
            </button>
        </div>
    `;
    if (window.lucide) window.lucide.createIcons();

    overlay.querySelector('#wo-continue').addEventListener('click', () => {
        overlay.classList.add('wo-exit');
        setTimeout(() => { overlay.remove(); onComplete(); }, 300);
    });
}
