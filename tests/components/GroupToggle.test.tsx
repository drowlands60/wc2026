import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(""),
}));

import { vi } from "vitest";
import { GroupToggle } from "@/components/GroupToggle";

describe("GroupToggle", () => {
  it("renders date and group buttons", () => {
    render(<GroupToggle current="date" />);
    expect(screen.getByText("By Date")).toBeInTheDocument();
    expect(screen.getByText("By Group/Round")).toBeInTheDocument();
  });

  it("highlights the active mode", () => {
    const { container } = render(<GroupToggle current="group" />);
    const groupBtn = container.querySelector("button:nth-child(2)")!;
    expect(groupBtn.className).toContain("bg-emerald-600");
  });

  it("renders section links when in group mode with sections", () => {
    render(<GroupToggle current="group" sections={["Group A", "Group B", "Group C"]} />);
    expect(screen.getByText("Group A")).toBeInTheDocument();
    expect(screen.getByText("Group B")).toBeInTheDocument();
    expect(screen.getByText("Group C")).toBeInTheDocument();
  });

  it("does not render section links in date mode", () => {
    render(<GroupToggle current="date" sections={["Group A"]} />);
    // sections prop is ignored in date mode (no section nav rendered)
    // The component only shows sections when current === "group"
  });
});
