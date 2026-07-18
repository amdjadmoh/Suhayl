import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider, useAuth } from "@/lib/authContext"

// Mock the api module
const mockLoginUser = vi.fn()
const mockRegisterUser = vi.fn()
const mockGetMe = vi.fn()

vi.mock("@/lib/api", () => ({
  loginUser: (...args: unknown[]) => mockLoginUser(...args),
  registerUser: (...args: unknown[]) => mockRegisterUser(...args),
  getMe: (...args: unknown[]) => mockGetMe(...args),
}))

// Test component that exercises the auth context
function TestComponent(): React.ReactElement {
  const { user, token, isLoading, login, register, logout } = useAuth()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : "null"}</div>
      <div data-testid="token">{token ?? "null"}</div>
      <button
        data-testid="login-btn"
        onClick={() => login("a@b.com", "pass")}
      >
        Login
      </button>
      <button
        data-testid="register-btn"
        onClick={() => register("Name", "a@b.com", "pass", "student")}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

function renderWithProviders(): ReturnType<typeof render> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  mockGetMe.mockRejectedValue(new Error("no token stored"))
})

describe("AuthContext", () => {
  it("starts with no user and no token", async () => {
    renderWithProviders()

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("null")
      expect(screen.getByTestId("token").textContent).toBe("null")
    })
  })

  it("logs in and stores the token in localStorage", async () => {
    const userData = {
      _id: "1",
      email: "a@b.com",
      name: "Alice",
      role: "student",
    }
    mockLoginUser.mockResolvedValue({ token: "test-token", user: userData })

    renderWithProviders()

    fireEvent.click(screen.getByTestId("login-btn"))

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("a@b.com", "pass")
      expect(localStorage.getItem("token")).toBe("test-token")
      const userEl = screen.getByTestId("user")
      const parsed = JSON.parse(userEl.textContent!)
      expect(parsed.email).toBe("a@b.com")
    })
  })

  it("logs out and clears the token", async () => {
    // First login
    const userData = {
      _id: "1",
      email: "a@b.com",
      name: "Alice",
      role: "student",
    }
    mockLoginUser.mockResolvedValue({ token: "test-token", user: userData })

    renderWithProviders()
    fireEvent.click(screen.getByTestId("login-btn"))

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("test-token")
    })

    // Now logout
    fireEvent.click(screen.getByTestId("logout-btn"))

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull()
      expect(screen.getByTestId("token").textContent).toBe("null")
      expect(screen.getByTestId("user").textContent).toBe("null")
    })
  })

  it("registers a new user and stores the token", async () => {
    const userData = {
      _id: "2",
      email: "a@b.com",
      name: "Name",
      role: "student",
    }
    mockRegisterUser.mockResolvedValue({ token: "reg-token", user: userData })

    renderWithProviders()
    fireEvent.click(screen.getByTestId("register-btn"))

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith(
        "Name",
        "a@b.com",
        "pass",
        "student"
      )
      expect(localStorage.getItem("token")).toBe("reg-token")
    })
  })
})
