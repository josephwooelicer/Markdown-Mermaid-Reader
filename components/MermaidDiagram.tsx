import React, { useEffect, useRef, useState } from 'react';
import { ZoomInIcon } from './icons/ZoomInIcon';

declare var mermaid: any;

interface MermaidDiagramProps {
  definition: string;
  onClick?: (svg: string) => void;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ definition, onClick }) => {
  const [renderOutput, setRenderOutput] = useState<{svg: string, bindFunctions?: (element: Element) => void} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'dark',
    });

    if (!definition.trim()) {
      setRenderOutput(null);
      setError(null);
      return;
    }

    const renderDiagram = async () => {
      try {
        setRenderOutput(null);
        setError(null);

        const id = `mermaid-svg-${Math.random().toString(36).slice(2, 9)}`;
        const result = await mermaid.render(id, definition);
        setRenderOutput(result);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const errorMessage = (err instanceof Error) ? err.message : String(err);
        setError(errorMessage);
        setRenderOutput(null);
      }
    };

    renderDiagram();
  }, [definition]);

  useEffect(() => {
      if (renderOutput?.bindFunctions && containerRef.current) {
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            renderOutput.bindFunctions(svgElement);
          }
      }
  }, [renderOutput]);

  const handleClick = () => {
    if (onClick && renderOutput) {
        onClick(renderOutput.svg);
    }
  };

  if (error) {
    return (
      <div className="my-4 p-4 border border-red-500/50 bg-red-900/30 rounded-lg">
        <p className="font-semibold text-red-200">Mermaid Diagram Error</p>
        <pre className="text-sm text-red-300 whitespace-pre-wrap break-all"><code>{error}</code></pre>
      </div>
    );
  }

  if (!renderOutput) {
    return <div className="my-4 p-8 flex justify-center items-center text-slate-400 bg-slate-800 border border-slate-700 rounded-lg animate-pulse min-h-[120px]">Loading diagram...</div>;
  }
  
  return (
    <div 
      className="relative my-4 p-4 bg-slate-800 border border-slate-700 rounded-lg group bg-white"
      onClick={handleClick}
    >
      <div 
        className="absolute top-2 right-2 p-1.5 bg-slate-900/70 backdrop-blur-sm border border-slate-600 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-zoom-in"
        aria-label="Zoom in on diagram"
      >
        <ZoomInIcon className="w-5 h-5" />
      </div>
      <div
        ref={containerRef}
        className="flex justify-center cursor-zoom-in"
        dangerouslySetInnerHTML={{ __html: renderOutput.svg }}
      />
    </div>
  );
};

export default MermaidDiagram;