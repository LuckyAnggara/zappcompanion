# Initial Concept

Saya ingin membuat aplikasi desktop menggunakan Electron yang berfungsi sebagai pendamping (companion app) untuk sebuah website frontend. Aplikasi ini akan menggunakan package Node.js yt-dlp-exec (fork dari microlinkhq/youtube-dl-exec) untuk menjalankan binary yt-dlp secara lokal di komputer pengguna. Ini bertujuan untuk memindahkan beban unduhan dan biaya bandwidth dari server ke sisi pengguna.

Spesifikasi Arsitektur & Teknologi:

Framework: Electron.js (Gunakan versi stabil terbaru).

Core Dependency: yt-dlp-exec untuk eksekusi yt-dlp. Aplikasi harus memastikan binary yt-dlp diunduh/tersedia secara otomatis saat aplikasi dijalankan (fitur bawaan yt-dlp-exec).

Local API (The Bridge): Main process Electron harus menjalankan server HTTP sederhana (gunakan Express.js atau http bawaan Node) yang mendengarkan pada port lokal (misalnya: 4000).

Security (CORS): Server lokal wajib mengimplementasikan kebijakan CORS. Server hanya boleh menerima request dari domain frontend spesifik (misal: https://my-downloader-web.app atau http://localhost:3000 untuk dev). Request dari domain lain harus diblokir.

UI (Renderer Process): Gunakan HTML/CSS/JS sederhana (atau framework frontend jika kamu sarankan) untuk UI internal aplikasi.

Fitur yang Harus Diimplementasikan:

A. Fitur UI Internal (Download Langsung di App):

Input URL: Kolom input untuk menyisipkan URL video (YouTube, dll.).

Tombol Download: Tombol untuk memulai proses unduhan.

Indikator Progress: Progress bar atau teks persen yang menunjukkan status unduhan saat ini (gunakan event progress dari yt-dlp-exec).

Lokasi Simpan: Unduhan harus otomatis disimpan ke folder 'Downloads' pengguna (gunakan app.getPath('downloads')).

Log/Status: Area teks untuk menampilkan log output dari yt-dlp jika terjadi error.

B. Fitur Bridge (Localhost API untuk Web App):

GET /ping: Endpoint sederhana untuk mengecek apakah Companion App sudah berjalan dan siap. Kembalikan { status: "ok" }.

POST /download:

Menerima JSON body: { "url": "..." }.

Memvalidasi URL.

Memicu yt-dlp-exec di Main process untuk mengunduh video ke folder Downloads pengguna.

Kembalikan respons segera: { "status": "downloading", "message": "Unduhan dimulai di latar belakang." }.

Opsional (Lanjut): Implementasikan mekanisme untuk memberi tahu frontend tentang kemajuan (misalnya melalui WebSocket atau polling terpisah, tapi untuk tahap awal, respons sukses cukup).

Output yang Diharapkan:

Struktur File: Struktur folder project Electron yang rapi.

package.json: Berisi semua dependency yang diperlukan (electron, yt-dlp-exec, express, cors).

main.js: Kode lengkap untuk Main process, termasuk pembuatan window, setup Express server, penanganan CORS, dan logika yt-dlp-exec.

preload.js: Kode bridge yang aman (menggunakan contextBridge dan ipcRenderer) untuk menghubungkan UI Internal dengan Main process untuk fitur download internal.

index.html & renderer.js: UI sederhana untuk fitur download internal.

Instruksi: Langkah-langkah cara menginstal dependency, menjalankan aplikasi dalam mode dev, dan cara mengetes koneksi dari website frontend (contoh fetch request).

Instruksi Tambahan:

Pastikan untuk menangani error dengan baik (misalnya URL tidak valid, yt-dlp gagal, port sibuk).

Gunakan sintaks ES6 Modern.

Berikan komentar pada bagian penting kode, terutama pada konfigurasi CORS dan eksekusi child process. pastikan CORS & Mixed Content: Karena website Anda kemungkinan menggunakan https://, sementara aplikasi lokal berjalan di http://localhost, Anda harus mengatur konfigurasi keamanan (CORS) di aplikasi lokal agar browser tidak memblokir koneksi tersebut. dan buat UI STYLE nya itu brutalism dengan warna dominan orange putih biru dan lainnya

---

# Product Guide: yt-dlp Companion App

## Overview

This Electron desktop application acts as a companion "bridge" for a web-based frontend. It leverages `yt-dlp-exec` to securely offload video downloading tasks directly to the user's local machine, reducing server bandwidth and infrastructure costs.

## Target Audience

**Frontend Users:** The application is designed to be a seamless background bridge for users of the frontend app, making the download process invisible and frictionless while offering robust features when the app UI is opened.

## UI/UX Flow & Aesthetics

**Advanced Brutalism:**

- The user interface embraces a brutalist design philosophy with bold orange, white, and blue as dominant colors.
- Features include a download queue, a history list, and an area for detailed logs.
- The UI contains an input field for video URLs, a download button, and progress indicators showing download status in real-time.

## Core Features

1. **Local API (The Bridge):**
   - Runs a lightweight Express.js HTTP server on a local port (e.g., 4000).
   - Provides an endpoint (`GET /ping`) to check readiness.
   - Provides a download endpoint (`POST /download`) that triggers `yt-dlp-exec` and saves files to the user's 'Downloads' folder.
2. **Security & CORS:**
   - Enforces **Strict CORS** to ensure only authorized frontend domains (e.g., production URL and `localhost:3000` for development) can connect.
   - Includes **Dynamic CORS** functionality, allowing advanced users to configure or add allowed domains via application settings.
3. **Internal UI Downloading:**
   - Users can manually paste URLs and download videos directly within the companion app, bypassing the web frontend if needed.
   - Real-time progress bars, completion status, and error logs are fully visible.

## Technical Requirements

- **Framework:** Electron.js (Latest Stable)
- **Local Server:** Express.js or Node.js built-in HTTP module.
- **Process Management:** `yt-dlp-exec` to handle binary downloads and execution.
- **Bridge Architecture:** Uses `contextBridge` and `ipcRenderer` in `preload.js` to securely connect the Internal UI to the Main Process.
