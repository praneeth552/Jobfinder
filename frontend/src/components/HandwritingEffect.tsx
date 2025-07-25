"use client";

import { useState, useEffect, useRef } from "react";
import "./HandwritingEffect.css";

interface HandwritingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export default function HandwritingEffect({
  text,
  speed = 100,
  onComplete,
  className = "",
}: HandwritingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Keep the onComplete callback fresh without re-triggering the effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p className={`font-sans text-5xl text-white ${className}`}>
      {displayedText}
      {!isComplete && <span className="handwriting-cursor"></span>}
    </p>
  );
}
