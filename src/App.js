import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [totalRotation, setTotalRotation] = useState(0);
  const [plan, setPlan] = useState({ frequency: "Day", duration: 2 });
  const [showTick, setShowTick] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [supportsVibration, setSupportsVibration] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const dialRef = useRef(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    setSupportsVibration('vibrate' in navigator);
  }, []);

  const initializeAudio = async () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    try {
      const response = await fetch("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const decodedAudio = await context.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedAudio);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  };

  const playFeedback = () => {
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }

    if (supportsVibration) {
      navigator.vibrate(3); // Reduced from 10ms to 3ms (70% reduction)
    }
  };

  const getAngle = (clientX, clientY) => {
    const rect = dialRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    return Math.atan2(y, x);
  };

  const handleStart = (e) => {
    if (!isInitialized) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setStartAngle(getAngle(clientX, clientY) - rotation);
  };

  const handleMove = (e) => {
    if (!isDragging || !isInitialized) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let newRotation = getAngle(clientX, clientY) - startAngle;
    if (newRotation < 0) newRotation += 2 * Math.PI;

    const rotationDiff = newRotation - rotation;
    setTotalRotation(prev => {
      if (rotationDiff > Math.PI) return prev - (2 * Math.PI - rotationDiff);
      if (rotationDiff < -Math.PI) return prev + (2 * Math.PI + rotationDiff);
      return prev + rotationDiff;
    });

    setRotation(newRotation);
    updatePlan(newRotation, Math.floor(totalRotation / (2 * Math.PI)));

    const currentTick = Math.floor(newRotation / (Math.PI / 12));
    if (currentTick !== lastTickRef.current) {
      playFeedback();
      setShowTick(true);
      setTimeout(() => setShowTick(false), 100);
      lastTickRef.current = currentTick;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const updatePlan = (angle, fullRotations) => {
    const normalizedAngle = angle / (2 * Math.PI);
    let frequency, duration;

    if (fullRotations % 3 === 0) {
      frequency = "Day";
      duration = Math.floor(normalizedAngle * 29) + 2;
    } else if (fullRotations % 3 === 1) {
      frequency = "Week";
      duration = Math.floor(normalizedAngle * 11) + 2;
    } else {
      frequency = "Month";
      duration = Math.floor(normalizedAngle * 11) + 2;
    }

    setPlan({ frequency, duration });
  };

  useEffect(() => {
    if (isInitialized) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("touchend", handleEnd);
      return () => {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
      };
    }
  }, [isInitialized, isDragging, startAngle, rotation, totalRotation]);

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
