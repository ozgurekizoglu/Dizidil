# Dizidil'i Çalıştırma

Bu uygulama ES Module (`import`/`export`) kullanıyor, bu yüzden `index.html`'i
çift tıklayıp doğrudan tarayıcıda açmak **çalışmaz** (tarayıcı güvenlik
kısıtlaması). Basit bir yerel sunucu üzerinden açılması gerekiyor — bu çok
kolay, aşağıdaki iki yoldan biriyle 1 dakikada yapılır.

## Yöntem 1 — Terminal (Mac'inizde zaten var, kurulum gerekmez)

1. Terminal'i açın
2. Bu klasöre gidin (klasörü Terminal'e sürükleyip bırakabilirsiniz, yolu otomatik yazar):
   ```
   cd "dizidil version aydin"
   ```
3. Şunu çalıştırın:
   ```
   python3 -m http.server 8000
   ```
4. Tarayıcıda şu adresi açın: **http://localhost:8000**
5. Bitirince Terminal'de `Control + C` ile sunucuyu durdurabilirsiniz.

## Yöntem 2 — VS Code "Live Server" eklentisi (eğer VS Code kullanıyorsanız)

1. VS Code'da Extensions (sol kenar çubuğu) → "Live Server" ara → kur
2. `index.html` dosyasına sağ tıkla → **"Open with Live Server"**
3. Otomatik olarak tarayıcıda açılacak

## Demo Günü İçin Önemli Not

Videolar gerçek YouTube oynatıcısı üzerinden geliyor. Eğer demo yapacağınız
hesap/cihazda **YouTube Premium yoksa**, bazı videolarda reklam çıkabilir.
Sunum yapacağınız cihazda önceden bir kere test edin; mümkünse kendi
Premium hesabınızın o tarayıcıda/cihazda giriş yapmış olduğundan emin olun.
