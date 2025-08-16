import { useEffect, useState } from "react";

const RainDrops = () => {
  const [rainDrops, setRainDrops] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const generateRainDrops = () => {
      const drops = Array.from({ length: 10 }).map(() => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 0.5 + 0.5}s`,
      }));
      setRainDrops(drops);
    };

    generateRainDrops();
  }, []);

  return (
    <>
      {rainDrops.map((style, i) => (
        <div key={i} className="rain-drop" style={style} />
      ))}
    </>
  );
};

export default RainDrops;