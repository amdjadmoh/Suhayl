import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

// Mock the auth context so Layout gets a student user
vi.mock("@/lib/authContext", () => ({
  useAuth: () => ({
    user: {
      _id: "1",
      name: "Test Student",
      email: "student@test.com",
      role: "student",
    },
    token: "mock-token",
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

// Mock the api module for notification hooks used by Layout
vi.mock("@/lib/api", () => ({
  useNotifications: () => ({
    data: { notifications: [], unreadCount: 0 },
    isLoading: false,
  }),
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useMarkAllRead: () => ({ mutate: vi.fn() }),
}))

// Mock the UI components that may have complex dependencies
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <div />,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

import Layout from "@/components/Layout"

describe("Layout", () => {
  it("renders sidebar navigation links for a student user", () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    // Sidebar renders twice (desktop + mobile), so use getAllByText
    const dashboards = screen.getAllByText("Dashboard")
    expect(dashboards.length).toBeGreaterThanOrEqual(1)

    expect(screen.getAllByText("Universities").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Programs").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Matches").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Applications").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Compare").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Saved").length).toBeGreaterThanOrEqual(1)
  })

  it("shows the user name and role in the sidebar", () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    // Name renders twice (desktop sidebar + mobile sidebar)
    const names = screen.getAllByText("Test Student")
    expect(names.length).toBeGreaterThanOrEqual(1)

    // Role renders twice
    const roles = screen.getAllByText("student")
    expect(roles.length).toBeGreaterThanOrEqual(1)
  })

  it("renders the brand name", () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    // Brand name renders in desktop sidebar, mobile sidebar, and mobile header
    const brands = screen.getAllByText("Suhayl")
    expect(brands.length).toBeGreaterThanOrEqual(1)
  })
})
