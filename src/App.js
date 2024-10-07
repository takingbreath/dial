import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  // ... (keep all existing state variables and functions)

  const [showArrows, setShowArrows] = useState(true);

  useEffect(() => {
    if (rotation > Math.PI / 6) { // Hide arrows after 30 degrees of rotation
      setShowArrows(false);
    }
  }, [rotation]);

  // ... (keep other useEffect hooks and functions)

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
          <div className="relative w-64 h-64">
            <div
              ref={dialRef}
              className="absolute inset-0 rounded-full bg-white shadow-lg cursor-pointer"
              onMouseDown={handleStart}
              onTouchStart={handleStart}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(purple ${(rotation / (2 * Math.PI)) * 100}%, transparent 0)`,
                }}
              />
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-3 bg-gray-200"
                    style={{
                      transform: `rotate(${i * 15}deg) translateY(-30px)`,
                      transformOrigin: "bottom center",
                    }}
                  />
                ))}
              </div>
              {showArrows && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <path
                    d="M50,10 A40,40 0 0,1 90,50 L85,50 A35,35 0 0,0 50,15 Z"
                    fill="#ff69b4"
                    opacity="0.7"
                  />
                  <path
                    d="M10,50 A40,40 0 0,1 50,10 L50,15 A35,35 0 0,0 15,50 Z"
                    fill="#ff69b4"
                    opacity="0.7"
                  />
                </svg>
              )}
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
    </div>
  );
};

export default RepaymentPlanDial;
