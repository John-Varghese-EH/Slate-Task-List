import { prisma } from "./db";

async function seed() {
  await prisma.task.deleteMany({});

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        title: "Review quarterly architecture proposals",
        description: "Evaluate RFC on state sync and offline cache consistency",
        priority: "high",
        completed: false,
        dueDate: tomorrow,
      },
      {
        title: "Audit design tokens and contrast",
        description: "Verify contrast ratios and tactile transitions across light and dark modes",
        priority: "medium",
        completed: false,
        dueDate: nextWeek,
      },
      {
        title: "Optimize Service Worker cache invalidation",
        description: "Ensure stale-while-revalidate handles background asset refreshes",
        priority: "low",
        completed: false,
      },
      {
        title: "Implement optimistic rollback in useTasks hook",
        description: "Preserve previous state snapshot on network failure with toast notification",
        priority: "medium",
        completed: true,
      },
      {
        title: "Initial REST API schema definition with Zod",
        description: "Type-safe request body and query param parsing",
        priority: "low",
        completed: true,
      },
    ],
  });

  process.stdout.write("Database seeded successfully\n");
  await prisma.$disconnect();
}

seed().catch((err) => {
  process.stderr.write(err.message + "\n");
  process.exit(1);
});
