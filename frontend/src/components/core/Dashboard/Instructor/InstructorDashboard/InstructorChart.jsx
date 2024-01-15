import React, { useState } from "react";
import  {Chart , registerables} from 'chart.js'
import {Pie} from 'react-chartjs-2'



Chart.register(...registerables)

const InstructorChart = ({courses}) => {

  // State to keep track of the currently selected chart

  const [currentChart, setCurrentChart] = useState("students");

  //function to generate random colors
  const getRandomColors = (numColors) => {
    const colors = [];

    for (let i = 0; i < numColors; i++) {
      const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )},
        ${Math.floor(Math.random() * 256)})`;

      colors.push(color);
    }
    return colors;
  };

  //create data for chart displaying student info

  const chartDataForStudents = {

    labels : courses.map((course)=> course.courseName),
    datasets : [
        {
            data : courses.map((course)=> course.totalStudentsEnrolled),
            backgroundColor : getRandomColors(courses.length),

        },
    ],

  }



  //create data for chart displaying income info
  
  const chartDataForIncome = {
    labels : courses.map((course)=> course.courseName),
    datasets : [
        {
            data : courses.map((course)=> course.totalAmountGenerated),
            backgroundColor : getRandomColors(courses.length)
        },
    ],
  } 


  //create options

  // Options for the chart
  const options = {
    maintainAspectRatio: false,
  }



  return (
    <div className="smd:w-[70%] md:w-[90%] w-[95%] sm:w-[90%] mx-auto smd:mx-0 border border-richblack-700 bg-richblack-800 flex flex-col gap-y-4 py-3 sm:px-5 xs:px-3 px-1 rounded-md tracking-wide">

    {/* ----------- heading ------------- */}

        <h2 className="text-lg text-richblack-5 font-semibold sm:ml-0 ml-3">Visualize</h2>

        {/* ---------- toggle buttons --------------- */}
        <div className="flex gap-x-6 xs:ml-0 ml-3 text-[16px] font-medium ">

            <button className={`px-2 py-1 rounded-md
            ${currentChart === 'students' ? "text-yellow-50 bg-richblack-700" : "text-yellow-500 bg-richblack-800"}
            transition-all duration-200`} onClick={()=> setCurrentChart("students")}>
                Students
            </button>

            <button className={`px-2 py-1 rounded-md
            ${currentChart !== 'students' ? "text-yellow-50 bg-richblack-700" : "text-yellow-500 bg-richblack-800"}
            transition-all duration-200`} 
             onClick={()=> setCurrentChart("incomes")}>
                Income 
            </button>

        </div>

        {/* -------------- Pie Chart ---------------------- */}

        <div className=" lg:w-[80%] mmd:w-[90%] w-full aspect-square mx-auto">

          {/* Render the Pie chart based on the selected chart */}
            <Pie
            data = {
                currentChart === "students" ? chartDataForStudents : chartDataForIncome

            }

            options={options}
            />

            
        </div>

    </div>
  
    );
};

export default InstructorChart;




