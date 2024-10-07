import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  // ... (keep other state variables)
  const [audioContext, setAudioContext] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [supportsVibration, setSupportsVibration] = useState(false);

  useEffect(() => {
    // Check for vibration support
    setSupportsVibration('vibrate' in navigator);

    // Create AudioContext
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    // Load audio file
    fetch("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3")
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .then(decodedAudio => setAudioBuffer(decodedAudio))
      .catch(error => console.error("Error loading audio:", error));

    return () => {
      context.close();
    };
  }, []);

  const playFeedback = () => {
    // Play sound
    if (audioContext && audioBuffer) {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }

    // Vibrate
    if (supportsVibration) {
      navigator.vibrate(50); // Vibrate for 50ms
    }
  };

  const handleStart = (e) => {
    // Resume audio context on user interaction
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
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

    // ... (keep existing rotation logic)

    const currentTick = Math.floor(newRotation / (Math.PI / 12));
    if (currentTick !== lastTickRef.current) {
      playFeedback();
      setShowTick(true);
      setTimeout(() => setShowTick(false), 100);
      lastTickRef.current = currentTick;
    }
  };

  // ... (keep other functions)

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div
        ref={dialRef}
        className="relative w-64 h-64 rounded-full bg-white shadow-lg cursor-pointer"
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* ... (keep existing JSX) */}
      </div>
      {/* ... (keep existing JSX) */}
    </div>
  );
};

export default RepaymentPlanDial;
