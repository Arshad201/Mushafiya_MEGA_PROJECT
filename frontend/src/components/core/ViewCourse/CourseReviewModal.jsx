import React, { useEffect } from "react";
import { useRef } from "react";
import { useOnClickOutside } from "../../../hooks/useOnClickOutside";
import { IoCloseSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import ReactStars from "react-rating-stars-component";
import { useForm } from "react-hook-form";
import { createRating } from "../../../services/operations/courseDetailAPI";

const CourseReviewModal = ({ setReviewModal }) => {
  const myRef = useRef(null);
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const {courseEntireData} = useSelector((state) => state.viewCourse);

  useOnClickOutside(myRef, () => setReviewModal(false));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setValue("courseExperience", "");
    setValue("courseRating", 0);
  }, []);

  const submitHandler = async(data) => {



    await createRating({
      courseId : courseEntireData._id,
      rating : data.courseRating ,
      review : data.courseExperience,
    } , token);

    setReviewModal(false);

  
  };

  const ratingChanged = (newRating) => {
    setValue("courseRating", newRating);
  };

  return (
    <div className="fixed inset-0 grid  justify-center items-start z-[9999] overflow-auto bg-white bg-opacity-10  backdrop-blur-sm text-richblack-5">
      <div
        className=" xmd:mt-24 mt-32 border border-richblack-700 bg-richblue-900 rounded-lg  pb-8 xmd:min-w-[800px] mmd:min-w-[700px] md:min-w-[600px] sm:min-w-[550px] xs:min-w-[470px] xsm:min-w-[430px] xxs:min-w-[370px] min-w-[300px] flex flex-col gap-4"
        ref={myRef}
        onClick={(event) => event.stopPropagation()}
      >
        {/* --------Modal header --------- */}

        <div className="flex justify-between items-center bg-richblack-700 py-3  px-6">
          <h2 className="text-richblack-5 font-semibold md:text-lg text-[16px]">Add Review</h2>
          <button onClick={() => setReviewModal(false)}>
            <IoCloseSharp className="text-xl hover:text-yellow-200 transition-all duration-200"/>
          </button>
        </div>

        {/* ---------Modal Body--------- */}

        <div className="flex flex-col sm:px-8 px-4 pt-2">
          {/* ------------- profile pic and name-------------- */}

          <div className="flex items-center gap-x-3 justify-center">
            <img
              src={user?.image}
              alt={user?.firstName}
              className="aspect-square w-[50px] rounded-full object-cover"
            />

            <div>
              <p className="text-[16px] font-semibold text-richblack-5 tracking-wide">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-richblack-300">Posting publicly</p>
            </div>
          </div>

          {/* --------------- Form Part ---------------------------- */}

          <form
            onSubmit={handleSubmit(submitHandler)}
            className="mt-6 flex flex-col gap-y-3"
          >
            {/* --------------------- rating stars ------------------ */}

            <div className="w-full flex justify-center">
              <ReactStars
                count={5}
                onChange={ratingChanged}
                size={30}
                isHalf={true}
                emptyIcon={<i className="far fa-star"></i>}
                halfIcon={<i className="fa fa-star-half-alt"></i>}
                fullIcon={<i className="fa fa-star"></i>}
                activeColor="#ffd700"
              />
            </div>

            {/* -------------------- Add reviews------------------- */}

            <div>
              <label  className='label-style' htmlFor="courseExperience">
                <p className="tracking-wide">Add Your Experience <span className='text-pink-200'>*</span></p>
                <textarea
                id="courseExperience"
                placeholder="Add Your Experience here"
                {...register("courseExperience" , {
                  required : true
                })}
                className="form-style min-h-[130px] w-full  bg-richblack-700 py-3 text-[14px] xs:text-[16px] rounded-lg px-3  shadow-sm shadow-richblack-200 tracking-wider"
                 />
              </label>
              {
                errors.courseExperience && (
                  <span>
                    Please add your experience
                  </span>
                )
              }
            </div>

            {/* ----------- Button group ------------ */}

            <div className="flex xs:justify-end justify-center xs:gap-x-4 gap-x-3">

              {/* ----------- cancel ---------- */}

              <button className="bg-richblack-400 rounded-lg py-2 px-4 text-richblack-900 font-semibold hover:bg-richblack-600 transition-all duration-500"
              onClick={()=> setReviewModal(false)}>
                Cancel
              </button>

              {/* ---------- Save---------------- */}

              <button className="bg-yellow-25 text-richblack-900 font-semibold rounded-lg py-2 px-4 hover:bg-yellow-200 transition-all duration-500" type="submit">
                Save
              </button>

            </div>


          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseReviewModal;
