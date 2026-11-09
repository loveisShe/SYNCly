const express = require("express");
const router = express.Router();

const { signup , login , getme } = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

router.post("/signup" , signup);
router.post("/login" , login);
router.get("/getme" , protect , getme);

module.exports = router;