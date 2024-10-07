import React, { useState, useRef, useEffect } from "react";

const RepaymentPlanDial = () => {
  // ... (keep all other state variables and functions)

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

  // ... (keep all other functions and JSX)

  return (
    // ... (keep the existing JSX structure)
  );
};

export default RepaymentPlanDial;
