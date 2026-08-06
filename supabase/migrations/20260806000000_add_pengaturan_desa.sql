-- Konten profil desa (sejarah/visi/misi) & kontak (alamat/jam/telp/email/peta)
-- sekarang bisa diedit admin lewat dashboard, bukan hardcode di kode.
-- Singleton: cuma 1 baris yang pernah ada, dikunci id=1.
CREATE TABLE pengaturan_desa (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  sejarah TEXT,
  visi TEXT,
  misi TEXT[] NOT NULL DEFAULT '{}',
  alamat_kantor TEXT,
  jam_pelayanan TEXT,
  jam_pelayanan_catatan TEXT,
  telepon TEXT,
  email TEXT,
  peta_embed_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed persis teks yang sebelumnya hardcode di app/tentang/page.tsx &
-- app/contact/page.tsx, supaya tampilan publik tidak berubah sama sekali
-- sampai admin beneran edit lewat dashboard.
INSERT INTO pengaturan_desa (
  id, sejarah, visi, misi, alamat_kantor, jam_pelayanan,
  jam_pelayanan_catatan, telepon, email, peta_embed_url
) VALUES (
  1,
  '<p>Nama <strong>"Pulung Merdiko"</strong> memiliki akar filosofis yang mendalam. Menurut kisah turun-temurun dari para tetua desa, kata <em>"Pulung"</em> merujuk pada wahyu, keberuntungan, atau pancaran cahaya spiritual positif yang turun di wilayah ini. Sedangkan kata <em>"Merdiko"</em> berarti merdeka, bebas, dan berdaulat.</p><p>Sejarah bermula pada pertengahan abad ke-19, saat wilayah ini berupa hutan belantara yang lebat. Sekelompok prajurit pengikut setia Pangeran Diponegoro yang mengembara ke arah timur Ponorogo membuka lahan baru. Dipimpin oleh <strong>Eyang Raden Tumenggung Djayengrono</strong>, mereka menetap dan mendirikan pemukiman yang mandiri bebas dari penjajahan Belanda.</p><p>Secara administratif, Desa Pulung Merdiko terbagi menjadi dua dusun, yaitu <strong>Dusun Krajan</strong> dan <strong>Dusun Segropyak</strong>.</p><p>Hingga hari ini, semangat kemandirian dan rasa kegotongroyongan kian mengakar kuat, menempatkan Desa Pulung Merdiko sebagai desa pelopor kedamaian, harmoni budaya, serta ketangguhan ekonomi kreatif di Kabupaten Ponorogo.</p>',
  'Mewujudkan Desa Pulung Merdiko sebagai desa yang mandiri, sejahtera, rukun, dan berbudaya melalui tata kelola pemerintahan yang bersih, transparan, dan responsif berbasis teknologi informasi.',
  ARRAY[
    'Meningkatkan profesionalisme aparatur pemerintah desa demi mewujudkan pelayanan yang prima, bersih, dan berwibawa.',
    'Membangun infrastruktur desa yang merata, berkualitas tinggi, serta berwawasan lingkungan secara berkesinambungan.',
    'Memberdayakan ekonomi kerakyatan melalui pendampingan intensif bagi UMKM lokal, modernisasi pertanian, dan perluasan pasar digital.',
    'Melestarikan warisan adat istiadat, kebudayaan daerah Ponorogo, serta membina kerukunan beragama secara berkeadilan.'
  ],
  'Jl. Raya Pulung No. 45, Desa Pulung Merdiko, Kecamatan Pulung, Kabupaten Ponorogo, Jawa Timur 63481',
  'Senin - Jumat: 08:00 - 15:00 WIB',
  '* Sabtu, Minggu, & Libur Nasional: Tutup',
  '+62 812-3456-7890 (Sekretariat Desa)',
  'pemdes@pulungmerdiko.desa.id',
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d19616.56775967318!2d111.6008402!3d-7.8813414!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79a76e1b735f29%3A0x535c125eec828e68!2sPulung%20Merdiko%2C%20Kec.%20Pulung%2C%20Kabupaten%20Ponorogo%2C%20Jawa%20Timur!5e1!3m2!1sid!2sid!4v1785942416008!5m2!1sid!2sid'
);
