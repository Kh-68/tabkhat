import React, { useState, useMemo } from 'react';
import { Recipe, RecipeCategory } from '../types';
import { CATEGORIES } from '../data/categories';
import { RecipeCard } from './RecipeCard';
import { Search, SlidersHorizontal, X, Clock, Users, ChefHat } from 'lucide-react';

interface SearchViewProps {
  recipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  initialCategory?: RecipeCategory;
  initialQuery?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  recipes,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
  initialCategory = 'all',
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>(initialCategory);
  const [maxTime, setMaxTime] = useState<number>(0); // 0 = any
  const [servingsFilter, setServingsFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [onlyUserCreated, setOnlyUserCreated] = useState<boolean>(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Filtered recipes calculation
  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      // Query search in title, description, or ingredients
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesIngredients = r.ingredients.some(i => i.name.toLowerCase().includes(q));
        const matchesTags = r.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesIngredients && !matchesTags) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }

      // Time filter
      if (maxTime > 0 && (r.prepTime + r.cookTime) > maxTime) {
        return false;
      }

      // Servings filter
      if (servingsFilter === '1-2' && r.servings > 2) return false;
      if (servingsFilter === '3-4' && (r.servings < 3 || r.servings > 4)) return false;
      if (servingsFilter === '5+' && r.servings < 5) return false;

      // Difficulty
      if (difficultyFilter !== 'all' && r.difficulty !== difficultyFilter) {
        return false;
      }

      // Only user created
      if (onlyUserCreated && !r.isUserCreated) {
        return false;
      }

      return true;
    });
  }, [recipes, query, selectedCategory, maxTime, servingsFilter, difficultyFilter, onlyUserCreated]);

  const activeFiltersCount =
    (maxTime > 0 ? 1 : 0) +
    (servingsFilter !== 'all' ? 1 : 0) +
    (difficultyFilter !== 'all' ? 1 : 0) +
    (onlyUserCreated ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setMaxTime(0);
    setServingsFilter('all');
    setDifficultyFilter('all');
    setOnlyUserCreated(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-4 pb-28">
      {/* Search Input Bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9791]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم الطبخة، المكونات (دجاج، أرز)..."
            className="w-full pr-10 pl-10 py-3 rounded-2xl bg-white border border-[#EDE7DD] text-xs sm:text-sm text-[#242A26] placeholder-[#969F99] focus:outline-none focus:border-[#4E7659] shadow-xs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8E9791] hover:text-[#242A26]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFiltersModal(true)}
          className={`relative p-3 rounded-2xl border transition shadow-xs active:scale-95 ${
            activeFiltersCount > 0
              ? 'bg-[#4E7659] text-white border-[#4E7659]'
              : 'bg-white text-[#242A26] border-[#EDE7DD] hover:bg-[#FAF8F5]'
          }`}
          title="فلاتر البحث"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#E26D46] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-[#4E7659] text-white border-[#4E7659] shadow-xs'
                  : 'bg-white text-[#606963] border-[#EDE7DD] hover:bg-[#F2ECE2]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[11px] text-[#8E9791]">فلاتر نشطة:</span>
          {maxTime > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#E26D46] font-bold flex items-center gap-1">
              <span>أقل من {maxTime} دقيقة</span>
              <button onClick={() => setMaxTime(0)}>✕</button>
            </span>
          )}
          {servingsFilter !== 'all' && (
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#E26D46] font-bold flex items-center gap-1">
              <span>{servingsFilter} أشخاص</span>
              <button onClick={() => setServingsFilter('all')}>✕</button>
            </span>
          )}
          {difficultyFilter !== 'all' && (
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#E26D46] font-bold flex items-center gap-1">
              <span>{difficultyFilter === 'easy' ? 'سهل' : difficultyFilter === 'medium' ? 'متوسط' : 'متقدم'}</span>
              <button onClick={() => setDifficultyFilter('all')}>✕</button>
            </span>
          )}
          {onlyUserCreated && (
            <span className="px-2.5 py-1 rounded-lg bg-[#FAF0E6] text-[#E26D46] font-bold flex items-center gap-1">
              <span>وصفاتي الخاصة</span>
              <button onClick={() => setOnlyUserCreated(false)}>✕</button>
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-[11px] text-[#4E7659] hover:underline font-bold"
          >
            إعادة تعيين الكل
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-[#242A26]">
          النتائج ({filteredRecipes.length})
        </span>
        {query && (
          <span className="text-[11px] text-[#8E9791]">
            بحثاً عن «{query}»
          </span>
        )}
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white border border-[#EDE7DD] space-y-2">
          <p className="text-2xl">🔍</p>
          <h3 className="text-sm font-bold text-[#242A26]">لم يتم العثور على وصفات</h3>
          <p className="text-xs text-[#8E9791]">
            جرب كلمات بحث أخرى، مثل «دجاج»، «أرز»، أو قم بتعديل الفلاتر.
          </p>
          <button
            onClick={() => {
              setQuery('');
              resetAllFilters();
            }}
            className="mt-2 text-xs font-bold text-[#4E7659] hover:underline"
          >
            مسح جميع الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={favorites.includes(recipe.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      )}

      {/* Filter Options Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-[#FAF8F5] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-[#EDE7DD] space-y-5 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE7DD]">
              <h3 className="text-sm font-bold text-[#242A26] flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#4E7659]" />
                <span>خيارات تصفية البحث</span>
              </h3>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#606963]"
              >
                ✕
              </button>
            </div>

            {/* Time Filter */}
            <div>
              <label className="text-xs font-bold text-[#242A26] block mb-2">
                الوقت الإجمالي الأقصى:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 0, label: 'الكل' },
                  { value: 20, label: '20 د' },
                  { value: 35, label: '35 د' },
                  { value: 50, label: '50 د' },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setMaxTime(t.value)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      maxTime === t.value
                        ? 'bg-[#4E7659] text-white border-[#4E7659]'
                        : 'bg-white text-[#242A26] border-[#EDE7DD]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Servings Filter */}
            <div>
              <label className="text-xs font-bold text-[#242A26] block mb-2">
                عدد الحصص (الأشخاص):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'all', label: 'الكل' },
                  { value: '1-2', label: '1 - 2' },
                  { value: '3-4', label: '3 - 4' },
                  { value: '5+', label: '5 فأكثر' },
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setServingsFilter(s.value)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      servingsFilter === s.value
                        ? 'bg-[#4E7659] text-white border-[#4E7659]'
                        : 'bg-white text-[#242A26] border-[#EDE7DD]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-xs font-bold text-[#242A26] block mb-2">
                مستوى الصعوبة:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'all', label: 'الكل' },
                  { value: 'easy', label: 'سهل' },
                  { value: 'medium', label: 'متوسط' },
                  { value: 'hard', label: 'متقدم' },
                ].map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficultyFilter(d.value)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      difficultyFilter === d.value
                        ? 'bg-[#4E7659] text-white border-[#4E7659]'
                        : 'bg-white text-[#242A26] border-[#EDE7DD]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User created toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EDE7DD]">
              <span className="text-xs font-bold text-[#242A26]">
                عرض الوصفات التي أضفتها بنفسي فقط
              </span>
              <input
                type="checkbox"
                checked={onlyUserCreated}
                onChange={(e) => setOnlyUserCreated(e.target.checked)}
                className="w-5 h-5 rounded text-[#4E7659] focus:ring-0"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 rounded-xl bg-white border border-[#EDE7DD] text-xs font-bold text-[#606963]"
              >
                إعادة تعيين
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow-md"
              >
                تطبيق الفلاتر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
