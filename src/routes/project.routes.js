import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeProjectMember,
} from "../controllers/project.controller.js";

import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

import {
  createProjectValidator,
  addMemberToProjectValidator,
} from "../validators/index.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), validate, getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMemberToProjectValidator(),
    validate,
    addProjectMember,
  );

router
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    removeProjectMember,
  );

export default router;

// GET / - List user projects (secured)
// POST / - Create project (secured)
// GET /:projectId - Get project details (secured, role-based)
// PUT /:projectId - Update project (secured, Admin only)
// DELETE /:projectId - Delete project (secured, Admin only)
// GET /:projectId/members - List project members (secured)
// POST /:projectId/members - Add project member (secured, Admin only)
// PUT /:projectId/members/:userId - Update member role (secured, Admin only)
// DELETE /:projectId/members/:userId - Remove member (secured, Admin only)
