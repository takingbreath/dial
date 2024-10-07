import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [totalRotation, setTotalRotation] = useState(0);
  const [plan, setPlan] = useState({ frequency: "Day", duration: 2 });
  const [audioContext, setAudioContext] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [supportsVibration, setSupportsVibration] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showVisualFeedback, setShowVisualFeedback] = useState(false);

  const dialRef = useRef(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    setSupportsVibration('vibrate' in navigator && !/(iPad|iPhone|iPod)/g.test(navigator.userAgent));
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
      navigator.vibrate(3);
    } else {
      setShowVisualFeedback(true);
      setTimeout(() => setShowVisualFeedback(false), 50);
    }
  };

  const getAngle = (clientX, clientY) => {
    const rect = dialRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    return Math.atan2(clientY - center.y, clientX - center.x);
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
    
    // Ensure the rotation is always positive and within [0, 2π]
    newRotation = (newRotation + 2 * Math.PI) % (2 * Math.PI);

    const rotationDiff = newRotation - rotation;
    const newTotalRotation = totalRotation + rotationDiff;
    setTotalRotation(newTotalRotation);

    setRotation(newRotation);
    updatePlan(newRotation, Math.floor(Math.abs(newTotalRotation) / (2 * Math.PI)));

    const currentTick = Math.floor(newRotation / (Math.PI / 12));
    if (currentTick !== lastTickRef.current) {
      playFeedback();
      lastTickRef.current = currentTick;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const updatePlan = (angle, fullRotations) => {
    const normalizedAngle = angle / (2 * Math.PI);
    let frequency, duration;

    const cyclePosition = fullRotations % 3;

    if (cyclePosition === 0) {
      frequency = "Day";
      duration = Math.floor(normalizedAngle * 29) + 2; // 2 to 30 days
    } else if (cyclePosition === 1) {
      frequency = "Week";
      duration = Math.floor(normalizedAngle * 11) + 2; // 2 to 12 weeks
    } else {
      frequency = "Month";
      duration = Math.floor(normalizedAngle * 11) + 2; // 2 to 12 months
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
  }, [isInitialized, isDragging, startAngle, rotation]);

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
                className="absolute inset-0 rounded-full transition-all duration-50 ease-out"
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
              {showVisualFeedback && (
                <div className="absolute inset-0 bg-white bg-opacity-30 rounded-full transition-opacity duration-50"></div>
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
