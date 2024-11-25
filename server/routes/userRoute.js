const { register, login,getAllusers } = require("../controllers/userController");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.get("/allUsers/:id",getAllusers)
module.exports = router;
