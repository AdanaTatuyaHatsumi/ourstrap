# Ourstrap

Ourstrap — framework UI ringan, modern, dan mudah dikustom untuk membuat antarmuka web dengan cepat.

Dibuat oleh **Kasirun Alfauzi BM Sitorus**. File ini menjelaskan cara instalasi, struktur, dan workflow dasar untuk mengembangkan Ourstrap.

---

## Fitur utama

* Grid 12 kolom dan utilitas dasar
* Komponen siap pakai: Buttons, Badges, Alerts, Cards, Navbar, Modal, Tabs, Dropdown, Pagination, Progress, Tooltip, Toast, Accordion, Stepper
* Aksesibilitas dasar (focus, ARIA pada komponen penting)
* Versi readable (`ourstrap.css` / `ourstrap.js`) dan minified (`ourstrap.min.css` / `ourstrap.min.js`)
* Workflow build sederhana (Sass, PostCSS, Terser)

---

## Struktur project (direkomendasikan)

```
ourstrap/
├─ README.md
├─ LICENSE
├─ package.json
├─ postcss.config.cjs
├─ .gitignore
├─ scss/              # (opsional) source SCSS
├─ css/
│  ├─ ourstrap.css
│  ├─ ourstrap.min.css
│  └─ custom.css
├─ js/
│  ├─ ourstrap.js
│  └─ ourstrap.min.js
├─ docs/
│  └─ ourstrap-doc.html
├─ examples/
├─ assets/
└─ dist/              # (opsional) build artefacts siap deploy
```

# assets/

Folder ini menyimpan file statis yang dipaket bersama Ourstrap:
- `images/` — logo, placeholder, favicon, dan aset gambar contoh.
- `fonts/` — file font self-hosted (woff2 / woff / ttf). **JANGAN** commit file font yang memiliki lisensi tertutup tanpa izin.

Rekomendasi:
- Simpan webfont (woff2) di `assets/fonts/`, dan import lewat `css/fonts.css` (contoh ada di repo root).
- Gunakan SVG untuk logo & plain placeholders agar ringan dan mudah diubah warna.
- Untuk favicon, buatkan versi `.ico` / `.png` di root jika perlu (contoh: `favicon.ico`).

Contoh perintah untuk membuat `.gitkeep` agar folder tetap muncul di git:
```bash
mkdir -p assets/images assets/fonts
touch assets/images/.gitkeep assets/fonts/.gitkeep
```

# assets/fonts/

Letakkan file font self-hosted di sini (format woff2 direkomendasikan).

Contoh file yang bisa ditaruh:
- Inter-Variable.woff2
- Inter-Regular.woff2
- Inter-Bold.woff2

Contoh penggunaan (letakkan di `css/fonts.css` dan import ke HTML):
```css
@font-face {
  font-family: 'Inter';
  src: url('../assets/fonts/Inter-Variable.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

:root { --ui-font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
body { font-family: var(--ui-font); }
```

---

## Prasyarat

* Node.js (LTS direkomendasikan)
* npm

---

## Instalasi & build (cepat)

Salin repo atau file ke folder `ourstrap/`, lalu:

```bash
cd ourstrap
npm install
```

Build sekali (CSS readable → CSS minified → JS minified):

```bash
npm run build
```

Jika mau auto-compile SCSS saat develop:

```bash
npm run watch:css
```

---

## Skrip `package.json` (yang direkomendasikan)

```json
{
  "scripts": {
    "build:css": "sass scss/ourstrap.scss css/ourstrap.css --style=expanded",
    "minify:css": "postcss css/ourstrap.css -o css/ourstrap.min.css",
    "build:js": "terser js/ourstrap.js -c -m -o js/ourstrap.min.js",
    "build": "npm run build:css && npm run minify:css && npm run build:js",
    "watch:css": "sass --watch scss/ourstrap.scss css/ourstrap.css --style=expanded"
  }
}
```

---

## Cara pakai (HTML contoh)

Gunakan versi minified untuk produksi:

```html
<link rel="stylesheet" href="css/ourstrap.min.css">
<script src="js/ourstrap.min.js" defer></script>
```

Untuk development, gunakan file readable agar gampang debug:

```html
<link rel="stylesheet" href="css/ourstrap.css">
<script src="js/ourstrap.js" defer></script>
```

Contoh komponen singkat:

```html
<button class="btn btn-primary">Primary</button>
<button data-modal-open="modal-m1" class="btn">Buka Modal</button>
<div id="modal-m1" class="os-modal" aria-hidden="true">...</div>
```

---

## Tips development

* Gunakan `scss/` untuk source dan partials (`_variables.scss`, `_components.scss`) untuk kemudahan maintenance.
* Simpan override proyek di `css/custom.css` dan import setelah `ourstrap.min.css`.
* Jalankan Lighthouse / axe-core untuk pemeriksaan aksesibilitas.
* Jangan commit file `node_modules/` dan `dist/` — gunakan `.gitignore`.

---

## Contributing

1. Fork repository
2. Buat branch: `feature/nama-fitur`
3. Commit perubahan dengan pesan jelas
4. Kirim PR — sertakan deskripsi perubahan dan alasan

---

## Lisensi

Ourstrap diberikan di bawah lisensi **MIT**. Lihat file `LICENSE` untuk detail.

---

## Kontak

Dibuat oleh Kasirun Alfauzi BM Sitorus — [kasirunsitorus@gmail.com](mailto:kasirunsitorus@gmail.com)
