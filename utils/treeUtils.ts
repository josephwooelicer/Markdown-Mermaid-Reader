
import type { FileNode } from '../types';

export const buildFileTree = (files: { [key: string]: any }): FileNode[] => {
  const tree: FileNode[] = [];
  const map: { [key: string]: FileNode } = {};

  Object.values(files)
    .filter(file => !file.dir)
    .forEach(file => {
      const pathParts = file.name.replace(/\/$/, '').split('/');
      let currentLevel = tree;
      let currentPath = '';

      pathParts.forEach((part, index) => {
        const isLastPart = index === pathParts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        let node = map[currentPath];

        if (!node) {
          node = isLastPart
            ? { name: part, path: file.name, type: 'file' }
            : { name: part, path: `${currentPath}/`, type: 'folder', children: [] };
          currentLevel.push(node);
          map[currentPath] = node;
        }

        if (node.type === 'folder') {
          currentLevel = node.children!;
        }
      });
    });

  const sortTree = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => {
      if (node.type === 'folder' && node.children) {
        sortTree(node.children);
      }
    });
  };

  sortTree(tree);
  return tree;
};
