import { asyncHandler } from "../../utils/asyncHandler.js";
import { commentService } from "./comment.service.js";

export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.create(req.user, req.validated.body);
  res.status(201).json(comment);
});

export const listComments = asyncHandler(async (req, res) => {
  const comments = await commentService.list(req.user, req.validated.query);
  res.json(comments);
});
export const updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.update(
    req.user,
    req.validated.params.id,
    req.validated.body,
  );

  res.json(comment);
});

export const deleteComment = asyncHandler(async (req, res) => {
  await commentService.remove(req.user, req.validated.params.id);

  res.status(204).send();
});
