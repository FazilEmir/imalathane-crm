# 🏭 İmalathane CRM & Envanter Yönetim Sistemi

Cilt şapı, kantaşı ve rolon deodorant imalathanesi için geliştirilmiş kapsamlı CRM ve envanter takip sistemidir.

---

## 📋 Özellikler

### Müşteri Yönetimi
- Müşteri ekleme, düzenleme, silme
- Ürün bazlı özel fiyatlandırma (müşteriye özel iskonto)
- Firma bilgileri, iletişim, vergi numarası

### Sipariş Takibi
- Sipariş oluşturma ve düzenleme
- Müşteri seçildiğinde özel fiyatlar otomatik gelir
- Peşin / Vadeli ödeme seçenekleri
- Faturalı / Faturasız ayrımı + KDV hesaplama
- Durum takibi: Beklemede → Hazırlanıyor → Teslim Edildi / İptal
- Siparişten hazır koli stoku düşme

### Ödeme Yönetimi
- Tahsilat (gelen) ve Ödeme (giden) kayıtları
- Peşin / Vadeli ayrımı
- Faturalı / Faturasız + KDV hesaplama
- Vade tarihi takibi

### Envanter Takibi
- **Malzemeler:** Hammadde, ambalaj ve koli stokları
  - Kategoriye göre filtreleme (Hammadde / Ambalaj / Koli)
  - Düşük stok uyarıları
  - Hızlı stok ekleme
- **Hazır Koliler:** Üretilen koli stokları
  - Koli ve adet bazında gösterim

### Üretim Sistemi
- 5 üretim reçetesi tanımlı:
  - **Cilt Şapı Kolisi:** 144 kutu + 1 koli
  - **Mini Kantaşı 24'lük Koli:** 576 çubuk + 576 kapak + 24 paket + 1 koli
  - **Mini Kantaşı 40'lık Koli:** 960 çubuk + 960 kapak + 40 paket + 1 koli
  - **Kalem Kantaşı Kolisi:** 864 etiket + 72 kutu + 1 koli
  - **Rolon Deodorant Kolisi:** 24 şişe + 24 kapak + 24 etiket + 1 koli
- Malzeme yeterliliği kontrolü
- Maksimum üretilebilir koli hesaplama
- Otomatik malzeme düşümü
- Üretim geçmişi kaydı

### Gösterge Paneli
- Toplam müşteri, sipariş, ciro özeti
- Tahsilat / ödeme dengesi
- Son siparişler listesi
- Düşük stok uyarıları
- Hazır koli stok durumu

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js** (v18 veya üzeri) → https://nodejs.org adresinden indirin
- **npm** (Node.js ile birlikte gelir)

### Adım Adım Kurulum

1. **Bu klasörü masaüstüne kopyalayın** (zaten orada olmalı)

2. **Terminal / Komut İstemi açın** ve proje klasörüne gidin:
   ```
   cd Masaüstü/imalathane-crm
   ```
   Windows için:
   ```
   cd Desktop\imalathane-crm
   ```

3. **Bağımlılıkları yükleyin:**
   ```
   npm install
   ```

4. **Uygulamayı başlatın:**
   ```
   npm run dev
   ```

5. **Tarayıcınız otomatik açılacaktır.** Açılmazsa:
   ```
   http://localhost:3000
   ```
   adresine gidin.

### Uygulamayı Durdurmak
Terminal'de `Ctrl + C` tuşlarına basın.

---

## 📦 Dağıtım (Production Build)

Uygulamayı bir web sunucusuna yüklemek isterseniz:

```
npm run build
```

Bu komut `dist` klasörü oluşturur. Bu klasörü herhangi bir web sunucusuna yükleyebilirsiniz.

---

## 💾 Veri Saklama

- Tüm veriler **tarayıcının localStorage'ında** saklanır
- Her değişiklik otomatik kaydedilir
- Tarayıcıyı kapatıp açsanız bile verileriniz korunur
- **Ayarlar** sayfasından tüm verileri sıfırlayabilirsiniz

### ⚠️ Dikkat
- Tarayıcı verilerini temizlerseniz CRM verileri de silinir
- Farklı tarayıcılarda farklı veriler olur
- Önemli verilerinizin yedeğini alın

---

## 🛠️ Teknik Bilgiler

- **Frontend:** React 18
- **Build Tool:** Vite 5
- **Dil:** JavaScript (JSX)
- **Stil:** Inline CSS (harici bağımlılık yok)
- **Font:** DM Sans + Playfair Display (Google Fonts)
- **Veri:** localStorage API

---

## 📞 Destek

Bu uygulama Claude AI tarafından özel olarak tasarlanmıştır.
Ek özellik veya değişiklik talepleri için Claude'a danışabilirsiniz.
