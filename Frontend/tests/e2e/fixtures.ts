import { expect, type Page } from "@playwright/test";

type UserRole = "teacher" | "coordinator" | "admin";

interface AuthSessionOptions {
  role?: UserRole;
  roles?: UserRole[];
  name?: string;
  email?: string;
}

const futureIso = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export const activeAcademicYear = {
  id: "academic-year-2026",
  name: "2025/2026",
  startDate: "2025-09-01",
  endDate: "2026-08-31",
  isActive: true,
};

export const dashboardSummary = {
  activeAcademicYear: "2025/2026",
  metrics: {
    totalRequests: 12,
    pendingRequests: 3,
    approvedRequests: 8,
    rejectedRequests: 1,
    activeCourses: 4,
    activeClassrooms: 18,
    activeClassGroups: 9,
    classCoveragePercent: 92,
  },
  trends: [
    { period: "Jan", total: 2, approved: 1, rejected: 0 },
    { period: "Feb", total: 4, approved: 3, rejected: 1 },
    { period: "Mar", total: 6, approved: 4, rejected: 0 },
  ],
  weekSchedule: [
    {
      dayOfWeek: 1,
      date: new Date().toISOString().slice(0, 10),
      events: [
        {
          id: "schedule-1",
          title: "Software Engineering",
          time: "09:00 - 11:00",
          room: "A.1",
          course: "LEI",
          classGroup: "LEI 3.1",
          type: "class",
        },
      ],
    },
  ],
};

export const notifications = [
  {
    id: "notification-1",
    title: "Request approved",
    message: "Your compensation request was approved.",
    type: "RequestStatusUpdated",
    isRead: false,
    createdAt: "2026-06-25T09:00:00Z",
  },
];

export const apiEnvelope = <T>(data: T, message = "OK") => ({
  success: true,
  message,
  data,
});

export const installApiMocks = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("language", "en");
  });

  await page.route("http://localhost:5005/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope(null)),
    });
  });

  await page.route("http://localhost:5005/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        apiEnvelope({
          devMagicLink: "http://127.0.0.1:5174/auth/verify?token=e2e-token",
        }),
      ),
    });
  });

  await page.route("http://localhost:5005/api/auth/verify**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        apiEnvelope({
          accessToken: "access-token",
          accessTokenExpiresAt: futureIso(1),
          refreshToken: "refresh-token",
          refreshTokenExpiresAt: futureIso(24),
          userId: "user-123",
          email: "teacher@compensa.test",
          fullName: "Test Teacher",
          roles: ["Teacher", "Coordinator"],
        }),
      ),
    });
  });

  await page.route("http://localhost:5005/api/academic-years/active", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope(activeAcademicYear)),
    });
  });

  await page.route("http://localhost:5005/api/academic-years", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope([activeAcademicYear])),
    });
  });

  await page.route("http://localhost:5005/api/dashboard/summary**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope(dashboardSummary)),
    });
  });

  await page.route("http://localhost:5005/api/notifications", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope(notifications)),
    });
  });

  await page.route("http://localhost:5005/api/notifications/*/read", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(apiEnvelope(null)),
    });
  });
};

export const seedAuthSession = async (
  page: Page,
  {
    role = "teacher",
    roles = [role],
    name = "Test Teacher",
    email = "teacher@compensa.test",
  }: AuthSessionOptions = {},
) => {
  await page.addInitScript(
    ({ sessionRole, sessionRoles, sessionName, sessionEmail }) => {
      window.localStorage.setItem(
        "compensa.auth.session",
        JSON.stringify({
          accessToken: "access-token",
          accessTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          refreshToken: "refresh-token",
          refreshTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          user: {
            id: "user-123",
            email: sessionEmail,
            name: sessionName,
            roles: sessionRoles,
          },
        }),
      );
      window.localStorage.setItem("compensa.auth.activeRole", sessionRole);
      window.localStorage.setItem("language", "en");
    },
    {
      sessionRole: role,
      sessionRoles: roles,
      sessionName: name,
      sessionEmail: email,
    },
  );
};

export const expectDashboardShell = async (page: Page) => {
  await expect(page.getByText("Compensa+").first()).toBeVisible();
  await expect(page.getByText("Total Requests").first()).toBeVisible();
  await expect(page.getByText("12").first()).toBeVisible();
  await expect(page.getByText("Request approved").first()).toBeVisible();
};
