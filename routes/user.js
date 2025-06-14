const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const {saveredirectUrl}=require("../middleware.js")
const ControllerUser=require("../controller/users.js")
router.route("/signup")
.get(ControllerUser.randersignup)
.post(wrapAsync(ControllerUser.signup))
router.route("/login")
.get(ControllerUser.renderlogin)
.post(saveredirectUrl,passport.authenticate("local",{ failureRedirect: '/login',failureFlash:true }),ControllerUser.login)

router.get("/logout",ControllerUser.logout)
module.exports=router;