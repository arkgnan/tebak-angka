# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada **Tebak Angka - Simulasi Edukasi Ilusi Probabilitas Judi Online**! Proyek ini bersifat sumber terbuka (*open-source*) di bawah lisensi **MIT**.

---

## Prasyarat Lingkungan Pengembangan

Sebelum memulai, pastikan Anda telah memasang:
1. **Node.js**: Versi `>= 18.x` (disarankan Node.js LTS)
2. **npm** atau **yarn**
3. **Java Development Kit (JDK)**: Versi 17 (dibutuhkan untuk kompilasi Android Gradle)
4. **Android Studio & Android SDK**:
   - SDK Platform Android 14 (API 34) / Android 15 (API 35) / Android 16 (API 36)
   - Android SDK Build-Tools
   - Android Emulator atau perangkat fisik dengan USB Debugging aktif

---

## Langkah Memulai (Getting Started)

### 1. Fork & Clone Repositori
```bash
# Fork repositori ini ke akun GitHub Anda, lalu clone:
git clone https://github.com/<username-anda>/tebak-angka.git
cd tebak-angka
```

### 2. Pasang Dependensi
```bash
npm install
```
*Catatan: Perintah `postinstall` akan secara otomatis menerapkan `patch-package` yang diperlukan untuk kompatibilitas native.*

### 3. Siapkan Konfigurasi Lingkungan (`.env`)
Salin file template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Secara default, nilai variabel diisi dengan **Google Test Ad IDs** resmi agar aman saat dijalankan di emulator atau mode pengujian.

### 4. Siapkan File Konfigurasi Firebase (`google-services.json`)
Salin file template dummy ke root project:
```bash
cp google-services.json.example google-services.json
cp google-services.json.example android/app/google-services.json
```
*Jika Anda ingin menguji fitur Google Sign-In dengan proyek Firebase Anda sendiri, unduh `google-services.json` asli dari Firebase Console Anda dan letakkan di kedua lokasi tersebut. File ini sudah diabaikan oleh `.gitignore` sehingga tidak akan ter-commit.*

### 5. Menjalankan Aplikasi
```bash
# Menjalankan Metro Bundler
npx expo start

# Atau menjalankan langsung ke emulator / device Android native
npm run android
```

---

## Alur Pengembangan & Pengajuan Kontribusi (Workflow)

1. **Buat Branch Baru:**
   Gunakan nama branch yang deskriptif:
   ```bash
   git checkout -b feat/nama-fitur-anda
   # atau
   git checkout -b fix/perbaikan-bug
   ```

2. **Lakukan Perubahan:**
   - Patuhi arsitektur kode yang sudah ada (React Native, Redux Toolkit, TypeScript).
   - Pastikan tidak ada kredensial pribadi atau ID unit iklan produksi yang di-*hardcode* di dalam kode.
   - Periksa tipe TypeScript sebelum melakukan commit:
     ```bash
     npx tsc --noEmit
     ```

3. **Format Pesan Commit:**
   Kami menyarankan format *Conventional Commits*:
   - `feat: deskripsi fitur baru`
   - `fix: deskripsi perbaikan bug`
   - `docs: pembaruan dokumentasi`
   - `refactor: perubahan struktur kode tanpa mengubah fungsionalitas`

4. **Kirimkan Pull Request (PR):**
   - Push branch ke fork GitHub Anda:
     ```bash
     git push origin feat/nama-fitur-anda
     ```
   - Buka Pull Request ke branch `main` repositori utama.
   - Jelaskan latar belakang perubahan, solusi yang diterapkan, dan cara pengujiannya.

---

## Pertanyaan atau Masalah?
Silakan buka [GitHub Issue](https://github.com/arkgnan/tebak-angka/issues) untuk berdiskusi atau melaporkan *bug*.
