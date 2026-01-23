import { memo, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import type { FileMap } from '../../lib/stores/files';
import { WORK_DIR } from '../../utils/constants';

interface FileTreeProps {
  files: FileMap;
  selectedFile?: string;
  onFileSelect: (filePath: string) => void;
  className?: string;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}

export const FileTree = memo(({ files, selectedFile, onFileSelect, className = '' }: FileTreeProps) => {
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div className={`h-full overflow-auto bg-gray-900 text-gray-300 ${className}`}>
      <div className="p-2">
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
});

FileTree.displayName = 'FileTree';

interface TreeItemProps {
  node: TreeNode;
  selectedFile?: string;
  onFileSelect: (filePath: string) => void;
  depth: number;
}

const TreeItem = memo(({ node, selectedFile, onFileSelect, depth }: TreeItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = node.path === selectedFile;
  const hasChildren = node.type === 'folder' && node.children && node.children.length > 0;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 hover:bg-gray-800 ${
          isSelected ? 'bg-blue-900/50 text-white' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
            <Folder className="h-4 w-4 text-yellow-500" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="h-4 w-4 text-gray-400" />
          </>
        )}
        <span className="truncate text-sm">{node.name}</span>
      </div>

      {hasChildren && isOpen && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

TreeItem.displayName = 'TreeItem';

function buildTree(files: FileMap): TreeNode[] {
  // Use a nested map structure to properly track children
  interface TreeNodeWithChildrenMap extends TreeNode {
    childrenMap?: Map<string, TreeNodeWithChildrenMap>;
  }

  const root: Map<string, TreeNodeWithChildrenMap> = new Map();

  console.log('[FileTree] Building tree from files:', Object.keys(files));

  // Sort entries to process folders first, then by path depth
  const entries = Object.entries(files)
    .filter(([, dirent]) => dirent !== undefined)
    .sort(([pathA, direntA], [pathB, direntB]) => {
      // Folders first
      if (direntA?.type === 'folder' && direntB?.type !== 'folder') return -1;
      if (direntA?.type !== 'folder' && direntB?.type === 'folder') return 1;
      return pathA.localeCompare(pathB);
    });

  for (const [fullPath, dirent] of entries) {
    if (!dirent) continue;

    // Handle paths with or without WORK_DIR prefix
    let relativePath = fullPath;
    if (fullPath.startsWith(WORK_DIR + '/')) {
      relativePath = fullPath.slice(WORK_DIR.length + 1);
    } else if (fullPath.startsWith(WORK_DIR)) {
      relativePath = fullPath.slice(WORK_DIR.length);
    }
    // Also handle paths starting with /
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.slice(1);
    }

    if (!relativePath) continue;

    const parts = relativePath.split('/').filter(p => p.length > 0);
    if (parts.length === 0) continue;

    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const currentPath = parts.slice(0, i + 1).join('/');
      const isLastPart = i === parts.length - 1;

      if (!currentLevel.has(name)) {
        const node: TreeNodeWithChildrenMap = {
          name,
          path: currentPath,
          type: isLastPart ? dirent.type : 'folder',
          children: isLastPart && dirent.type === 'file' ? undefined : [],
          childrenMap: isLastPart && dirent.type === 'file' ? undefined : new Map(),
        };
        currentLevel.set(name, node);
      }

      const node = currentLevel.get(name)!;

      // Navigate to next level using the childrenMap
      if (!isLastPart && node.childrenMap) {
        currentLevel = node.childrenMap;
      }
    }
  }

  // Convert maps to arrays recursively
  function convertToArray(nodeMap: Map<string, TreeNodeWithChildrenMap>): TreeNode[] {
    const result: TreeNode[] = [];
    for (const node of nodeMap.values()) {
      const treeNode: TreeNode = {
        name: node.name,
        path: node.path,
        type: node.type,
        children: node.childrenMap ? convertToArray(node.childrenMap) : undefined,
      };
      result.push(treeNode);
    }
    return result;
  }

  const result = sortNodes(convertToArray(root));
  console.log('[FileTree] Built tree:', JSON.stringify(result, null, 2));
  return result;
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: node.children ? sortNodes(node.children) : undefined,
    }))
    .sort((a, b) => {
      // Folders first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
}

export default FileTree;
