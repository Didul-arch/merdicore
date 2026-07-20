import { Eye, Landmark, BookOpen, Users } from 'lucide-react';
import { OFFICIALS } from '../data';

const MISSIONS = [
  'Meningkatkan profesionalisme aparatur pemerintah desa demi mewujudkan pelayanan yang prima, bersih, dan berwibawa.',
  'Membangun infrastruktur desa yang merata, berkualitas tinggi, serta berwawasan lingkungan secara berkesinambungan.',
  'Memberdayakan ekonomi kerakyatan melalui pendampingan intensif bagi UMKM lokal, modernisasi pertanian, dan perluasan pasar digital.',
  'Melestarikan warisan adat istiadat, kebudayaan daerah Ponorogo, serta membina kerukunan beragama secara berkeadilan.',
];

export default function Tentang() {
  return (
    <div className="py-24 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/50">PROFIL DESA</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Mengenal Lebih Dekat Pulung Merdiko
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
            Menelusuri sejarah kejayaan perjuangan kemandirian, visi misi pembangunan masa depan, dan para pelayan masyarakat Desa Pulung Merdiko.
          </p>
          <div className="h-1 w-16 bg-teal-600 rounded mx-auto mt-2" />
        </div>

        {/* Sejarah */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-teal-100 rounded-full blur-xl opacity-60 -z-10" />
            <div className="absolute -bottom-4 -right-4 w-44 h-44 bg-sky-100 rounded-3xl -z-10" />
            <img
              src="https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=800&q=80"
              alt="Makam Bersejarah"
              className="w-full h-80 object-cover rounded-2xl shadow-md border border-gray-100"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center space-x-2 text-teal-700">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <h3 className="font-extrabold text-gray-900 text-lg sm:text-xl">Sejarah & Asal-Usul</h3>
            </div>
            <div className="h-0.5 w-16 bg-teal-600 rounded" />

            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
              Nama <strong>&quot;Pulung Merdiko&quot;</strong> memiliki akar filosofis yang mendalam. Kata <em>&quot;Pulung&quot;</em> merujuk pada wahyu atau pancaran cahaya spiritual positif, sedangkan <em>&quot;Merdiko&quot;</em> berarti merdeka dan berdaulat.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
              Sejarah bermula pada pertengahan abad ke-19, saat sekelompok prajurit pengikut setia Pangeran Diponegoro membuka lahan baru di wilayah ini. Dipimpin oleh <strong>Eyang Raden Tumenggung Djajengrana</strong>, mereka mendirikan pemukiman yang mandiri dan bebas dari penjajahan Belanda.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
              Hingga hari ini, semangat kemandirian dan gotong-royong terus mengakar kuat, menempatkan Desa Pulung Merdiko sebagai desa pelopor kedamaian dan ketangguhan ekonomi kreatif di Kabupaten Ponorogo.
            </p>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visi */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-teal-700">
                <div className="p-2.5 bg-teal-50 rounded-xl">
                  <Eye className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Visi Desa</h3>
              </div>
              <div className="h-0.5 w-12 bg-teal-600 rounded" />

              <blockquote className="border-l-4 border-teal-600 pl-4 py-2 text-sm sm:text-base italic text-gray-800 font-medium leading-relaxed bg-slate-50 rounded-r-xl pr-4">
                &quot;Mewujudkan Desa Pulung Merdiko sebagai desa yang mandiri, sejahtera, rukun, dan berbudaya melalui tata kelola pemerintahan yang bersih, transparan, dan responsif berbasis teknologi informasi.&quot;
              </blockquote>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-50 text-center">
              {['MANDIRI', 'RUKUN', 'BERSIH'].map((word, i) => (
                <div key={word}>
                  <span className="block text-xl font-bold text-teal-700">{word}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                    {['Ekonomi', 'Masyarakat', 'Pelayanan'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Misi */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center space-x-3 text-teal-700">
              <div className="p-2.5 bg-sky-50 rounded-xl">
                <Landmark className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Misi Pembangunan</h3>
            </div>
            <div className="h-0.5 w-12 bg-teal-600 rounded" />

            <ul className="space-y-4">
              {MISSIONS.map((mission, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <span className="w-6 h-6 flex-shrink-0 bg-teal-50 text-teal-700 border border-teal-200/50 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">{mission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Perangkat Desa */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="flex justify-center">
              <Users className="w-8 h-8 text-teal-600 bg-teal-50 p-1.5 rounded-full" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
              Pemerintah Desa (Perangkat Desa)
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              Para abdi masyarakat Desa Pulung Merdiko yang melayani kepentingan umum dengan penuh dedikasi.
            </p>
            <div className="h-1 w-12 bg-teal-600 rounded mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {OFFICIALS.map((official, idx) => (
              <div
                key={idx}
                className="hover-lift bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center p-6 space-y-4"
              >
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-teal-100 ring-2 ring-teal-600/10">
                  <img
                    src={official.photo}
                    alt={official.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                    {official.name}
                  </h4>
                  <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">
                    {official.role}
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-gray-50 text-[11px] text-gray-400 font-light">
                  <span>Sedia melayani kebutuhan administratif warga desa.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
