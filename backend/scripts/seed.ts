import { readFileSync } from 'fs';
import { resolve } from 'path';

import { connectDatabase, disconnectDatabase } from '@/config/database';
import { Category } from '@/models/Category.model';
import { CmsContent } from '@/models/CmsContent.model';
import { Coupon } from '@/models/Coupon.model';
import { MenuItem } from '@/models/MenuItem.model';
import { Station } from '@/models/Station.model';
import { User } from '@/models/User.model';
import { uploadImageBuffer } from '@/services/cloudinary.service';
import { CmsContentType, CouponDiscountType, UserRole } from '@/types/domain.types';
import { hashPassword } from '@/utils/hash';
import { logger } from '@/utils/logger';

const FRONTEND_ASSETS_DIR = resolve(__dirname, '../../frontend/src/assets');

async function uploadFrontendAsset(filename: string, folder: string): Promise<string | undefined> {
  try {
    const buffer = readFileSync(resolve(FRONTEND_ASSETS_DIR, filename));
    return await uploadImageBuffer(buffer, folder);
  } catch (error) {
    logger.warn(`Could not upload frontend asset "${filename}" — leaving imageUrl empty`, {
      error: error instanceof Error ? error.message : error,
    });
    return undefined;
  }
}

interface CategorySeed {
  name: string;
  slug: string;
  icon: string;
  displayOrder: number;
  assetFile: string;
}

const CATEGORY_SEEDS: CategorySeed[] = [
  { name: 'Veg Thali', slug: 'veg-thali', icon: '🌿', displayOrder: 1, assetFile: 'food-veg-thali.jpg' },
  { name: 'Non-Veg Thali', slug: 'non-veg-thali', icon: '🍗', displayOrder: 2, assetFile: 'food-chicken-thali.jpg' },
  { name: 'Biryani', slug: 'biryani', icon: '🍛', displayOrder: 3, assetFile: 'food-veg-biryani.jpg' },
  { name: 'Snacks', slug: 'snacks', icon: '🥟', displayOrder: 4, assetFile: 'cat-snacks.jpg' },
  { name: 'Beverages', slug: 'beverages', icon: '🥤', displayOrder: 5, assetFile: 'cat-beverages.jpg' },
  { name: 'Combos', slug: 'combos', icon: '🍱', displayOrder: 6, assetFile: 'cat-combos.jpg' },
  { name: 'Desserts', slug: 'desserts', icon: '🍮', displayOrder: 7, assetFile: 'cat-desserts.jpg' },
];

interface MenuItemSeed {
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  assetFile: string;
  isVeg: boolean;
  categorySlug: string;
  isBestseller?: boolean;
  ingredients: string[];
}

const MENU_ITEM_SEEDS: MenuItemSeed[] = [
  {
    name: 'Veg Thali',
    shortDescription: 'Dal, Paneer, Rice, 2 Roti, Mix Veg, Salad',
    description:
      'A wholesome platter featuring dal tadka, paneer butter masala, basmati rice, two soft rotis, mixed vegetable curry and fresh salad — a complete homestyle meal.',
    price: 14900,
    assetFile: 'food-veg-thali.jpg',
    isVeg: true,
    categorySlug: 'veg-thali',
    isBestseller: true,
    ingredients: ['Toor dal', 'Paneer', 'Basmati rice', 'Whole wheat', 'Mixed veg', 'Salad', 'Cumin', 'Garam masala'],
  },
  {
    name: 'Chicken Curry Thali',
    shortDescription: 'Chicken Curry, Rice, 2 Roti, Dal, Salad',
    description: 'Tender chicken simmered in a rich onion-tomato gravy, served with steamed rice, soft rotis, dal and salad.',
    price: 17900,
    assetFile: 'food-chicken-thali.jpg',
    isVeg: false,
    categorySlug: 'non-veg-thali',
    isBestseller: true,
    ingredients: ['Chicken', 'Onion', 'Tomato', 'Rice', 'Wheat flour', 'Dal', 'Ginger-garlic', 'Spices'],
  },
  {
    name: 'Paneer Butter Masala',
    shortDescription: 'Paneer Butter Masala, Rice, 2 Roti, Salad',
    description: 'Cottage cheese cubes in a creamy tomato-cashew gravy, balanced with butter and aromatic spices.',
    price: 15900,
    assetFile: 'food-paneer.jpg',
    isVeg: true,
    categorySlug: 'veg-thali',
    ingredients: ['Paneer', 'Tomato', 'Cashew', 'Butter', 'Cream', 'Rice', 'Wheat flour'],
  },
  {
    name: 'Veg Biryani',
    shortDescription: 'Veg Biryani with Raita & Salad',
    description: 'Long-grain basmati rice layered with seasonal vegetables, saffron and whole spices.',
    price: 12900,
    assetFile: 'food-veg-biryani.jpg',
    isVeg: true,
    categorySlug: 'biryani',
    ingredients: ['Basmati rice', 'Mixed vegetables', 'Saffron', 'Yogurt', 'Whole spices', 'Mint', 'Fried onion'],
  },
  {
    name: 'Chicken Biryani',
    shortDescription: 'Chicken Biryani with Raita & Salad',
    description: 'Slow-cooked Hyderabadi-style chicken biryani with fragrant basmati, marinated chicken and aromatic spices.',
    price: 16900,
    assetFile: 'food-chicken-biryani.jpg',
    isVeg: false,
    categorySlug: 'biryani',
    isBestseller: true,
    ingredients: ['Basmati rice', 'Chicken', 'Yogurt', 'Saffron', 'Whole spices', 'Mint', 'Fried onion'],
  },
  {
    name: 'Crispy Samosa (2 pcs)',
    shortDescription: 'Golden samosas with mint chutney',
    description: 'Crispy, flaky pastry stuffed with spiced potato-pea filling. Served with fresh mint and tamarind chutney.',
    price: 4900,
    assetFile: 'cat-snacks.jpg',
    isVeg: true,
    categorySlug: 'snacks',
    ingredients: ['Wheat flour', 'Potato', 'Green peas', 'Cumin', 'Coriander', 'Mint chutney'],
  },
  {
    name: 'Rose Lassi',
    shortDescription: 'Chilled rose-flavored yogurt drink',
    description: 'Creamy yogurt blended with rose syrup and a hint of cardamom — refreshing and perfect for journeys.',
    price: 5900,
    assetFile: 'cat-beverages.jpg',
    isVeg: true,
    categorySlug: 'beverages',
    ingredients: ['Yogurt', 'Rose syrup', 'Sugar', 'Cardamom'],
  },
  {
    name: 'Gulab Jamun (3 pcs)',
    shortDescription: 'Warm syrup-soaked milk dumplings',
    description: 'Soft khoya dumplings deep-fried and soaked in cardamom-rose sugar syrup. A classic Indian dessert.',
    price: 6900,
    assetFile: 'cat-desserts.jpg',
    isVeg: true,
    categorySlug: 'desserts',
    isBestseller: true,
    ingredients: ['Khoya', 'Flour', 'Sugar', 'Cardamom', 'Rose water'],
  },
  {
    name: 'Deluxe Veg Combo',
    shortDescription: 'Rice, 2 curries, 2 roti, dessert',
    description: 'A king-sized combo with steamed rice, two curries of the day, soft rotis and a sweet to finish.',
    price: 19900,
    assetFile: 'cat-combos.jpg',
    isVeg: true,
    categorySlug: 'combos',
    ingredients: ['Rice', 'Seasonal curries', 'Wheat flour', 'Dessert', 'Salad'],
  },
];

interface StationSeed {
  name: string;
  code: string;
}

const STATION_SEEDS: StationSeed[] = [
  { name: 'New Delhi', code: 'NDLS' },
  { name: 'Mumbai Central', code: 'BCT' },
  { name: 'Bhopal Junction', code: 'BPL' },
  { name: 'Kanpur Central', code: 'CNB' },
  { name: 'Lucknow', code: 'LKO' },
  { name: 'Chennai Central', code: 'MAS' },
  { name: 'Howrah Junction', code: 'HWH' },
  { name: 'Bengaluru City', code: 'SBC' },
  { name: 'Ahmedabad Junction', code: 'ADI' },
  { name: 'Jaipur Junction', code: 'JP' },
];

async function seedCategories(): Promise<Map<string, string>> {
  const slugToId = new Map<string, string>();
  for (const seed of CATEGORY_SEEDS) {
    const imageUrl = await uploadFrontendAsset(seed.assetFile, 'srfood/categories');
    const category = await Category.findOneAndUpdate(
      { slug: seed.slug },
      { name: seed.name, slug: seed.slug, icon: seed.icon, displayOrder: seed.displayOrder, ...(imageUrl ? { imageUrl } : {}) },
      { upsert: true, new: true },
    );
    slugToId.set(seed.slug, category._id.toString());
    logger.info(`Category seeded: ${seed.name}`);
  }
  return slugToId;
}

async function seedMenuItems(categoryIdBySlug: Map<string, string>): Promise<void> {
  for (const seed of MENU_ITEM_SEEDS) {
    const categoryId = categoryIdBySlug.get(seed.categorySlug);
    if (!categoryId) throw new Error(`Category not seeded: ${seed.categorySlug}`);

    const imageUrl = await uploadFrontendAsset(seed.assetFile, 'srfood/menu-items');

    await MenuItem.findOneAndUpdate(
      { name: seed.name },
      {
        categoryId,
        name: seed.name,
        shortDescription: seed.shortDescription,
        description: seed.description,
        price: seed.price,
        isVeg: seed.isVeg,
        isBestseller: seed.isBestseller ?? false,
        ingredients: seed.ingredients,
        isAvailable: true,
        ...(imageUrl ? { imageUrl } : {}),
      },
      { upsert: true, new: true },
    );
    logger.info(`Menu item seeded: ${seed.name}`);
  }
}

async function seedStations(): Promise<void> {
  for (const seed of STATION_SEEDS) {
    await Station.findOneAndUpdate(
      { code: seed.code },
      { name: seed.name, code: seed.code, isActive: true },
      { upsert: true, new: true },
    );
    logger.info(`Station seeded: ${seed.name}`);
  }
}

async function seedCoupons(): Promise<void> {
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const coupons = [
    {
      code: 'SRFOOD10',
      description: '10% off on your first order',
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValuePaise: 0,
      usageLimitPerUser: 1,
    },
    {
      code: 'TRAIN20',
      description: 'Weekend Special on orders above ₹399',
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 20,
      minOrderValuePaise: 39900,
      usageLimitPerUser: 3,
    },
    {
      code: 'BIRYANI15',
      description: 'Flat 15% off',
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 15,
      minOrderValuePaise: 0,
      usageLimitPerUser: 3,
    },
    {
      code: 'FIRSTMEAL',
      description: 'Up to ₹100 off on your first meal',
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 50,
      maxDiscountPaise: 10000,
      minOrderValuePaise: 0,
      usageLimitPerUser: 1,
    },
  ];

  for (const coupon of coupons) {
    await Coupon.findOneAndUpdate(
      { code: coupon.code },
      { ...coupon, validFrom: new Date(), validUntil: oneYearFromNow, isActive: true },
      { upsert: true, new: true },
    );
    logger.info(`Coupon seeded: ${coupon.code}`);
  }
}

async function seedCmsContent(): Promise<void> {
  const entries: { type: CmsContentType; data: unknown }[] = [
    {
      type: CmsContentType.HOMEPAGE,
      data: {
        hero: [
          { eyebrow: 'Tasty Food,', title: 'On Track!', desc: 'Delicious meals delivered to your seat. Hygienic. Fresh. On Time.', cta: 'Order Now' },
          { eyebrow: 'Fresh Thalis,', title: 'Every Journey!', desc: 'Regional flavors, packed hot and delivered station-side.', cta: 'Explore Menu' },
          { eyebrow: 'Hygienic Kitchens,', title: 'Honest Pricing!', desc: 'FSSAI-certified partners. Live tracking till your seat.', cta: 'See Offers' },
        ],
        offer: { code: 'SRFOOD10', percent: 10, headline: 'On Your First Order', sub: 'Fast Delivery Right to Your Seat' },
      },
    },
    {
      type: CmsContentType.FAQ,
      data: {
        faqs: [
          { question: 'How do I place an order?', answer: 'Browse the menu, add items to your cart, then enter your PNR, coach and seat number at checkout.', displayOrder: 1 },
          { question: 'How is food delivered on train?', answer: 'Our kitchen near your upcoming station prepares food and hands it over at the platform to your seat.', displayOrder: 2 },
          { question: 'Can I cancel an order?', answer: 'Orders can be cancelled before they enter the Preparing stage. Contact support for assistance.', displayOrder: 3 },
          { question: 'What are the payment options?', answer: 'We accept UPI, Cards, Wallets and Cash on Delivery.', displayOrder: 4 },
          { question: 'Is the food hygienic?', answer: 'Our kitchen is FSSAI-certified and follows strict hygiene protocols.', displayOrder: 5 },
        ],
      },
    },
    {
      type: CmsContentType.LEGAL_PRIVACY,
      data: {
        text: 'SR Food respects your privacy. We collect the minimum information necessary to deliver your order — name, contact, PNR/seat details, and payment confirmation. We do not sell your data. Payment details are handled by secure PCI-DSS compliant gateways. You may request deletion of your account at any time from your profile.',
      },
    },
    {
      type: CmsContentType.LEGAL_TERMS,
      data: {
        text: 'By using SR Food you agree to place genuine orders with accurate PNR/seat details. Refunds are issued for undelivered or unsatisfactory orders as per our refund policy. Prices are inclusive of applicable taxes unless stated otherwise.',
      },
    },
    {
      type: CmsContentType.SETTINGS,
      data: {
        social: {
          facebook: 'https://facebook.com/srfood',
          instagram: 'https://instagram.com/srfood',
          twitter: 'https://twitter.com/srfood',
          youtube: 'https://youtube.com/@srfood',
        },
        contactEmail: 'support@srfood.example',
        contactPhone: '+91 98765 43210',
        contactAddress: 'SR Food HQ, Sector 21, New Delhi, India',
        whatsappNumber: '+91 6378639934',
      },
    },
  ];

  for (const entry of entries) {
    await CmsContent.findOneAndUpdate({ type: entry.type }, { data: entry.data, isPublished: true, publishedAt: new Date() }, { upsert: true, new: true });
    logger.info(`CMS content seeded: ${entry.type}`);
  }
}

async function seedSuperAdmin(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@srfood.example';
  const mobile = process.env.SEED_ADMIN_MOBILE ?? '9000000000';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';

  const existing = await User.findOne({ email });
  if (existing) {
    logger.info(`Super admin already exists: ${email}`);
    return;
  }

  await User.create({
    name: 'SR Food Super Admin',
    email,
    mobile,
    passwordHash: await hashPassword(password),
    role: UserRole.SUPER_ADMIN,
    isEmailVerified: true,
    isMobileVerified: true,
  });
  logger.warn(`Seeded super admin — CHANGE THIS PASSWORD IMMEDIATELY: ${email} / ${password}`);
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    await seedSuperAdmin();
    const categoryIdBySlug = await seedCategories();
    await seedMenuItems(categoryIdBySlug);
    await seedStations();
    await seedCoupons();
    await seedCmsContent();
    logger.info('Seed complete.');
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  logger.error('Seed failed', { error: error instanceof Error ? error.message : error });
  process.exit(1);
});
