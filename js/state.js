export const state = {
    isAuthenticated: true,
    currentScreen: 'home',
    nazarCount: 28,
    savedReels: new Set(),
    unlockedSeries: new Set(),
    listeners: [],

    // Simple state subscription
    subscribe(listener) {
        this.listeners.push(listener);
    },

    notify() {
        this.listeners.forEach(l => l());
        this.saveData();
    },

    login() {
        this.isAuthenticated = true;
        this.saveData();
        this.notify();
    },

    logout() {
        this.isAuthenticated = false;
        this.nazarCount = 28;
        this.savedReels.clear();
        this.unlockedSeries.clear();
        this.saveData();
        this.notify();
    },

    addNazar(amount) {
        this.nazarCount += amount;
        this.notify();
    },

    toggleSaveReel(reelId) {
        if (this.savedReels.has(reelId)) {
            this.savedReels.delete(reelId);
        } else {
            this.savedReels.add(reelId);
            this.addNazar(2); // Reward for saving
        }
        this.notify();
    },

    unlockSeries(seriesId, cost) {
        if (this.nazarCount >= cost && !this.unlockedSeries.has(seriesId)) {
            this.nazarCount -= cost;
            this.unlockedSeries.add(seriesId);
            this.notify();
            return true;
        }
        return false;
    },

    saveData() {
        localStorage.setItem('dizidil_auth', this.isAuthenticated);
        if (this.isAuthenticated) {
            localStorage.setItem('dizidil_nazar', this.nazarCount);
            localStorage.setItem('dizidil_saved', JSON.stringify([...this.savedReels]));
            localStorage.setItem('dizidil_unlocked', JSON.stringify([...this.unlockedSeries]));
        } else {
            localStorage.removeItem('dizidil_nazar');
            localStorage.removeItem('dizidil_saved');
            localStorage.removeItem('dizidil_unlocked');
        }
    },

    loadData() {
        const auth = localStorage.getItem('dizidil_auth');
        if (auth === 'true') {
            this.isAuthenticated = true;
            const savedNazar = localStorage.getItem('dizidil_nazar');
            if (savedNazar) {
                this.nazarCount = parseInt(savedNazar, 10);
                // Fix: if user has exactly 15 and no unlocked series, upgrade them to 28
                if (this.nazarCount === 15 && !localStorage.getItem('dizidil_unlocked')) {
                    this.nazarCount = 28;
                }
            }

            const savedReelsStr = localStorage.getItem('dizidil_saved');
            if (savedReelsStr) {
                this.savedReels = new Set(JSON.parse(savedReelsStr));
            }

            const unlockedStr = localStorage.getItem('dizidil_unlocked');
            if (unlockedStr) {
                this.unlockedSeries = new Set(JSON.parse(unlockedStr));
            }
        }
    }
};

// Load initial data from localStorage
state.loadData();

export const seriesData = [
    { id: 1, title: 'Kuzey Güney', genres: ['Romantic', 'Drama', 'Crime'], img: 'https://media.themoviedb.org/t/p/w500/eG35U9iYp6cWigQxIpzwlPEPY0l.jpg', locked: false },
    { id: 2, title: 'Prens', genres: ['Comedy'], img: 'https://upload.wikimedia.org/wikipedia/tr/9/9d/Prens_dizi_afi%C5%9F.jpg', locked: false },
    { id: 3, title: 'Ezel', genres: ['Drama', 'Romantic'], img: 'https://media.themoviedb.org/t/p/w500/pHSjh4MINU2JnK7qQvjogQaX3wr.jpg', locked: false, cost: 10 },
    { id: 4, title: 'Muhteşem Yüzyıl', genres: ['History', 'Romantic', 'Drama'], img: 'https://media.themoviedb.org/t/p/w500/kryRPZTkCxtIc1bGMjIQgblnPe0.jpg', locked: true, cost: 20 },
];

export const mockReels = [
    // --- KUZEY GÜNEY ---
    {
        id: 'reel_kg_1', series: 'Kuzey Güney', location: 'İstanbul',
        youtubeId: 'eBnhfmWsxF8', // Beklenen Kuzey Güney 1
        subtitles: [
            {
                start: 3,
                end: 4.5,
                trText: 'Sen neye baktın?',
                enText: 'What did you look at?',
                grammar: 'Geçmiş Zaman (Definite Past Tense) [bak-tı-n] + Yönelme Durumu (Dative Case: ne-ye)',
                vocab: [
                    { word: 'Bakmak', trMeaning: 'Gözleri bir yöne çevirmek', meaning: 'To look / to look at' },
                    { word: 'Neye', trMeaning: 'Hangi şeye, ne tarafa', meaning: 'At what / to what' }
                ]
            },
            {
                start: 4.5,
                end: 6,
                trText: 'Bakıyordum öyle karar veremedim.',
                enText: 'I was just looking, I couldn\'t decide.',
                grammar: 'Şimdiki Zamanın Hikayesi (Past Continuous: bak-ıyor-du-m) + Yeterlilik Fiili Olumsuzu (Negative Abilitative: karar ver-e-me-di-m)',
                vocab: [
                    { word: 'Karar vermek', trMeaning: 'Bir konuda son sözü söylemek', meaning: 'To decide / to make up one\'s mind' },
                    { word: 'Öyle', trMeaning: 'O şekilde, öylesine', meaning: 'Just because / casually / like that' }
                ]
            },
            {
                start: 6.5,
                end: 7.5,
                trText: 'Neye bakıyon lan!',
                enText: 'What are you looking at, man!',
                grammar: 'Sokak Ağzı / Kısaltma (Colloquial Shortening: bakıyon -> bakıyorsun) + Argo (Slang)',
                vocab: [
                    { word: 'Lan', trMeaning: 'Kaba hitap sözü, ulanın kısaltılmışı', meaning: 'Dude / Man / Hell (Highly informal address, can be aggressive depending on tone)' }
                ]
            },
            {
                start: 7.5,
                end: 9,
                trText: 'Kurabiye var simit var neye bakıyon?',
                enText: 'There are cookies, there are bagels — what are you looking at?',
                grammar: 'Var/Yok Cümlesi (Existential Clause: Noun + Var)',
                vocab: [
                    { word: 'Kurabiye', trMeaning: 'Unlu tatlı bir çerez', meaning: 'Cookie / biscuit' },
                    { word: 'Simit', trMeaning: 'Susamlı halka ekmek', meaning: 'Turkish bagel (sesame-crusted bread ring)' },
                    { word: 'Var', trMeaning: 'Mevcut, bulunan', meaning: 'Existing / Present / There is / There are' }
                ]
            }
        ],
        likes: '12K', saves: '2K'
    },
    {
        id: 'reel_kg_2', series: 'Kuzey Güney', location: 'İstanbul',
        youtubeId: 'ohBkvMkm6os', // Beklenen Kuzey Güney 2
        subtitles: [
            {
                start: 0,
                end: 2,
                trText: 'Kardeşine hiç benzemiyor.',
                enText: 'Doesn\'t look like his/her sibling at all.',
                grammar: 'Geniş Zamanın Olumsuzu (Simple Present Negative: benz-e-mi-yor) + Dative Case (kardeş-in-e)',
                vocab: [
                    { word: 'Benzemek', trMeaning: 'Birine ya da bir şeye benzer olmak', meaning: 'To resemble / to look like (requires Dative "-e/-a")' },
                    { word: 'Kardeş', trMeaning: 'Aynı anne babadan doğan kişi', meaning: 'Sibling / brother / sister' },
                    { word: 'Hiç', trMeaning: 'Asla, hiçbir şekilde', meaning: 'Never / not at all / by no means' }
                ]
            },
            {
                start: 2.5,
                end: 3.5,
                trText: 'O senin görüşün,',
                enText: 'That\'s your opinion,',
                grammar: 'Possessive Pronoun (senin) + Second Person Singular Possessive Suffix (görüş-ün)',
                vocab: [
                    { word: 'Görüş', trMeaning: 'Düşünce, fikir, bakış açısı', meaning: 'Opinion / view / perspective / sight' },
                    { word: 'O', trMeaning: 'Şu, bu, o kişi', meaning: 'That / he / she / it' }
                ]
            },
            {
                start: 3.5,
                end: 5,
                trText: 'herkes benzetir aslında...',
                enText: 'everyone actually finds a resemblance...',
                grammar: 'Causative Verb Construction (benze-t-mek) + Habitual Aorist / Simple Present (benze-t-ir)',
                vocab: [
                    { word: 'Benzetmek', trMeaning: 'Birini başkasına benzer bulmak', meaning: 'To compare / to find a resemblance / to mistake for' },
                    { word: 'Herkes', trMeaning: 'Bütün insanlar, tüm kişiler', meaning: 'Everyone / everybody' },
                    { word: 'Aslında', trMeaning: 'Gerçekte, hakikatte', meaning: 'Actually / in fact / originally' }
                ]
            },
            {
                start: 5.5,
                end: 8.5,
                trText: 'Sen bir kere çok sarısın.',
                enText: 'For one thing, you\'re very blonde.',
                grammar: 'Idiomatic Phrase (bir kere) + Present Copula / "To Be" for Second Person (sarı-sın)',
                vocab: [
                    { word: 'Sarı', trMeaning: 'Açık saç rengi, sarışın', meaning: 'Blond / blonde / yellow' },
                    { word: 'Bir kere', trMeaning: 'Her şeyden önce, ilk olarak', meaning: 'For one thing / first of all / to begin with' },
                    { word: 'Çok', trMeaning: 'Fazla, aşırı', meaning: 'Very / much / a lot' }
                ]
            },
            {
                start: 9,
                end: 10,
                trText: 'Nolmuş ?',
                enText: 'So what?',
                grammar: 'Spoken Contraction (Ne olmuş -> Nolmuş) + Evidential / Reported Past Tense (-muş)',
                vocab: [
                    { word: 'Nolmuş / Ne olmuş', trMeaning: 'Ne olmuş yani, ne fark eder', meaning: 'So what? / What of it? / What happened?' }
                ]
            },
            {
                start: 10.5,
                end: 12.5,
                trText: 'Sarıyım ama çirkin değilim en azından.',
                enText: 'I\'m blonde but at least I\'m not ugly.',
                grammar: 'First Person Copula (sarı-y-ım) + Negative Copula for First Person (değil-im) + Concessive Phrase (en azından)',
                vocab: [
                    { word: 'Ama', trMeaning: 'Fakat, ancak', meaning: 'But / however' },
                    { word: 'Çirkin', trMeaning: 'Görünüşü hoş olmayan', meaning: 'Ugly' },
                    { word: 'En azından', trMeaning: 'Hiç değilse, bari', meaning: 'At least' }
                ]
            },
            {
                start: 14,
                end: 16,
                trText: 'Şşt, sarı!',
                enText: 'Hey, blondie!',
                grammar: 'Interjection / Calling Attention (Şşt!) + Vocative / Address (sarı)',
                vocab: [
                    { word: 'Şşt', trMeaning: 'Dikkat çekmek için çıkarılan ses', meaning: 'Hey / pst / shh' },
                    { word: 'Sarı', trMeaning: 'Sarışın (burada lakap olarak)', meaning: 'Blondie (used here as a nickname)' }
                ]
            },
            {
                start: 16,
                end: 18,
                trText: 'Bu yakıştı sana ha!',
                enText: 'That suited you, huh!',
                grammar: 'Definite Past Tense (yakış-tı) + Dative Personal Pronoun (sen -> san-a) + Emphatic Particle (ha)',
                vocab: [
                    { word: 'Yakışmak', trMeaning: 'Birine yaraşmak, güzel durmak', meaning: 'To suit / to look good on (requires Dative "-e/-a")' },
                    { word: 'Ha', trMeaning: 'Vurgulama, onaylama ünlemi', meaning: 'Eh? / you know / indeed (used to add emphasis)' }
                ]
            }
        ],
        likes: '14K', saves: '1K'
    },

    // --- PRENS ---
    {
        id: 'reel_pr_1', series: 'Prens', location: 'Bongomia',
        widescreen: true,
        youtubeId: 'VBxUSqlw9y8',
        subtitles: [
            {
                start: 0,
                end: 4,
                trText: 'Ulaşmak istedi ama uykunuzu bölmemek için biz sizi uyandırmadık.',
                enText: 'He wanted to reach you, but we didn\'t wake you so as not to disturb your sleep.',
                grammar: 'Past Tense with Intention (ulaş-mak iste-di) + Negative Infinitive with Purpose Clause (-memek için) + Causative Negative Past Tense (uyan-dır-ma-dık)',
                vocab: [
                    { word: 'Ulaşmak', trMeaning: 'Bir yere ya da kişiye erişmek', meaning: 'To reach / to contact (requires Dative "-e/-a")' },
                    { word: 'Bölmek', trMeaning: 'Kesmek, ayırmak, sekteye uğratmak', meaning: 'To interrupt / to divide / to split' },
                    { word: 'Uyandırmak', trMeaning: 'Uyuyan birini uyarmak', meaning: 'To wake someone up (Causative of "uyanmak")' }
                ]
            },
            {
                start: 4.5,
                end: 6.5,
                trText: 'Büyücüleri kahinleri bilirsiniz,',
                enText: 'You know the sorcerers and oracles,',
                grammar: 'Accusative Case Direct Objects (-ler-i) + Aorist / Simple Present with Second Person Plural (bil-ir-siniz)',
                vocab: [
                    { word: 'Büyücü', trMeaning: 'Sihir yapan kişi', meaning: 'Sorcerer / wizard / magician' },
                    { word: 'Kahin', trMeaning: 'Geleceği gören, falcı', meaning: 'Oracle / seer / soothsayer' },
                    { word: 'Bilmek', trMeaning: 'Bir şeyi öğrenmiş olmak, haberdar olmak', meaning: 'To know' }
                ]
            },
            {
                start: 6.5,
                end: 7.5,
                trText: 'diyar diyar gezerler.',
                enText: 'they wander from land to land.',
                grammar: 'Adverbial Reduplication (diyar diyar) + Aorist / Simple Present with Third Person Plural (gez-er-ler)',
                vocab: [
                    { word: 'Diyar diyar', trMeaning: 'Ülke ülke, yer yer', meaning: 'From land to land / all over the country' },
                    { word: 'Gezmek', trMeaning: 'Dolaşmak, seyahat etmek', meaning: 'To travel / to wander / to roam' }
                ]
            },
            {
                start: 8,
                end: 10.5,
                trText: 'Gidecek yolu varmış demek ki.',
                enText: 'So apparently he had a journey ahead.',
                grammar: 'Future Participle as Adjective (gid-ecek yol) + Evidential / Reported Existential (var-mış) + Conjunction (demek ki)',
                vocab: [
                    { word: 'Demek ki', trMeaning: 'Anlamı şuymuş, öyleyse', meaning: 'It means that / so / therefore' },
                    { word: 'Gidecek yol', trMeaning: 'Önünde yürünecek yol', meaning: 'A road to go / journey ahead' },
                    { word: 'Varmış', trMeaning: 'Mevcutmuş, bulunuyormuş', meaning: 'Reportedly exists / apparently there is' }
                ]
            },
            {
                start: 11,
                end: 14.5,
                trText: 'Böyle, içimizden ona iyi yolculuklar dileyelim mi ?',
                enText: 'So, shall we silently wish him a good journey?',
                grammar: 'First Person Plural Optative / Suggestion (diley-elim) + Question Particle (mi?) + Dative Pronoun (o-n-a)',
                vocab: [
                    { word: 'Dilemek', trMeaning: 'Temenni etmek, arzu etmek', meaning: 'To wish / to desire' },
                    { word: 'İçimizden', trMeaning: 'Sessizce, gönülden', meaning: 'Inwardly / from the heart / silently' },
                    { word: 'Yolculuk', trMeaning: 'Seyahat, gezi', meaning: 'Journey / trip / travel' }
                ]
            },
            {
                start: 15,
                end: 16.5,
                trText: 'Haşarya anan aynı sen he!',
                enText: 'Your naughty mother is just like you!',
                grammar: 'Colloquial Non-standard Adjective (Haşarya -> Haşarı) + Dropped Copula / Equative Clause (aynı sen) + Emphatic Particle (he)',
                vocab: [
                    { word: 'Haşarı / Haşarya', trMeaning: 'Yaramaz, ele avuca sığmaz', meaning: 'Naughty / mischievous / rowdy' },
                    { word: 'Anan', trMeaning: 'Annen (kaba, samimi hitap)', meaning: 'Your mother (informal/colloquial for "annen")' },
                    { word: 'Aynı sen', trMeaning: 'Tıpkı senin gibi', meaning: 'Just like you / the spitting image of you' }
                ]
            },
            {
                start: 17,
                end: 18.5,
                trText: 'Ne kadar inanarak boş konuşuyor görüyor musun ?',
                enText: 'Do you see how convincingly he talks nonsense?',
                grammar: 'Adverbial Participle of Manner (inan-arak) + Present Continuous Progressive (konuş-uyor / gör-üyor) + Present Continuous Question (görüyor mu-sun)',
                vocab: [
                    { word: 'İnanarak', trMeaning: 'İnanıp, içtenlikle', meaning: 'Believingly / with conviction (from "inanmak")' },
                    { word: 'Boş konuşmak', trMeaning: 'Anlamsız sözler söylemek', meaning: 'To talk nonsense / to speak in vain' },
                    { word: 'Ne kadar', trMeaning: 'Hangi ölçüde, ne denli', meaning: 'How much / to what extent' }
                ]
            },
            {
                start: 19,
                end: 23,
                trText: 'Sion, ben artık bir kralım ve her kralın bir mantoru olur.',
                enText: 'Sion, I am now a king, and every king has a mentor.',
                grammar: 'Nominal Sentence / Present Copula (kral-ım) + Possessive Genitive Relation (kral-ın mentor-u) + Habitual Aorist (ol-ur)',
                vocab: [
                    { word: 'Artık', trMeaning: 'Bundan böyle, bundan sonra', meaning: 'From now on / anymore' },
                    { word: 'Kral', trMeaning: 'Hükümdar, padişah', meaning: 'King' },
                    { word: 'Mentor / Mantor', trMeaning: 'Danışman, akıl hocası', meaning: 'Mentor / guide / advisor' }
                ]
            }
        ],
        likes: '22K', saves: '4K'
    },
    {
        id: 'reel_pr_2', series: 'Prens', location: 'Bongomia',
        widescreen: true,
        youtubeId: 'p4OEukWzsMc', // Beklenen Prens 2
        subtitles: [
            {
                start: 0,
                end: 2.5,
                trText: 'Çok teşekkür ederim hepinize buraya kadar geldiğiniz için.',
                enText: 'Thank you so much to all of you for coming all the way here.',
                grammar: 'Simple Present / Aorist (teşekkür ed-er-im) + Dative Case (hepiniz-e) + Nominalized Verb with Possessive and Postposition (gel-diğ-iniz için)',
                vocab: [
                    { word: 'Teşekkür etmek', trMeaning: 'Minnettarlık bildirmek', meaning: 'To thank / to express gratitude (takes Dative "-e/-a")' },
                    { word: 'Hepiniz', trMeaning: 'Hepiniz, tümünüz', meaning: 'All of you' },
                    { word: 'Buraya kadar', trMeaning: 'Bu noktaya dek, ta buralara', meaning: 'All the way here / up to this point' }
                ]
            },
            {
                start: 3,
                end: 5,
                trText: 'Açıkçası bu kadar yüksek bir katılım ben de beklemiyordum, çok mutlu oldum.',
                enText: 'Honestly, I wasn\'t expecting such high attendance either, I\'m very happy.',
                grammar: 'Past Continuous Negative (bekle-mi-yor-du-m) + Definite Past Tense (mutlu ol-du-m) + Emphatic Clitic (ben de)',
                vocab: [
                    { word: 'Açıkçası', trMeaning: 'Doğrusu, açık söylemek gerekirse', meaning: 'Frankly / honestly / to be honest' },
                    { word: 'Katılım', trMeaning: 'İştirak, katılanların sayısı', meaning: 'Participation / attendance / turnout' },
                    { word: 'Mutlu olmak', trMeaning: 'Sevinç duymak, hoşnut olmak', meaning: 'To become happy / to be glad' }
                ]
            },
            {
                start: 5.5,
                end: 7,
                trText: 'Gelmeyen boğdurulacak demişsiniz.',
                enText: 'You apparently said whoever doesn\'t come will be strangled.',
                grammar: 'Active Participle (gel-mey-en) + Double Passive/Causative Future Tense (boğ-dur-ul-acak) + Reported Past Second Person Plural (de-miş-siniz)',
                vocab: [
                    { word: 'Boğdurulmak', trMeaning: 'Boğulmaya maruz bırakılmak', meaning: 'To be strangled / to be choked (by someone\'s order)' },
                    { word: 'Gelmeyen', trMeaning: 'Gelmemiş olan kişi', meaning: 'Those who do not come / non-attendee' },
                    { word: 'Demek', trMeaning: 'Söylemek, ifade etmek', meaning: 'To say / to state' }
                ]
            },
            {
                start: 7.5,
                end: 8,
                trText: 'Sus be!',
                enText: 'Shut up, man!',
                grammar: 'Imperative Mood (Sus!) + Informal Emphatic Particle (be)',
                vocab: [
                    { word: 'Susmak', trMeaning: 'Sessiz olmak, konuşmayı kesmek', meaning: 'To be quiet / to shut up' },
                    { word: 'Be', trMeaning: 'Kızgınlık veya samimiyetle kullanılan ünlem', meaning: 'Man / jeez / oh (used informally to add irritation or emphasis)' }
                ]
            },
            {
                start: 8.5,
                end: 10,
                trText: 'Ne alakası var, kimseyi zorla tutmuyorum!',
                enText: 'What does that have to do with anything? I\'m not keeping anyone here by force!',
                grammar: 'Noun Phrase with Third Person Possessive (alaka-sı var) + Present Continuous Negative (tut-mu-yor-um) + Accusative Pronoun (kimse-y-i)',
                vocab: [
                    { word: 'Ne alakası var?', trMeaning: 'Bunun ne ilgisi var, saçmalamak', meaning: 'What does that have to do with anything? / No way!' },
                    { word: 'Zorla', trMeaning: 'Zorlayarak, güç kullanarak', meaning: 'By force / forcibly' },
                    { word: 'Tutmak', trMeaning: 'Elde bulundurmak, bırakmamak', meaning: 'To keep / to hold / to detain' }
                ]
            }
        ],
        likes: '19K', saves: '3K'
    },

    // --- EZEL ---
    {
        id: 'reel_ez_1', series: 'Ezel', location: 'İstanbul',
        youtubeId: '0REn3yxeHZs', // Beklenen Ezel 1
        subtitles: [
            { start: 0, end: 5, trText: 'Örnek Altyazı 1', enText: 'Example Subtitle 1', grammar: 'Gramer Kuralı', vocab: [{ word: 'Kelime', meaning: 'Anlamı' }] }
        ],
        likes: '45K', saves: '12K'
    },
    {
        id: 'reel_ez_2', series: 'Ezel', location: 'İstanbul',
        youtubeId: '0REn3yxeHZs', // Beklenen Ezel 2
        subtitles: [
            { start: 0, end: 5, trText: 'Örnek Altyazı 2', enText: 'Example Subtitle 2', grammar: 'Gramer Kuralı', vocab: [{ word: 'Kelime', meaning: 'Anlamı' }] }
        ],
        likes: '32K', saves: '8K'
    },

    // --- MUHTEŞEM YÜZYIL ---
    {
        id: 'reel_my_1', series: 'Muhteşem Yüzyıl', location: 'Topkapı Sarayı',
        youtubeId: 'LGytIGFZ2mQ',
        subtitles: [
            {
                start: 2,
                end: 4.5,
                trText: 'Ben sana büyü yapmışım.',
                enText: 'Apparently I\'ve cast a spell on you.',
                grammar: 'Indirect / Evidential Past Tense (yap-mış-ım) + Dative Personal Pronoun (sen -> san-a)',
                vocab: [
                    { word: 'Büyü yapmak', trMeaning: 'Sihir yapmak, birini büyülemek', meaning: 'To cast a spell / to bewitch / to charm (takes Dative "-e/-a")' },
                    { word: 'Büyü', trMeaning: 'Sihir, büyücülük', meaning: 'Magic / spell / witchcraft' }
                ]
            },
            {
                start: 5,
                end: 7,
                trText: 'Cadıymışım ben.',
                enText: 'They say I\'m a witch.',
                grammar: 'Nominal Sentence with Evidential Copula (cadı-y-mış-ım | "I was reportedly..." / "They say I am...")',
                vocab: [
                    { word: 'Cadı', trMeaning: 'Kötü sihir yapan kadın', meaning: 'Witch' }
                ]
            },
            {
                // NOT: Bu satır eskiden iki kez (10-11sn ve 10.5-11.5sn olarak)
                // tanımlıydı -- YouTube caption export'unun yaygın bir hatası
                // olan, aynı repliğin çakışan zaman damgalarıyla tekrarı.
                // Tek, biraz daha geniş bir aralıkta birleştirildi.
                start: 10,
                end: 11.5,
                trText: 'Gülme.',
                enText: 'Don\'t laugh.',
                grammar: 'Negative Imperative for Second Person Singular (gül-me)',
                vocab: [
                    { word: 'Gülmek', trMeaning: 'Neşelenip ses çıkarmak', meaning: 'To laugh / to smile' }
                ]
            },
            {
                start: 12,
                end: 13,
                trText: 'Ciddiyim.',
                enText: 'I\'m serious.',
                grammar: 'Nominal Sentence / Present Copula with Buffer Consonant (ciddi-y-im)',
                vocab: [
                    { word: 'Ciddi', trMeaning: 'Şakacı olmayan, ciddiye alan', meaning: 'Serious / earnest' }
                ]
            },
            {
                start: 14,
                end: 17,
                trText: 'Anlamıyorum, neden kimse beni sevmiyor?',
                enText: 'I don\'t understand, why does nobody love me?',
                grammar: 'Present Continuous Negative (anla-mı-yor-um / sev-mi-yor) + Accusative Pronoun (ben -> ben-i)',
                vocab: [
                    { word: 'Anlamak', trMeaning: 'Kavramak, idrak etmek', meaning: 'To understand' },
                    { word: 'Sevmek', trMeaning: 'Birine sevgi duymak, hoşlanmak', meaning: 'To love / to like' },
                    { word: 'Kimse', trMeaning: 'Hiç kimse, hiçbir kişi', meaning: 'Nobody / anyone (used with negative verbs to mean "nobody")' },
                    { word: 'Neden', trMeaning: 'Niçin, niye', meaning: 'Why' }
                ]
            }
        ],
        likes: '55K', saves: '15K'
    },
    {
        id: 'reel_my_2', series: 'Muhteşem Yüzyıl', location: 'Topkapı Sarayı',
        youtubeId: 'ynVII7uwqs4',
        subtitles: [
            {
                start: 0,
                end: 1.5,
                trText: 'Hünkarım.',
                enText: 'My Sultan.',
                grammar: 'First Person Singular Possessive Suffix (hünkar-ım) | Respectful Address',
                vocab: [
                    { word: 'Hünkarım', trMeaning: 'Sultanlık unvanı, saygılı hitap', meaning: 'My Sultan / my sovereign / my emperor (from "Hünkar")' }
                ]
            },
            {
                start: 2,
                end: 4.5,
                trText: 'Baharda Manisa\'ya gidelim.',
                enText: 'Let\'s go to Manisa in spring.',
                grammar: 'Locative Case (bahar-da) + Dative Case with Proper Noun & Buffer (Manisa-\'ya) + First Person Plural Optative / Suggestion (gid-elim)',
                vocab: [
                    { word: 'Bahar', trMeaning: 'İlkbahar mevsimi', meaning: 'Spring (season)' },
                    { word: 'Gitmek', trMeaning: 'Bir yerden ayrılıp başka yere yönelmek', meaning: 'To go' },
                    { word: 'Manisa', trMeaning: 'Batı Türkiye\'de bir şehir (şehzadeler şehri)', meaning: 'A city in western Turkey (historically known as the city of princes)' }
                ]
            },
            {
                start: 5.5,
                end: 6.5,
                trText: 'Birlikte.',
                enText: 'Together.',
                grammar: 'Adverb of Manner (derived from bir-lik-te | literally: "in oneness")',
                vocab: [
                    { word: 'Birlikte', trMeaning: 'Beraber, bir arada', meaning: 'Together / jointly' }
                ]
            },
            {
                start: 7,
                end: 9,
                trText: 'Eski günleri yad ederiz.',
                enText: 'We\'ll reminisce about the old days.',
                grammar: 'Accusative Case Direct Object (gün-ler-i) + Compound Verb with Habitual Aorist (yad ed-er-iz)',
                vocab: [
                    { word: 'Yad etmek', trMeaning: 'Anıları hatırlamak, anmak', meaning: 'To reminisce / to commemorate / to remember fondly' },
                    { word: 'Eski günler', trMeaning: 'Geçmişteki günler, eski zamanlar', meaning: 'Old days / the past' }
                ]
            },
            {
                start: 12.5,
                end: 14,
                trText: 'Gidelim İbrahim.',
                enText: 'Let\'s go, Ibrahim.',
                grammar: 'First Person Plural Optative / Suggestion (gid-elim) + Vocative Address',
                vocab: [
                    { word: 'Gidelim', trMeaning: 'Haydi gidelim, gitmek istiyorum', meaning: 'Let\'s go' },
                    { word: 'İbrahim', trMeaning: 'Erkek ismi', meaning: 'A male given name (Abraham)' }
                ]
            },
            {
                start: 14,
                end: 16,
                trText: 'Bahar gelsin, gideriz.',
                enText: 'When spring comes, we\'ll go.',
                grammar: 'Third Person Singular Imperative / Jussive Mood (gel-sin) + Habitual Aorist / Simple Present (gid-er-iz)',
                vocab: [
                    { word: 'Gelmek', trMeaning: 'Bir yere varmak, ulaşmak', meaning: 'To come' },
                    { word: 'Gideriz', trMeaning: 'Biz gideriz, gitmek âdetimizdir', meaning: 'We (will) go / we usually go' }
                ]
            }
        ],
        likes: '48K', saves: '10K'
    }
];
