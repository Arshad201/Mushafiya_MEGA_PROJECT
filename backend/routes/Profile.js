const express= require('express');
const router = express.Router();


//import Handler and middleware


const {updateProfile , deleteAccount , getAllUserDetails , updateDisplayPicture , getEnrolledCourses} = require('../controllers/Profile');
const {auth , isInstructor} = require('../middlewares/auth');

//Instructor course Stats

const {instructorDashboard} = require('../controllers/Profile')



//Define method , path and handler

router.put("/updateProfile" , auth , updateProfile);
router.delete("/deleteAccount" , auth , deleteAccount);
router.get("/getUserDetails" , auth , getAllUserDetails);
router.put("/updateDisplayPicture" , auth , updateDisplayPicture);
router.get("/getEnrolledCourses" , auth , getEnrolledCourses);


router.get("/instructorDashboard" , auth , isInstructor , instructorDashboard);

module.exports = router;