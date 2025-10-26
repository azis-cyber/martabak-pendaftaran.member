# Aplikasi Pendaftaran Member Martabak Juara

Ini adalah repositori untuk aplikasi web pendaftaran dan manajemen member untuk bisnis "Martabak Juara". Aplikasi ini dibuat menggunakan React, TypeScript, dan Firebase, serta diintegrasikan dengan Gemini API untuk fungsionalitas AI.

## Fitur Utama

- **Pendaftaran & Login Member:** Alur pendaftaran dan login yang aman untuk pelanggan.
- **Dashboard Member:** Member dapat melihat poin, riwayat penukaran, dan mengelola profil mereka.
- **Dashboard Admin:** Panel admin untuk mengelola member, inventaris, dan menyetujui penukaran poin.
- **Sistem Poin & Penukaran:** Member bisa mendapatkan poin dari transaksi dan menukarkannya dengan hadiah.
- **Manajemen Inventaris:** Admin dapat melacak stok bahan baku.
- **Asisten AI Chatbot:** Sebuah chatbot cerdas yang didukung oleh Gemini API untuk menjawab pertanyaan pelanggan.

## Deployment

Proyek ini dikonfigurasi untuk deployment otomatis ke **GitHub Pages** menggunakan GitHub Actions. Setiap kali ada perubahan yang di-push ke branch `main`, alur kerja yang didefinisikan di `.github/workflows/deploy.yml` akan secara otomatis mempublikasikan versi terbaru dari situs.
