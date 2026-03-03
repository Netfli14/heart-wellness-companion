import { useEffect, useRef } from 'react';

const randomColors = (count: number): string[] => {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

export default function TubesCursor({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    const initTimer = setTimeout(() => {
      import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js' as any)
        .then((module: any) => {
          const TubesCursorFn = module.default;
          if (canvasRef.current) {
            const app = TubesCursorFn(canvasRef.current, {
              tubes: {
                colors: ["#5e72e4", "#8965e0", "#f5365c"],
                lights: {
                  intensity: 200,
                  colors: ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"]
                }
              }
            });
            appRef.current = app;
          }
        })
        .catch((err: any) => console.error("Failed to load TubesCursor module:", err));
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (appRef.current && typeof appRef.current.dispose === 'function') {
        appRef.current.dispose();
      }
    };
  }, []);

  const handleClick = () => {
    if (appRef.current) {
      const newTubeColors = randomColors(3);
      const newLightColors = randomColors(4);
      appRef.current.tubes.setColors(newTubeColors);
      appRef.current.tubes.setLightsColors(newLightColors);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`} onClick={handleClick}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
