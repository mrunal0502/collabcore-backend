import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Project } from "../models/project.model.js";
import { Note } from "../models/note.model.js";
import { Task } from "../models/task.model.js";
import { SubTask } from "../models/subtask.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import mongoose from "mongoose";
import {
  AvailableUserRole,
  UserRolesEnum,
  AvailableTaskStatus,
} from "../utils/constants.js";

const getTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({ project: projectId }).populate(
    "assignedTo",
    "avatar username fullName",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  if (!title || !description || !assignedTo) {
    throw new ApiError(400, "All fields are required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const files = req.files || [];

  const attachments = files.map((file) => {
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
  });

  const user = await User.findById(assignedTo);

  if (!user) {
    throw new ApiError(404, "Assigned user not found");
  }

  const member = await ProjectMember.findOne({
    user: assignedTo,
    project: projectId,
  });

  if (!member) {
    throw new ApiError(400, "User not part of project");
  }

  const task = await Task.create({
    title,
    description,
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : undefined,
    assignedBy: req.user._id,
    status: AvailableTaskStatus.TODO,
    project: projectId,
    attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            _id: 1,
            username: 1,
            avatar: 1,
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addField: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  //   const task = await Task.findById(taskId);

  //   if (!task) {
  //     throw new ApiError(404, "Task not found");
  //   }

  //   if (task.project === projectId) {
  //     throw new ApiError(400, "Task does not belong to the project");
  //   }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task found successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  if (!projectId || !taskId) {
    throw new ApiError(400, "ProjectId and TaskId required");
  }

  if (!title && !description && !assignedTo && !status) {
    throw new ApiError(400, "At least one field required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (task.project.toString() !== projectId) {
    throw new ApiError(400, "Task does not belong to project");
  }

  const user = await User.findById(assignedTo);

  if (!user) {
    throw new ApiError(404, "Assigned user not found");
  }

  const member = await ProjectMember.findOne({
    user: assignedTo,
    project: projectId,
  });

  if (!member) {
    throw new ApiError(400, "User not part of project");
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: {
        title,
        description,
        assignedTo,
        status: AvailableTaskStatus.TODO,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;

  if (!projectId) {
    throw new ApiError(404, "Project not found");
  }

  await Task.findByIdAndDelete(taskId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task Deleted successgull"));
};

const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  const { title } = req.body;

  if (!title) {
    throw new ApiError(400, "Title required");
  }

  if (!task) {
    throw new ApiError(404, "task not found");
  }

  const subTask = await SubTask.create({
    title,
    task: new mongoose.Types.OjectId(taskId),
    isCompleted: false,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  if (!subTask) {
    throw new ApiError(400, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, subTask, "SubTask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const { title, task, isCompleted } = req.body;

  const foundtask = await Task.findById(task);

  if (!foundtask) {
    throw new ApiError(404, "Task not found");
  }

  const subTask = await SubTask.findByIdAndUpdate(
    subTaskId,
    {
      title,
      task,
      isCompleted,
    },
    { new: true },
  );

  if (!subTask) {
    throw new ApiError(400, "Subtask not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subTask, "Subtask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const subTask = await SubTask.findByIdAndDelete(subTaskId);

  if (!subTask) {
    throw new ApiError(400, "Subtask not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});

export {
  getTask,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  deleteSubTask,
  updateSubTask,
  createSubTask,
};

// - `GET /:projectId` - List project tasks (secured, role-based)
// - `POST /:projectId` - Create task (secured, Admin/Project Admin)
// - `GET /:projectId/t/:taskId` - Get task details (secured, role-based)
// - `PUT /:projectId/t/:taskId` - Update task (secured, Admin/Project Admin)
// - `DELETE /:projectId/t/:taskId` - Delete task (secured, Admin/Project Admin)
// - `POST /:projectId/t/:taskId/subtasks` - Create subtask (secured, Admin/Project Admin)
// - `PUT /:projectId/st/:subTaskId` - Update subtask (secured, role-based)
// - `DELETE /:projectId/st/:subTaskId` - Delete subtask (secured, Admin/Project Admin)
