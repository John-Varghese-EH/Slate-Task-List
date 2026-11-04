import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from "../schemas/task.schema";

export const getTasks = async (
  req: Request<unknown, unknown, unknown, TaskQueryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status = "all", priority, search } = req.query;
    const userId = req.userId!;

    const whereClause: {
      userId: string;
      completed?: boolean;
      priority?: string;
      OR?: Array<{ title?: { contains: string }; description?: { contains: string } }>;
    } = {
      userId,
    };

    if (status === "active") {
      whereClause.completed = false;
    } else if (status === "completed") {
      whereClause.completed = true;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      whereClause.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { completed: "asc" },
        { createdAt: "desc" },
      ],
    });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request<unknown, unknown, CreateTaskInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, priority, dueDate, completed } = req.body;
    const userId = req.userId!;

    const task = await prisma.task.create({
      data: {
        userId,
        title,
        description: description ?? "",
        priority: priority ?? "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: completed ?? false,
      },
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request<{ id: string }, unknown, UpdateTaskInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    const { title, description, priority, dueDate, completed } = req.body;

    const updateData: {
      title?: string;
      description?: string;
      priority?: string;
      dueDate?: Date | null;
      completed?: boolean;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (completed !== undefined) updateData.completed = completed;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskCompletion = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        completed: !task.completed,
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      throw new AppError("Task not found", 404, "NOT_FOUND");
    }

    const deleted = await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCompletedTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;

    const result = await prisma.task.deleteMany({
      where: { completed: true, userId },
    });

    res.status(200).json({
      success: true,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    next(error);
  }
};
