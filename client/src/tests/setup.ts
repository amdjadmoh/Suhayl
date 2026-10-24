import "@testing-library/jest-dom"

// Node 25+ has its own experimental `localStorage`, which is undefined unless Node
// is started with --localstorage-file. It hides jsdom's, so tests that touch storage
// crashed. Give every test a real in-memory Storage instead.
class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length(): number {
    return this.data.size
  }
  clear(): void {
    this.data.clear()
  }
  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string): void {
    this.data.delete(key)
  }
  setItem(key: string, value: string): void {
    this.data.set(key, String(value))
  }
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  const storage = new MemoryStorage()
  Object.defineProperty(globalThis, name, { value: storage, configurable: true, writable: true })
  if (typeof window !== "undefined") Object.defineProperty(window, name, { value: storage, configurable: true, writable: true })
}
