import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isActive: boolean;
  volume: number; // 0 to 1
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, volume }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set clearer resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    let phase = 0;

    const render = () => {
      if (!isActive) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        // Draw a flat line when inactive
        ctx.beginPath();
        ctx.moveTo(0, rect.height / 2);
        ctx.lineTo(rect.width, rect.height / 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      ctx.clearRect(0, 0, rect.width, rect.height);
      const centerY = rect.height / 2;
      
      // Visual parameters
      // Enhance volume visual effect
      const amplitude = Math.max(5, volume * 100); 
      const frequency = 0.05;
      
      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let x = 0; x < rect.width; x++) {
        // Combine sine waves for a more organic "voice" look
        const y = centerY + 
          Math.sin(x * frequency + phase) * amplitude * Math.sin(x / rect.width * Math.PI) +
          Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = '#6366f1'; // Indigo-500
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      phase += 0.15;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, volume]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-24 rounded-lg bg-white border border-slate-100"
    />
  );
};

export default Visualizer;