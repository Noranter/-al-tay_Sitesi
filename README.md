# GalÇal '26 Lise Çalıştayı Web Sitesi

Bu proje, modern bir lise çalıştayı için tasarlanmış profesyonel bir bilgilendirme ve yönetim platformudur.

## Teknolojiler
- **Frontend/Backend:** Next.js 15 (App Router)
- **Veritabanı:** MongoDB (Mongoose)
- **Stil:** Vanilla CSS (CSS Modules)
- **İkonlar:** Lucide React
- **Auth:** JWT + HttpOnly Cookie

## Kurulum

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Veritabanı Ayarları:**
   `.env.local` dosyasını açın ve `MONGODB_URI` değişkenine MongoDB bağlantı dizginizi ekleyin.
   (Örn: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

3. **Admin Giriş Bilgileri:**
   Varsayılan olarak:
   - **Kullanıcı Adı:** `admin`
   - **Şifre:** `admin123`
   Bu bilgileri `.env.local` içinden değiştirebilirsiniz.

4. **Çalıştırın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızda `http://localhost:3000` adresini açın.

## Proje Yapısı
- `/src/app`: Sayfa ve API rotaları.
- `/src/models`: MongoDB veri modelleri.
- `/src/lib`: Veritabanı bağlantı konfigürasyonu.
- `/src/app/globals.css`: Tüm sitenin modern tasarım kodları.

## Özellikler
- **Responsive:** Mobil uyumlu tasarım.
- **Glassmorphism:** Modern ve premium UI.
- **Dark Mode:** Gece modu desteği.
- **Admin Panel:** İçeriklerin tamamını tarayıcı üzerinden yönetme imkanı.
- **SEO Uyumu:** Arama motorları için optimize edilmiş yapı.
