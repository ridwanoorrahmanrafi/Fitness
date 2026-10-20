import { describe, expect, it } from "vitest";
import { auth } from "../lib/auth";
import { authClient } from "../lib/auth-client";

describe("Better Auth Engine", () => {
  it("initializes Better Auth server instance correctly", () => {
    expect(auth).toBeTruthy();
    expect(auth.api).toBeTruthy();
    expect(typeof auth.handler).toBe("function");
  });

  it("initializes Better Auth client with full email & password handlers", () => {
    expect(authClient).toBeTruthy();
    expect(authClient.signIn).toBeTruthy();
    expect(typeof authClient.signIn.email).toBe("function");
    expect(authClient.signUp).toBeTruthy();
    expect(typeof authClient.signUp.email).toBe("function");
    expect(typeof authClient.signOut).toBe("function");
  });
});
