import { asyncHandler } from "../../utils/asyncHandler.js";
import { authService } from "./auth.service.js";

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.validated.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.validated.body);
  res.json(result);
});
