export const idiomsList = [
    { tr: "Damlaya damlaya göl olur.", en: "Drop by drop, it becomes a lake. (Little things add up)" },
    { tr: "Ateş olmayan yerden duman çıkmaz.", en: "There is no smoke without fire. (Rumors usually have some truth)" },
    { tr: "Sakla samanı, gelir zamanı.", en: "Keep the straw, its time will come. (Save for a rainy day)" },
    { tr: "Gülü seven dikenine katlanır.", en: "Who loves the rose puts up with its thorns." },
    { tr: "Ağaç yaşken eğilir.", en: "A tree is bent while it is young. (Education starts early)" },
    { tr: "Tatlı dil yılanı deliğinden çıkarır.", en: "Sweet talk draws the snake out of its hole." },
    { tr: "Ne ekersen onu biçersin.", en: "You reap what you sow." },
    { tr: "Meyve veren ağaç taşlanır.", en: "The tree that bears fruit is stoned. (Successful people are criticized)" },
    { tr: "Yalancının mumu yatsıya kadar yanar.", en: "A liar's candle burns till the evening. (Lies are soon discovered)" },
    { tr: "Dost kara günde belli olur.", en: "A friend is known on a dark day. (A friend in need is a friend indeed)" },
    { tr: "Acele işe şeytan karışır.", en: "The devil meddles with hasty work. (Haste makes waste)" },
    { tr: "Bir elin nesi var, iki elin sesi var.", en: "Two hands make a sound. (Teamwork is better than working alone)" },
    { tr: "Rüzgar eken fırtına biçer.", en: "He who sows the wind reaps the storm." },
    { tr: "Kedi uzanamadığı ciğere mundar der.", en: "The cat calls the liver it cannot reach dirty. (Sour grapes)" },
    { tr: "Görünen köy kılavuz istemez.", en: "The visible village needs no guide. (It's obvious)" }
];

export function setupIdioms(container) {
    // Pick a random idiom
    const randomIndex = Math.floor(Math.random() * idiomsList.length);
    const selectedIdiom = idiomsList[randomIndex];

    const idiomsTemplate = `
        <div class="screen idioms-screen" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; height: 100%;">
            <header style="margin-bottom: 40px; width: 100%;">
                <h2 style="color: var(--primary-color);">Idiom of the Day</h2>
            </header>
            
            <div class="idiom-card" style="width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <i data-lucide="quote" style="color: rgba(255,255,255,0.1); width: 48px; height: 48px; position: absolute; top: -20px; left: 20px;"></i>
                
                <h3 class="idiom-tr" style="font-size: 1.8rem; margin-top: 16px;">"${selectedIdiom.tr}"</h3>
                <p class="idiom-en" style="color: var(--text-secondary); margin-top: 16px; font-style: italic;">${selectedIdiom.en}</p>
                
                <button id="tts-btn" class="icon-btn" style="margin-top: 32px; background: var(--primary-color); border-radius: 50%; padding: 16px; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4); transition: transform 0.2s;">
                    <i data-lucide="volume-2" style="color: white;"></i>
                </button>
            </div>
            
            <button id="next-idiom-btn" style="margin-top: 40px; background: none; border: 1px solid var(--text-secondary); color: var(--text-secondary); padding: 10px 20px; border-radius: 20px; cursor: pointer;">
                Show another one
            </button>
        </div>
    `;

    container.innerHTML = idiomsTemplate;
    if(window.lucide) window.lucide.createIcons();

    // Text to Speech logic
    const ttsBtn = container.querySelector('#tts-btn');
    ttsBtn.addEventListener('click', () => {
        // Add click animation
        ttsBtn.style.transform = 'scale(0.9)';
        setTimeout(() => ttsBtn.style.transform = 'scale(1)', 150);

        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(selectedIdiom.tr);
            utterance.lang = 'tr-TR';
            utterance.rate = 0.9; // Slightly slower for learning
            utterance.pitch = 1;
            
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser does not support text-to-speech.");
        }
    });

    // Refresh button logic (for demonstration purposes if user wants to see another one immediately)
    const nextBtn = container.querySelector('#next-idiom-btn');
    nextBtn.addEventListener('click', () => {
        setupIdioms(container); // Re-render component
    });
}
