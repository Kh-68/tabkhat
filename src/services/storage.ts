import { Recipe, WeeklyPlan, ShoppingItem, UserProfile, DayOfWeek, MealType } from '../types';
import { INITIAL_RECIPES } from '../data/initialRecipes';

const RECIPES_KEY = 'tabkhat_recipes_v1';
const FAVORITES_KEY = 'tabkhat_favorites_v1';
const MEAL_PLAN_KEY = 'tabkhat_meal_plan_v1';
const SHOPPING_LIST_KEY = 'tabkhat_shopping_list_v1';
const USER_PROFILE_KEY = 'tabkhat_user_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_1',
  name: 'شيف البيت',
  email: 'chef@tabkhat.app',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  joinedDate: '2026-09-01',
  skillLevel: 'هاوي طبخ',
  dietaryPreferences: ['عائلي', 'سريع التحضير'],
  bio: 'عاشق للنكهات العربية والوصفات المنزلية السريعة والدافئة.',
};

export const INITIAL_MEAL_PLAN: WeeklyPlan = {
  sat: {
    lunch: INITIAL_RECIPES[0], // كبسة
    dinner: INITIAL_RECIPES[4], // شكشوكة
  },
  sun: {
    lunch: INITIAL_RECIPES[1], // شاورما
    snack: INITIAL_RECIPES[7], // كوكيز
  },
  mon: {
    lunch: INITIAL_RECIPES[6], // باستا
  },
  tue: {
    lunch: INITIAL_RECIPES[2], // سلمون
    dinner: INITIAL_RECIPES[9], // سلطة كينوا
  },
  wed: {
    lunch: INITIAL_RECIPES[5], // شوربة عدس
  },
  thu: {
    lunch: INITIAL_RECIPES[3], // فتة باذنجان
    dinner: INITIAL_RECIPES[1], // شاورما
  },
  fri: {
    lunch: INITIAL_RECIPES[0], // كبسة
    snack: INITIAL_RECIPES[8], // عصير ليمون نعناع
  },
};

export const StorageService = {
  getRecipes(): Recipe[] {
    try {
      const stored = localStorage.getItem(RECIPES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial recipes in case new ones were added
        const customRecipes: Recipe[] = parsed.filter((r: Recipe) => r.isUserCreated);
        return [...INITIAL_RECIPES, ...customRecipes];
      }
    } catch (e) {
      console.error('Failed to load recipes from localStorage', e);
    }
    return INITIAL_RECIPES;
  },

  saveCustomRecipe(newRecipe: Recipe): Recipe[] {
    const current = this.getRecipes();
    const updated = [newRecipe, ...current];
    try {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recipe', e);
    }
    return updated;
  },

  deleteCustomRecipe(id: string): Recipe[] {
    const current = this.getRecipes();
    const updated = current.filter(r => r.id !== id);
    try {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete recipe', e);
    }
    return updated;
  },

  getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
    // Initial favorites
    return ['rec-1', 'rec-3', 'rec-8'];
  },

  saveFavorites(ids: string[]): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  },

  getMealPlan(): WeeklyPlan {
    try {
      const stored = localStorage.getItem(MEAL_PLAN_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load meal plan', e);
    }
    return INITIAL_MEAL_PLAN;
  },

  saveMealPlan(plan: WeeklyPlan): void {
    try {
      localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save meal plan', e);
    }
  },

  getShoppingList(): ShoppingItem[] {
    try {
      const stored = localStorage.getItem(SHOPPING_LIST_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load shopping list', e);
    }
    // Generate initial from meal plan
    return this.generateShoppingListFromMealPlan(INITIAL_MEAL_PLAN);
  },

  saveShoppingList(items: ShoppingItem[]): void {
    try {
      localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save shopping list', e);
    }
  },

  getUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
    return DEFAULT_PROFILE;
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  generateShoppingListFromMealPlan(plan: WeeklyPlan): ShoppingItem[] {
    const map = new Map<string, ShoppingItem>();

    const addIngredient = (ing: { name: string; amount: number; unit: string }, recipeTitle?: string) => {
      const key = ing.name.trim().toLowerCase();
      const category = categorizeIngredient(ing.name);

      if (map.has(key)) {
        const existing = map.get(key)!;
        if (existing.unit === ing.unit) {
          existing.amount = Math.round((existing.amount + ing.amount) * 10) / 10;
        }
      } else {
        map.set(key, {
          id: 'shop_' + Math.random().toString(36).substr(2, 9),
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: category.key,
          categoryLabel: category.label,
          checked: false,
          recipeSource: recipeTitle,
        });
      }
    };

    const days: DayOfWeek[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
    days.forEach(d => {
      const day = plan[d];
      if (!day) return;
      const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
      meals.forEach(m => {
        const rec = day[m];
        if (rec && rec.ingredients) {
          rec.ingredients.forEach(ing => addIngredient(ing, rec.title));
        }
      });
    });

    return Array.from(map.values());
  },

  addRecipeToShoppingList(recipe: Recipe, servingsMultiplier = 1): ShoppingItem[] {
    const currentList = this.getShoppingList();
    const map = new Map<string, ShoppingItem>();
    
    currentList.forEach(item => {
      map.set(item.name.trim().toLowerCase(), { ...item });
    });

    recipe.ingredients.forEach(ing => {
      const key = ing.name.trim().toLowerCase();
      const scaledAmount = Math.round(ing.amount * servingsMultiplier * 10) / 10;
      const category = categorizeIngredient(ing.name);

      if (map.has(key)) {
        const existing = map.get(key)!;
        if (existing.unit === ing.unit) {
          existing.amount = Math.round((existing.amount + scaledAmount) * 10) / 10;
        }
      } else {
        map.set(key, {
          id: 'shop_' + Math.random().toString(36).substr(2, 9),
          name: ing.name,
          amount: scaledAmount,
          unit: ing.unit,
          category: category.key,
          categoryLabel: category.label,
          checked: false,
          recipeSource: recipe.title,
        });
      }
    });

    const updated = Array.from(map.values());
    this.saveShoppingList(updated);
    return updated;
  },
};

function categorizeIngredient(name: string): { key: ShoppingItem['category']; label: string } {
  const n = name.toLowerCase();
  if (n.includes('دجاج') || n.includes('لحم') || n.includes('سلمون') || n.includes('سمك') || n.includes('فيليه')) {
    return { key: 'meat', label: 'لحوم وأسماك' };
  }
  if (n.includes('طماطم') || n.includes('بصل') || n.includes('ثوم') || n.includes('ليمون') || n.includes('نعناع') || n.includes('شبت') || n.includes('ريحان') || n.includes('بطاطس') || n.includes('جزر') || n.includes('باذنجان') || n.includes('أفوكادو') || n.includes('رمان') || n.includes('جرجير') || n.includes('هليون') || n.includes('فلفل')) {
    return { key: 'produce', label: 'خضار وفواكه' };
  }
  if (n.includes('حليب') || n.includes('زبادي') || n.includes('لبن') || n.includes('جبن') || n.includes('فيتا') || n.includes('بارميزان') || n.includes('زبدة') || n.includes('بيض')) {
    return { key: 'dairy', label: 'ألبان وأجبان وبيض' };
  }
  if (n.includes('بهار') || n.includes('كمون') || n.includes('هيل') || n.includes('قرفة') || n.includes('ملح') || n.includes('كركم') || n.includes('لومي') || n.includes('بابريكا')) {
    return { key: 'spices', label: 'توابل وبهارات' };
  }
  if (n.includes('خبز') || n.includes('صاج') || n.includes('دقيق') || n.includes('توست')) {
    return { key: 'bakery', label: 'مخبوزات' };
  }
  return { key: 'pantry', label: 'مواد تموينية' };
}
