const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadImagetoCloudinary } = require('../utils/imageUploader');
require("dotenv").config();
const {convertSecondsToDuration} = require('../utils/secToDuration')
const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course')

//create Profile

exports.updateProfile = async (req, res) => {
    try {

        //fetch all data of profile
        const { about = " ", contactNumber, dateOfBirth = "", gender } = req.body;

        //userId
        const userId = req.user.id;


        //validation
        if (!contactNumber || !gender) {
            console.log("Pleases Enter required Details ");
            return res.status(402).json({
                success: false,
                message: "Please Enter required Details",
            })

        }
        //validation on ID
        if (!userId) {
            console.log("User ID Not Found ");
            return res.status(400).json({
                success: false,
                message: "User ID Not Found ",
            })

        }

        //find Profile

        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;

        const profile = await Profile.findById(profileId);
      

            //update profile fields

            profile.dateOfBirth = dateOfBirth,
            profile.about = about,
            profile.gender = gender,
            profile.contactNumber = contactNumber,

            //save the updated profile

            await profile.save();

            const updateProfileDetails = await User.findById(userId).populate("additionalDetails").exec();

          
        //return response

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            updateProfileDetails,
        })






    } catch (err) {
        console.log("Something went wrong while updating Profile ");
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating Profile ",
            error: err.message,
        })
    }
}

//delete Account
//how can we schedule this deletion operation
//explore cron-job

exports.deleteAccount = async (req, res) => {



    try {
        //fetch account Id
        const userId = req.user.id;

        const userDetails = await User.findById(userId);

        //Validation
        if (!userDetails) {
            console.log("User Not Found");
            return res.status(404).json({
                success: false,
                message: "User Not found"
            })
        }


        //delete Profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        //TODO : HW := unenroll user from all enrolled students

        //delete User

        await User.findByIdAndDelete({ _id: userId });



        //return response
        return res.status(200).json({
            success: true,
            message: "Account Deleted Successfully"
        })


    } catch (err) {

        console.log("Something went wrong while deleting Account ");
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting Account ",
            error: err.message,
        })

    }
}


//All user Detail
exports.getAllUserDetails = async (req, res) => {
    try {
        //fetch User Detail 
        const userId = req.user.id;

        //fetch User with above User Id

        const allUserDetails = await User.findById(userId)
            .populate("additionalDetails")
            .exec();

       

        //validation

        if (!allUserDetails) {
            console.log("User not found with this ID");
            return res.status(404).json({
                success: false,
                message: "User not found with this ID"
            })
        }

        //send response

        return res.status(200).json({
            success: true,
            message: "User Data Fetched Successfully",
            data: allUserDetails,

        })


    } catch (err) {
        console.log("Something went wrong while showing all details of User");
        res.status(500).json({
            success: false,
            message: "Something went wrong while showing all details of User",
            error: err.message,
        })
    }
}


//upload a profile picture

exports.updateDisplayPicture = async (req, res) => {
    try {
       
        const userId = req.user.id;
        
    
        const displayPicture = req.files.displayPicture;


        if (!displayPicture) {
            res.json({
                success: false,
                message: "DisplayPicture is empty"
            })
        }
       
        const image = await uploadImagetoCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
       
    //   Image going to upload on DB
    
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error while uploading a display picture"
        })
    }
};

//get enrolled courses

exports.getEnrolledCourses = async (req, res) => {
    try {
        //fetch userId
        const userId = req.user.id;

        //fetch userDetails with populate the course field
        let userDetails = await User.findById({ _id: userId })
            .populate({
                path :  "courses" , 
                populate : {
                    path : "courseContent" ,
                    populate : {
                        path : "subSection"
                    }
                }

            })

            .exec();

            //------------here we calculate the course progress of the enrolled courses----------------------

            //first convert the userdetail mongoDb document to js object

            userDetails = userDetails.toObject();


            //lets take the subsectiobn length to 0
            var SubSectionLength = 0;


            //now traversing the no of userDetails courses

            for(var i = 0 ; i < userDetails.courses.length ; i++){

                //let take totalDurationInSeconds to 0

                let totalDurationInSeconds = 0;
                
                SubSectionLength = 0;

                 //now traversing the no of userDetails courses sections

                for(var j=0 ; j < userDetails.courses[i].courseContent.length ; j++){


                    //find the totalDuration in seconds by accessing the subSection timeDuration and add it to variable
                    totalDurationInSeconds += userDetails.courses[i].courseContent[j].subSection.reduce((acc , curr) =>
                       acc + parseInt(curr.timeDuration)
                     , 0)


                     //insert the totalDuration in userdetail courses
                     userDetails.courses[i].totalDuration =  convertSecondsToDuration(totalDurationInSeconds);


                     //find the total number of subsection length in the given course
                     SubSectionLength += userDetails.courses[i].courseContent[j].subSection.length;

                }

                //lets call the courseProgressCount

                let courseProgressCount = await CourseProgress.findOne({
                    courseId : userDetails.courses[i]._id ,
                    userId : userId,
                })

                //now set the courseProgressCount to the total number of completed videos

                courseProgressCount = courseProgressCount?.completedVideos.length


                //find the course progress percentage

                if(SubSectionLength === 0){
                    userDetails.courses[i].progressPercentage = 100;
                }else{
                    //To make it to 2 decimal number

                    let multiplier = Math.pow(10,2);

                    userDetails.courses[i].progressPercentage = Math.round(
                        (courseProgressCount / SubSectionLength) * 100 * 100
                    ) / multiplier;
                }

            }
        

        //validation
        if (!userDetails) {
            console.log("No user found with this ID");
            return res.status(404).json({
                success: false,
                message: "No user found with this ID",
            })
        }
        //return res
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
            message: "Enrolled Courses fetched Successfully",

        })

    } catch (err) {
        console.log("Error while fetching all courses");
        return res.status(500).json({
            success: false,
            message: "Error while fetching enrolled courses",
            error: err.message,
        })
    }
}


//instructor stats and courses(INSTRUCTOR DASHBOARD)

exports.instructorDashboard = async(req , res)=> {

    try{

        const userId = req.user.id;
        const courseDetails = await Course.find({instructor : userId});

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length ;
            const totalAmountGenerated = totalStudentsEnrolled * course.price;


            //create a new object with the additional fields

            const courseDataWithStats = {

                _id : course._id,
                courseName : course.courseName ,
                courseDescription : course.courseDescription,
                totalStudentsEnrolled,
                totalAmountGenerated,

            }

            return courseDataWithStats;
        })

        res.status(200).json({
            success : true ,
            message : "Data fetched Successfully",
            courses : courseData ,
        })


        

    }catch(err){
        
        console.log("Error while fetching instructor dashboard api");
        return res.status(500).json({
            success: false,
            message: "Error while fetching instructor dashboard api",
            error: err.message,
        })


    }
}