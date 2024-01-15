import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { markLectureAsComplete } from "../../../services/operations//courseDetailAPI";
import { updateCompletedLectures } from "../../../redux/slices/viewCourseSlice";
import { BigPlayButton, Player } from "video-react";
import "video-react/dist/video-react.css";

const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const playerRef = useRef();

  const { token } = useSelector((state) => state.auth);
  const { courseEntireData, courseSectionData, completedLectures } =
    useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  //for showing  Video
  useEffect(() => {
    const setVideoSpecificDetails = async () => {
      if (!courseSectionData) {
        return;
      }
      if (!courseId || !sectionId || !subSectionId) {
        navigate("/dashboard/enrolled-courses");
      } else {
        //lets assume all three fields are present

        const filteredData = courseSectionData.filter(
          (section) => section._id === sectionId
        );

        const filteredVideo = filteredData[0]?.subSection.filter(
          (lecture) => lecture._id === subSectionId
        );

        if (filteredVideo) {
          setVideoData(filteredVideo[0]);
        }

        setVideoEnded(false);
      }
    };

    setVideoSpecificDetails();
  }, [courseEntireData, courseSectionData, location.pathname]);

  //functions

  const isFirstVideo = () => {
    //current Section index
    const currentSectionIndex = courseSectionData.findIndex(
      (section) => section._id === sectionId
    );

    //current SubSection Index
    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ]?.subSection.findIndex((subSection) => subSection._id === subSectionId);

    if (currentSectionIndex === 0 && currentSubSectionIndex === 0) {
      return true;
    } else {
      return false;
    }
  };
  const isLastVideo = () => {
    //current Section index
    const currentSectionIndex = courseSectionData.findIndex(
      (section) => section._id === sectionId
    );

    //No of SubSection in a current section
    const noOfSubSection =
      courseSectionData[currentSectionIndex]?.subSection.length;

    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ]?.subSection.findIndex((lecture) => lecture._id === subSectionId);

    if (
      currentSectionIndex === courseSectionData.length - 1 &&
      currentSubSectionIndex === noOfSubSection - 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  const goToNextVideo = () => {
    //current Section index
    const currentSectionIndex = courseSectionData.findIndex(
      (section) => section._id === sectionId
    );

    //current subsection index
    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((lecture) => lecture._id === subSectionId);

    //no of subsection in a current Section
    const noOfSubSection =
      courseSectionData[currentSectionIndex].subSection.length;

    // same section ki next video current video se
    if (currentSubSectionIndex !== noOfSubSection - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndex].subSection[
          currentSubSectionIndex + 1
        ]._id;

      //now going to next lecture

      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      );
    }
    //dusre section ki 1st video
    else {
      //current section se next section ki ID
      const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;

      //next section ke first Video ki Id
      const firstSubSectionId =
        courseSectionData[currentSectionIndex + 1].subSection[0]._id;

      navigate(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${firstSubSectionId}`
      );
    }
  };

  const goToPreviousVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (section) => section._id === sectionId
    );

    const noOfSubSection =
      courseSectionData[currentSectionIndex].subSection.length;

    const currentSubSectionIndex = courseSectionData[
      currentSectionIndex
    ].subSection.findIndex((lecture) => lecture._id === subSectionId);

    //case 1 : same section previous video
    if (currentSubSectionIndex != 0) {
      const previousSubSectionId =
        courseSectionData[currentSectionIndex].subSection[
          currentSubSectionIndex - 1
        ]._id;

      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${previousSubSectionId}`
      );
    }

    //case 2 : different section , last video
    else {
      const previousSectionId = courseSectionData[currentSectionIndex - 1]._id;
      const noOfSubSectionInPreviousSection =
        courseSectionData[currentSectionIndex - 1].subSection.length;
      const lastVideoId =
        courseSectionData[currentSectionIndex - 1].subSection[
          noOfSubSectionInPreviousSection - 1
        ]._id;

      navigate(
        `/view-course/${courseId}/section/${previousSectionId}/sub-section/${lastVideoId}`
      );
    }
  };

  const handleLectureCompleted = async () => {
    setLoading(true);

    const res = await markLectureAsComplete(
      { courseId: courseId, subSectionId: subSectionId },
      token
    );

    if (res) {
      //state updated
      dispatch(updateCompletedLectures(subSectionId));
    }

    setLoading(false);
  };

  return (
    <div className=" md:w-[95%] w-full mx-auto flex flex-col gap-8 text-richblack-300 ">
      {!videoData ? (
        <div className="h-[60vh] grid place-items-center text-3xl tracking-wide">
          No data found
        </div>
      ) : (
        <div className=" relative">
          <Player
            ref={playerRef}
            playsInline
            onEnded={() => setVideoEnded(true)}
            src={videoData?.videoUrl}
          >
            <BigPlayButton position="center" />
          </Player>

          {/* if video ended */}
          {videoEnded && (
            // ---------------- button groups -------------
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className=" absolute inset-0 z-[100] grid gap-y-3 text-richblack-5 h-full place-content-center font-inter"
            >
              <div className="flex sm:gap-x-3 gap-x-2">
                {/* --------Mark as completed button -----------*/}
                {!completedLectures.includes(subSectionId) && (
                  <button
                    disabled={loading}
                    onClick={() => handleLectureCompleted()}
                    className="bg-richblack-700 bg-opacity-80 border-2 border-yellow-300 xlg:px-3 px-2 xlg:text-lg text-[16px]   tracking-wide py-2 rounded-lg hover:scale-90 hover:bg-richblack-800 transition-all duration-500"
                  >
                    {!loading ? "Mark As Completed" : "Loading"}
                  </button>
                )}

                {/* --------- Rewatch button --------------- */}

                <button
                  disabled={loading}
                  onClick={() => {
                    if (playerRef?.current) {
                      playerRef.current?.seek(0);
                      playerRef.current?.play();
                      setVideoEnded(false);
                    }
                  }}
                  className="bg-richblack-700 bg-opacity-80 border-2 border-yellow-300 xlg:px-3 px-2 xlg:text-lg sm:text-[16px]  text-sm tracking-wide py-2 rounded-lg hover:scale-90 hover:bg-richblack-800 transition-all duration-500"
                >
                  Rewatch
                </button>
              </div>

              {/* ---------------- Previous button -------------- */}

              {!isFirstVideo() && (
                <button
                  disabled={loading}
                  onClick={() => goToPreviousVideo()}
                  className="xlg:px-3 px-2 xlg:text-lg sm:text-[16px] text-sm py-2 bg-yellow-50 text-richblack-900 rounded-lg  tracking-wide font-semibold hover:scale-90 transition-all duration-700"
                >
                  Prev
                </button>
              )}

              {/* -------------------- Next video --------------------- */}

              {!isLastVideo() && (
                <button
                  disabled={loading}
                  onClick={() => goToNextVideo()}
                  className="xlg:px-3 px-2 xlg:text-lg sm:text-[16px] text-sm  py-2 bg-yellow-50 text-richblack-900 rounded-lg tracking-wide font-semibold hover:scale-90 transition-all duration-700"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {/* ---------------- Video Content ------------- */}

      <div className="flex flex-col gap-y-4">
        <h1 className="md:text-2xl sm:text-xl text-lg font-semibold text-richblack-5">
          {videoData?.title}
        </h1>

        <p className="md:text-lg sm:text-[16px] text-sm text-richblack-300">
          {videoData?.description}
        </p>
      </div>
    </div>
  );
};

export default VideoDetails;
