import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface LightboxProps {
  svgContent: string;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ svgContent, onClose }) => {
  const [scale, setScale] = useState(1);
  const [initialScale, setInitialScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const pinchDistRef = useRef(0);
  const svgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial scale to fit screen
  useEffect(() => {
    // Reset visibility and transforms for new content
    setIsInitialized(false);
    setPosition({ x: 0, y: 0 });
    setScale(1);

    // Use a small timeout to allow the SVG to render and get its natural dimensions
    const timer = setTimeout(() => {
      if (!svgRef.current || !containerRef.current) return;
      const svgElement = svgRef.current.querySelector('svg');
      if (!svgElement) return;

      const { width: svgWidth, height: svgHeight } = svgElement.getBoundingClientRect();
      const { width: containerWidth, height: containerHeight } = containerRef.current.getBoundingClientRect();

      // Add padding so it doesn't touch the edges
      const padding = 80; // 40px on each side
      const availableWidth = containerWidth - padding;
      const availableHeight = containerHeight - padding;

      if (svgWidth === 0 || svgHeight === 0) {
        setIsInitialized(true);
        return;
      };

      const scaleX = availableWidth / svgWidth;
      const scaleY = availableHeight / svgHeight;
      const fitScale = Math.min(scaleX, scaleY);
      
      setScale(fitScale);
      setInitialScale(fitScale);
      setIsInitialized(true); // Fade in with the correct scale
    }, 50);

    return () => clearTimeout(timer);
  }, [svgContent]);


  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setStartPanPoint({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPanPoint.x,
      y: e.clientY - startPanPoint.y,
    });
  };
  
  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.005;
    const newScale = Math.max(Math.max(0.1, scale + delta), initialScale);
    setScale(newScale);
  };

  // Touch Handlers
  const getTouchDistance = (touches: React.TouchList) => {
    return Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
        setIsPanning(true);
        setStartPanPoint({
            x: e.touches[0].clientX - position.x,
            y: e.touches[0].clientY - position.y,
        });
    } else if (e.touches.length === 2) {
        pinchDistRef.current = getTouchDistance(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
        setPosition({
            x: e.touches[0].clientX - startPanPoint.x,
            y: e.touches[0].clientY - startPanPoint.y,
        });
    } else if (e.touches.length === 2 && pinchDistRef.current > 0) {
        const newDist = getTouchDistance(e.touches);
        const scaleDelta = newDist / pinchDistRef.current;
        setScale(prevScale => Math.min(Math.max(0.1, prevScale * scaleDelta), 10));
        pinchDistRef.current = newDist;
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    pinchDistRef.current = 0;
  };

  // Keyboard support for closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 touch-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Diagram viewer"
    >
      <button 
        className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <CloseIcon className="w-8 h-8" />
      </button>

      <div
        ref={svgRef}
        className={`select-none transition-opacity duration-200 ${isInitialized ? 'opacity-100' : 'opacity-0'} ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};