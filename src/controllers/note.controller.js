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

const getNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const notes = await Note.find({ project: projectId });

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note found successfully"));
});

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content required");
  }

  const note = await Note.create({
    project: projectId,
    createdBy: req.user._id,
    content,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note created successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  if (note.project.toString() !== projectId) {
    throw new ApiError(400, "Note does not belong to this project");
  }

  const note = await Note.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note Found successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  if (note.project.toString() !== projectId) {
    throw new ApiError(400, "Note does not belong to this project");
  }
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const note = await Note.findByIdAndUpdate(
    noteId,
    {
      content,
    },
    { new: true },
  );

  if (!note) {
    throw new ApiError(400, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  if (note.project.toString() !== projectId) {
    throw new ApiError(400, "Note does not belong to this project");
  }
  const note = await Note.findByIdAndDelete(noteId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note deleted successfully"));
});

export { deleteNote, updateNote, getNoteById, createNote, getNote };

// - `GET /:projectId` - List project notes (secured, role-based)
// - `POST /:projectId` - Create note (secured, Admin only)
// - `GET /:projectId/n/:noteId` - Get note details (secured, role-based)
// - `PUT /:projectId/n/:noteId` - Update note (secured, Admin only)
// - `DELETE /:projectId/n/:noteId` - Delete note (secured, Admin only)
