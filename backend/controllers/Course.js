const Course = require("../models/Course");
const Category = require("../models/Category");
const CourseProgress = require("../models/CourseProgress");
const User = require("../models/User");
const { uploadImagetoCloudinary } = require("../utils/imageUploader");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { convertSecondsToDuration } = require("../utils/secToDuration");

//made some chnanges here

//create Course

exports.createCourse = async (req, res) => {
  try {
    //fetch all Data
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
      instructions,
      status,
    } = req.body;

    //fetch file from req file for thumbnail

    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !category
    ) {
      console.log("Please Fill all data");
      res.json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!status || status === undefined) {
      status = "Draft";
    }

    //check for instructor
    const userId = req.user.id;

    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });

    if (!instructorDetails) {
      console.log("Instructor Details are not found");
      res.status(400).json({
        success: false,
        message: "Instructor Details are not found",
      });
    }
    //verify that userId and InstructorDetails._id are same or different?

    //check given Category is valid or not
    const categoryDetails = await Category.findById(category);

    if (!categoryDetails) {
      console.log("Category Details are not found");
      res.status(400).json({
        success: false,
        message: "Category Details are not found",
      });
    }

    //upload Image to cloudinary

    const thumbnailImage = await uploadImagetoCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create and entry for new course

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      // Convert the tag and instructions from stringified Array to Array
      tag: JSON.parse(tag),
      instructions: JSON.parse(instructions),
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
    });

    //Add the new course to the user schema of Instructor

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //update the tag Schema

    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //return response

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });
  } catch (err) {
    console.log("Error while creating a Course : ", err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Something went wrong while creating course",
    });
  }
};

//fetch all Course

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All Course Fetched Successfully",
      data: allCourses,
    });
  } catch (err) {
    console.log("Error while showing all Courses : ", err);
    res.status(500).json({
      success: false,
      error: err.message,
      message: "Something went wrong while showing all course",
    });
  }
};

//edit a course
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const updates = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      console.log(`Course not found with this id : ${courseId}`);

      return res.status(404).json({
        success: false,
        message: "Course not found with this id",
      });
    }

    //If thumbnail image is found , update it

    if (req.files) {
      const thumbnail = req.files.thumbnailImage;

      //upload image to cloudinary

      const thumbnailImage = await uploadImagetoCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );

      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update only the fields that are present in the request body

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key]);
        } else {
          course[key] = updates[key];
        }
      }
    }

    //Save the updated values on course

    await course.save();

    // fetch the updated course

    const updatedCourse = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//get a single course detail with the given id

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .populate("ratingAndReviews")
      .populate("category")
      .exec();

    if (!courseDetails) {
      console.log("Course Not found with this ID");
      return res.status(400).json({
        success: false,
        message: "Course Not found with this ID",
      });
    }

    let totalDurationInSeconds = 0;

    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      message: "Course details fetched Successfully",
      data: {
        courseDetails,
        totalDuration,
      },
    });
  } catch (err) {
    console.log("Something went wrong while fetching all detailss of course");
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching all detailss of course",
      error: err.message,
    });
  }
};

//get a detail of course fully including progress count etc.

exports.getFullCourseDetails = async (req, res) => {
  try {
    //fetch all data

    const { courseId } = req.body;

    const user = req.user;

    //now call the db for course and save it on the variable

    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    //also called courseProgressCount

    const courseProgressCount = await CourseProgress.findOne({
      courseId: courseId,
      userId: user.id,
    });

    //validation on course

    if (!courseDetails) {
      console.log("Course not found with the given ID");

      return res.status(404).json({
        success: false,
        message: "Course Not found",
      });
    }

    // accessing draft course is forbidden

    if (courseDetails.status === "Draft") {
      res.status(401).json({
        success: false,
        message: "Accessing a draft course is forbidden",
      });
    }

    // Now make the total Time Duration

    let totalDurationInSeconds = 0;

    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration);

        totalDurationInSeconds = totalDurationInSeconds + timeDurationInSeconds;
      });
    });

    const timeDuration = convertSecondsToDuration(totalDurationInSeconds);

    //return response

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        timeDuration,
        completedVideos: courseProgressCount?.completedVideos
          ? courseProgressCount?.completedVideos
          : [],
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get a list of Course for a given Instructor

exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id;



    let instructorDetail = await User.findById(instructorId)
                                .populate({
                                    path : "courses",
                                    populate : {
                                        path : "courseContent",
                                        populate : {
                                            path : "subSection"
                                        }
                                    }
                                })
    

    console.log("Instructor Detail : " , instructorDetail);


    instructorDetail = instructorDetail.toObject();

    for(var i=0 ; i < instructorDetail.courses.length; i++){

        let totalDurationInSeconds = 0;

        for(var j=0 ; j < instructorDetail.courses[i].courseContent.length ; j++){

            totalDurationInSeconds += instructorDetail.courses[i].courseContent[j].subSection.reduce((acc , curr) => acc + parseInt(curr.timeDuration) , 0);

            instructorDetail.courses[i].totalDuration = convertSecondsToDuration(totalDurationInSeconds)
        }

    }





    res.status(200).json({
      success: true,
      data : instructorDetail.courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      err: err.message,
    });
  }
};

//delete a course

exports.deleteCourse = async (req, res) => {
  try {
    //fetch data

    const { courseId } = req.body;

    //find the course

    const course = await Course.findById(courseId);

    //validation on course

    if (!course) {
      console.log("Course not found with this id : ", courseId);
    }

    //unenroll the student from the course

    const studentsEnrolled = course.studentsEnrolled;

    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: {
          courses: courseId,
        },
      });
    }

    // delete the sections and subsection from the course

    const Coursesections = course.courseContent;

    for (const sectionId of Coursesections) {
      const section = await Section.findById(sectionId);

      //delete the subsection

      if (section) {
        const subSections = section.subSection;

        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId);
        }
      }

      //delete the sections

      await Section.findByIdAndDelete(sectionId);
    }

    //now delete the course

    await Course.findByIdAndDelete(courseId);

    //return response

    return res.status(200).json({
      success: true,
      message: "Course Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//delete all courses

exports.deleteAllCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const instructorCourses = await Course.find({
      instructor: instructorId,
    });

    //going to each course of instructor for deleting

    for (const course of instructorCourses) {
      //delete the students enrolled in a course

      const studentsEnrolled = course.studentsEnrolled;

      for (const studentsId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentsId, {
          $pull: {
            courses: course._id,
          },
        });
      }

      //delete the section and subSection

      const courseSection = course.courseContent;

      for (const sectionId of courseSection) {
        const section = await Section.findById(sectionId);

        if (section) {
          const subSections = section.subSection;

          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId);
          }
        }

        await Section.findByIdAndDelete(sectionId);
      }

      //now delete all the courses

      await Course.findByIdAndDelete(course._id);
    }

    //return response

    return res.status(200).json({
      success: true,
      message: "Successfully deleted all courses",
    });
  } catch (err) {
    console.log("There is a problem while deleting all courses");
    return res.status(500).json({
      success: false,
      message: "Problem while deleting all courses",
      error: err.message,
    });
  }
};
