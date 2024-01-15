import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchInstructorCourses } from "../../../../../services/operations/courseDetailAPI";
import { getInstructorData } from "../../../../../services/operations/profileAPI";
import { PiHandWavingFill } from "react-icons/pi";
import Spinner from "../../../../common/Spinner";
import { Link, useNavigate } from "react-router-dom";
import InstructorChart from "./InstructorChart";
// import PieChart from "./PieChart";

const Instructor = () => {
  const [loading, setLoading] = useState(false);
  const [instructorData, setInstructorData] = useState(null);
  const [courses, setCourses] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  useEffect(() => {
    const getCourseDataWithStats = async () => {
      setLoading(true);

      const instructorApiData = await getInstructorData(token);
      const result = await fetchInstructorCourses(token);

      if (instructorApiData.length) {
        setInstructorData(instructorApiData);
      }

      if (result) {
        setCourses(result);
      }

      setLoading(false);
    };

    getCourseDataWithStats();
  }, []);

  const totalAmount = instructorData?.reduce(
    (acc, curr) => acc + curr.totalAmountGenerated,
    0
  );
  const totalStudents = instructorData?.reduce(
    (acc, curr) => acc + curr.totalStudentsEnrolled,
    0
  );

  return (
    <div className=" xlg:w-[75%] lg:w-[80%] xmd:w-[85%] smd:w-[85%] w-[90%] mx-auto flex flex-col gap-8 text-richblack-300  ">
      {/* ------------- name upper section -------------- */}

      <div className="flex flex-col gap-y-2">
        <h1 className="flex items-center gap-x-1 text-xl font-semibold text-richblack-5">
          Hi {user?.firstName}
          <span>
            <PiHandWavingFill className="text-xl text-yellow-200" />
          </span>
        </h1>
        <p className="tracking-wide text-[16px]">Let's start something new</p>
      </div>

      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <Spinner></Spinner>
        </div>
      ) : courses.length > 0 ? (
        // if courses available

        <div className="flex flex-col gap-y-3">
          {/* // ----------- Upper section (Instructor Statistics) ------------- */}

          <div className="flex smd:flex-row flex-col  smd:gap-x-5 gap-y-5 ">
            {/* ---------------Instructor chart (Left Side) ----------------- */}

            <InstructorChart courses={instructorData}></InstructorChart>

            {/* --------------- Instructor stats(Right Side) -------------------- */}

            <div className="smd:w-[30%] sm:w-[90%] w-[95%] mx-auto smd:mx-0 flex flex-col items-center smd:items-start gap-y-5 bg-richblack-800 rounded-md border border-richblack-700 py-4 mmd:px-5 px-3">
              {/* ------------ heading ----------- */}

              <h2 className="text-lg font-semibold text-richblack-5 mb-2">
                Statistics
              </h2>

              {/* -------- Total courses ------ */}
              <div className="flex flex-col  items-center smd:items-start">
                <p>Total Courses</p>
                <p className="mmd:text-2xl text-xl font-semibold text-richblack-5">
                  {courses.length}
                </p>
              </div>

              {/* ---------- Students data ----------------- */}

              <div className="flex flex-col items-center smd:items-start">
                <p>Total Students</p>
                <p className="mmd:text-2xl text-xl font-semibold text-richblack-5">
                  {totalStudents}
                </p>
              </div>

              {/* --------Income part -------------- */}

              <div className="flex flex-col items-center smd:items-start">
                <p>Total Income</p>
                <p className="mmd:text-2xl text-xl font-semibold text-richblack-5">
                  Rs. {totalAmount}
                </p>
              </div>
            </div>
          </div>

          {/* ----------------- Lower Section (Instructor Courses) ------------------ */}

          <div className="flex flex-col gap-y-5 bg-richblack-800 rounded-md py-5 xlg:px-6 xmd:px-4 xs:px-12 px-8">
            {/* ------------- heading part ------------------ */}
            <div className="flex justify-between">
              <h2 className="text-lg text-richblack-5 font-semibold">
                Your Courses
              </h2>

              <Link to="/dashboard/my-courses">
                <p className="text-yellow-200 hover:text-yellow-400">
                  View All
                </p>
              </Link>
            </div>

            {/* --------------  course part ---------------------------- */}

            <div className="flex xmd:flex-row flex-col gap-y-3 gap-x-3 ">
              {/* ------ Render 3 Courses ------------ */}
              {courses.slice(0, 3).map((course, index) => (
                <div
                  key={index}
                  className=" rounded-md cursor-pointer bg-richblack-900 px-2 py-2 hover:scale-90 transition-all duration-500"
                  onClick={() => navigate(`/courses/${course._id}`)}
                >
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="rounded-t-md mb-3"
                  />

                  <div className="flex flex-col gap-y-1 ">
                    <p className="text-[16px] text-richblack-50 font-medium">
                      {course.courseName}
                    </p>
                    <div className="flex xl:flex-row flex-col gap-y-2 gap-x-2">
                      <p className="xmd:text-sm xl:text-[16px] xs:text-[16px] text-sm">
                        {course.studentsEnrolled.length} students enrolled
                      </p>
                      <p className="xl:flex hidden">|</p>
                      <p className="xmd:text-sm xl:text-[16px] xs:text-[16px] text-sm">
                        Rs {course.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // if courses not available

        <div className="h-[50vh] flex items-center justify-center">
          <p>You have not created any course yet</p>
          <Link to={"/dashboard/add-course"}>Created a Course</Link>
        </div>
      )}
    </div>
  );
};

export default Instructor;
