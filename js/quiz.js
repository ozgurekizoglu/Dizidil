/**
 * quiz.js — Mini Quiz Sistemi
 * Reel'in subtitles + vocab verisinden otomatik soru üretir.
 * 3 soru tipi: kelime eşleştirme, boşluk doldurma, gramer sorusu
 */

import { state, mockReels } from './state.js?v=14';

// ── Soru üretici ──────────────────────────────────────────────────────────────

function generateQuestions(reel) {
    const questions = [];
    const allVocab = [];
    const allSubs  = reel.subtitles || [];

    allSubs.forEach(sub => (sub.vocab || []).forEach(v => {
        if (!allVocab.find(x => x.word === v.word)) allVocab.push({ ...v, sub });
    }));

    if (allVocab.length === 0 && allSubs.length === 0) return [];

    // Havuzdan yanlış şık üret
    const allWords = mockReels.flatMap(r =>
        (r.subtitles || []).flatMap(s => s.vocab || [])
    );
    function wrongOptions(correct, field, count = 3) {
        const pool = allWords
            .filter(v => v[field] && v[field] !== correct)
            .map(v => v[field]);
        const unique = [...new Set(pool)];
        const shuffled = unique.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    // 1. KELİME EŞLEŞTİRME — vocab varsa
    if (allVocab.length > 0) {
        const target = allVocab[Math.floor(Math.random() * allVocab.length)];
        const wrongs  = wrongOptions(target.meaning, 'meaning', 3);
        if (wrongs.length >= 3) {
            const options = shuffle([target.meaning, ...wrongs]);
            questions.push({
                type: 'vocab_match',
                emoji: '🔤',
                question: `"${target.word}" kelimesinin İngilizce karşılığı hangisidir?`,
                options,
                correct: target.meaning,
                explanation: target.trMeaning
                    ? `${target.word} → ${target.trMeaning} → ${target.meaning}`
                    : `${target.word} → ${target.meaning}`
            });
        }
    }

    // 2. BOŞLUK DOLDURMA — subtitle varsa
    const goodSubs = allSubs.filter(s => s.vocab && s.vocab.length > 0 && s.trText.split(' ').length >= 4);
    if (goodSubs.length > 0) {
        const sub    = goodSubs[Math.floor(Math.random() * goodSubs.length)];
        const vocab  = sub.vocab[Math.floor(Math.random() * sub.vocab.length)];
        // Cümledeki kelimeyi bul (büyük/küçük harf + ek toleranslı)
        const words  = sub.trText.split(' ');
        const idx    = words.findIndex(w =>
            w.toLowerCase().startsWith(vocab.word.toLowerCase().slice(0, 3))
        );
        if (idx !== -1) {
            const blank   = words.map((w, i) => i === idx ? '___' : w).join(' ');
            const wrongs  = wrongOptions(vocab.word, 'word', 3);
            if (wrongs.length >= 2) {
                const options = shuffle([vocab.word, ...wrongs.slice(0, 3)]);
                questions.push({
                    type: 'fill_blank',
                    emoji: '✏️',
                    question: `Boşluğu doldurun:\n"${blank}"`,
                    subHint: sub.enText ? `İpucu: "${sub.enText}"` : null,
                    options,
                    correct: vocab.word,
                    explanation: `"${vocab.word}" — ${vocab.meaning}`
                });
            }
        }
    }

    // 3. GRAMER SORUSU — grammar string varsa
    const subWithGrammar = allSubs.filter(s => s.grammar && s.grammar.length > 10);
    if (subWithGrammar.length > 0) {
        const sub = subWithGrammar[Math.floor(Math.random() * subWithGrammar.length)];
        // Gramerden kısa bir soru üret: "Bu cümle hangi zamanı kullanıyor?"
        const grammarTypes = extractGrammarType(sub.grammar);
        if (grammarTypes.correct) {
            questions.push({
                type: 'grammar',
                emoji: '📐',
                question: `"${sub.trText}"\n\nBu cümlede kullanılan dilbilgisi yapısı nedir?`,
                options: grammarTypes.options,
                correct: grammarTypes.correct,
                explanation: sub.grammar
            });
        }
    }

    return shuffle(questions).slice(0, 3);
}

// Grammar string'inden soru+şık üretir
function extractGrammarType(grammarStr) {
    const patterns = [
        { match: /geçmiş zaman|past tense|definite past/i, label: 'Geçmiş Zaman (Past Tense)' },
        { match: /şimdiki zaman|present continuous/i, label: 'Şimdiki Zaman (Present Continuous)' },
        { match: /geniş zaman|aorist|simple present/i, label: 'Geniş Zaman (Aorist)' },
        { match: /gelecek zaman|future/i, label: 'Gelecek Zaman (Future)' },
        { match: /optative|öneri|suggestion|dilek/i, label: 'Dilek / Öneri Kipi (Optative)' },
        { match: /imperative|emir/i, label: 'Emir Kipi (Imperative)' },
        { match: /causative|ettirgen/i, label: 'Ettirgen Çatı (Causative)' },
        { match: /passive|edilgen/i, label: 'Edilgen Çatı (Passive)' },
        { match: /dative|yönelme/i, label: 'Yönelme Durumu (Dative Case)' },
        { match: /accusative|belirtme/i, label: 'Belirtme Durumu (Accusative)' },
        { match: /possessive|iyelik/i, label: 'İyelik Eki (Possessive Suffix)' },
        { match: /evidential|reported|miş/i, label: 'Duyulan Geçmiş (Evidential Past)' },
    ];

    const matched = patterns.filter(p => p.match.test(grammarStr));
    if (matched.length === 0) return {};

    const correct = matched[0].label;
    const wrongPool = patterns.map(p => p.label).filter(l => l !== correct);
    const wrongs = shuffle(wrongPool).slice(0, 3);

    return { correct, options: shuffle([correct, ...wrongs]) };
}

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

// ── Quiz Overlay renderer ─────────────────────────────────────────────────────

export function showQuiz(reel, container, onComplete) {
    const questions = generateQuestions(reel);
    if (questions.length === 0) {
        onComplete();
        return;
    }

    // Quiz overlay DOM'a eklenir
    const overlay = document.createElement('div');
    overlay.className = 'quiz-overlay';
    overlay.id = `quiz-overlay-${reel.id}`;

    container.appendChild(overlay);
    renderQuizStep(overlay, questions, 0, reel, onComplete);
}

function renderQuizStep(overlay, questions, stepIdx, reel, onComplete) {
    if (stepIdx >= questions.length) {
        renderQuizComplete(overlay, questions, reel, onComplete);
        return;
    }

    const q        = questions[stepIdx];
    const progress = `${stepIdx + 1} / ${questions.length}`;

    overlay.innerHTML = `
        <div class="quiz-card">
            <div class="quiz-header">
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width: ${((stepIdx) / questions.length) * 100}%"></div>
                </div>
                <div class="quiz-meta">
                    <span class="quiz-step-label">${progress}</span>
                    <button class="quiz-skip-btn" id="quiz-skip">Atla</button>
                </div>
            </div>

            <div class="quiz-body">
                <div class="quiz-emoji">${q.emoji}</div>
                <p class="quiz-question">${q.question.replace(/\n/g, '<br>')}</p>
                ${q.subHint ? `<p class="quiz-hint">${q.subHint}</p>` : ''}
            </div>

            <div class="quiz-options" id="quiz-options">
                ${q.options.map((opt, i) => `
                    <button class="quiz-option" data-value="${escapeHtml(opt)}" data-index="${i}">
                        ${opt}
                    </button>
                `).join('')}
            </div>

            <div class="quiz-feedback" id="quiz-feedback" style="display:none"></div>
        </div>
    `;

    const optionsEl  = overlay.querySelector('#quiz-options');
    const feedbackEl = overlay.querySelector('#quiz-feedback');
    const skipBtn    = overlay.querySelector('#quiz-skip');
    let answered     = false;

    skipBtn.addEventListener('click', () => {
        if (!answered) renderQuizStep(overlay, questions, stepIdx + 1, reel, onComplete);
    });

    optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            if (answered) return;
            answered = true;
            const chosen  = btn.dataset.value;
            const correct = q.correct;
            const isRight = chosen === correct;

            // Tüm şıkları renklendir
            optionsEl.querySelectorAll('.quiz-option').forEach(b => {
                if (b.dataset.value === correct) b.classList.add('correct');
                else if (b === btn && !isRight) b.classList.add('wrong');
                b.disabled = true;
            });

            // Geri bildirim
            feedbackEl.style.display = 'flex';
            feedbackEl.innerHTML = `
                <span class="feedback-icon">${isRight ? '✅' : '❌'}</span>
                <span class="feedback-text">
                    ${isRight ? 'Harika!' : 'Doğru cevap: <strong>' + correct + '</strong>'}
                    <small>${q.explanation}</small>
                </span>
            `;

            // 2sn sonra sonraki soruya geç
            setTimeout(() => {
                renderQuizStep(overlay, questions, stepIdx + 1, reel, onComplete);
            }, 2000);
        });
    });
}

function renderQuizComplete(overlay, questions, reel, onComplete) {
    state.markQuizCompleted(reel.id);

    overlay.innerHTML = `
        <div class="quiz-card quiz-complete-card">
            <div class="quiz-complete-emoji">🎉</div>
            <h2 class="quiz-complete-title">Quiz Tamamlandı!</h2>
            <p class="quiz-complete-subtitle">${reel.series} — Klip ${reel.id}</p>
            <div class="quiz-reward">
                <span class="nazar-badge">+5 🧿 Nazar</span>
                <span class="quiz-reward-label">Kazandın!</span>
            </div>
            <button class="quiz-continue-btn" id="quiz-continue">
                <i data-lucide="play"></i>
                Devam Et
            </button>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    overlay.querySelector('#quiz-continue').addEventListener('click', () => {
        overlay.classList.add('quiz-exit');
        setTimeout(() => {
            overlay.remove();
            onComplete();
        }, 300);
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
