const fs = require('fs');

const file = 'js/state.js';
let content = fs.readFileSync(file, 'utf8');

const translations = {
    "Sen neye baktın?": "What did you look at?",
    "Bakıyordum öyle karar veremedim.": "I was just looking, couldn't decide.",
    "Neye bakıyon lan!": "What are you looking at, man!",
    "Kurabiye var simit var neye bakıyon?": "There's cookies, there's bagels, what are you looking at?",
    "Kardeşine hiç benzemiyor.": "He doesn't look like his brother at all.",
    "O senin görüşün,": "That's your opinion,",
    "herkes benzetir aslında...": "Actually, everyone thinks they look alike...",
    "Sen bir kere çok sarısın.": "For one thing, you are very blonde.",
    "Nolmuş ?": "So what?",
    "Sarıyım ama çirkin değilim en azından.": "I may be blonde, but at least I'm not ugly.",
    "Şşt, sarı!": "Hey, blondie!",
    "Bu yakıştı sana ha!": "This suits you, huh!",
    "Ulaşmak istedi ama uykunuzu bölmemek için biz sizi uyandırmadık.": "He wanted to reach you, but we didn't wake you up so as not to interrupt your sleep.",
    "Büyücüleri kahinleri bilirsiniz,": "You know sorcerers and oracles,",
    "diyar diyar gezerler.": "they wander from land to land.",
    "Gidecek yolu varmış demek ki.": "It means he had a road to travel.",
    "Böyle, içimizden ona iyi yolculuklar dileyelim mi ?": "Shall we silently wish him a good journey?",
    "Haşarya anan aynı sen he!": "Your mischievous mother is just like you, eh!",
    "Ne kadar inanarak boş konuşuyor görüyor musun ?": "Do you see how convincingly he speaks nonsense?",
    "Sion, ben artık bir kralım ve her kralın bir mantoru olur.": "Sion, I am a king now, and every king has a mentor.",
    "Çok teşekkür ederim hepinize buraya kadar geldiğiniz için.": "Thank you all very much for coming all this way.",
    "Açıkçası bu kadar yüksek bir katılım ben de beklemiyordum, çok mutlu oldum.": "Honestly, even I wasn't expecting such a high turnout, I am very happy.",
    "Gelmeyen boğdurulacak demişsiniz.": "You reportedly said 'Those who don't come will be strangled.'",
    "Sus be!": "Shut up!",
    "Ne alakası var, kimseyi zorla tutmuyorum!": "What does that have to do with it, I'm not holding anyone by force!",
    "Örnek Altyazı 1": "Example Subtitle 1",
    "Örnek Altyazı 2": "Example Subtitle 2",
    "Ben sana büyü yapmışım.": "They say I cast a spell on you.",
    "Cadıymışım ben.": "They say I am a witch.",
    "Gülme.": "Don't laugh.",
    "Ciddiyim.": "I'm serious.",
    "Anlamıyorum, neden kimse beni sevmiyor?": "I don't understand, why does nobody love me?",
    "Hünkarım.": "My Sultan.",
    "Baharda Manisa'ya gidelim.": "Let's go to Manisa in the spring.",
    "Birlikte.": "Together.",
    "Eski günleri yad ederiz.": "We can reminisce about the old days.",
    "Gidelim İbrahim.": "Let's go, Ibrahim.",
    "Bahar gelsin, gideriz.": "Let spring come, and we shall go."
};

let modified = false;

content = content.replace(/(trText:\s*['"])(.*?)(['"],)(\s*grammar)/g, (match, p1, p2, p3, p4) => {
    let unescaped = p2.replace(/\\'/g, "'");
    let en = translations[unescaped];
    if (en) {
        modified = true;
        let enEscaped = en.replace(/'/g, "\\'");
        return `${p1}${p2}${p3}\n                enText: '${enEscaped}',${p4}`;
    } else {
        console.log("Missing translation for:", unescaped);
    }
    return match;
});

content = content.replace(/(trText:\s*['"])(Örnek Altyazı \d)(['"],)( grammar)/g, (match, p1, p2, p3, p4) => {
    return `${p1}${p2}${p3} enText: 'Example Subtitle',${p4}`;
});

fs.writeFileSync(file, content);
console.log('Modified state.js:', modified);
