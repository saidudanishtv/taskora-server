import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createProject, deleteProject, listProjects } from './project.controller.js';

const router = Router();

const createProjectSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1),
    name: z.string().min(2),
    description: z.string().optional(),
    memberIds: z.array(z.string().min(1)).default([])
  })
});

const listProjectSchema = z.object({
  query: z.object({
    workspaceId: z.string().min(1)
  })
});

const paramsSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

router.use(requireAuth);
router.post('/', validate(createProjectSchema), createProject);
router.get('/', validate(listProjectSchema), listProjects);
router.delete('/:id', validate(paramsSchema), deleteProject);

export default router;

