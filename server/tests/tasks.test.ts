import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db";

const app = createApp();

describe("Task API Integration Tests", () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.session.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});

    // register test user
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test.tasks@example.com",
        password: "password123",
        name: "Test User",
      });
    authToken = res.body.data.token;
    testUserId = res.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.session.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.task.deleteMany({});
  });

  describe("Security: Authentication requirements", () => {
    it("rejects unauthenticated GET /api/tasks with 401", async () => {
      const response = await request(app).get("/api/tasks");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects unauthenticated POST /api/tasks with 401", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Unauthorized task" });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("rejects unauthenticated GET /api/tasks/:id with 401", async () => {
      const response = await request(app).get(
        "/api/tasks/00000000-0000-0000-0000-000000000000"
      );
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("rejects unauthenticated PATCH /api/tasks/:id with 401", async () => {
      const response = await request(app)
        .patch("/api/tasks/00000000-0000-0000-0000-000000000000")
        .send({ title: "Hacked" });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("rejects unauthenticated DELETE /api/tasks/:id with 401", async () => {
      const response = await request(app).delete(
        "/api/tasks/00000000-0000-0000-0000-000000000000"
      );
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("rejects invalid Bearer token with 401", async () => {
      const response = await request(app)
        .get("/api/tasks")
        .set("Authorization", "Bearer invalid-tampered-token");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/tasks", () => {
    it("creates a task with valid payload", async () => {
      const payload = {
        title: "Review quarterly roadmap",
        description: "Prepare key slides and milestones",
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe(payload.title);
      expect(response.body.data.description).toBe(payload.description);
      expect(response.body.data.priority).toBe(payload.priority);
      expect(response.body.data.completed).toBe(false);
    });

    it("rejects an empty task title with 400", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "   " })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.message).toBeDefined();
    });

    it("rejects invalid priority value with 400", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Valid title", priority: "urgent" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/tasks", () => {
    it("lists and filters tasks by status and search term", async () => {
      await prisma.task.createMany({
        data: [
          { title: "Alpha task", completed: false, priority: "low", userId: testUserId },
          { title: "Beta task", completed: true, priority: "medium", userId: testUserId },
          { title: "Gamma search match", completed: false, priority: "high", userId: testUserId },
        ],
      });

      const listResponse = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data.length).toBe(3);

      const activeResponse = await request(app)
        .get("/api/tasks?status=active")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(activeResponse.body.data.length).toBe(2);
      expect(activeResponse.body.data.every((t: { completed: boolean }) => !t.completed)).toBe(true);

      const completedResponse = await request(app)
        .get("/api/tasks?status=completed")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(completedResponse.body.data.length).toBe(1);
      expect(completedResponse.body.data[0].completed).toBe(true);

      const searchResponse = await request(app)
        .get("/api/tasks?search=Gamma")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);
      expect(searchResponse.body.data.length).toBe(1);
      expect(searchResponse.body.data[0].title).toBe("Gamma search match");
    });

    it("rejects search query longer than 100 characters with 400", async () => {
      const longQuery = "a".repeat(101);
      const response = await request(app)
        .get(`/api/tasks?search=${longQuery}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("returns 400 when task ID is not a valid UUID", async () => {
      const response = await request(app)
        .get("/api/tasks/invalid-uuid-123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 404 when task is not found", async () => {
      const nonExistentUuid = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .get(`/api/tasks/${nonExistentUuid}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /api/tasks/:id and toggle", () => {
    it("updates task fields and toggles completion", async () => {
      const created = await prisma.task.create({
        data: { title: "Draft documentation", priority: "low", userId: testUserId },
      });

      const updateResponse = await request(app)
        .patch(`/api/tasks/${created.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated documentation", priority: "high" })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.title).toBe("Updated documentation");
      expect(updateResponse.body.data.priority).toBe("high");

      const toggleResponse = await request(app)
        .patch(`/api/tasks/${created.id}/toggle`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(toggleResponse.body.success).toBe(true);
      expect(toggleResponse.body.data.completed).toBe(true);

      const toggleBack = await request(app)
        .patch(`/api/tasks/${created.id}/toggle`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(toggleBack.body.data.completed).toBe(false);
    });
  });

  describe("DELETE /api/tasks/:id and clear completed", () => {
    it("deletes a task and returns 404 on subsequent get", async () => {
      const task = await prisma.task.create({
        data: { title: "Task to delete", userId: testUserId },
      });

      const deleteResponse = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.id).toBe(task.id);

      await request(app)
        .get(`/api/tasks/${task.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("clears all completed tasks", async () => {
      await prisma.task.createMany({
        data: [
          { title: "Active 1", completed: false, userId: testUserId },
          { title: "Done 1", completed: true, userId: testUserId },
          { title: "Done 2", completed: true, userId: testUserId },
        ],
      });

      const clearResponse = await request(app)
        .delete("/api/tasks/completed")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(clearResponse.body.success).toBe(true);
      expect(clearResponse.body.data.count).toBe(2);

      const remaining = await prisma.task.findMany({ where: { userId: testUserId } });
      expect(remaining.length).toBe(1);
      expect(remaining[0].title).toBe("Active 1");
    });
  });
});
