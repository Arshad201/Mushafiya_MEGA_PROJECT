import React, { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFullDetailsOfCourse } from "../services/operations/courseDetailAPI";
import {
  setCourseSectionData,
  setCourseEntireData,
  setCompletedLectures,
  setTotalNoOfLectures,
 
} from "../redux/slices/viewCourseSlice";
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar";
import ResponsiveVideoDetailsSideBar from "../components/core/ViewCourse/ResponsiveVideoDetailsSideBar";
import { BsThreeDotsVertical } from "react-icons/bs";
import CourseReviewModal from "../components/core/ViewCourse/CourseReviewModal";
import { useLocation } from "react-router-dom";

const ViewCourse = () => {
  const [reviewModal, setReviewModal] = useState(false);
  const { courseId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const setCourseSpecificDetails = async () => {
      const courseData = await getFullDetailsOfCourse(courseId, token);

      dispatch(setCourseSectionData(courseData.courseDetails.courseContent));
      dispatch(setCourseEntireData(courseData.courseDetails));
      dispatch(setCompletedLectures(courseData.completedVideos));

      let lectures = 0;

      courseData?.courseDetails?.courseContent?.forEach((section) => {
        lectures += section.subSection.length;
      });

      dispatch(setTotalNoOfLectures(lectures));
    };

    setCourseSpecificDetails();
  }, []);

  useEffect(()=> {
    setOpen(false);

  } , [location.pathname])

  return (
    <div className="relative">
      <div
        className={`relative flex xmd:min-h-[calc(99vh-3.5rem)] md:min-h-[calc(60vh-3.5rem)]  mt-14
        `}
      >
        {/* ------------------------ SideBar ------------------------- */}

        <div className="xmd:flex hidden">
          <VideoDetailsSidebar setReviewModal={setReviewModal} />
        </div>

        {/* ----------------------- Middle content ------------------------ */}

        <div className="xmd:h-[calc(99vh-3.5rem)] h-[calc(60vh-3.5rem)]  sm:w-11/12  w-[96%] mx-auto xmd:mx-0  overflow-auto   ">
          <div className=" sm:py-12 py-6  mx-auto ">
            <div
              className="flex xmd:hidden items-center w-max mt-2 mb-8  text-white text-2xl cursor-pointer hover:text-yellow-100"
              onClick={() => setOpen(true)}
            >
              <BsThreeDotsVertical></BsThreeDotsVertical>
            </div>
            <Outlet></Outlet>
          </div>
        </div>
      </div>
      {open && (
        <ResponsiveVideoDetailsSideBar
          open={open}
          setOpen={setOpen}
          setReviewModal={setReviewModal}
        ></ResponsiveVideoDetailsSideBar>
      )}

      {reviewModal && (
        <CourseReviewModal setReviewModal={setReviewModal}></CourseReviewModal>
      )}
    </div>
  );
};

export default ViewCourse;
