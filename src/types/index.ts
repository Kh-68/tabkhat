export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DayOfWeek = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export type RecipeCategory =
  | 'all'
  | 'main'
  | 'breakfast'
  | 'appetizer'
  | 'dessert'
  | 'drinks'
  | 'healthy'
  | 'fast'
  | 'traditional';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface InstructionStep {
  step: number;
  instruction: string;
  tip?: string;
  timerMinutes?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: RecipeCategory;
  categoryLabel: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyLabel: 'سهل' | 'متوسط' | 'متقدم';
  calories: number;
  isFeatured?: boolean;
  isTodayPick?: boolean;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  tags: string[];
  authorId?: string;
  authorName?: string;
  isUserCreated?: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  skillLevel: 'مبتدئ' | 'هاوي طبخ' | 'شيف متمرس';
  dietaryPreferences: string[];
  bio?: string;
}

export interface DayPlan {
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snack?: Recipe;
}

export type WeeklyPlan = Record<DayOfWeek, DayPlan>;

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: 'produce' | 'meat' | 'dairy' | 'spices' | 'pantry' | 'bakery' | 'other';
  categoryLabel: string;
  checked: boolean;
  recipeSource?: string;
}
