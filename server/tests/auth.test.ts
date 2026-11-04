import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db";

const app = createApp();

describe("Authentication & Multi-Tenant Tests", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  it("registers a new user and sets session cookie", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "alice@example.com",
        password: "securePassword123",
        name: "Alice",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("alice@example.com");
    expect(res.body.data.user.name).toBe("Alice");
    expect(res.body.data.token).toBeDefined();

    const cookies = res.headers["set-cookie"];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies || ""];
    expect(cookieArray.some((c) => c.includes("slate_session"))).toBe(true);
  });

  it("rejects registration with duplicate email", async () => {
    await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "password123",
      name: "User 1",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "password456",
      name: "User 2",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("authenticates existing user and returns profile on /me", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      email: "bob@example.com",
      password: "password123",
      name: "Bob",
    });

    const token = regRes.body.data.token;

    // Login
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "bob@example.com",
      password: "password123",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);

    // Profile with Bearer token
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe("bob@example.com");
  });

  it("enforces multi-tenant task isolation between users", async () => {
    // User A
    const resA = await request(app).post("/api/auth/register").send({
      email: "usera@example.com",
      password: "password123",
      name: "User A",
    });
    const tokenA = resA.body.data.token;

    // User B
    const resB = await request(app).post("/api/auth/register").send({
      email: "userb@example.com",
      password: "password123",
      name: "User B",
    });
    const tokenB = resB.body.data.token;

    // User A creates a task
    const taskA = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "User A private task" });

    expect(taskA.status).toBe(201);
    const taskId = taskA.body.data.id;

    // User B lists tasks: should NOT see User A's task
    const listB = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(listB.body.data).toHaveLength(0);

    // User B attempts to access User A's task: returns 404
    const getTaskB = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(getTaskB.status).toBe(404);

    // User A can access own task
    const getTaskA = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`);

    expect(getTaskA.status).toBe(200);
    expect(getTaskA.body.data.title).toBe("User A private task");
  });

  it("rejects profile update with empty payload", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      email: "charlie@example.com",
      password: "password123",
      name: "Charlie",
    });
    const token = regRes.body.data.token;

    const res = await request(app)
      .patch("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("revokes other sessions on password change", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      email: "david@example.com",
      password: "password123",
      name: "David",
    });
    const token1 = regRes.body.data.token;

    // second login creates second session
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "david@example.com",
      password: "password123",
    });
    const token2 = loginRes.body.data.token;

    // verify two active sessions
    const sessionsBefore = await request(app)
      .get("/api/auth/sessions")
      .set("Authorization", `Bearer ${token2}`);
    expect(sessionsBefore.body.data.sessions.length).toBe(2);

    // change password using session 2
    const changeRes = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${token2}`)
      .send({
        currentPassword: "password123",
        newPassword: "newPassword456",
      });
    expect(changeRes.status).toBe(200);

    // session 1 should now be revoked
    const meRes1 = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token1}`);
    expect(meRes1.status).toBe(200);
    expect(meRes1.body.data.user).toBeNull();

    // session 2 remains active
    const meRes2 = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token2}`);
    expect(meRes2.status).toBe(200);
  });

  it("returns null user when unauthenticated without console 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeNull();
  });

  it("deletes account with valid password and cascades deletion of tasks and sessions", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      email: "delete.me@example.com",
      password: "strongPassword123",
      name: "Delete Tester",
    });
    const token = regRes.body.data.token;
    const userId = regRes.body.data.user.id;

    // create task belonging to this user
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Account deletion test task", priority: "high" });

    // delete account
    const delRes = await request(app)
      .delete("/api/auth/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "strongPassword123" });

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // verify user is completely removed
    const userInDb = await prisma.user.findUnique({ where: { id: userId } });
    expect(userInDb).toBeNull();

    // verify cascaded task deletion
    const tasksInDb = await prisma.task.findMany({ where: { userId } });
    expect(tasksInDb.length).toBe(0);

    // verify cascaded session deletion
    const sessionsInDb = await prisma.session.findMany({ where: { userId } });
    expect(sessionsInDb.length).toBe(0);

    // verify subsequent auth requests are rejected
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user).toBeNull();
  });

  it("rejects account deletion with incorrect password", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      email: "keep.me@example.com",
      password: "strongPassword123",
      name: "Keep Tester",
    });
    const token = regRes.body.data.token;
    const userId = regRes.body.data.user.id;

    const delRes = await request(app)
      .delete("/api/auth/account")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "wrongPassword" });

    expect(delRes.status).toBe(400);
    expect(delRes.body.success).toBe(false);

    // verify user still exists in database
    const userInDb = await prisma.user.findUnique({ where: { id: userId } });
    expect(userInDb).not.toBeNull();
  });

  it("rejects account deletion when unauthenticated", async () => {
    const res = await request(app)
      .delete("/api/auth/account")
      .send({ password: "somePassword" });

    expect(res.status).toBe(401);
  });
});
