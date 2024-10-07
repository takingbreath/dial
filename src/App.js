import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  // ... (keep all other state variables and useEffect hooks)

  const playFeedback = () => {
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }

    if (supportsVibration) {
      // Reduced vibration duration from 50ms to 10ms for a lighter feedback
      navigator.vibrate(10);
    }
  };

  // ... (keep all other functions)

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
              {/* Add tick marks here if needed */}
            </div>
            {showTick && (
              <div className="absolute inset-0 bg-white bg-opacity-50 rounded-full transition-opacity duration-100"></div>
            )}
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
