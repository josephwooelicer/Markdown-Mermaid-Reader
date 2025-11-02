
import React, { useState, useCallback } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Lightbox } from './components/Lightbox';
import { FileTextIcon } from './components/icons/FileTextIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import { FileUpload } from './components/FileUpload';
import { ResetIcon } from './components/icons/ResetIcon';
import { pathIsImage, pathIsMarkdown } from './utils/fileUtils';
import { HighlightedCode } from './components/HighlightedCode';
import type { FileNode } from './types';
import { zipService } from './services/zipService';

const App: React.FC = () => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxSvg, setLightboxSvg] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const reset = useCallback(() => {
    setFileTree([]);
    setFileContents(new Map());
    setSelectedFile(null);
    setIsLoading(false);
    setError(null);
    setLightboxSvg(null);
    setSidebarOpen(false);
    setSearchQuery('');
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setSelectedFile(null);
    setFileTree([]);
    setFileContents(new Map());
    setSearchQuery('');
    
    try {
      const { fileTree, fileContents } = await zipService.processZipFile(file);
      setFileTree(fileTree);
      setFileContents(fileContents);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const selectFile = useCallback((path: string) => {
    if (fileContents.has(path)) {
      const content = fileContents.get(path) || '';
      setSelectedFile({ path, content });
      setSidebarOpen(false);
    }
  }, [fileContents]);

  const openLightbox = useCallback((svg: string) => {
    setLightboxSvg(svg);
  }, []);
  
  const closeLightbox = useCallback(() => {
    setLightboxSvg(null);
  }, []);

  return (
    <>
      <div className="flex h-screen bg-slate-900 font-sans antialiased overflow-hidden">
        {fileTree.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center p-4">
                <FileUpload onFileUpload={uploadFile} isLoading={isLoading} error={error} />
            </div>
        ) : (
          <>
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/60 z-20 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              ></div>
            )}
            <aside className={`fixed inset-y-0 left-0 w-4/5 max-w-sm h-full bg-slate-800 p-4 border-r border-slate-700 flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-1/3 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
               <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-100">Documentation</h2>
                  <button 
                    onClick={reset} 
                    className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors" 
                    aria-label="Upload another file"
                    title="Upload another file"
                  >
                      <ResetIcon className="w-5 h-5" />
                  </button>
               </div>
              <FileExplorer 
                tree={fileTree} 
                fileContents={fileContents}
                onFileSelect={selectFile} 
                selectedPath={selectedFile?.path}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </aside>
            <main className="flex-1 h-full flex flex-col overflow-hidden bg-slate-900">
               <header className="md:hidden sticky top-0 bg-slate-900/80 backdrop-blur-sm p-2 z-10 border-b border-slate-700 flex items-center h-14 shrink-0">
                  <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-slate-300 hover:bg-slate-700">
                      <span className="sr-only">Open file explorer</span>
                      <MenuIcon className="w-6 h-6" />
                  </button>
                  <span className="ml-4 font-semibold truncate text-slate-200">{selectedFile?.path ?? 'Documentation'}</span>
              </header>
              <div className="flex-1 overflow-y-auto">
                {selectedFile ? (
                  pathIsMarkdown(selectedFile.path) ? (
                    <MarkdownRenderer 
                      key={selectedFile.path} 
                      content={selectedFile.content}
                      onDiagramClick={openLightbox}
                      searchQuery={searchQuery}
                    />
                  ) : pathIsImage(selectedFile.path) ? (
                    <div className="p-4 sm:p-6 md:p-8 flex items-center justify-center h-full">
                      <img 
                        src={selectedFile.content} 
                        alt={selectedFile.path} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg bg-slate-800 border border-slate-700"
                      />
                    </div>
                  ) : (
                    <pre className="p-8 text-sm text-slate-300 whitespace-pre-wrap break-words">
                      <HighlightedCode text={selectedFile.content} highlight={searchQuery} />
                    </pre>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
                    <FileTextIcon className="w-24 h-24 mb-4 text-slate-700" />
                    <p className="text-lg font-medium">Select a file to view its content</p>
                    <p className="text-sm md:hidden">Tap the menu icon to browse files.</p>
                    <p className="text-sm hidden md:block">Choose a file from the explorer on the left.</p>
                  </div>
                )}
              </div>
            </main>
          </>
        )}
      </div>
      {lightboxSvg && (
        <Lightbox svgContent={lightboxSvg} onClose={closeLightbox} />
      )}
    </>
  );
};

export default App;