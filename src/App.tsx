import { useState } from 'react';
import './App.css';
import { AppShell } from './components/layout/AppShell';
import { HomeView } from './views/HomeView';
import { PantryView } from './views/PantryView';
import { RecipesView } from './views/RecipesView';
import { AllergyView } from './views/AllergyView';
import { FavoritesView } from './views/FavoritesView';
import { RequestsView } from './views/RequestsView';

export type Tab = 'home' | 'pantry' | 'recipes' | 'allergy' | 'favorites' | 'requests';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  return (
    <AppShell tab={tab} onTabChange={setTab}>
      {tab === 'home' && (
        <HomeView
          onGoToRecipes={() => setTab('recipes')}
          onGoToPantry={() => setTab('pantry')}
          onSelectRecipe={(id) => { setSelectedRecipeId(id); setTab('recipes'); }}
        />
      )}
      {tab === 'pantry' && <PantryView />}
      {tab === 'recipes' && (
        <RecipesView
          initialRecipeId={selectedRecipeId}
          onClearSelected={() => setSelectedRecipeId(null)}
        />
      )}
      {tab === 'allergy' && <AllergyView />}
      {tab === 'favorites' && (
        <FavoritesView
          onSelectRecipe={(id) => { setSelectedRecipeId(id); setTab('recipes'); }}
        />
      )}
      {tab === 'requests' && <RequestsView />}
    </AppShell>
  );
}
