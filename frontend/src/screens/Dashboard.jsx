import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { Navigate, useNavigate } from "react-router-dom";
import FallingText from "../animate/FallingText";
import SplitText from "../animate/SplitText";

const Dashboard = () => {
  const navigate = useNavigate();
  const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

  return (
    <>
      <div className="main bg-gradient-to-br from-[#030712] to-[#0f172a] w-full h-screen flex flex-col justify-center items-center gap-4 relative overflow-hidden ">
        <FallingText
          // text={`Slash: Let AI handle the heavy lifting, so you can focus on what truly matters. Code smarter, build faster, and bring your ideas to life — effortlessly.`}
          // highlightWords={[
          //   "Slash",
          //   "AI",
          //   "heavy",
          //   "focus",
          //   "Code",
          //   "ideas",
          //   "build",
          //   "effortlessly",
          // ]}

          text={`. . . . . . . . . . O O O O O O O O O O O O  ______________  O O O O O O O O O O O O . . . . . . . . . .`}
          highlightWords={[
           ".",
          ]}
          highlightClass="highlighted"
          trigger="hover"
          backgroundColor="transparent"
          wireframes={false}
          gravity={0.009}
          fontSize="2rem"
          mouseConstraintStiffness={0.9}
        />
        <div className="absolute top-0 left-0 w-[10%] h-[2px] bg-gradient-to-r from-blue-200/80 to-transparent blur-xs rotate-45 animate-flash" />
        <div className="absolute top-0 left-0 w-[30%] h-[2px] bg-gradient-to-r from-green-400/80 to-transparent blur-xs rotate-45 animate-flash" />
        <div className="absolute top-0 left-0 w-[50%] h-[2px] bg-gradient-to-r from-yellow-400/80 to-transparent blur-xs rotate-45 animate-flash" />
        <div className="absolute top-0 left-0 w-[70%] h-[2px] bg-gradient-to-r from-orange-400/80 to-transparent blur-xs rotate-45 animate-flash" />
        <div className="absolute top-0 left-0 w-[90%] h-[2px] bg-gradient-to-r from-pink-400/80 to-transparent blur-xs rotate-45 animate-flash" />
        <div className="absolute top-0 left-0 w-[110%] h-[2px] bg-gradient-to-r from-red-400/80 to-transparent blur-xs rotate-45 animate-flash" />
        <div className="absolute top-0 left-0 w-[130%] h-[2px] bg-gradient-to-r from-purple-400/80 to-transparent blur-xs rotate-45 animate-flash" />
        <div className="absolute top-0 left-0 w-[150%] h-[2px] bg-gradient-to-r from-cyan-500/80 to-transparent blur-xs rotate-45 animate-flash" />

        <div className="absolute top-0 left-0 w-[150%] h-[2px] bg-gradient-to-r from-cyan-500/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-0 left-0 w-[130%] h-[2px] bg-gradient-to-r from-purple-400/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-0 left-0 w-[110%] h-[2px] bg-gradient-to-r from-red-400/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-0 left-0 w-[90%] h-[2px] bg-gradient-to-r from-pink-400/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-0 left-0 w-[70%] h-[2px] bg-gradient-to-r from-orange-400/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-0 left-0 w-[50%] h-[2px] bg-gradient-to-r from-yellow-400/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-0 left-0 w-[30%] h-[2px] bg-gradient-to-r from-green-400/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-0 left-0 w-[10%] h-[2px] bg-gradient-to-r from-blue-400/80 to-transparent blur-xs rotate-135 animate-flash" />
        <div className="absolute top-2 right-2 flex gap-4 flex-row justify-end w-full z-10">
          <button
            className="bg-slate-900 w-24 h-10 text-white rounded-full hover:bg-slate-700"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="bg-slate-900 w-24 h-10 text-white rounded-full hover:bg-slate-700"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
        <div className="flex flex-col justify-center items-center gap-6 absolute top-[35%] z-10">
          {/* <h1 className="text-7xl text-white font-bold  ">
            Welcome to the Slash
          </h1> */}
          <SplitText
            text="Welcome to the Slash!"
            className="text-2xl font-semibold text-center"
            delay={150}
            animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
            animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
            easing="easeOutCubic"
            threshold={0.2}
            rootMargin="-50px"
            onLetterAnimationComplete={handleAnimationComplete}
            fontsize="text-7xl"
          />
          {/* <h1 className="text-5xl text-white font-bold">
            Code smarter, not harder.
          </h1> */}

          <SplitText
            text="Code smarter, not harder."
            className="text-2xl font-semibold text-center"
            delay={200}
            animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
            animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
            easing="easeOutCubic"
            threshold={0.2}
            rootMargin="-50px"
            onLetterAnimationComplete={handleAnimationComplete}
            fontsize="text-5xl"
          />
          <div
            className="w-40 h-12 rounded-lg text-white bg-[#1e1e1e] bg-transparent flex justify-center items-center hover:bg-slate-700 border border-slate-300"
            onClick={() => {
              navigate("/home");
            }}
          >
            Get Started
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
