import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";

// const healthcheck = (req, res) => {
//   try {
//     res.status(200).json(new ApiResponse(200, "Server is healthy"));
//   } catch (error) {
//     console.error("Healthcheck error:", error);
//   }
// };

const healthcheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, "Server is running"));
});

export { healthcheck };
