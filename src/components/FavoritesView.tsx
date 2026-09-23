import React, { useState } from 'react';
import { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { Heart, Search, Sparkles } from 'lucide-react';

interface FavoritesViewProps {
  recipes: Recipe[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onGoToExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  recipes,
  favorites,
  onToggleFavorite,
  onSelectRecipe,
  onGoToExplore,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));
  const displayedRecipes = favoriteRecipes.filter(r =>
    filterQuery.trim()
      ? r.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        r.categoryLabel.toLowerCase().includes(filterQuery.toLowerCase())
      : true
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-black text-[#242A26] font-heading flex items-center gap-2">
            <span>❤️ وصفاتي المفضلة</span>
          </h1>
          <p className="text-xs text-[#606963] mt-0.5">
            الأطباق التي أحببتها وترغب في طبخها دائماً ({favoriteRecipes.length})
          </p>
        </div>
      </div>

      {/* Filter Input if favorites > 2 */}
      {favoriteRecipes.length > 2 && (
        <div className="relative">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9791]" />
          <input
            type="text"
            placeholder="ابحث في أطباقك المفضلة..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white border border-[#EDE7DD] text-xs sm:text-sm text-[#242A26] placeholder-[#969F99] focus:outline-none focus:border-[#4E7659] shadow-xs"
          />
        </div>
      )}

      {/* Grid or Empty */}
      {displayedRecipes.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-[#EDE7DD] space-y-3 mt-4">
          <div className="w-14 h-14 rounded-full bg-[#FAF0E6] text-[#E26D46] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#242A26]">
            {favoriteRecipes.length === 0
              ? 'لم تحفظ أي وصفة في المفضلة بعد'
              : 'لم نجد وصفة مطابقة لبحثك في المفضلة'}
          </h3>
          <p className="text-xs text-[#8E9791] max-w-xs mx-auto">
            اضغط على علامة القلب ❤️ على أي وصفة في التطبيق لحفظها هنا والرجوع لها بسرعة في أي وقت.
          </p>
          <button
            onClick={onGoToExplore}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4E7659] text-white text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>استكشاف وصفات لذيذة</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {displayedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
};
