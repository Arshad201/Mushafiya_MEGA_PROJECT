import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import RatingStars from "./RatingStars";
import ReactStars from "react-rating-stars-component";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apiLinks";
import { useRef } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const truncateWords = 15;

  const swiper = useRef(null);
  useEffect(() => {
    const fetchAllReviews = async () => {
      const response = await apiConnector(
        "GET",
        ratingsEndpoints.GET_RATING_AND_REVIEW_API
      );

     

      const { data } = response;

      if (data?.success) {
        setReviews(data?.data);
      }
    };

    fetchAllReviews();
  }, []);

  return (
    <div className=" pt-16 pb-20 ">
      <h2 className="text-center lg:text-4xl text-3xl font-semibold ">
        Reviews from other learners
      </h2>

      {/* ----------------- Review Slider Here ----------------------------- */}

      <div className=" max-w-maxContent  sm:px-0 xxs:px-8 px-6">
        <Swiper
        ref={swiper}
          slidesPerView={1}
          spaceBetween={25}
          loop={true}
          pagination={true}
          modules={[Pagination, Autoplay]}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
            640: {
              slidesPerView: 2,
            },
          
            
          }}

          // className="max-h-[30rem]"
        >
          {reviews?.map((review, index) => (
            <SwiperSlide key={index}>
              <div className="h-[200px] min-h-[230px] bg-richblack-800 flex flex-col mt-10 py-4 px-5 gap-y-2 rounded-md">
                {/* -------------- userDetails ------------ */}
                <div className="flex gap-x-4 mb-2">
                  <img
                    src={review?.user?.image}
                    alt={review?.user?.firstName}
                    className="h-9 w-9 object-cover rounded-full aspect-square"
                  />

                  <div className="flex flex-col">
                    <p className="font-semibold md:text-lg text-[16px]">
                      {review?.user?.firstName} {review?.user?.lastName}
                    </p>
                    <p className="text-sm text-richblack-300">{review?.course?.courseName}</p>
                  </div>
                </div>

                {/* --------------Review ---------------- */}
                <div>

                  {
                    review?.review.split(" ").length > 20 ? review?.review.split(" ").slice(0, truncateWords).join(" ") +
                    "...." : review?.review
                  }
                
                </div>

                {/* -----------------Rating ----------------- */}
                

                <div className="flex gap-x-4 items-center">
                  <p className="text-yellow-50 font-semibold text-xl">{review?.rating.toFixed(1)}</p>
                  <ReactStars
                    count={5}
                    value={review?.rating}
                    size={20}
                    edit={false}
                    isHalf={true}
                    emptyIcon={<i className="far fa-star"></i>}
                    halfIcon={<i className="fa fa-star-half-alt"></i>}
                    fullIcon={<i className="fa fa-star"></i>}
                    activeColor="#ffd700"
                  ></ReactStars>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Reviews;
