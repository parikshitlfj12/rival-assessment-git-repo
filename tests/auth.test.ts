import { afterEach, describe, expect, it } from "vitest";
import { GET as getMe } from "@/app/api/auth/me/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { POST as signup } from "@/app/api/auth/signup/route";
import {
  createRequest,
  getSetCookieSessionId,
  resetDatabase,
} from "./helpers";

describe("auth flow", () => {
  afterEach(async () => {
    await resetDatabase();
  });

  it("signs up, returns session cookie, loads me, and logs out", async () => {
    const signupResponse = await signup(
      createRequest("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123",
        }),
      }),
    );

    expect(signupResponse.status).toBe(201);
    const sessionId = getSetCookieSessionId(signupResponse);
    expect(sessionId).toBeTruthy();

    const meResponse = await getMe(
      createRequest("http://localhost/api/auth/me", { sessionId: sessionId! }),
    );
    expect(meResponse.status).toBe(200);
    const meJson = await meResponse.json();
    expect(meJson.data.user.email).toBe("user@example.com");

    const logoutResponse = await logout(
      createRequest("http://localhost/api/auth/logout", {
        method: "POST",
        sessionId: sessionId!,
      }),
    );
    expect(logoutResponse.status).toBe(200);

    const meAfterLogout = await getMe(
      createRequest("http://localhost/api/auth/me", { sessionId: sessionId! }),
    );
    expect(meAfterLogout.status).toBe(401);
  });

  it("rejects invalid login credentials", async () => {
    await signup(
      createRequest("http://localhost/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123",
        }),
      }),
    );

    const loginResponse = await login(
      createRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          password: "wrong-password",
        }),
      }),
    );

    expect(loginResponse.status).toBe(401);
  });
});
