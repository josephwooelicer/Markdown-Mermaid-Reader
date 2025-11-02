
import React, { useState, useMemo } from 'react';
import type { FileNode } from '../types';
import { FolderIcon } from './icons/FolderIcon';
import { FileIcon } from './icons/FileIcon';
import { MarkdownIcon } from './icons/MarkdownIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ImageIcon } from './icons/ImageIcon';
import { pathIsImage } from '../utils/fileUtils';
import { SearchIcon } from './icons/SearchIcon';

const HighlightMatches: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query) return <>{text}</>;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-500/30 text-yellow-200 rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

const FileExplorerNode: React.FC<{ 
  node: FileNode; 
  onFileSelect: (path: string) => void; 
  selectedPath?: string | null; 
  level: number; 
  searchQuery: string;
}> = ({ node, onFileSelect, selectedPath, level, searchQuery }) => {
  const [isOpen, setIsOpen] = useState(true);

  const isSelected = selectedPath === node.path;

  if (node.type === 'folder') {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-slate-700 transition-colors"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          <ChevronRightIcon className={`w-4 h-4 mr-2 text-slate-400 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          <FolderIcon className="w-5 h-5 mr-2 text-purple-400" />
          <span className="font-medium text-slate-200 truncate">
            <HighlightMatches text={node.name} query={searchQuery} />
          </span>
        </div>
        {isOpen && node.children && (
          <FileExplorerComponent 
            tree={node.children} 
            onFileSelect={onFileSelect} 
            selectedPath={selectedPath} 
            level={level + 1}
            searchQuery={searchQuery}
          />
        )}
      </div>
    );
  }

  const isMarkdown = node.name.endsWith('.md') || node.name.endsWith('.markdown');
  const isImg = pathIsImage(node.name);

  return (
    <div
      onClick={() => onFileSelect(node.path)}
      className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors group ${
        isSelected ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'hover:bg-slate-700 text-slate-300'
      }`}
      style={{ paddingLeft: `${level * 20 + 8}px` }}
    >
      <div className="w-4 h-4 mr-2 shrink-0"></div>
      {isMarkdown ? (
        <MarkdownIcon className="w-5 h-5 mr-2 text-white-400 shrink-0" />
      ) : isImg ? (
        <ImageIcon className={`w-5 h-5 mr-2 shrink-0 ${isSelected ? 'text-purple-300' : 'text-sky-400'}`} />
      ) : (
        <FileIcon className={`w-5 h-5 mr-2 shrink-0 ${isSelected ? 'text-purple-300' : 'text-slate-400'}`} />
      )}
      <span className="truncate">
        <HighlightMatches text={node.name} query={searchQuery} />
      </span>
    </div>
  );
};

const FileExplorerComponent: React.FC<{ 
  tree: FileNode[]; 
  onFileSelect: (path: string) => void; 
  selectedPath?: string | null; 
  level?: number;
  searchQuery: string;
}> = ({ tree, onFileSelect, selectedPath, level = 0, searchQuery }) => {
  return (
    <div className="space-y-0.5 text-sm">
      {tree.map(node => (
        <FileExplorerNode
          key={node.path}
          node={node}
          onFileSelect={onFileSelect}
          selectedPath={selectedPath}
          level={level}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
};

interface FileExplorerContainerProps {
  tree: FileNode[];
  fileContents: Map<string, string>;
  onFileSelect: (path: string) => void;
  selectedPath?: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FileExplorer: React.FC<FileExplorerContainerProps> = (props) => {
  const { tree, fileContents, onFileSelect, selectedPath, searchQuery, onSearchChange } = props;

  const filteredTree = useMemo(() => {
    if (!searchQuery) return tree;

    const lowerCaseQuery = searchQuery.toLowerCase();

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      const result: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === 'folder') {
          const children = filterNodes(node.children || []);
          if (children.length > 0 || node.name.toLowerCase().includes(lowerCaseQuery)) {
            result.push({ ...node, children });
          }
        } else {
          const content = fileContents.get(node.path) || '';
          if (node.name.toLowerCase().includes(lowerCaseQuery) || (!pathIsImage(node.path) && content.toLowerCase().includes(lowerCaseQuery))) {
            result.push(node);
          }
        }
      }
      return result;
    };
    
    return filterNodes(tree);
  }, [tree, searchQuery, fileContents]);

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search files..."
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredTree.length > 0 ? (
          <FileExplorerComponent
            tree={filteredTree}
            onFileSelect={onFileSelect}
            selectedPath={selectedPath}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="text-center text-slate-400 p-4">
            No results found.
          </div>
        )}
      </div>
    </div>
  );
}
