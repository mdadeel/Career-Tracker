import { describe, it, expect } from "vitest";
import { PIPELINE_STAGES, groupRecentByStage } from "../pipeline";
import type { RecentApplication } from "../../types";

const makeApp = (overrides: Partial<RecentApplication>): RecentApplication => ({
  id: "1",
  companyName: "Acme",
  jobTitle: "Engineer",
  status: "Applied",
  applicationDate: "2026-07-01T00:00:00.000Z",
  interviewDate: null,
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "USD",
  location: null,
  employmentType: null,
  remoteStatus: null,
  createdAt: "2026-07-01T00:00:00.000Z",
  ...overrides,
});

describe("groupRecentByStage", () => {
  it("returns an empty array for an empty input", () => {
    expect(groupRecentByStage([])).toEqual([]);
  });

  it("groups applications by stage, preserving pipeline order", () => {
    const apps = [
      makeApp({ id: "a", status: "Offer" }),
      makeApp({ id: "b", status: "Saved" }),
      makeApp({ id: "c", status: "Interview" }),
    ];

    const groups = groupRecentByStage(apps);

    expect(groups.map((g) => g.key)).toEqual(["saved", "interview", "offer"]);
  });

  it("drops stages that have no applications", () => {
    const apps = [makeApp({ id: "a", status: "Applied" })];

    const groups = groupRecentByStage(apps);

    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe("applied");
    expect(groups[0].apps).toHaveLength(1);
  });

  it("collects multiple applications into the same stage group", () => {
    const apps = [
      makeApp({ id: "a", status: "Interview" }),
      makeApp({ id: "b", status: "Interview" }),
      makeApp({ id: "c", status: "Offer" }),
    ];

    const groups = groupRecentByStage(apps);

    const interview = groups.find((g) => g.key === "interview");
    expect(interview?.apps.map((a) => a.id)).toEqual(["a", "b"]);
  });

  it("matches statuses case-insensitively (statuses are capitalized)", () => {
    const apps = [makeApp({ id: "a", status: "Applied" })];

    const groups = groupRecentByStage(apps);

    expect(groups[0].key).toBe("applied");
    expect(groups[0].apps[0].id).toBe("a");
  });

  it("ignores statuses that are not valid pipeline stages", () => {
    const apps = [
      makeApp({ id: "a", status: "Applied" }),
      makeApp({ id: "b", status: "Ghosted" as RecentApplication["status"] }),
    ];

    const groups = groupRecentByStage(apps);

    expect(groups).toHaveLength(1);
    expect(groups[0].apps.map((a) => a.id)).toEqual(["a"]);
  });

  it("carries the stage metadata (label, color) onto each group", () => {
    const apps = [makeApp({ id: "a", status: "Offer" })];

    const groups = groupRecentByStage(apps);

    expect(groups[0]).toMatchObject({
      key: "offer",
      label: "Offer",
      color: "bg-emerald-500",
    });
  });

  it("does not mutate the input array", () => {
    const apps = [makeApp({ id: "a", status: "Applied" })];
    const snapshot = [...apps];

    groupRecentByStage(apps);

    expect(apps).toEqual(snapshot);
  });
});

describe("PIPELINE_STAGES", () => {
  it("exposes every known application status as a lowercase key", () => {
    const statuses = ["Saved", "Applied", "Assessment", "Interview", "Rejected", "Offer"];
    const keys = PIPELINE_STAGES.map((s) => s.key);

    for (const status of statuses) {
      expect(keys).toContain(status.toLowerCase());
    }
  });

  it("is ordered from earliest to latest stage", () => {
    expect(PIPELINE_STAGES.map((s) => s.key)).toEqual([
      "saved",
      "applied",
      "assessment",
      "interview",
      "rejected",
      "offer",
    ]);
  });
});
