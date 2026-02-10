import { http, HttpResponse } from "msw";
import type { AuthResponse, LoginRequest } from "~/api/generated";

const FAKE_USER = {
  email: "user@fake.com",
  password: "12345678",
};

const FAKE_AUTH_RESPONSE: AuthResponse = {
  accessToken: "fake-jwt-access-token",
  refreshToken: "fake-jwt-refresh-token",
  user: {
    id: "usr_1",
    email: FAKE_USER.email,
    name: "Fake User",
  },
};

export const handlers = [
  http.post("*/auth/login", async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    if (body.email === FAKE_USER.email && body.password === FAKE_USER.password) {
      return HttpResponse.json(FAKE_AUTH_RESPONSE, { status: 200 });
    }

    return HttpResponse.json(
      { message: "Invalid email or password" },
      { status: 401 },
    );
  }),

  http.post("*/auth/register", async ({ request }) => {
    const body = (await request.json()) as { email?: string; name?: string };

    return HttpResponse.json(
      {
        accessToken: "fake-jwt-access-token",
        refreshToken: "fake-jwt-refresh-token",
        user: {
          id: "usr_" + Math.random().toString(36).slice(2, 8),
          email: body.email,
          name: body.name ?? body.email?.split("@")[0],
        },
      } satisfies AuthResponse,
      { status: 201 },
    );
  }),
];
