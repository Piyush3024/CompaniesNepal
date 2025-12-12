import express from "express";
import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
} from "../controller/user.controller.js";
import { isSameUser, verifyToken } from "../middleware/middleware.js";
const router = express.Router();

router.get("/", getUser);
router.post("/:id", isSameUser, createUser);

router.delete("/:id", verifyToken, isSameUser, deleteUser);
router.patch("/update/:id", updateUser);

export default router;
