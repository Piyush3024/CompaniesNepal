import express from "express"
const router = express.Router() 
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory , getSubcategories , addSubcategory} from "../controller/categories.controller.js"

import { uploadSingle } from "../config/multer.config.js";

router.get("/:parentId/subcategories", getSubcategories);       
router.post("/:parentId/subcategories", addSubcategory);
router.get("/:id", getCategoryById);   

router.get("/",uploadSingle, getCategories);       
router.post("/", createCategory);  
         
router.patch("/:id", uploadSingle , updateCategory);      
router.delete("/:id", deleteCategory);  

export default router;