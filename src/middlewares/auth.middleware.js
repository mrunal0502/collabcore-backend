import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { Project } from "../models/project.model.js";
import { Note } from "../models/note.model.js";
import { Task } from "../models/task.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgotPasswordToken -forgotPasswordTokenExpiry -refreshTokenExpiry",
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Unauthorized request");
  }
});

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    console.log("Route params:", req.params);
    console.log("Route path:", req.originalUrl);

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new ApiError(400, "Invalid project ID");
    }

    // if (!mongoose.Types.ObjectId.isValid(projectId)) {
    //   throw new ApiError(400, "Invalid project ID");
    // }

    const projectDetails = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
    });

    if (!projectDetails) {
      throw new ApiError(404, "Project not found or user not a member");
    }

    const givenRole = projectDetails.role;

    req.user.role = givenRole;

    if (roles.length && !roles.includes(givenRole)) {
      throw new ApiError(403, "You do not have permission for this action");
    }

    next();
  });
};
