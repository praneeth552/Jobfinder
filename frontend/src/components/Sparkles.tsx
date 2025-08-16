import { useEffect, useState } from "react";

const Sparkles = () => {
  const [sparkles, setSparkles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const sps = Array.from({ length: 3 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        animationDelay: `${Math.random() * 1.5}s`,
      }));
      setSparkles(sps);
    };

    generateSparkles();
  }, []);

  return (
    <>
      {sparkles.map((style, i) => (
        <div key={i} className="sparkle" style={style} />
      ))}
    </>
  );
};

export default Sparkles;