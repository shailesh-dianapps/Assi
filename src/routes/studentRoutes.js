const express = require("express");
const {signup, getAllStudents, getStudentById, updateStudent, deleteStudent} = require("../controllers/studentController");

const router = express.Router();

router.post("/signup", signup);
router.get("/students", getAllStudents);
router.get("/students/:id", getStudentById);
router.patch("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

module.exports = router;
