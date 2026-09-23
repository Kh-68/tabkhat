/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Recipe, RecipeCategory, WeeklyPlan, ShoppingItem, UserProfile, DayOfWeek, MealType } from './types';
import { StorageService } from './services/storage';
import { HeaderNav } from './components/HeaderNav';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { MealPlannerView } from './components/MealPlannerView';
import { ShoppingListView } from './components/ShoppingListView';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { AddRecipeModal } from './components/AddRecipeModal';
import { AddToMealPlanModal } from './components/AddToMealPlanModal';
import { SmartSuggestionsModal } from './components/SmartSuggestionsModal';
import { CookTimerDrawer } from './components/CookTimerDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Primary State
  const [recipes, setRecipes] = useState<Recipe[]>(() => StorageService.getRecipes());
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.getFavorites());
  const [mealPlan, setMealPlan] = useState<WeeklyPlan>(() => StorageService.getMealPlan());
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => StorageService.getShoppingList());
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getUserProfile());

  // Navigation & Active views
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'add' | 'favorites' | 'profile' | 'planner' | 'shopping'>('home');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>('all');
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');

  // Modals & Sheets
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeForMealPlan, setRecipeForMealPlan] = useState<Recipe | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSmartSuggestionsOpen, setIsSmartSuggestionsOpen] = useState<boolean>(false);

  // Timer State
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [timerTitle, setTimerTitle] = useState<string>('مؤقت الطبخ');

  // Favorites toggle handler
  const handleToggleFavorite = (id: string) => {
    let next: string[];
    if (favorites.includes(id)) {
      next = favorites.filter(favId => favId !== id);
    } else {
      next = [...favorites, id];
    }
    setFavorites(next);
    StorageService.saveFavorites(next);
  };

  // Save new custom recipe
  const handleSaveRecipe = (newRecipe: Recipe) => {
    const updated = StorageService.saveCustomRecipe(newRecipe);
    setRecipes(updated);
    // automatically view new recipe
    setSelectedRecipe(newRecipe);
  };

  // Delete custom recipe
  const handleDeleteRecipe = (id: string) => {
    const updated = StorageService.deleteCustomRecipe(id);
    setRecipes(updated);
    if (favorites.includes(id)) {
      handleToggleFavorite(id);
    }
  };

  // Update Meal Plan
  const handleUpdateMealPlan = (newPlan: WeeklyPlan) => {
    setMealPlan(newPlan);
    StorageService.saveMealPlan(newPlan);
  };

  // Add a recipe directly to Meal Plan
  const handleConfirmAddToMealPlan = (recipe: Recipe, day: DayOfWeek, meal: MealType) => {
    const updated = { ...mealPlan };
    if (!updated[day]) {
      updated[day] = {};
    }
    updated[day] = {
      ...updated[day],
      [meal]: recipe,
    };
    handleUpdateMealPlan(updated);
  };

  // Add Recipe ingredients to Shopping List with serving scaler
  const handleAddToShoppingList = (recipe: Recipe, multiplier: number) => {
    const updated = StorageService.addRecipeToShoppingList(recipe, multiplier);
    setShoppingList(updated);
  };

  // Update Shopping items directly
  const handleUpdateShoppingItems = (items: ShoppingItem[]) => {
    setShoppingList(items);
    StorageService.saveShoppingList(items);
  };

  // Regenerate shopping list from current meal plan
  const handleRegenerateShoppingFromMealPlan = () => {
    const generated = StorageService.generateShoppingListFromMealPlan(mealPlan);
    setShoppingList(generated);
    StorageService.saveShoppingList(generated);
  };

  // Update user profile
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    StorageService.saveUserProfile(updatedProfile);
  };

  // Timer trigger
  const handleOpenTimer = (minutes = 10, title = 'مؤقت الطبخ') => {
    setTimerMinutes(minutes);
    setTimerTitle(title);
    setIsTimerOpen(true);
  };

  // Handle Tab navigation
  const handleSelectTab = (tab: 'home' | 'search' | 'add' | 'favorites' | 'profile') => {
    if (tab === 'add') {
      setIsAddModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter user's created recipes
  const userCreatedRecipes = recipes.filter(r => r.isUserCreated);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#242A26] flex flex-col font-['Tajawal',sans-serif]">
      {/* Offline Connectivity Warning */}
      <OfflineIndicator />

      {/* Top Header */}
      <HeaderNav
        currentTab={currentTab}
        onNavigateTab={(tab) => {
          if (tab === 'add') {
            setIsAddModalOpen(true);
          } else {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        shoppingCount={shoppingList.filter(i => !i.checked).length}
        profile={profile}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            recipes={recipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('search');
            }}
            onNavigateTab={(tab) => {
              if (tab === 'add') {
                setIsAddModalOpen(true);
              } else {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onOpenSmartSuggestions={() => setIsSmartSuggestionsOpen(true)}
            onOpenTimer={() => handleOpenTimer(15, 'مؤقت المطبخ')}
            onAddToMealPlan={(r) => setRecipeForMealPlan(r)}
          />
        )}

        {currentTab === 'search' && (
          <SearchView
            recipes={recipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            initialCategory={selectedCategory}
            initialQuery={searchInitialQuery}
          />
        )}

        {currentTab === 'favorites' && (
          <FavoritesView
            recipes={recipes}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onGoToExplore={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'planner' && (
          <MealPlannerView
            plan={mealPlan}
            recipes={recipes}
            onUpdatePlan={handleUpdateMealPlan}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onExportToShoppingList={() => {
              handleRegenerateShoppingFromMealPlan();
              setCurrentTab('shopping');
            }}
          />
        )}

        {currentTab === 'shopping' && (
          <ShoppingListView
            items={shoppingList}
            onUpdateItems={handleUpdateShoppingItems}
            onRegenerateFromMealPlan={handleRegenerateShoppingFromMealPlan}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            userRecipes={userCreatedRecipes}
            favoritesCount={favorites.length}
            shoppingItemsCount={shoppingList.length}
            onUpdateProfile={handleUpdateProfile}
            onDeleteRecipe={handleDeleteRecipe}
            onSelectRecipe={(r) => setSelectedRecipe(r)}
            onOpenAddRecipe={() => setIsAddModalOpen(true)}
            onOpenInstallGuide={() => {
              // Trigger iOS / PWA modal via home view or direct event
              window.dispatchEvent(new CustomEvent('open-pwa-guide'));
            }}
          />
        )}
      </main>

      {/* Bottom Mobile Tab Bar (Thumb-friendly iOS tab bar) */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        favoritesCount={favorites.length}
      />

      {/* Recipe Detail Full-Screen Sheet */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isFavorite={selectedRecipe ? favorites.includes(selectedRecipe.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddToShoppingList={handleAddToShoppingList}
        onOpenMealPlannerDialog={(r) => setRecipeForMealPlan(r)}
        onOpenTimer={handleOpenTimer}
      />

      {/* Add To Meal Plan Modal */}
      <AddToMealPlanModal
        recipe={recipeForMealPlan}
        isOpen={!!recipeForMealPlan}
        onClose={() => setRecipeForMealPlan(null)}
        onConfirm={handleConfirmAddToMealPlan}
      />

      {/* Add Custom Recipe Sheet */}
      <AddRecipeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveRecipe}
      />

      {/* Smart Suggestions Modal ("ماذا أطبخ اليوم؟") */}
      <SmartSuggestionsModal
        isOpen={isSmartSuggestionsOpen}
        onClose={() => setIsSmartSuggestionsOpen(false)}
        recipes={recipes}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onSelectRecipe={(r) => {
          setIsSmartSuggestionsOpen(false);
          setSelectedRecipe(r);
        }}
      />

      {/* Interactive Kitchen Timer Drawer */}
      <CookTimerDrawer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialMinutes={timerMinutes}
        initialTitle={timerTitle}
      />
    </div>
  );
}
