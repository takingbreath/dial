import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [totalRotation, setTotalRotation] = useState(0);
  const dialRef = useRef(null);
  const audioRef = useRef(null);
  const [plan, setPlan] = useState({ frequency: "Day", duration: 2 });
  const lastTickRef = useRef(0);
  const [canPlayAudio, setCanPlayAudio] = useState(false);
  const [showTick, setShowTick] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
    );
    audioRef.current.volume = 0.2;

    audioRef.current.play().then(() => {
      setCanPlayAudio(true);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }).catch(() => {
      setCanPlayAudio(false);
      console.log("Audio autoplay is not allowed. Using visual indicator instead.");
    });
  }, []);

  const getAngle = (clientX, clientY) => {
    const rect = dialRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    return Math.atan2(y, x);
  };

  const handleStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setStartAngle(getAngle(clientX, clientY) - rotation);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let newRotation = getAngle(clientX, clientY) - startAngle;
    if (newRotation < 0) newRotation += 2 * Math.PI;

    const rotationDiff = newRotation - rotation;
    setTotalRotation((prev) => {
      if (rotationDiff > Math.PI) return prev - (2 * Math.PI - rotationDiff);
      if (rotationDiff < -Math.PI) return prev + (2 * Math.PI + rotationDiff);
      return prev + rotationDiff;
    });

    setRotation(newRotation);
    updatePlan(newRotation, Math.floor(totalRotation / (2 * Math.PI)));

    const currentTick = Math.floor(newRotation / (Math.PI / 12));
    if (currentTick !== lastTickRef.current) {
      if (canPlayAudio) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      } else {
        setShowTick(true);
        setTimeout(() => setShowTick(false), 100);
      }
      lastTickRef.current = currentTick;
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
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
  }, [isDragging, startAngle, rotation, totalRotation]);

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

  const getDialBackground = () => {
    const startColor = 'rgb(236, 72, 153)'; // Hot pink
    const endColor = 'rgb(107, 33, 168)'; // Dark purple
    const angle = (rotation / (2 * Math.PI)) * 360;
    const fullRotations = Math.floor(totalRotation / (2 * Math.PI));
    
    const progress = Math.min(fullRotations / 2, 1); // Max out at 2 full rotations
    const currentColor = interpolateColor(startColor, endColor, progress);
    
    return `conic-gradient(${currentColor} ${angle}deg, transparent ${angle}deg, transparent 360deg)`;
  };

  const interpolateColor = (color1, color2, factor) => {
    const r1 = parseInt(color1.slice(4, 7), 10);
    const g1 = parseInt(color1.slice(9, 12), 10);
    const b1 = parseInt(color1.slice(14, 17), 10);
    const r2 = parseInt(color2.slice(4, 7), 10);
    const g2 = parseInt(color2.slice(9, 12), 10);
    const b2 = parseInt(color2.slice(14, 17), 10);
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * 360;
      ticks.push(
        <div
          key={i}
          className="absolute w-0.5 h-2 bg-gray-300"
          style={{
            transform: `rotate(${angle}deg) translateY(-31px)`,
            transformOrigin: "bottom center",
          }}
        />
      );
    }
    return ticks;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div
        ref={dialRef}
        className="relative w-64 h-64 rounded-full bg-white shadow-lg cursor-pointer"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: getDialBackground(),
          }}
        />
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          {renderTicks()}
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
    </div>
  );
};

export default RepaymentPlanDial;
