/**
 * Parser for AI-generated messages containing bolt artifacts
 */

export interface FileAction {
  type: 'file';
  filePath: string;
  content: string;
}

export interface ShellAction {
  type: 'shell';
  command: string;
}

export interface StartAction {
  type: 'start';
  command: string;
}

export type BoltAction = FileAction | ShellAction | StartAction;

export interface BoltArtifact {
  id: string;
  title: string;
  actions: BoltAction[];
}

export interface ParsedMessage {
  text: string;
  artifacts: BoltArtifact[];
}

/**
 * Parse a message containing bolt artifacts
 */
export function parseMessage(content: string): ParsedMessage {
  const artifacts: BoltArtifact[] = [];
  let text = content;

  console.log('[Parser] Parsing content length:', content.length);
  console.log('[Parser] Has boltArtifact tag:', content.includes('<boltArtifact'));
  console.log('[Parser] Has boltAction tag:', content.includes('<boltAction'));
  console.log('[Parser] Has closing boltArtifact tag:', content.includes('</boltArtifact>'));

  // Find all bolt artifacts with proper wrapper
  const artifactRegex = /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/g;
  let match;

  while ((match = artifactRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const innerContent = match[1];

    // Parse artifact attributes
    const idMatch = fullMatch.match(/id=["']([^"']+)["']/);
    const titleMatch = fullMatch.match(/title=["']([^"']+)["']/);

    const actions = parseActions(innerContent);
    console.log('[Parser] Found artifact:', titleMatch?.[1], 'with', actions.length, 'actions');

    const artifact: BoltArtifact = {
      id: idMatch?.[1] || `artifact-${Date.now()}`,
      title: titleMatch?.[1] || 'Projeto',
      actions,
    };

    artifacts.push(artifact);

    // Remove artifact from text
    text = text.replace(fullMatch, '');
  }

  // If no artifacts found with proper closing tag, check for truncated artifacts
  if (artifacts.length === 0 && content.includes('<boltArtifact') && !content.includes('</boltArtifact>')) {
    console.log('[Parser] Found truncated boltArtifact (missing closing tag), attempting to parse...');

    // Extract content after <boltArtifact>
    const openTagMatch = content.match(/<boltArtifact([^>]*)>/);
    if (openTagMatch) {
      const startIndex = content.indexOf(openTagMatch[0]) + openTagMatch[0].length;
      const innerContent = content.substring(startIndex);

      // Parse artifact attributes from opening tag
      const idMatch = openTagMatch[0].match(/id=["']([^"']+)["']/);
      const titleMatch = openTagMatch[0].match(/title=["']([^"']+)["']/);

      const actions = parseActions(innerContent);
      console.log('[Parser] Parsed truncated artifact with', actions.length, 'actions');

      if (actions.length > 0) {
        artifacts.push({
          id: idMatch?.[1] || `artifact-${Date.now()}`,
          title: titleMatch?.[1] || 'Projeto (Truncado)',
          actions,
        });

        // Remove artifact content from text
        text = content.substring(0, content.indexOf('<boltArtifact'));
      }
    }
  }

  // If no artifacts found with wrapper, try to find standalone boltActions
  if (artifacts.length === 0 && content.includes('<boltAction')) {
    console.log('[Parser] No boltArtifact wrapper found, looking for standalone boltActions...');
    const standaloneActions = parseActions(content);

    if (standaloneActions.length > 0) {
      console.log('[Parser] Found', standaloneActions.length, 'standalone actions');
      artifacts.push({
        id: `artifact-${Date.now()}`,
        title: 'Projeto Gerado',
        actions: standaloneActions,
      });

      // Remove all boltAction tags from text
      text = content.replace(/<boltAction[^>]*>[\s\S]*?<\/boltAction>/g, '');
    }
  }

  // Clean up text
  text = text.trim();

  console.log('[Parser] Final result:', artifacts.length, 'artifacts, text length:', text.length);

  return { text, artifacts };
}

/**
 * Parse actions from artifact content
 */
function parseActions(content: string): BoltAction[] {
  const actions: BoltAction[] = [];

  // Log raw content to debug
  console.log('[Parser] parseActions content length:', content.length);

  // Count how many boltAction tags we have
  const openTags = (content.match(/<boltAction/g) || []).length;
  const closeTags = (content.match(/<\/boltAction>/g) || []).length;
  console.log('[Parser] boltAction tags - open:', openTags, 'close:', closeTags);

  // Check specifically for App.tsx
  const hasAppTsxTag = content.includes('filePath="src/App.tsx"') || content.includes("filePath='src/App.tsx'");
  console.log('[Parser] Content has src/App.tsx filePath:', hasAppTsxTag);

  const actionRegex = /<boltAction[^>]*>([\s\S]*?)<\/boltAction>/g;
  let match;

  while ((match = actionRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const actionContent = match[1];

    // Parse action type
    const typeMatch = fullMatch.match(/type=["']([^"']+)["']/);
    const type = typeMatch?.[1] || 'shell';

    console.log('[Parser] Parsing action type:', type);

    switch (type) {
      case 'file': {
        const filePathMatch = fullMatch.match(/filePath=["']([^"']+)["']/);
        if (filePathMatch) {
          console.log('[Parser] Found file action:', filePathMatch[1], 'content length:', actionContent.trim().length);
          actions.push({
            type: 'file',
            filePath: filePathMatch[1],
            content: actionContent.trim(),
          });
        } else {
          console.warn('[Parser] File action missing filePath attribute:', fullMatch.substring(0, 100));
        }
        break;
      }
      case 'shell': {
        actions.push({
          type: 'shell',
          command: actionContent.trim(),
        });
        break;
      }
      case 'start': {
        actions.push({
          type: 'start',
          command: actionContent.trim(),
        });
        break;
      }
    }
  }

  // Log all parsed file actions
  const fileActions = actions.filter(a => a.type === 'file') as FileAction[];
  console.log('[Parser] All parsed files:', fileActions.map(f => f.filePath));

  // Check if App.tsx is missing but was in the content
  const hasAppTsx = fileActions.some(f => f.filePath === 'src/App.tsx' || f.filePath === 'App.tsx');
  const hasAppTsxInContent = content.includes('filePath="src/App.tsx"') || content.includes("filePath='src/App.tsx'");

  if (!hasAppTsx && hasAppTsxInContent) {
    console.warn('[Parser] WARNING: App.tsx tag found in content but NOT parsed! Attempting manual extraction...');

    // Try to manually extract App.tsx
    const appTsxMatch = content.match(/<boltAction[^>]*filePath=["']src\/App\.tsx["'][^>]*>([\s\S]*?)(?:<\/boltAction>|<boltAction|$)/);
    if (appTsxMatch) {
      let appContent = appTsxMatch[1].trim();
      // Remove trailing </boltAction> if present
      if (appContent.endsWith('</boltAction>')) {
        appContent = appContent.slice(0, -13).trim();
      }
      console.log('[Parser] Manually extracted App.tsx, content length:', appContent.length);
      actions.push({
        type: 'file',
        filePath: 'src/App.tsx',
        content: appContent,
      });
    }
  } else if (!hasAppTsx && fileActions.length > 0) {
    console.warn('[Parser] WARNING: App.tsx not found in parsed files and not in content!');
  }

  // Check if we have file actions but missing shell/start actions
  const hasFileActions = actions.some(a => a.type === 'file');
  const hasPackageJson = actions.some(a => a.type === 'file' && a.filePath === 'package.json');
  const hasShellAction = actions.some(a => a.type === 'shell');
  const hasStartAction = actions.some(a => a.type === 'start');

  // Auto-add npm install and npm run dev if missing
  if (hasFileActions && hasPackageJson) {
    if (!hasShellAction) {
      console.log('[Parser] Auto-adding npm install action');
      actions.push({
        type: 'shell',
        command: 'npm install',
      });
    }
    if (!hasStartAction) {
      console.log('[Parser] Auto-adding npm run dev action');
      actions.push({
        type: 'start',
        command: 'npm run dev',
      });
    }
  }

  return actions;
}

/**
 * Stream parser for incremental artifact detection
 */
export class StreamingMessageParser {
  private buffer = '';
  private onArtifact?: (artifact: BoltArtifact) => void;
  private onText?: (text: string) => void;

  constructor(options?: {
    onArtifact?: (artifact: BoltArtifact) => void;
    onText?: (text: string) => void;
  }) {
    this.onArtifact = options?.onArtifact;
    this.onText = options?.onText;
  }

  /**
   * Add content to the buffer and process
   */
  append(content: string): void {
    this.buffer += content;
    this.process();
  }

  /**
   * Process the buffer for complete artifacts
   */
  private process(): void {
    // Check for complete artifacts
    const artifactEndTag = '</boltArtifact>';
    const endIndex = this.buffer.indexOf(artifactEndTag);

    if (endIndex !== -1) {
      const completeContent = this.buffer.substring(0, endIndex + artifactEndTag.length);
      this.buffer = this.buffer.substring(endIndex + artifactEndTag.length);

      const parsed = parseMessage(completeContent);

      if (parsed.text) {
        this.onText?.(parsed.text);
      }

      for (const artifact of parsed.artifacts) {
        this.onArtifact?.(artifact);
      }

      // Continue processing remaining buffer
      if (this.buffer.length > 0) {
        this.process();
      }
    }
  }

  /**
   * Finalize and return any remaining content
   */
  finalize(): ParsedMessage {
    const result = parseMessage(this.buffer);
    this.buffer = '';
    return result;
  }

  /**
   * Reset the parser
   */
  reset(): void {
    this.buffer = '';
  }
}
