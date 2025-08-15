import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen text-white bg-gradient-to-b from-[#0f172a] to-[#020617] overflow-x-hidden">
      
      {/* Section 1 - Hero */}
      <section className="relative h-screen flex items-center justify-center px-6 md:px-20">
        {/* Gradient blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/40 rounded-full blur-[200px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/40 rounded-full blur-[200px] animate-pulse delay-500" />

        {/* Navigation */}
        <div className="absolute top-6 right-8 flex gap-4 z-20">
          <button
            className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-all duration-300"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl">
          {/* Left Content */}
          <div className="max-w-xl text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to Slash 🚀
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              Slash is your AI-powered productivity companion.  
              Build faster, work smarter, and automate everything that slows you down.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <button
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                onClick={() => navigate("/home")}
              >
                Get Started
              </button>
              <button
                className="px-8 py-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all duration-300"
                onClick={() => document.getElementById("about").scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative w-full md:w-[450px] h-[300px] bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-blue-500/30 blur-2xl rounded-2xl animate-pulse" />
            <p className="z-10 text-lg text-gray-300">⚡ AI Code Preview</p>
          </div>
        </div>

        {/* Stats Below Hero */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-10 bg-white/5 backdrop-blur-md border border-white/10 px-10 py-4 rounded-full shadow-lg">
          {[
            { num: "10+", label: "Active Users" },
            { num: "50+", label: "Projects Built" },
            { num: "200+", label: "AI Tasks Done" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <h3 className="text-2xl font-bold text-white">{stat.num}</h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 - About */}
      <section id="about" className="py-20 px-6 md:px-20 bg-[#0f172a]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">About Slash</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Slash is designed to revolutionize the way you work.  
            Whether you’re a developer, a student, or an entrepreneur, our platform uses AI to streamline workflows, enhance productivity, and eliminate repetitive tasks.
          </p>
        </div>
      </section>

      {/* Section 3 - Features */}
      <section className="py-20 px-6 md:px-20 bg-[#020617]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "AI Code Assistant", desc: "Write and debug code faster with intelligent AI suggestions." },
              { title: "Smart File Access", desc: "Access your files securely from anywhere without cloud storage." },
              { title: "Collaboration Tools", desc: "Seamlessly work with your team in real-time." },
              { title: "Task Automation", desc: "Automate repetitive tasks and focus on creativity." },
              { title: "Secure Environment", desc: "End-to-end encryption ensures your data stays safe." },
              { title: "Cross-Platform", desc: "Use Slash on mobile, desktop, or the web." }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:scale-105 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-white/10">
        © {new Date().getFullYear()} Slash. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
