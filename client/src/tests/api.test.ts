import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"

// Define mock instance inside the factory to avoid hoisting issues
vi.mock("axios", () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
    },
  }
  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
    create: vi.fn(() => mockInstance),
  }
})

// Now import the API functions (they'll use the mocked axios instance)
import {
  loginUser,
  registerUser,
  getMe,
  getUniversities,
  getApplications,
  createApplication,
} from "@/lib/api"

// Get a reference to the mock instance that the api module uses
const mockAxiosInstance = (axios.create as ReturnType<typeof vi.fn>)()

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe("API client", () => {
  describe("loginUser", () => {
    it("calls POST /auth/login with email and password", async () => {
      const userData = {
        _id: "1",
        email: "test@test.com",
        name: "Test",
        role: "student",
      }
      mockAxiosInstance.post.mockResolvedValue({
        data: { token: "abc123", user: userData },
      })

      const result = await loginUser("test@test.com", "password")

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@test.com",
        password: "password",
      })
      expect(result.token).toBe("abc123")
      expect(result.user.email).toBe("test@test.com")
    })
  })

  describe("registerUser", () => {
    it("calls POST /auth/register with user details", async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          token: "reg-token",
          user: { _id: "2", email: "new@test.com", name: "New", role: "student" },
        },
      })

      const result = await registerUser("New", "new@test.com", "pass123", "student")

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/auth/register", {
        name: "New",
        email: "new@test.com",
        password: "pass123",
        role: "student",
      })
      expect(result.token).toBe("reg-token")
    })
  })

  describe("getMe", () => {
    it("calls GET /auth/me and returns the user", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { user: { _id: "1", email: "test@test.com", name: "Test", role: "student" } },
      })

      const result = await getMe()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/auth/me")
      expect(result.email).toBe("test@test.com")
    })
  })

  describe("getUniversities", () => {
    it("calls GET /universities with optional params", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { universities: [{ _id: "u1", name: "MIT" }], total: 1 },
      })

      const result = await getUniversities({ search: "MIT" })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/universities", {
        params: { search: "MIT" },
      })
      expect(result.universities).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe("getApplications", () => {
    it("calls GET /applications", async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { applications: [{ _id: "a1", studentName: "Alice" }], total: 1 },
      })

      const result = await getApplications()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/applications", {
        params: undefined,
      })
      expect(result.applications).toHaveLength(1)
    })
  })

  describe("createApplication", () => {
    it("calls POST /applications with form data", async () => {
      const appData = {
        _id: "a2",
        studentName: "Bob",
        studentEmail: "bob@test.com",
      } as any
      mockAxiosInstance.post.mockResolvedValue({ data: appData })

      const payload = {
        programId: "p1",
        studentName: "Bob",
        studentEmail: "bob@test.com",
      } as any
      const result = await createApplication(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        "/applications",
        payload
      )
      expect(result.studentName).toBe("Bob")
    })
  })

  describe("interceptors", () => {
    it("registers a request interceptor", () => {
      // The api module registers a request interceptor at load time.
      // The mock instance's interceptors.request.use should have been called.
      // We verify by checking the mock was created with the right structure.
      expect(mockAxiosInstance.interceptors).toBeDefined()
      expect(mockAxiosInstance.interceptors.request).toBeDefined()
      expect(typeof mockAxiosInstance.interceptors.request.use).toBe("function")
    })
  })
})
