// Kategori produk berdasarkan marketplace Indonesia (Shopee, Tokopedia, TikTok Shop, dll)
export const PRODUCT_CATEGORIES = [
  'Fashion Pria',
  'Fashion Wanita',
  'Fashion Anak & Bayi',
  'Sepatu Pria',
  'Sepatu Wanita',
  'Tas Pria',
  'Tas Wanita',
  'Aksesoris Fashion',
  'Jam Tangan',
  'Kacamata',
  'Kesehatan',
  'Kecantikan',
  'Perawatan Tubuh',
  'Makeup',
  'Perawatan Kulit',
  'Perawatan Rambut',
  'Makanan & Minuman',
  'Makanan Ringan',
  'Minuman',
  'Bahan Makanan',
  'Elektronik',
  'Handphone & Tablet',
  'Komputer & Laptop',
  'Kamera',
  'Audio',
  'Elektronik Rumah Tangga',
  'Peralatan Rumah Tangga',
  'Peralatan Dapur',
  'Dekorasi Rumah',
  'Furniture',
  'Perlengkapan Kamar Mandi',
  'Ibu & Bayi',
  'Perlengkapan Bayi',
  'Mainan Bayi',
  'Makanan Bayi',
  'Hobi & Koleksi',
  'Mainan & Games',
  'Buku & Alat Tulis',
  'Musik & Media',
  'Olahraga & Outdoor',
  'Alat Olahraga',
  'Pakaian Olahraga',
  'Sepeda',
  'Otomotif',
  'Aksesoris Motor',
  'Aksesoris Mobil',
  'Suku Cadang',
  'Souvenir & Hadiah',
  'Perlengkapan Pesta',
  'Voucher & Layanan',
  'Custom'
];

const CUSTOM_CATEGORIES_KEY = 'custom_categories';

export function getCustomCategories() {
  const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addCustomCategory(category) {
  const customCategories = getCustomCategories();
  if (!customCategories.includes(category) && category.trim()) {
    customCategories.push(category.trim());
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
  }
}

export function getAllCategories() {
  const customCategories = getCustomCategories();
  return [...PRODUCT_CATEGORIES.filter(cat => cat !== 'Custom'), ...customCategories, 'Custom'];
}
