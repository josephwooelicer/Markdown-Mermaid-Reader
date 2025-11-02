
import React, { useEffect, useMemo } from 'react';
import MermaidDiagram from './MermaidDiagram';

// TypeScript declarations for global libraries from CDN
declare var marked: any;
declare var Prism: any; // For syntax highlighting via Prism.js

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface MarkdownRendererProps {
  content: string;
  onDiagramClick?: (svg: string) => void;
  searchQuery?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onDiagramClick, searchQuery }) => {

  const markedOptions = useMemo(() => {
    const renderer = new marked.Renderer();
    
    // Highlight search query in text
    if (searchQuery) {
        const originalText = renderer.text.bind(renderer);
        renderer.text = (text) => {
            const highlighted = originalText(text).replace(
                new RegExp(escapeRegExp(searchQuery), 'gi'),
                (match: string) => `<mark>${match}</mark>`
            );
            return highlighted;
        };
    }

    return {
      gfm: true, 
      breaks: true,
      highlight: (code: string, lang: string) => {
        if (typeof Prism !== 'undefined' && Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      },
      renderer,
    };
  }, [searchQuery]);


  useEffect(() => {
    // Set global options for marked to use GitHub Flavored Markdown, handle line breaks,
    // and use Prism for syntax highlighting.
    marked.setOptions(markedOptions);

    // Cleanup function to reset marked options when the component unmounts.
    return () => {
      marked.setOptions({
        gfm: false,
        breaks: false,
        highlight: undefined,
        renderer: new marked.Renderer(),
      });
    };
  }, [markedOptions]);

  const parts = useMemo(() => {
    if (!content) return [];
    // Split the content by mermaid code blocks, keeping the delimiters
    return content.split(/(```mermaid[\s\S]*?```)/g);
  }, [content]);

  if (!content) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 overflow-y-auto h-full">
      <div className="max-w-none text-base text-slate-300 leading-relaxed
        /* Headings */
        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:pb-2 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-slate-700
        [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:pb-2 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-slate-700
        [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2
        [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mb-2
        [&_h5]:text-base [&_h5]:font-bold [&_h5]:mb-2
        [&_h6]:text-sm [&_h6]:font-bold [&_h6]:mb-2

        /* Text & Links */
        [&_p]:my-4
        [&_a]:text-blue-400 hover:[&_a]:underline
        [&_strong]:font-bold [&_strong]:text-slate-100

        /* Lists */
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
        [&_li]:my-1

        /* Blockquote */
        [&_blockquote]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-600 [&_blockquote]:text-slate-400 [&_blockquote]:italic [&_blockquote]:my-4

        /* Horizontal Rule */
        [&_hr]:border-slate-700 [&_hr]:my-6

        /* Code */
        [&_:not(pre)>code]:bg-slate-700/50 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-1 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-sm
        [&_pre]:bg-slate-800 [&_pre]:border [&_pre]:border-slate-700 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4
        /* Reset styles for code inside pre blocks to allow Prism theme to take over text styling */
        [&_pre_code]:p-0 [&_pre_code]:bg-transparent [&_pre_code]:border-0

        /* Tables */
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-slate-600 [&_table]:text-left
        [&_thead]:bg-slate-800
        [&_th]:p-3 [&_th]:font-semibold [&_th]:border [&_th]:border-slate-600
        [&_td]:p-3 [&_td]:border [&_td]:border-slate-600
        
        /* Highlighting */
        [&_mark]:bg-yellow-500/30 [&_mark]:text-yellow-200 [&_mark]:rounded-sm [&_mark]:px-0.5
      ">
        {parts.map((part, index) => {
          if (part.startsWith('```mermaid')) {
            const definition = part.replace(/^```mermaid\n?/, '').replace(/```$/, '').trim();
            return <MermaidDiagram key={index} definition={definition} onClick={onDiagramClick} />;
          } else if (part.trim()) {
            const htmlContent = marked.parse(part, { ...markedOptions, async: false }) as string;
            return <div key={index} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
          }
          return null;
        })}
      </div>
    </div>
  );
};
