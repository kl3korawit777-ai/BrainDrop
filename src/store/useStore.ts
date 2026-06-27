import { create } from 'zustand'

interface Store {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeTags: string[]
  toggleTag: (tag: string) => void
  activeSubject: string
  setActiveSubject: (s: string) => void
  readProgress: Record<string, number>
  setReadProgress: (id: string, page: number) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

export const useStore = create<Store>((set, get) => ({
  theme: 'light',
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    set({ theme: next })
  },
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  activeTags: [],
  toggleTag: (tag) => {
    const cur = get().activeTags
    set({ activeTags: cur.includes(tag) ? cur.filter(t => t !== tag) : [...cur, tag] })
  },
  activeSubject: 'ทั้งหมด',
  setActiveSubject: (s) => set({ activeSubject: s }),
  readProgress: {},
  setReadProgress: (id, page) =>
    set(s => ({ readProgress: { ...s.readProgress, [id]: page } })),
  sidebarOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}))
