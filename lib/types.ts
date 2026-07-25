export interface NewsItem {
  id: string;
  category: 'Budaya' | 'Pemerintahan' | 'Sejarah' | 'Infrastruktur' | 'Pengumuman';
  title: string;
  date: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  views: number;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  seller: string;
  phone: string;
  category: 'Kerajinan' | 'Kuliner' | 'Pertanian' | 'Madu & Herbal';
}

export interface VillageOfficial {
  name: string;
  role: string;
  photo: string;
  phone?: string;
}

