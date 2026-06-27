import { create } from 'zustand'
import type { ContentItem } from '../data/content'
import { fetchContent } from '../lib/contentApi'

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
  // content (shared by public site + admin)
  content: ContentItem[]
  contentLoading: boolean
  loadContent: () => Promise<void>
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

  content: [],
  contentLoading: true,
  loadContent: async () => {
    set({ contentLoading: true })
    const items = await fetchContent()
    set({ content: items, contentLoading: false })
  },
}))
