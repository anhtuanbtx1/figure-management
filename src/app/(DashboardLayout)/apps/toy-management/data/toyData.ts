import { Toy, ToyCategory, ToyStatus } from '../../../types/apps/toy';

export const toyCategories: ToyCategory[] = [
  {
    id: '1',
    name: 'Đồ chơi giáo dục',
    slug: 'educational-toys',
    description: 'Đồ chơi phát triển trí tuệ và kỹ năng học tập',
    icon: '🎓',
    color: '#4CAF50'
  },
  {
    id: '2',
    name: 'Đồ chơi xây dựng',
    slug: 'building-toys',
    description: 'Lego, khối xây dựng và đồ chơi lắp ráp',
    icon: '🧱',
    color: '#FF9800'
  },
  {
    id: '3',
    name: 'Búp bê & Nhân vật',
    slug: 'dolls-figures',
    description: 'Búp bê, nhân vật hoạt hình và phụ kiện',
    icon: '🪆',
    color: '#E91E63'
  },
  {
    id: '4',
    name: 'Xe đồ chơi',
    slug: 'toy-vehicles',
    description: 'Ô tô, máy bay, tàu thuyền đồ chơi',
    icon: '🚗',
    color: '#2196F3'
  },
  {
    id: '5',
    name: 'Đồ chơi thể thao',
    slug: 'sports-toys',
    description: 'Bóng, vợt, dụng cụ thể thao cho trẻ em',
    icon: '⚽',
    color: '#9C27B0'
  },
  {
    id: '6',
    name: 'Đồ chơi nghệ thuật',
    slug: 'art-craft-toys',
    description: 'Bút màu, đất nặn, dụng cụ vẽ và thủ công',
    icon: '🎨',
    color: '#FF5722'
  }
];

export const toyBrands = [
  'LEGO',
  'Barbie',
  'Hot Wheels',
  'Fisher-Price',
  'Playmobil',
  'Hasbro',
  'Mattel',
  'VTech',
  'Melissa & Doug',
  'Little Tikes',
  'Chicco',
  'Disney',
  'Marvel',
  'Pokemon'
];

export const mockToys: Toy[] = [
  {
    id: '1',
    name: 'Bộ Lego Creator 3-in-1 Deep Sea Creatures',
    description: 'Bộ xây dựng Lego với 3 mô hình sinh vật biển sâu khác nhau. Phát triển khả năng sáng tạo và tư duy logic.',
    image: '/images/toys/lego-deep-sea.jpg',
    category: toyCategories[1],
    price: 1250000,
    originalPrice: 1500000,
    stock: 25,
    status: ToyStatus.ACTIVE,
    ageRange: '7-12 tuổi',
    brand: 'LEGO',
    material: 'Nhựa ABS cao cấp',
    dimensions: {
      length: 35,
      width: 25,
      height: 15,
      weight: 800
    },
    colors: ['Xanh dương', 'Xanh lá', 'Cam', 'Trắng'],
    tags: ['Lego', 'Xây dựng', 'Sáng tạo', 'Biển'],
    rating: 4.8,
    reviewCount: 156,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-01'),
    isNew: false,
    isFeatured: true,
    discount: 17
  },
  {
    id: '2',
    name: 'Búp bê Barbie Dreamhouse Adventures',
    description: 'Búp bê Barbie với ngôi nhà mơ ước đầy đủ nội thất và phụ kiện. Kích thích trí tưởng tượng và kỹ năng xã hội.',
    image: '/images/toys/barbie-dreamhouse.jpg',
    category: toyCategories[2],
    price: 2800000,
    stock: 15,
    status: ToyStatus.ACTIVE,
    ageRange: '3-10 tuổi',
    brand: 'Barbie',
    material: 'Nhựa và vải',
    dimensions: {
      length: 90,
      width: 60,
      height: 120,
      weight: 5200
    },
    colors: ['Hồng', 'Tím', 'Trắng', 'Vàng'],
    tags: ['Búp bê', 'Nhà búp bê', 'Barbie', 'Phụ kiện'],
    rating: 4.6,
    reviewCount: 89,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-11-28'),
    isNew: true,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Bộ xe Hot Wheels Track Builder Unlimited',
    description: 'Bộ đường đua Hot Wheels với nhiều đoạn đường và phụ kiện. Bao gồm 2 xe đua tốc độ cao.',
    image: '/images/toys/hotwheels-track.jpg',
    category: toyCategories[3],
    price: 950000,
    originalPrice: 1100000,
    stock: 32,
    status: ToyStatus.ACTIVE,
    ageRange: '4-10 tuổi',
    brand: 'Hot Wheels',
    material: 'Nhựa và kim loại',
    dimensions: {
      length: 120,
      width: 80,
      height: 25,
      weight: 1500
    },
    colors: ['Cam', 'Xanh dương', 'Đỏ', 'Vàng'],
    tags: ['Xe đồ chơi', 'Đường đua', 'Tốc độ', 'Hot Wheels'],
    rating: 4.7,
    reviewCount: 203,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-12-05'),
    isNew: false,
    isFeatured: false,
    discount: 14
  },
  {
    id: '4',
    name: 'Bộ đồ chơi khoa học Fisher-Price Think & Learn',
    description: 'Bộ thí nghiệm khoa học an toàn cho trẻ em. Bao gồm kính hiển vi, ống nghiệm và hướng dẫn thí nghiệm.',
    image: '/images/toys/science-kit.jpg',
    category: toyCategories[0],
    price: 1680000,
    stock: 18,
    status: ToyStatus.ACTIVE,
    ageRange: '6-12 tuổi',
    brand: 'Fisher-Price',
    material: 'Nhựa và thủy tinh an toàn',
    dimensions: {
      length: 40,
      width: 30,
      height: 20,
      weight: 1200
    },
    colors: ['Xanh lá', 'Trắng', 'Đen'],
    tags: ['Giáo dục', 'Khoa học', 'Thí nghiệm', 'STEM'],
    rating: 4.9,
    reviewCount: 127,
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-12-03'),
    isNew: true,
    isFeatured: true
  },
  {
    id: '5',
    name: 'Bóng đá mini FIFA World Cup',
    description: 'Bóng đá chính thức FIFA World Cup phiên bản mini. Chất liệu da tổng hợp cao cấp, phù hợp cho trẻ em.',
    image: '/images/toys/fifa-football.jpg',
    category: toyCategories[4],
    price: 320000,
    stock: 0,
    status: ToyStatus.OUT_OF_STOCK,
    ageRange: '5+ tuổi',
    brand: 'FIFA',
    material: 'Da tổng hợp',
    dimensions: {
      length: 18,
      width: 18,
      height: 18,
      weight: 280
    },
    colors: ['Trắng', 'Đen', 'Vàng'],
    tags: ['Bóng đá', 'Thể thao', 'FIFA', 'World Cup'],
    rating: 4.4,
    reviewCount: 78,
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-11-30'),
    isNew: false,
    isFeatured: false
  },
  {
    id: '6',
    name: 'Bộ màu vẽ Crayola 64 màu',
    description: 'Bộ bút màu sáp Crayola với 64 màu sắc rực rỡ. Kèm theo giấy vẽ và sách tô màu.',
    image: '/images/toys/crayola-64.jpg',
    category: toyCategories[5],
    price: 450000,
    stock: 45,
    status: ToyStatus.ACTIVE,
    ageRange: '3+ tuổi',
    brand: 'Crayola',
    material: 'Sáp màu an toàn',
    dimensions: {
      length: 25,
      width: 20,
      height: 5,
      weight: 400
    },
    colors: ['Đa màu'],
    tags: ['Vẽ', 'Màu sắc', 'Nghệ thuật', 'Sáng tạo'],
    rating: 4.5,
    reviewCount: 234,
    createdAt: new Date('2024-06-08'),
    updatedAt: new Date('2024-12-02'),
    isNew: false,
    isFeatured: false
  },
  {
    id: '7',
    name: 'Robot biến hình Transformers Optimus Prime',
    description: 'Robot Transformers có thể biến hình thành xe tải. Chất liệu nhựa cao cấp với khớp nối linh hoạt.',
    image: '/images/toys/transformers-optimus.jpg',
    category: toyCategories[2],
    price: 1850000,
    originalPrice: 2200000,
    stock: 12,
    status: ToyStatus.ACTIVE,
    ageRange: '8+ tuổi',
    brand: 'Hasbro',
    material: 'Nhựa ABS và kim loại',
    dimensions: {
      length: 30,
      width: 15,
      height: 35,
      weight: 650
    },
    colors: ['Đỏ', 'Xanh dương', 'Vàng'],
    tags: ['Robot', 'Biến hình', 'Transformers', 'Hasbro'],
    rating: 4.8,
    reviewCount: 167,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-12-04'),
    isNew: true,
    isFeatured: true,
    discount: 16
  },
  {
    id: '8',
    name: 'Đàn piano điện tử trẻ em Casio SA-76',
    description: 'Đàn piano mini với 44 phím và 100 âm thanh khác nhau. Có chức năng ghi âm và phát lại.',
    image: '/images/toys/casio-piano.jpg',
    category: toyCategories[0],
    price: 1200000,
    stock: 8,
    status: ToyStatus.ACTIVE,
    ageRange: '4-12 tuổi',
    brand: 'Casio',
    material: 'Nhựa và linh kiện điện tử',
    dimensions: {
      length: 60,
      width: 20,
      height: 8,
      weight: 1100
    },
    colors: ['Đen', 'Trắng'],
    tags: ['Âm nhạc', 'Piano', 'Điện tử', 'Giáo dục'],
    rating: 4.6,
    reviewCount: 92,
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-12-01'),
    isNew: false,
    isFeatured: false
  },
  {
    id: '9',
    name: 'Bộ đồ chơi nấu ăn Kitchen Playset',
    description: 'Bộ nhà bếp mini với đầy đủ dụng cụ nấu ăn. Có âm thanh và ánh sáng thật như nhà bếp thực.',
    image: '/images/toys/kitchen-playset.jpg',
    category: toyCategories[2],
    price: 2100000,
    stock: 6,
    status: ToyStatus.ACTIVE,
    ageRange: '3-8 tuổi',
    brand: 'Little Tikes',
    material: 'Nhựa an toàn',
    dimensions: {
      length: 80,
      width: 40,
      height: 95,
      weight: 8500
    },
    colors: ['Hồng', 'Trắng', 'Đỏ'],
    tags: ['Nhà bếp', 'Nấu ăn', 'Nhập vai', 'Âm thanh'],
    rating: 4.7,
    reviewCount: 145,
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-11-29'),
    isNew: true,
    isFeatured: true
  },
  {
    id: '10',
    name: 'Xe điều khiển từ xa BMW X6',
    description: 'Xe hơi điều khiển từ xa tỷ lệ 1:14. Pin sạc, tốc độ cao và có thể drift.',
    image: '/images/toys/rc-bmw-x6.jpg',
    category: toyCategories[3],
    price: 890000,
    stock: 0,
    status: ToyStatus.OUT_OF_STOCK,
    ageRange: '6+ tuổi',
    brand: 'BMW',
    material: 'Nhựa và kim loại',
    dimensions: {
      length: 32,
      width: 16,
      height: 12,
      weight: 850
    },
    colors: ['Đen', 'Trắng', 'Đỏ'],
    tags: ['Xe điều khiển', 'BMW', 'Tốc độ', 'Pin sạc'],
    rating: 4.3,
    reviewCount: 76,
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-12-06'),
    isNew: false,
    isFeatured: false
  }
];

// Utility functions
export const getToysByCategory = (categoryId: string): Toy[] => {
  return mockToys.filter(toy => toy.category.id === categoryId);
};

export const getToysByStatus = (status: ToyStatus): Toy[] => {
  return mockToys.filter(toy => toy.status === status);
};

export const searchToys = (query: string): Toy[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockToys.filter(toy => 
    toy.name.toLowerCase().includes(lowercaseQuery) ||
    toy.description.toLowerCase().includes(lowercaseQuery) ||
    toy.brand.toLowerCase().includes(lowercaseQuery) ||
    toy.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getToysByPriceRange = (min: number, max: number): Toy[] => {
  return mockToys.filter(toy => toy.price >= min && toy.price <= max);
};
