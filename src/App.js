import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  // ... (keep all existing state variables and functions)

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {!isInitialized ? (
        <button
          onClick={initializeAudio}
          className="px-6 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors"
        >
          Start
        </button>
      ) : (
        <>
          <div className="text-2xl font-bold mb-4 text-gray-700">Spin</div>
          <div className="relative">
            <div
              ref={dialRef}
              className="relative w-64 h-64 rounded-full bg-white shadow-lg cursor-pointer"
              onMouseDown={handleStart}
              onTouchStart={handleStart}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(purple ${(rotation / (2 * Math.PI)) * 100}%, transparent 0)`,
                }}
              />
              <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                {/* Tick marks */}
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-3 bg-gray-300"
                    style={{
                      transform: `rotate(${i * 15}deg) translateY(-30px)`,
                      transformOrigin: "bottom center",
                    }}
                  />
                ))}
              </div>
              {/* Animated arrows */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="arrow-left"></div>
                <div className="arrow-right"></div>
              </div>
              {showTick && (
                <div className="absolute inset-0 bg-white bg-opacity-50 rounded-full transition-opacity duration-100"></div>
              )}
            </div>
          </div>
          <div className="mt-8 text-xl font-semibold text-gray-700">
            Every {plan.frequency} for {plan.duration} {plan.frequency}s
          </div>
          <button className="mt-4 px-6 py-2 bg-purple-700 text-white rounded-full shadow-md hover:bg-purple-800 transition-colors">
            Next
          </button>
        </>
      )}
      <style jsx>{`
        .arrow-left, .arrow-right {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 4px solid #ff69b4;
          border-top: none;
          border-right: none;
          opacity: 0.7;
          animation: arrow-pulse 2s infinite;
        }
        .arrow-left {
          top: 50%;
          left: 20px;
          transform: translateY(-50%) rotate(45deg);
        }
        .arrow-right {
          top: 20px;
          right: 50%;
          transform: translateX(50%) rotate(225deg);
        }
        @keyframes arrow-pulse {
          0% { opacity: 0.7; }
          50% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default RepaymentPlanDial;
