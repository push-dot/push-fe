import { it, expect } from "vitest";
import { createServer } from "node:http";
import { request } from "@/shared/api";
import { useSession } from "@/shared/auth";
it("unwraps envelopes and refreshes an expired bearer only once", async () => {
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/auth/refresh") {
      res.end(
        JSON.stringify({
          data: { accessToken: "new", refreshToken: "rotated" },
        }),
      );
      return;
    }
    if (req.headers.authorization !== "Bearer new") {
      res.statusCode = 401;
      res.end('{"error":{"code":"UNAUTHORIZED","message":"expired"}}');
      return;
    }
    res.end('{"data":[{"id":"real"}]}');
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  useSession.setState({
    apiUrl: `http://127.0.0.1:${address.port}`,
    accessToken: "expired",
    refreshToken: "refresh",
  });
  try {
    expect(await request("jobs")).toEqual([{ id: "real" }]);
    expect(useSession.getState().refreshToken).toBe("rotated");
  } finally {
    server.close();
  }
});
it("does not resurrect credentials when logout happens during a refresh", async () => {
  let release: () => void = () => {};
  let refreshStarted: () => void = () => {};
  const started = new Promise<void>((resolve) => {
    refreshStarted = resolve;
  });
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/auth/refresh") {
      refreshStarted();
      await blocked;
      res.end(
        '{"data":{"accessToken":"leaked","refreshToken":"leaked-refresh"}}',
      );
      return;
    }
    res.statusCode = 401;
    res.end('{"error":{"code":"TOKEN_EXPIRED","message":"expired"}}');
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  useSession.setState({
    apiUrl: `http://127.0.0.1:${address.port}`,
    accessToken: "old",
    refreshToken: "old-refresh",
    accountId: "account-a",
  });
  const pending = request("jobs");
  await started;
  useSession.getState().clear();
  release();
  try {
    await expect(pending).rejects.toThrow();
    expect(useSession.getState().accessToken).toBe("");
    expect(useSession.getState().refreshToken).toBe("");
  } finally {
    server.close();
  }
});
it("clears credentials on API origin change and rejects non-loopback HTTP", () => {
  useSession.setState({
    apiUrl: "http://localhost:8080/api/v1",
    accessToken: "private",
    refreshToken: "private-refresh",
    accountId: "account",
  });
  useSession.getState().set({ apiUrl: "https://api.example.com/api/v1" });
  expect(useSession.getState().accessToken).toBe("");
  expect(() =>
    useSession.getState().set({ apiUrl: "http://untrusted.example/api/v1" }),
  ).toThrow();
});
