const prisma = require("../src/utils/prisma");

async function main() {
  // =============================================
  // 1. FAKULTAS & PRODI
  // =============================================
  const fakultasData = [
    {
      nama: "Teologi",
      prodi: ["Filsafat Keilahian", "Magister Ilmu Teologi", "Magister Kajian Konflik dan Perdamaian", "Doktor Teologi"],
    },
    {
      nama: "Bisnis",
      prodi: ["Manajemen", "Akuntansi"],
    },
    {
      nama: "Arsitektur dan Desain",
      prodi: ["Arsitektur dan Desain Produk"],
    },
    {
      nama: "Kedokteran",
      prodi: ["Pendidikan Kedokteran", "Profesi Dokter"],
    },
    {
      nama: "Bioteknologi",
      prodi: ["Biologi"],
    },
    {
      nama: "Teknologi Informasi",
      prodi: ["Sistem Informasi", "Teknik Informatika"],
    },
    {
      nama: "Kependidikan dan Humaniora",
      prodi: ["Pendidikan Bahasa Inggris", "Studi Humanitas"],
    },
  ];

  const prodiList = [];

  for (const f of fakultasData) {
    const fakultas = await prisma.fakultas.create({
      data: { nama: f.nama },
    });

    for (const p of f.prodi) {
      const prodi = await prisma.prodi.create({
        data: {
          nama: p,
          fakultas_id: fakultas.id,
        },
      });
      prodiList.push(prodi);
    }
  }

  // =============================================
  // 2. JENIS DISABILITAS
  // =============================================
  const jenisList = ["Fisik", "Sensorik", "Intelektual", "Mental", "Ganda"];
  const jenisMap = {};

  for (const j of jenisList) {
    jenisMap[j] = (
      await prisma.jenisDisabilitas.create({
        data: { jenis: j },
      })
    ).id;
  }

  // =============================================
  // 3. KATEGORI DISABILITAS
  // =============================================
  const kategoriData = [
    { kategori: "Tuna Daksa", jenis: "Fisik" },
    { kategori: "Cerebral Palsy", jenis: "Fisik" },
    { kategori: "Amputasi", jenis: "Fisik" },
    { kategori: "Kelumpuhan", jenis: "Fisik" },
    { kategori: "Kelainan Ortopedi", jenis: "Fisik" },
    { kategori: "Distrofi Otot", jenis: "Fisik" },

    { kategori: "Tuna Netra", jenis: "Sensorik" },
    { kategori: "Low Vision", jenis: "Sensorik" },
    { kategori: "Tuna Rungu", jenis: "Sensorik" },
    { kategori: "Tuna Wicara", jenis: "Sensorik" },

    { kategori: "Tuna Grahita Ringan", jenis: "Intelektual" },
    { kategori: "Tuna Grahita Sedang", jenis: "Intelektual" },
    { kategori: "Tuna Grahita Berat", jenis: "Intelektual" },

    { kategori: "Skizofrenia", jenis: "Mental" },
    { kategori: "Depresi Berat", jenis: "Mental" },
    { kategori: "Gangguan Cemas", jenis: "Mental" },
    { kategori: "Bipolar", jenis: "Mental" },

    { kategori: "Disabilitas Ganda", jenis: "Ganda" },
  ];

  const kategoriMap = {};
  for (const k of kategoriData) {
    kategoriMap[k.kategori] = (
      await prisma.kategoriDisabilitas.create({
        data: {
          kategori: k.kategori,
          jenis_disabilitas_id: jenisMap[k.jenis],
        },
      })
    ).id;
  }

  const kategoriList = Object.keys(kategoriMap).filter((k) => k !== "Disabilitas Ganda");

  // =============================================
  // 4. DATA MAHASISWA (10 awal + 5 tambahan)
  // =============================================
  const mahasiswaSeed = [
    { nama: "Agus Saputra", nim: "22010001", provinsi: "DIY", angkatan: 2020, jalur: "SNMPTN", status: "aktif", jenjang: "S1", gender: "L", sekolah: "SMA 1 Bandung" },
    { nama: "Bella Sari", nim: "22010002", provinsi: "Jawa Tengah", angkatan: 2021, jalur: "SBMPTN", status: "cuti", jenjang: "S1", gender: "P", sekolah: "SMA 3 Semarang" },
    { nama: "Citra Lestari", nim: "22010003", provinsi: "Jawa Barat", angkatan: 2019, jalur: "Mandiri", status: "aktif", jenjang: "S1", gender: "P", sekolah: "SMA Al-Azhar" },
    { nama: "Dimas Rahman", nim: "22010004", provinsi: "Banten", angkatan: 2022, jalur: "SNMPTN", status: "aktif", jenjang: "S1", gender: "L", sekolah: "SMA 7 Tangerang" },
    { nama: "Eka Putri", nim: "22010005", provinsi: "Lampung", angkatan: 2023, jalur: "Mandiri", status: "aktif", jenjang: "S1", gender: "P", sekolah: "SMA 5 Bandar Lampung" },
    { nama: "Fikri Maulana", nim: "22010006", provinsi: "Jambi", angkatan: 2020, jalur: "SBMPTN", status: "lulus", jenjang: "S1", gender: "L", sekolah: "SMA 2 Jambi" },
    { nama: "Gina Novita", nim: "22010007", provinsi: "Sumatera Barat", angkatan: 2018, jalur: "SNMPTN", status: "aktif", jenjang: "S1", gender: "P", sekolah: "SMA 1 Padang" },
    { nama: "Heri Gunawan", nim: "22010008", provinsi: "Riau", angkatan: 2022, jalur: "SBMPTN", status: "aktif", jenjang: "S1", gender: "L", sekolah: "SMA 2 Pekanbaru" },
    { nama: "Indah Pratiwi", nim: "22010009", provinsi: "Sumatera Utara", angkatan: 2021, jalur: "Mandiri", status: "aktif", jenjang: "S1", gender: "P", sekolah: "SMA Methodist Medan" },
    { nama: "Joko Wibowo", nim: "22010010", nimLower: "22010010", provinsi: "Aceh", angkatan: 2023, jalur: "SNMPTN", status: "aktif", jenjang: "S1", gender: "L", sekolah: "SMA 1 Banda Aceh" },

    // ✅ 5 mahasiswa tambahan (kategori tunggal)
    { nama: "Kevin Santoso", nim: "22010011", provinsi: "Bali", angkatan: 2021, jalur: "SBMPTN", status: "aktif", jenjang: "S1", gender: "L", sekolah: "SMA 4 Denpasar", fixedKategori: "Tuna Rungu" },
    { nama: "Maria Febrina", nim: "22010012", provinsi: "Kalimantan Barat", angkatan: 2022, jalur: "SNMPTN", status: "aktif", jenjang: "S1", gender: "P", sekolah: "SMA 1 Pontianak", fixedKategori: "Skizofrenia" },
    { nama: "Rian Aditya", nim: "22010013", provinsi: "NTB", angkatan: 2020, jalur: "Mandiri", status: "aktif", jenjang: "S1", gender: "L", sekolah: "SMA 3 Mataram", fixedKategori: "Tuna Daksa" },
    { nama: "Selvi Anggraini", nim: "22010014", provinsi: "Kalimantan Selatan", angkatan: 2023, jalur: "SBMPTN", status: "aktif", jenjang: "S1", gender: "P", sekolah: "SMA 2 Banjarmasin", fixedKategori: "Tuna Grahita Ringan" },
    { nama: "Yusuf Hamdani", nim: "22010015", provinsi: "Sulawesi Selatan", angkatan: 2021, jalur: "Mandiri", status: "aktif", jenjang: "S1", gender: "L", sekolah: "SMA 5 Makassar", fixedKategori: "Low Vision" },
  ];

  // =============================================
  // 5. INSERT MAHASISWA
  // =============================================
  for (let i = 0; i < mahasiswaSeed.length; i++) {
    const m = mahasiswaSeed[i];

    // Tentukan kategori (random atau fixed)
    let chosen;
    if (m.fixedKategori) {
      chosen = [m.fixedKategori];
    } else {
      chosen = [];
      const total = Math.floor(Math.random() * 3) + 1;
      while (chosen.length < total) {
        const rand = kategoriList[Math.floor(Math.random() * kategoriList.length)];
        if (!chosen.includes(rand)) chosen.push(rand);
      }
    }

    const mhs = await prisma.mahasiswa.create({
      data: {
        nama: m.nama,
        nim: m.nim,
        provinsi: m.provinsi,
        angkatan: m.angkatan,
        jalur_masuk: m.jalur,
        status: m.status,
        jenjang: m.jenjang,
        gender: m.gender,
        asal_sekolah: m.sekolah,
        ipk: 2.8 + i * 0.1,
        fakultas_id: prodiList[i % prodiList.length].fakultas_id,
        prodi_id: prodiList[i % prodiList.length].id,
      },
    });

    for (const kat of chosen) {
      await prisma.mahasiswaKategoriDisabilitas.create({
        data: {
          mahasiswa_id: mhs.id,
          kategori_id: kategoriMap[kat],
        },
      });
    }

    if (chosen.length > 1) {
      await prisma.mahasiswaKategoriDisabilitas.create({
        data: {
          mahasiswa_id: mhs.id,
          kategori_id: kategoriMap["Disabilitas Ganda"],
        },
      });
    }

    const jenisToAssign = chosen.length === 1 ? kategoriData.find((k) => k.kategori === chosen[0]).jenis : "Ganda";

    await prisma.mahasiswaJenisDisabilitas.create({
      data: {
        mahasiswa_id: mhs.id,
        jenis_id: jenisMap[jenisToAssign],
      },
    });
  }

  await prisma.user.createMany({
    data: [
      { registrationNumber: "ADMIN-0001", name: "Super Admin", role: "ADMIN" },
      { registrationNumber: "PST-1001", name: "Peserta Satu", role: "PARTICIPANT" },
      { registrationNumber: "PST-1002", name: "Peserta Dua", role: "PARTICIPANT" },
    ],
  });

  // =======================
  // 2. TEST TYPES (BARU)
  // =======================
  const digital = await prisma.testType.create({
    data: { name: "DIGITAL_LITERACY" },
  });

  const college = await prisma.testType.create({
    data: { name: "COLLEGE_READINESS" },
  });

  // =======================
  // 3. DIGITAL LITERACY TEST
  // =======================
  await prisma.test.create({
    data: {
      title: "Digital Literacy Test",
      description: "Uji keterampilan dasar digital",
      typeId: digital.id,
      questions: {
        create: [
          {
            text: "Apa itu browser?",
            options: {
              a: "Software untuk mengakses web",
              b: "Program antivirus",
              c: "Sistem operasi",
            },
            answer: "a",
            questionType: "MCQ",
          },
          {
            text: "Singkatan dari URL?",
            options: {
              a: "Uniform Resource Locator",
              b: "Universal Resource Link",
              c: "User Registered Link",
            },
            answer: "a",
            questionType: "MCQ",
          },
        ],
      },
    },
  });

  // =======================
  // 4. COLLEGE READINESS TEST
  // =======================
  await prisma.test.create({
    data: {
      title: "College Readiness Test",
      description: "Uji kesiapan akademik dasar",
      typeId: college.id,
      questions: {
        create: [
          {
            text: "Apa itu IPK?",
            options: [], // essay → kosongkan array
            answer: null,
            questionType: "ESSAY",
          },
          {
            text: "Bagaimana metode belajar efektif menurut kamu?",
            options: [],
            answer: null,
            questionType: "ESSAY",
          },
        ],
      },
    },
  });

  console.log("SEED BERHASIL!");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
