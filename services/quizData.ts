export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizTopic {
  id: string;
  title: string;
  icon: string;
  desc: string;
  color: string;
  questions: QuizQuestion[];
}

export const QUIZ_TOPICS: QuizTopic[] = [
  {
    id: "dopamine",
    title: "Psikologi Dopamin & Kecanduan",
    icon: "🧠",
    desc: "Bongkar bagaimana lampu, suara kemenangan palsu, dan hormon otak menjebak pemain judol.",
    color: "#00E5FF",
    questions: [
      {
        id: "dop1",
        question: "Mengapa bandar judi online sering memberi kemenangan mudah pada pemain baru?",
        options: [
          "Karena sistem belum mendeteksi identitas pemain",
          "Sebagai umpan psikologis agar otak dibanjiri dopamin dan terdorong deposit lebih besar",
          "Karena pemain baru memiliki keberuntungan alami",
          "Untuk memenuhi standar regulasi algoritma adil"
        ],
        correctIndex: 1,
        explanation: "Bandar menggunakan trik 'baiting'. Kemenangan awal sengaja diprogram untuk memicu lonjakan dopamin agar otak mengingat sensasi menang dan ingin mengulanginya dengan taruhan lebih besar."
      },
      {
        id: "dop2",
        question: "Apa yang dimaksud dengan efek 'Near-Miss' (nyaris menang) pada mesin slot dan roda putar?",
        options: [
          "Tanda bahwa algoritma mesin sudah hampir rusak",
          "Kondisi di mana kamu hanya berjarak 1 detik dari kemenangan sejati",
          "Trik visual di mana simbol berhenti tepat di samping jackpot agar otak merasa kemenangan sudah dekat",
          "Kesalahan teknis pada grafis permainan"
        ],
        correctIndex: 2,
        explanation: "Efek Near-Miss (seperti simbol 7-7-bom atau jarum 1 milimeter dari jackpot) sengaja diprogram bandar untuk memicu dopamin setara kemenangan nyata, sehingga pemain terus memutar tanpa sadar."
      },
      {
        id: "dop3",
        question: "Hormon apa di otak yang paling bertanggung jawab atas rasa penasaran dan kecanduan judi online?",
        options: [
          "Dopamin",
          "Melatonin",
          "Insulin",
          "Tiroksin"
        ],
        correctIndex: 0,
        explanation: "Dopamin adalah hormon antisipasi dan penghargaan. Otak melepaskan dopamin paling tinggi bukan saat menang, melainkan saat 'menunggu hasil' yang tidak pasti."
      },
      {
        id: "dop4",
        question: "Apa istilah psikologis untuk dorongan terus bermain demi mengembalikan uang yang sudah hilang?",
        options: [
          "Loss Aversion Mastery",
          "Chasing Losses (Mengejar Kekalahan)",
          "Revenge Trading Success",
          "Gambler's Resilience"
        ],
        correctIndex: 1,
        explanation: "Chasing losses adalah jebakan fatal di mana pemain menaikkan taruhan karena panik ingin uangnya kembali, padahal ini justru mempercepat kebangkrutan hingga 100%."
      },
      {
        id: "dop5",
        question: "Mengapa judi online menggunakan musik riang, koin gemerincing, dan efek visual meriah saat pemain menang kecil?",
        options: [
          "Untuk menghibur pemain agar tidak bosan",
          "Karena format file audio bawaan memang demikian",
          "Untuk memanipulasi persepsi seolah pemain menang besar padahal jumlah kemenangan lebih kecil dari modal spin",
          "Sebagai pengingat waktu bermain"
        ],
        correctIndex: 2,
        explanation: "Teknik ini disebut 'Losses Disguised as Wins' (LDW). Taruhan 10.000 hanya kembali 4.000, tapi lampu dan suara meriah membuat otak tertipu merasa telah menang."
      },
      {
        id: "dop6",
        question: "Apakah mitos 'Jam Gacor' (jam tertentu pasti menang) memiliki dasar ilmiah?",
        options: [
          "Ya, karena server judi sepi pengunjung di dini hari",
          "Tidak, itu hanyalah taktik marketing affiliator untuk menarik pendaftar baru",
          "Ya, jika bermain tepat pada pergantian hari",
          "Tergantung sinyal provider internet"
        ],
        correctIndex: 1,
        explanation: "Jam gacor adalah mitos buatan para affiliator dan sindikat judol agar masyarakat terus memasang alarm dan bermain tanpa henti 24 jam sehari."
      },
      {
        id: "dop7",
        question: "Apa yang terjadi pada toleransi otak seseorang yang sudah kecanduan judi online?",
        options: [
          "Otak menjadi kebal dan tidak butuh bermain lagi",
          "Toleransi menurun sehingga taruhan kecil sudah memuaskan",
          "Toleransi meningkat sehingga butuh taruhan semakin besar untuk merasakan sensasi yang sama",
          "Kemampuan berhitung pemain meningkat drastis"
        ],
        correctIndex: 2,
        explanation: "Mirip kecanduan zat adiktif, reseptor dopamin menurun sensivitasnya sehingga pemain terdorong menaikkan nominal taruhan (eskalasi taruhan) yang berujung hutang."
      },
      {
        id: "dop8",
        question: "Bagaimana sistem 'Crash Game / Roket Aviator' mempermainkan psikologi pemain?",
        options: [
          "Dengan memanipulasi ketakutan ketinggalan untung (FOMO) dan keserakahan pemain",
          "Dengan menampilkan grafik pergerakan saham bursa nyata",
          "Dengan menguji kecepatan internet pemain",
          "Memberikan peluang adil sesuai keahlian mengetuk layar"
        ],
        correctIndex: 0,
        explanation: "Crash game memancing rasa serakah dan FOMO saat angka roket naik. Namun titik ledakan sudah diputuskan oleh server bandar sejak detik pertama permainan dimulai."
      },
      {
        id: "dop9",
        question: "Apa yang dimaksud dengan 'Gambler’s Fallacy' (Kesesatan Berpikir Penjudi)?",
        options: [
          "Keyakinan salah bahwa jika sudah sering kalah, putaran berikutnya pasti akan menang",
          "Anggapan bahwa judi online diawasi oleh OJK",
          "Keyakinan bahwa semua bandar judi adalah orang jujur",
          "Kecurigaan bahwa teman sendiri yang menjadi bandar"
        ],
        correctIndex: 0,
        explanation: "Setiap putaran acak bersifat independen atau diatur bandar. Kekalahan 10 kali berturut-turut sama sekali tidak meningkatkan peluang menang di putaran ke-11."
      },
      {
        id: "dop10",
        question: "Tanda utama seseorang sudah mulai kehilangan kendali atas kebiasaan judinya adalah...",
        options: [
          "Hanya bermain saat akhir pekan",
          "Mulai berbohong kepada keluarga mengenai keuangan dan meminjam uang untuk deposit",
          "Membaca tips keuangan di internet",
          "Menghapus riwayat browser"
        ],
        correctIndex: 1,
        explanation: "Menyembunyikan kondisi saldo, berbohong pada orang terdekat, dan berani berhutang untuk deposit adalah sinyal merah kecanduan judi tingkat lanjut."
      },
      {
        id: "dop11",
        question: "Mengapa istirahat sejenak (cooling-down) sangat dianjurkan saat seseorang mulai emosi dalam permainan taruhan?",
        options: [
          "Agar server bandar melakukan restart",
          "Untuk memulihkan koneksi internet",
          "Memberi waktu bagi bagian otak depan (Prefrontal Cortex) untuk berpikir rasional kembali",
          "Menunggu jam gacor berikutnya"
        ],
        correctIndex: 2,
        explanation: "Saat emosi atau panik karena kalah, otak emosional (amigdala) mengambil alih. Berhenti sejenak memungkinkan otak berpikir logis dan menghentikan kerugian."
      },
      {
        id: "dop12",
        question: "Apa cara paling efektif untuk memutus siklus kecanduan dopamin dari judi online?",
        options: [
          "Bermain di situs lain yang menjanjikan RTP lebih tinggi",
          "Berhenti total (cold turkey), hapus akses rekening/aplikasi, dan cari dukungan keluarga atau profesional",
          "Menurunkan nominal taruhan menjadi Rp 1.000",
          "Menonton video tutorial cara menang di YouTube"
        ],
        correctIndex: 1,
        explanation: "Satu-satunya cara menang melawan bandar adalah tidak bermain sama sekali. Memutus akses perbankan dan jujur kepada orang terdekat adalah langkah pertama pemulihan."
      }
    ]
  },
  {
    id: "pinjol",
    title: "Bahaya & Teror Pinjol Ilegal",
    icon: "💸",
    desc: "Kenali jeratan bunga mencekik, denda harian, dan teror sebar data yang selalu beriringan dengan judi online.",
    color: "#FF3D00",
    questions: [
      {
        id: "pj1",
        question: "Apa korelasi terbesar antara maraknya judi online dengan ledakan hutang pinjaman online (pinjol)?",
        options: [
          "Pemain judol yang kehabisan uang meminjam di pinjol karena panik ingin 'membalikkan modal'",
          "Pinjol memberikan cashback khusus untuk deposit judi",
          "Aplikasi judi online terdaftar resmi bersama pinjol OJK",
          "Pinjol mewajibkan peminjam bermain slot terlebih dahulu"
        ],
        correctIndex: 0,
        explanation: "Lebih dari 80% kasus kredit macet pinjol ilegal bermula dari pengguna yang panik kalah judol lalu nekat berhutang untuk mengejar kekalahan (chasing losses)."
      },
      {
        id: "pj2",
        question: "Ciri paling mencolok dari aplikasi pinjaman online (pinjol) ilegal adalah...",
        options: [
          "Bunga pinjaman transparan dan tertera di aplikasi",
          "Meminta akses seluruh kontak telepon, galeri foto, dan data pribadi di smartphone",
          "Terdaftar dan berizin resmi di Otoritas Jasa Keuangan (OJK)",
          "Menyediakan layanan pengaduan konsumen yang jelas"
        ],
        correctIndex: 1,
        explanation: "Pinjol ilegal selalu meminta izin akses kontak dan galeri foto untuk dijadikan senjata pemerasan dan intimidasi (sebar data) saat korban telat membayar."
      },
      {
        id: "pj3",
        question: "Jika kamu terjerat pinjol ilegal dengan bunga tidak masuk akal, langkah paling tepat yang harus dilakukan adalah...",
        options: [
          "Meminjam di pinjol lain untuk menutup pinjol pertama (gali lubang tutup lubang)",
          "Menjual seluruh perabot rumah secara diam-diam",
          "Lapor ke Satgas Waspada Investasi (OJK) dan kepolisian serta blokir nomor penagih teror",
          "Deposit slot lagi berharap menang jackpot untuk bayar hutang"
        ],
        correctIndex: 2,
        explanation: "Gali lubang tutup lubang hanya memperbesar lingkaran setan hutang. Laporkan ke Satgas PASTI (OJK) dan pihak berwajib, serta jangan pernah membayar bunga ilegal yang tidak masuk akal."
      },
      {
        id: "pj4",
        question: "Mengapa skema 'Gali Lubang Tutup Lubang' sangat berbahaya?",
        options: [
          "Karena bunga, biaya admin, dan denda akan bergulir menjadi bola salju yang melipatgandakan hutang berkali-kali lipat",
          "Karena aplikasi pinjol akan saling mengenal satu sama lain",
          "Karena limit pinjaman akan otomatis berkurang",
          "Karena waktu luang menjadi habis"
        ],
        correctIndex: 0,
        explanation: "Meminjam untuk membayar hutang lain hanya menunda bom waktu. Dalam hitungan minggu, hutang pokok 1 juta bisa membengkak menjadi puluhan juta akibat denda dan bunga harian."
      },
      {
        id: "pj5",
        question: "Berapa batas maksimal bunga pinjol resmi yang diawasi oleh OJK per harinya?",
        options: [
          "10% per hari",
          "0.1% hingga 0.3% per hari dan diatur ketat",
          "Bebas sesuai kesepakatan aplikasi",
          "5% per hari"
        ],
        correctIndex: 1,
        explanation: "OJK membatasi bunga pinjol legal maksimal 0.1% - 0.3% per hari. Sebaliknya, pinjol ilegal bisa mematok bunga 2% - 5% per hari tanpa batasan!"
      },
      {
        id: "pj6",
        question: "Apa risiko hukum dan sosial terberat jika nomor kontakmu dijadikan sasaran sebar data oleh pinjol ilegal?",
        options: [
          "Skor kredit di bank otomatis naik",
          "Pencemaran nama baik, teror ke rekan kerja/keluarga, hingga potensi kehilangan pekerjaan",
          "Aplikasi WhatsApp otomatis terhapus",
          "Mendapatkan kuota gratis dari provider"
        ],
        correctIndex: 1,
        explanation: "Teror kontak membuat keluarga, atasan kantor, dan teman ikut diteror, yang kerap memicu stres berat, kehancuran reputasi, hingga pemecatan kerja."
      },
      {
        id: "pj7",
        question: "Apakah uang pinjaman dari pinjol ilegal dapat dituntut secara perdata jika kontraknya melanggar hukum?",
        options: [
          "Perjanjian pinjol ilegal batal demi hukum karena tidak memenuhi syarat sah perjanjian menurut KUHPerdata",
          "Peminjam wajib dihukum penjara seumur hidup",
          "Polisi akan membantu menagih pinjol ilegal",
          "Bunga pinjol ilegal harus dibayar 10 kali lipat"
        ],
        correctIndex: 0,
        explanation: "Kemenko Polhukam dan OJK menegaskan pinjol ilegal tidak memiliki legal standing. Perjanjiannya cacat hukum, sehingga masyarakat diminta tidak membayar bunga pemerasan mereka."
      },
      {
        id: "pj8",
        question: "Tindakan apa yang harus dihindari saat smartphone menerima tawaran pinjaman instan via SMS / WhatsApp?",
        options: [
          "Menghapus pesan dan memblokir nomornya",
          "Mengeklik tautan (link APK) yang tidak dikenal dan mengunduh filenya",
          "Memeriksa status legalitas entitas di website resmi ojk.go.id",
          "Mengabaikan penawaran tersebut"
        ],
        correctIndex: 1,
        explanation: "Tautan APK via SMS/WA sering kali mengandung malware peretas SMS OTP perbankan atau spyware pencuri kontak smartphone."
      },
      {
        id: "pj9",
        question: "Siapakah pihak resmi pemerintah Indonesia yang bertugas memberantas pinjaman online ilegal dan investasi bodong?",
        options: [
          "Satgas PASTI (Pemberantasan Aktivitas Keuangan Ilegal) / SWI di bawah OJK",
          "Badan Meteorologi dan Geofisika (BMKG)",
          "Kementerian Kelautan dan Perikanan",
          "Dinas Perhubungan"
        ],
        correctIndex: 0,
        explanation: "Satgas PASTI (sebelumnya Satgas Waspada Investasi) adalah gabungan OJK, Kepolisian, Kominfo, dan instansi terkait untuk memblokir pinjol ilegal dan sindikat judol."
      },
      {
        id: "pj10",
        question: "Apa dampak psikologis paling berbahaya dari teror penagih hutang (debt collector) ilegal?",
        options: [
          "Pikiran menjadi lebih fokus dan produktif",
          "Gangguan kecemasan parah, depresi, trauma berkepanjangan, hingga keputusasaan",
          "Semangat berolahraga meningkat",
          "Mudah tidur nyenyak di malam hari"
        ],
        correctIndex: 1,
        explanation: "Tekanan psikologis akibat teror bertubi-tubi merusak kesehatan mental. Mengakui masalah kepada keluarga dan mencari konseling adalah kunci keselamatan."
      },
      {
        id: "pj11",
        question: "Jika seseorang terlanjur mentransfer uang ke rekening penampung pinjol ilegal, apakah uang itu bisa ditarik kembali?",
        options: [
          "Bisa ditarik dengan fitur refund di ATM",
          "Hampir mustahil karena dana langsung dicuci dan dialirkan ke rekening penampung berlapis",
          "Otomatis dikembalikan oleh bank pengirim dalam 1 jam",
          "Bisa ditukar dengan poin pulsa"
        ],
        correctIndex: 1,
        explanation: "Sindikat pinjol dan judol menggunakan rekening 'mule' (rekening titipan) yang langsung mencairkan dana dalam hitungan detik setelah transfer masuk."
      },
      {
        id: "pj12",
        question: "Bagaimana cara memeriksa apakah suatu perusahaan pinjol terdaftar resmi di OJK?",
        options: [
          "Melihat apakah iklannya ada di TikTok",
          "Memeriksa langsung di situs resmi ojk.go.id atau kontak WhatsApp resmi OJK 081-157-157-157",
          "Mempercayai logo OJK yang ditempel di brosur aplikasi",
          "Melihat testimoni di kolom komentar media sosial"
        ],
        correctIndex: 1,
        explanation: "Pinjol ilegal sering memalsukan logo OJK pada banner mereka. Selalu lakukan verifikasi mandiri melalui kontak resmi OJK 157 atau situs ojk.go.id."
      }
    ]
  },
  {
    id: "houseEdge",
    title: "House Edge & Matematika Peluang",
    icon: "📐",
    desc: "Pahami rumus Return to Player (RTP) dan bukti matematis mengapa tidak ada pemain yang bisa kaya dari judi.",
    color: "#FFD700",
    questions: [
      {
        id: "he1",
        question: "Apa arti istilah 'House Edge' dalam industri perjudian dan kasino?",
        options: [
          "Desain arsitektur bangunan tempat kasino berdiri",
          "Keunggulan persentase keuntungan matematis yang pasti didapatkan oleh bandar atas setiap taruhan",
          "Nama komunitas pemain judi profesional",
          "Bonus diskon deposit yang diberikan kepada pemain"
        ],
        correctIndex: 1,
        explanation: "House Edge adalah margin keuntungan pasti milik bandar. Berapapun kemenangan sementara pemain, hukum probabilitas menjamin bandar selalu mengantongi untung bersih dalam volume putaran."
      },
      {
        id: "he2",
        question: "Jika sebuah game memiliki RTP (Return to Player) 90%, apa artinya bagi pemain?",
        options: [
          "Pemain pasti untung 90% dari modalnya",
          "Setiap Rp 100.000 yang diputar, secara rata-rata pemain akan kehilangan Rp 10.000 ke kantong bandar",
          "Peluang menang adalah 90 kali dari 100 kali tebakan",
          "Game tersebut diawasi oleh pemerintah sebesar 90%"
        ],
        correctIndex: 1,
        explanation: "RTP 90% berarti bandar mengambil untung pasti 10%. Semakin banyak kamu memutar uangmu, modalmu akan tergerus eksponensial hingga mendekati Rp 0."
      },
      {
        id: "he3",
        question: "Dalam teori matematika peluang, apa bunyi 'Hukum Bilangan Besar' (Law of Large Numbers)?",
        options: [
          "Angka yang besar selalu membawa hoki",
          "Semakin banyak percobaan dilakukan, hasil aktual akan semakin mendekati nilai harapan matematis (keuntungan bandar)",
          "Pemain bermodal besar pasti bisa mengalahkan bandar",
          "Jumlah kerugian akan terhapus jika bermain lebih dari 1.000 kali"
        ],
        correctIndex: 1,
        explanation: "Law of Large Numbers membuktikan bahwa dalam jangka panjang, fluktuasi keberuntungan akan lenyap dan hasil akhir pasti sesuai persentase yang menguntungkan bandar 100%."
      },
      {
        id: "he4",
        question: "Apakah 'Sistem Martingale' (melipatgandakan taruhan setiap kali kalah) terbukti berhasil mengalahkan bandar?",
        options: [
          "Ya, matematika membuktikan sistem ini 100% anti-kalah",
          "Tidak, sistem ini selalu gagal fatal karena batasan modal pemain dan batasan limit taruhan meja kasino",
          "Berhasil hanya pada permainan dadu",
          "Direkomendasikan oleh pakar ekonomi dunia"
        ],
        correctIndex: 1,
        explanation: "Sistem Martingale membutuhkan modal tak terbatas. Mengalami 8-10 kekalahan beruntun akan membuat taruhan melonjak eksponensial hingga menguras habis seluruh saldo tabungan."
      },
      {
        id: "he5",
        question: "Pada server judi online ilegal, di mana letak penentuan angka hasil kocokan kartu / slot?",
        options: [
          "Diacak murni oleh gravitasi dan fisika dunia nyata",
          "Di server terpusat milik bandar yang sudah mengetahui pilihan taruhan pemain sebelum hasil ditampilkan",
          "Di dalam kartu SIM smartphone pemain",
          "Diputuskan bersama oleh seluruh pemain yang sedang online"
        ],
        correctIndex: 1,
        explanation: "Tidak ada keacakan murni di judi online ilegal. Server bandar sudah merekam nominal dan pilihan taruhanmu terlebih dahulu, lalu algoritma menentukan hasil yang memaksimalkan laba bandar."
      },
      {
        id: "he6",
        question: "Mengapa peluang memenangkan Jackpot utama pada mesin slot umumnya di bawah 0.001%?",
        options: [
          "Karena mesin slot cepat panas jika sering jackpot",
          "Agar bandar hanya mengeluarkan uang hadiah sesekali sebagai bahan iklan tangkapan layar di media sosial",
          "Karena kuota internet pemain terbatas",
          "Mengikuti aturan perhitungan zakat"
        ],
        correctIndex: 1,
        explanation: "Jackpot langka sengaja disebar di media sosial untuk memicu ilusi bahwa 'orang biasa pun bisa menang', padahal jutaan pemain lainnya rugi total untuk membiayai jackpot tersebut."
      },
      {
        id: "he7",
        question: "Apa istilah matematika untuk nilai rata-rata hasil yang diharapkan dari suatu taruhan bernilai negatif?",
        options: [
          "Positive Asset",
          "Negative Expected Value (-EV)",
          "Optimal Portfolio Balance",
          "Risk-Free Arbitrage"
        ],
        correctIndex: 1,
        explanation: "Semua permainan judi berstatus -EV (Negative Expected Value). Artinya secara matematis, setiap detik kamu bermain, kamu sedang membayar biaya kerugian pasti ke bandar."
      },
      {
        id: "he8",
        question: "Jika kamu melempar koin adil 5 kali dan semuanya keluar 'Gambar', berapa peluang lemparan ke-6 keluar 'Gambar'?",
        options: [
          "Pasti Angka, karena Gambar sudah terlalu sering keluar",
          "Tetap 50% (1 banding 2), karena setiap lemparan bersifat independen",
          "Peluangnya naik menjadi 90%",
          "Peluangnya turun menjadi 0%"
        ],
        correctIndex: 1,
        explanation: "Koin tidak memiliki ingatan. Mengira pola sebelumnya menentukan masa depan adalah ilusi dasar yang dieksploitasi bandar judi."
      },
      {
        id: "he9",
        question: "Mengapa bandar judi online menyukai pemain yang bermain dalam durasi waktu lama (maraton)?",
        options: [
          "Karena pemain menghemat server bandwidth",
          "Karena semakin banyak putaran taruhan yang dipasang, House Edge bekerja semakin sempurna menghabisi modal pemain",
          "Agar pemain bisa berteman akrab dengan customer service",
          "Untuk memenuhi jam tayang aplikasi"
        ],
        correctIndex: 1,
        explanation: "Keberuntungan hanya bisa terjadi dalam 1 atau 2 putaran singkat. Makin lama bermain, kepastian hukum statistik akan menarik saldo pemain ke angka nol mutlak."
      },
      {
        id: "he10",
        question: "Berapa persentase keuntungan bersih tahunan yang dijamin dinikmati oleh sindikat pengelola judi online?",
        options: [
          "Rugi karena sering dibobol pemain",
          "Mencapai puluhan hingga ratusan triliun Rupiah dari akumulasi kekalahan jutaan masyarakat",
          "Sama dengan bunga bank biasa (3%)",
          "Hanya cukup untuk biaya listrik server"
        ],
        correctIndex: 1,
        explanation: "Laporan PPATK mencatat perputaran dana judi online di Indonesia mencapai ratusan triliun Rupiah per tahun—semuanya diserap dari kantong masyarakat kecil ke bandar."
      },
      {
        id: "he11",
        question: "Mengapa fitur 'Beli Free Spin' (Buy Spin) pada game slot online sangat berbahaya bagi saldo pemain?",
        options: [
          "Menghabiskan baterai smartphone lebih cepat",
          "Memotong modal 50x hingga 100x lipat dalam satu detik dengan probabilitas pengembalian yang tetap dipatok rugi",
          "Mengurangi kualitas resolusi layar",
          "Menyebabkan aplikasi otomatis logout"
        ],
        correctIndex: 1,
        explanation: "Beli Spin memotong saldo 100x lipat seketika atas janji manis maxwin. Dalam 3-5 kali klik, tabungan berbulan-bulan bisa ludes dalam 1 menit."
      },
      {
        id: "he12",
        question: "Secara ilmu matematika, apa satu-satunya keputusan taruhan yang memiliki Expected Value 100% menang atas bandar?",
        options: [
          "Memasang taruhan pada dua sisi sekaligus",
          "Keputusan untuk TIDAK PERNAH memasang taruhan sama sekali (0 taruhan = 0 kerugian)",
          "Bermain hanya saat mendapatkan saldo gratis bonus deposit",
          "Mengikuti instruksi grup bocoran admin slot di Telegram"
        ],
        correctIndex: 1,
        explanation: "Satu-satunya cara pasti mengalahkan bandar adalah tidak bermain. Dengan menyimpan uangmu, modalmu 100% utuh tanpa potongan algoritma licik bandar."
      }
    ]
  },
  {
    id: "emergencyFund",
    title: "Dana Darurat & Manajemen Risiko",
    icon: "🛡️",
    desc: "Pelajari cara membangun benteng keuangan nyata agar tidak goyah saat menghadapi musibah atau krisis mendadak.",
    color: "#00E676",
    questions: [
      {
        id: "ef1",
        question: "Berapa jumlah dana darurat ideal bagi seorang lajang (belum menikah) menurut perencana keuangan?",
        options: [
          "1 minggu pengeluaran",
          "Minimal 3 sampai 6 kali pengeluaran rutin bulanan",
          "Cukup Rp 50.000 di dompet digital",
          "Tidak perlu dana darurat jika masih sehat"
        ],
        correctIndex: 1,
        explanation: "Dana darurat 3-6 bulan pengeluaran memberi rasa aman saat terjadi PHK, sakit mendadak, atau musibah tanpa perlu berhutang ke pinjol atau tergiur jalan pintas judi."
      },
      {
        id: "ef2",
        question: "Di instrumen manakah dana darurat paling tepat disimpan?",
        options: [
          "Di saldo akun judi online agar bisa digandakan",
          "Di instrumen likuid, aman, dan mudah dicairkan seperti rekening tabungan khusus atau reksa dana pasar uang",
          "Dibelikan barang koleksi hobi yang sulit dijual",
          "Dipinjamkan ke teman yang suka bermain slot"
        ],
        correctIndex: 1,
        explanation: "Syarat utama dana darurat adalah likuiditas (mudah ditarik saat darurat) dan keamanan modal. Jangan simpan dana darurat di instrumen berisiko tinggi."
      },
      {
        id: "ef3",
        question: "Kapan dana darurat boleh digunakan?",
        options: [
          "Untuk modal deposit slot saat ada rumor jam gacor",
          "Hanya untuk kebutuhan genting yang tak terduga seperti biaya rumah sakit, perbaikan kendaraan untuk kerja, atau musibah",
          "Membeli tiket konser musik artis luar negeri",
          "Membeli smartphone keluaran terbaru saat diskon"
        ],
        correctIndex: 1,
        explanation: "Dana darurat adalah pelampung keselamatan, bukan dana belanja konsumtif apalagi modal taruhan perjudian."
      },
      {
        id: "ef4",
        question: "Rumus alokasi gaji bulanan yang populer untuk kesehatan finansial adalah 50/30/20. Apa arti 20% tersebut?",
        options: [
          "20% untuk taruhan game online",
          "20% untuk tabungan, dana darurat, dan investasi masa depan",
          "20% untuk membayar bunga denda pinjol",
          "20% untuk nongkrong di kafe"
        ],
        correctIndex: 1,
        explanation: "Metode 50/30/20: 50% untuk kebutuhan pokok (needs), 30% untuk keinginan wajar (wants), dan 20% untuk tabungan & investasi masa depan (savings/investments)."
      },
      {
        id: "ef5",
        question: "Apa perbedaan paling mendasar antara 'Menabung' dengan 'Berjudi'?",
        options: [
          "Menabung nilainya pasti terjaga dan bertumbuh secara terukur, sedangkan judi mempertaruhkan modal pada kepastian kalah demi kesenangan sesaat",
          "Menabung hanya untuk orang tua, judi untuk anak muda",
          "Menabung tidak memerlukan uang",
          "Keduanya memiliki risiko yang sama persis"
        ],
        correctIndex: 0,
        explanation: "Menabung dan berinvestasi menciptakan nilai nyata bagi masa depan, sedangkan judi adalah penghancur kekayaan yang dirancang mengalirkan uangmu ke sindikat kriminal."
      },
      {
        id: "ef6",
        question: "Jika kamu memiliki hutang berbunga tinggi (seperti pinjol) dan sedikit tabungan, apa prioritas utamamu?",
        options: [
          "Mempertaruhkan tabungan di judi online untuk melunasi hutang sekaligus",
          "Melunasi hutang berbunga tinggi secepat mungkin sebelum bunga menggulung lebih besar",
          "Mengabaikan tagihan sampai nomor penagih diblokir",
          "Membeli barang mewah agar terlihat tetap kaya"
        ],
        correctIndex: 1,
        explanation: "Bunga pinjol menggerus kekayaan lebih cepat dari instrumen apapun. Melunasi hutang berbunga tinggi adalah investasi terbaik dengan imbal hasil kepastian terbebas dari jeratan."
      },
      {
        id: "ef7",
        question: "Mengapa memiliki dana darurat dapat mencegah seseorang terjerumus ke dalam judi online?",
        options: [
          "Karena orang yang memiliki dana darurat tidak memiliki waktu luang",
          "Karena saat krisis mendadak tiba, mereka tidak panik mencari uang instan lewat judi atau pinjol ilegal",
          "Karena bank melarang nasabah bermain game",
          "Karena aplikasi judi menolak nasabah yang punya tabungan"
        ],
        correctIndex: 1,
        explanation: "Banyak orang terjerat judol karena keputusasaan finansial saat butuh uang mendesak. Dana darurat adalah perisai psikologis agar pikiran tetap tenang dan rasional."
      },
      {
        id: "ef8",
        question: "Apa langkah pertama yang harus dilakukan seseorang yang ingin mulai menata keuangannya dari nol?",
        options: [
          "Mencatat seluruh arus kas masuk dan pengeluaran harian secara jujur",
          "Mencari grup bocoran saham spekulatif",
          "Membeli buku motivasi bisnis yang mahal",
          "Meminjam uang untuk modal awal"
        ],
        correctIndex: 0,
        explanation: "Kamu tidak bisa mengendalikan apa yang tidak kamu ukur. Mencatat arus kas harian membantumu melihat kebocoran keuangan (termasuk uang rokok, jajan berlebih, atau deposit terselubung)."
      },
      {
        id: "ef9",
        question: "Berapa dana darurat yang disarankan bagi seseorang yang sudah berkeluarga dan memiliki tanggungan anak?",
        options: [
          "Cukup 1 bulan pengeluaran",
          "Minimal 6 hingga 12 kali pengeluaran rutin bulanan keluarga",
          "Tidak perlu jika pasangan juga bekerja",
          "Rp 1.000.000 per anak"
        ],
        correctIndex: 1,
        explanation: "Keluarga dengan anak memiliki risiko kebutuhan mendadak yang lebih tinggi (biaya sekolah, kesehatan anak). 6-12 bulan memberi rasa aman yang kokoh."
      },
      {
        id: "ef10",
        question: "Apa arti konsep 'Pay Yourself First' (Bayar Dirimu Sendiri Terlebih Dahulu)?",
        options: [
          "Membelanjakan gaji untuk kesenangan pribadi begitu uang masuk rekening",
          "Menyisihkan uang tabungan/investasi di awal gajian, bukan menunggu sisa di akhir bulan",
          "Membayar hutang ke teman sebelum hutang ke bank",
          "Membeli makanan paling mahal saat tanggal muda"
        ],
        correctIndex: 1,
        explanation: "Jika menunggu 'sisa uang di akhir bulan', tabungan hampir pasti tidak pernah ada. Sisihkan 10%-20% langsung di hari pertama menerima penghasilan."
      },
      {
        id: "ef11",
        question: "Jika penghasilanmu saat ini pas-pasan, strategi apa yang paling realistis untuk mulai menabung?",
        options: [
          "Mencoba peruntungan di roket crash atau slot gacor",
          "Mulai dari nominal sekecil apapun secara konsisten (misal Rp 10.000/hari) dan fokus menambah keterampilan kerja",
          "Berhenti makan sama sekali selama 2 minggu",
          "Menunggu gaji naik menjadi 10 juta baru mulai menabung"
        ],
        correctIndex: 1,
        explanation: "Membangun kebiasaan disiplin menabung jauh lebih penting daripada nominal awalnya. Konsistensi kecil akan membentuk mentalitas tangguh."
      },
      {
        id: "ef12",
        question: "Apakah asuransi kesehatan (seperti BPJS Kesehatan) merupakan bagian dari manajemen risiko keuangan?",
        options: [
          "Bukan, itu hanya program pemerintah biasa",
          "Ya, benteng vital yang melindungi tabungan dan dana darurat agar tidak amblas saat musibah sakit berat",
          "Hanya penting bagi orang yang berusia di atas 60 tahun",
          "Membuang-buang uang setiap bulan"
        ],
        correctIndex: 1,
        explanation: "Biaya rawat inap atau operasi bisa menghabiskan puluhan juta dalam hitungan hari. Memiliki BPJS Kesehatan aktif mencegah kehancuran aset keluarga."
      }
    ]
  },
  {
    id: "realInvest",
    title: "Investasi Nyata vs Judi Berkedok Trading",
    icon: "📈",
    desc: "Bongkar beda investasi resmi (SBN, Emas, Saham IHSG) dengan skema binary option atau robot trading bodong.",
    color: "#9C27B0",
    questions: [
      {
        id: "ri1",
        question: "Apa ciri paling mendasar dari investasi bodong / judi berkedok trading (Binary Option)?",
        options: [
          "Menebak harga naik atau turun dalam durasi hitungan detik/menit dengan skema menang dapat 80% tapi kalah rugi 100%",
          "Memiliki izin resmi dari Bappebti dan OJK",
          "Perusahaan tercatat di Bursa Efek Indonesia (BEI)",
          "Memberikan dividen tahunan yang wajar"
        ],
        correctIndex: 0,
        explanation: "Binary option bukanlah trading, melainkan perjudian murni berkedok grafik mata uang. Jika benar hanya dapat 80%, tapi jika salah modal 100% ludes ke bandar broker."
      },
      {
        id: "ri2",
        question: "Siapakah lembaga resmi pemerintah Indonesia yang mengawasi perdagangan berjangka dan komoditi (forex, emas, kripto)?",
        options: [
          "Bappebti (Badan Pengawas Perdagangan Berjangka Komoditi) di bawah Kemendag",
          "Kementerian Pariwisata dan Ekonomi Kreatif",
          "Dinas Kependudukan dan Catatan Sipil",
          "Badan Pengawas Obat dan Makanan (BPOM)"
        ],
        correctIndex: 0,
        explanation: "Platform trading forex, emas, dan kripto legal wajib terdaftar dan diawasi oleh Bappebti dan OJK. Platform luar negeri tak berizin adalah ilegal dan berisiko scam."
      },
      {
        id: "ri3",
        question: "Apa yang membuat 'Investasi Saham Resmi di Bursa Efek Indonesia' berbeda total dari judi online?",
        options: [
          "Investasi saham membeli kepemilikan bisnis riil yang memiliki karyawan, aset pabrik, dan menghasilkan laba nyata",
          "Saham bisa diatur jam gacornya oleh artis terkenal",
          "Investasi saham menjamin kamu pasti kaya dalam 3 hari",
          "Saham tidak memiliki risiko penurunan nilai"
        ],
        correctIndex: 0,
        explanation: "Saat membeli saham resmi (seperti BBCA, TLKM, ASII), kamu menjadi pemilik sebagian perusahaan nyata yang mencetak laba dan membagikan dividen dari penjualan produk riil."
      },
      {
        id: "ri4",
        question: "Jika ada orang menawarkan investasi dengan janji 'Pasti Untung 1% per Hari Tanpa Risiko', apa kesimpulannya?",
        options: [
          "Peluang emas yang harus segera diambil dengan menjual rumah",
          "100% Pasti Skema Ponzi / Penipuan Investasi Bodong",
          "Metode rahasia yang ditemukan oleh ilmuwan jenius",
          "Investasi resmi yang dilindungi oleh bank sentral"
        ],
        correctIndex: 1,
        explanation: "Prinsip dasar ekonomi adalah 'High Risk, High Return'. Tidak ada instrumen di dunia yang bisa menjamin keuntungan 1% per hari (365% setahun) bebas risiko tanpa skema gali lubang tutup lubang ponzi."
      },
      {
        id: "ri5",
        question: "Apa instrumen investasi paling aman dan dijamin 100% oleh negara Republik Indonesia?",
        options: [
          "Robot trading emas di Telegram",
          "Surat Berharga Negara (SBN / ORI / Sukuk Ritel)",
          "Koin kripto baru yang dipromosikan influencer",
          "Situs judi berlisensi Curacao"
        ],
        correctIndex: 1,
        explanation: "SBN (Surat Berharga Negara) dijamin oleh undang-undang dan APBN. Pokok dan kuponnya pasti dibayar oleh pemerintah Indonesia tanpa risiko gagal bayar."
      },
      {
        id: "ri6",
        question: "Apa kekuatan terbesar dari konsep 'Bunga Berbunga' (Compound Interest) dalam investasi nyata?",
        options: [
          "Bisa melipatgandakan uang dalam 5 menit",
          "Keuntungan yang diinvestasikan kembali akan menghasilkan keuntungan baru secara eksponensial dalam jangka panjang",
          "Mengurangi beban pajak penghasilan menjadi nol",
          "Membuat investor tidak perlu bekerja lagi besok pagi"
        ],
        correctIndex: 1,
        explanation: "Albert Einstein menyebut bunga berbunga sebagai keajaiban dunia ke-8. Konsistensi investasi kecil yang bertumbuh seiring waktu akan mengalahkan spekulasi instan apapun."
      },
      {
        id: "ri7",
        question: "Mengapa para affiliator binary option atau robot trading sering memamerkan mobil mewah dan tumpukan uang di media sosial?",
        options: [
          "Karena mereka murni berniat sedekah mengajarkan ilmunya",
          "Flexing (pamer harta sewaan) untuk menjerat korban agar mau mendaftar lewat link referral mereka",
          "Diwajibkan oleh aturan bursa berjangka",
          "Untuk membayar pajak secara terbuka"
        ],
        correctIndex: 1,
        explanation: "Affiliator mendapat komisi dari kekalahan uang deposit membernya (loss-sharing). Mobil mewah yang dipamerkan sering kali mobil rental untuk membius logika korban."
      },
      {
        id: "ri8",
        question: "Apa keunggulan instrumen 'Emas Batangan / Logam Mulia' untuk portofolio jangka panjang?",
        options: [
          "Bisa naik 500% dalam seminggu",
          "Sebagai pelindung nilai (hedge) terhadap inflasi dan depresiasi mata uang",
          "Menghasilkan dividen tunai setiap kuartal",
          "Bisa digandakan dengan bantuan dukun"
        ],
        correctIndex: 1,
        explanation: "Emas fisik mempertahankan daya beli uang selama ribuan tahun. Emas adalah instrumen pelindung nilai kekayaan yang aman dan teruji zaman."
      },
      {
        id: "ri9",
        question: "Apa arti istilah 'Diversifikasi' dalam dunia investasi?",
        options: [
          "Bermain di 5 situs judi online yang berbeda sekaligus",
          "Jangan menaruh semua telur dalam satu keranjang (sebar modal ke berbagai aset: pasar uang, obligasi, saham)",
          "Menghabiskan seluruh tabungan untuk satu koin kripto",
          "Membuka banyak rekening bank untuk menampung pinjol"
        ],
        correctIndex: 1,
        explanation: "Diversifikasi menyebarkan risiko. Jika satu sektor aset mengalami penurunan, sektor lain dapat menyeimbangkan portofolio keseluruhan."
      },
      {
        id: "ri10",
        question: "Apa yang harus dilakukan investor sebelum membeli suatu produk reksa dana atau saham?",
        options: [
          "Membaca prospektus, fundamental bisnis perusahaan, dan memahami profil risiko diri sendiri",
          "Meminta petunjuk dukun atau ramalan zodiak",
          "Melihat apakah logonya memiliki warna emas",
          "Mengikuti saran acak dari akun anonim di forum internet"
        ],
        correctIndex: 0,
        explanation: "Investasi cerdas selalu didasarkan pada riset fundamental dan logika bisnis, bukan euforia atau ikut-ikutan FOMO di media sosial."
      },
      {
        id: "ri11",
        question: "Berapa lama jangka waktu ideal untuk mengukur hasil investasi saham bisnis yang berkualitas?",
        options: [
          "15 detik setelah membeli",
          "Jangka menengah hingga panjang (3 hingga 10+ tahun)",
          "Harus dijual sebelum jam makan siang",
          "Tepat saat tanggal gajian tiba"
        ],
        correctIndex: 1,
        explanation: "Perusahaan riil butuh waktu bertahun-tahun untuk membangun pabrik, menambah cabang, dan melipatgandakan omset. Investor sejati tumbuh bersama pertumbuhan bisnis tersebut."
      },
      {
        id: "ri12",
        question: "Apa perbedaan paling mendalam antara mentalitas 'Penjudi' vs mentalitas 'Investor Sejati'?",
        options: [
          "Penjudi mengincar uang cepat tanpa usaha dengan risiko kehancuran total, sedangkan investor sabar membangun aset produktif dengan risiko terukur",
          "Investor tidak butuh uang, penjudi butuh uang",
          "Penjudi selalu lebih kaya daripada investor",
          "Keduanya memiliki pola pikir yang identik"
        ],
        correctIndex: 0,
        explanation: "Penjudi mencari sensasi instan dan jalan pintas yang selalu berakhir rungkad. Investor memahami nilai proses, literasi keuangan, dan kerja keras yang membuahkan kebebasan finansial sejati."
      }
    ]
  }
];
