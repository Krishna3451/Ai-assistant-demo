import { create } from 'zustand'

interface CategoryState {
  selectedCategory: string
  setCategory: (category: string) => void
}

export const useCategoryStore = create<CategoryState>((set) => ({
  selectedCategory: 'General',
  setCategory: (category) => set({ selectedCategory: category }),
})) 