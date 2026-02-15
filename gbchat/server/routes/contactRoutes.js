// server/routes/contactRoutes.js
import express from "express";
import {
  getContacts,
  addContact,
  removeContact,
  addFavorite,
} from "../controllers/contactController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getContacts);
router.post("/", addContact);
router.delete("/:id", removeContact);
router.post("/favorite", addFavorite);

export default router;