import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/predictions",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}));

import { vi } from "vitest";
import { Navbar } from "@/components/Navbar";

describe("Navbar", () => {
  it("renders navigation links when user is logged in", () => {
    render(<Navbar user={{ email: "test@test.com", id: "123" }} />);
    expect(screen.getAllByText("Predictions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Leaderboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Matches").length).toBeGreaterThan(0);
  });

  it("shows sign out button when user is logged in", () => {
    render(<Navbar user={{ email: "test@test.com", id: "123" }} />);
    expect(screen.getAllByText("Sign Out").length).toBeGreaterThan(0);
  });

  it("shows sign in link when user is not logged in", () => {
    render(<Navbar user={null} />);
    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);
  });
});
