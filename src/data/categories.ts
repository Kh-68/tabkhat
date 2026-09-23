import { RecipeCategory } from '../types';

export interface CategoryInfo {
  id: RecipeCategory;
  name: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', name: 'الكل', icon: '🍽️', description: 'جميع الوصفات' },
  { id: 'traditional', name: 'شعبي وخليجي', icon: '🍲', description: 'أكلات أصيلة بنكهات زمان' },
  { id: 'main', name: 'أطباق رئيسية', icon: '🥘', description: 'وجبات غداء وعشاء متكاملة' },
  { id: 'breakfast', name: 'فطور', icon: '🍳', description: 'صباح الخير بنكهة لذيذة' },
  { id: 'fast', name: 'وجبات سريعة', icon: '🥪', description: 'وصفات شهية في وقت قياسي' },
  { id: 'healthy', name: 'صحي ودايت', icon: '🥗', description: 'قليل السعرات وغني بالطاقة' },
  { id: 'appetizer', name: 'مقبلات وسلطات', icon: '🧆', description: 'أطباق جانبية تفتح الشهية' },
  { id: 'dessert', name: 'حلويات', icon: '🍰', description: 'تحلية تسعد القلب' },
  { id: 'drinks', name: 'مشروبات', icon: '🍹', description: 'عصائر ومنعشات طازجة' },
];

export const DAYS_OF_WEEK = [
  { key: 'sat', name: 'السبت', short: 'سبت' },
  { key: 'sun', name: 'الأحد', short: 'أحد' },
  { key: 'mon', name: 'الإثنين', short: 'إثنين' },
  { key: 'tue', name: 'الثلاثاء', short: 'ثلاثاء' },
  { key: 'wed', name: 'الأربعاء', short: 'أربعاء' },
  { key: 'thu', name: 'الخميس', short: 'خميس' },
  { key: 'fri', name: 'الجمعة', short: 'جمعة' },
] as const;

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'فطور', icon: '🍳', timeHint: 'صباحاً' },
  { key: 'lunch', label: 'غداء', icon: '🍲', timeHint: 'ظهراً' },
  { key: 'dinner', label: 'عشاء', icon: '🥪', timeHint: 'مساءً' },
  { key: 'snack', label: 'سناك / حلى', icon: '☕', timeHint: 'بين الوجبات' },
] as const;

export const PANTRY_INGREDIENTS = [
  'دجاج', 'لحم', 'سلمون', 'أرز', 'مكرونة', 'طماطم', 'بصل',
  'ثوم', 'بطاطس', 'بيض', 'زبادي', 'جبنة', 'ليمون', 'نعناع',
  'عدس', 'حمص', 'باذنجان', 'كينوا', 'زيت زيتون', 'زبدة', 'شوكولاتة'
];
