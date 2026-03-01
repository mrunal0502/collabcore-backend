import {
  getTask,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  deleteSubTask,
  updateSubTask,
  createSubTask,
} from "../controllers/task.controller.js";
import {
  verifyJWT,
  validateProjectPermission,
} from "../middlewares/auth.middleware.js";

import {
  createTaskValidator,
  createSubTaskValidator,
  updateTaskValidator,
} from "../validators/index.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { validate } from "../middlewares/validator.middleware.js";

import { Router } from "express";

const router = Router();

router.use(verifyJWT);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getTask)
  .post(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createTaskValidator(),
    validate,
    createTask,
  );
router
  .route("/:projectId/t/:taskId")
  .get(validateProjectPermission(AvailableUserRole), getTaskById)
  .put(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    updateTaskValidator(),
    validate,
    updateTask,
  )
  .delete(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    deleteTask,
  );

router
  .route("/:projectId/t/:taskId/subtasks")
  .post(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createSubTaskValidator(),
    validate,
    createSubTask,
  );

router
  .route("/:projectId/st/:subTaskId")
  .put(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    createSubTaskValidator(),
    validate,
    updateSubTask,
  )
  .delete(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    deleteSubTask,
  );

export default router;

// - `GET /:projectId` - List project tasks (secured, role-based)
// - `POST /:projectId` - Create task (secured, Admin/Project Admin)
// - `GET /:projectId/t/:taskId` - Get task details (secured, role-based)
// - `PUT /:projectId/t/:taskId` - Update task (secured, Admin/Project Admin)
// - `DELETE /:projectId/t/:taskId` - Delete task (secured, Admin/Project Admin)
// - `POST /:projectId/t/:taskId/subtasks` - Create subtask (secured, Admin/Project Admin)
// - `PUT /:projectId/st/:subTaskId` - Update subtask (secured, role-based)
// - `DELETE /:projectId/st/:subTaskId` - Delete subtask (secured, Admin/Project Admin)
