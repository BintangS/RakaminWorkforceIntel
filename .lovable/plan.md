
# Redesign: Light Theme + Uber Type + Declutter

Tujuannya bukan reskin — ini bongkar ulang taste & hierarchy. Sekarang appnya dark, padet teks, tiap page nembak 5-6 ide sekaligus. Habis ini: terang, lapang, satu pesan utama per page.

## Design system baru

**Warna (broken white, Claude-ish):**
- `--bg`: #F5F4EE (broken white, sedikit warm)
- `--sf`: #FFFFFF (kartu/panel)
- `--sf2`: #EFEDE4 (subtle surface, hover)
- `--bd`: #E4E1D6 (border halus)
- `--tx`: #1F1E1B (teks utama, hampir hitam tapi warm)
- `--tx2`: #6B6A63 (teks sekunder)
- `--tx3`: #9C9A90 (meta)
- `--ac`: #C96442 (terracotta Claude-ish, dipakai hemat — CTA & highlight only)
- `--dg`: #B83A26 (risk High)
- `--wn`: #B7791F (risk Medium)
- `--ok`: #3F7D58 (risk Low / positive)
- `--in`: #2F5F8F (info / human review)

Semua dipindah ke `src/styles.css` sebagai oklch tokens. Komponen lama yang hardcode `var(--bg)` dark akan auto-flip karena nama tokennya sama.

**Typography (Uber Move family):**
- Heading display: **Uber Move** (kalau lisensi nggak ada di web font CDN, fallback ke **Inter Tight** dengan tracking ketat — visualnya 95% mirip Uber Move)
- Body/UI: **Uber Move Text** → fallback **Inter**
- Mono: **JetBrains Mono** (untuk ID & angka)
- Scale dipangkas: hanya 5 ukuran (28 / 20 / 15 / 13 / 11), bukan 9 ukuran kayak sekarang
- Numeric tabular by default untuk angka

Cara loadnya: `<link>` ke font yang available (Inter Tight + Inter dari Google Fonts), lalu di CSS aliasnya jadi `"Uber Move"` dengan `font-family: "Uber Move", "Inter Tight", system-ui`. Kalau nanti user upload file Uber Move beneran, tinggal `@font-face` swap.

## Declutter prinsip

Setiap page sekarang aku audit dengan aturan **"satu pertanyaan, satu jawaban utama"**:

| Page | Pertanyaan utama | Yang dihapus / dipindah |
|---|---|---|
| Overview | Berapa employee at risk & kemana arah aksinya | Hero alert panjang → 1 kalimat. 90-day roadmap → dipindah ke section bawah collapsible. 4 stat card → 3 stat (gabung redundant) |
| Attrition | Siapa yang harus di-action minggu ini | Filter berderet → 1 search + 2 dropdown. Kolom tabel: 10 → 6 |
| Review Queue | Mana kasus yang nunggu manusia | Card → list row tipis. Reason di-truncate, expand on click |
| Productivity | Department mana yang signalnya lemah | Methodology note panjang → tooltip ikon "?". Grid signal → 1 ranked list |
| Reskilling | Track apa, siapa pesertanya | AI Literacy & role tracks → 2 tab, bukan 2 section stacked |
| Obsolescence | Role mana yang risikonya kritis | Source cards (WEF/Gartner/McKinsey) → footnote kecil di bawah, bukan 3 kartu besar |
| Data Quality | Sebelum vs sesudah cleaning | Side-by-side tetap, tapi insight chips dipangkas dari 6 → 3 |
| Employee detail | Profil + rekomendasi aksi | Section dipersempit jadi 5 (sekarang 8), banyak panel digabung |

## Layout shell

- Sidebar tetap kiri, tapi lebih tipis (220px), label only, ikon dihapus (icon + label = noise di light theme)
- Topbar: cuma page title + dataset toggle (messy/clean). Breadcrumb dihapus.
- Content max-width: 1100px, padding generous (32px). Sekarang full-bleed bikin mata capek.
- Card style: flat, 1px border, no shadow. Radius 8px. Hover = bg shift halus, bukan border glow.

## Workflow eksekusi (di build mode)

1. **Capture current state** — screenshot Overview & Attrition sekarang sebagai anchor
2. **Generate 3 design directions** via `design--create_directions` dengan palette + font + layout intent yang udah dipin di atas (LOCKED — 3 variant cuma beda di density/composition/emphasis)
3. **Tampilkan ke kamu** — pilih satu
4. **Implement** direction yang dipilih:
   - Rewrite `src/styles.css` dengan token light theme
   - Update `src/components/ui-rakamin.tsx` (StatCard, RiskBadge, ConfidenceBar, Alert, Section) supaya minim-ink
   - Rewrite `AppShell.tsx` untuk sidebar tipis + topbar minimal
   - Per-page declutter sesuai tabel di atas (8 route files)
   - Tambah `<link>` font di `__root.tsx`

## Yang TIDAK berubah

- Data layer (`src/data/*`) — tetap
- Routing & dataset toggle logic — tetap
- Isi informasi strategis (claim, angka, rekomendasi) — tetap akurat, cuma cara presentasinya yang dirombak

## Risiko / trade-off yang perlu kamu setujui

- **Uber Move font lisensi**: bukan open-source. Aku pakai Inter Tight sebagai stand-in yang visualnya sangat mirip. Kalau kamu punya file resmi, kasih ke aku nanti.
- **Aksen warna minim**: terracotta cuma di CTA & High risk. Mungkin awal-awal kerasa "kurang berwarna" dibanding dark theme sekarang — itu intentional (Claude vibe).
- **Beberapa info pindah ke collapsible / tooltip**, jadi butuh 1 klik ekstra. Trade-off untuk less cluttered.

Approve plan ini dan aku langsung mulai dari step 1 (screenshot + generate 3 directions) di build mode.
