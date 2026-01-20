import { acceptCompletion, autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, foldGutter, indentOnInput, indentUnit } from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { Compartment, EditorState, type Extension, Transaction } from '@codemirror/state';
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  scrollPastEnd,
} from '@codemirror/view';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { memo, useEffect, useRef, useState } from 'react';
import { getLanguage } from './languages';

export interface EditorDocument {
  value: string;
  isBinary: boolean;
  filePath: string;
  scroll?: ScrollPosition;
}

export interface ScrollPosition {
  top?: number;
  left?: number;
}

export interface EditorUpdate {
  content: string;
}

export type OnChangeCallback = (update: EditorUpdate) => void;
export type OnScrollCallback = (position: ScrollPosition) => void;
export type OnSaveCallback = () => void;

interface Props {
  doc?: EditorDocument;
  editable?: boolean;
  onChange?: OnChangeCallback;
  onScroll?: OnScrollCallback;
  onSave?: OnSaveCallback;
  className?: string;
}

type EditorStates = Map<string, EditorState>;

export const CodeMirrorEditor = memo(
  ({ doc, editable = true, onScroll, onChange, onSave, className = '' }: Props) => {
    const [languageCompartment] = useState(new Compartment());

    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView>();
    const docRef = useRef<EditorDocument>();
    const editorStatesRef = useRef<EditorStates>(new Map());
    const onScrollRef = useRef(onScroll);
    const onChangeRef = useRef(onChange);
    const onSaveRef = useRef(onSave);

    useEffect(() => {
      onScrollRef.current = onScroll;
      onChangeRef.current = onChange;
      onSaveRef.current = onSave;
      docRef.current = doc;
    });

    // Initialize editor
    useEffect(() => {
      const view = new EditorView({
        parent: containerRef.current!,
        dispatchTransactions(transactions: readonly Transaction[]) {
          view.update(transactions);

          if (docRef.current && transactions.some((t: Transaction) => t.docChanged)) {
            onChangeRef.current?.({
              content: view.state.doc.toString(),
            });

            editorStatesRef.current.set(docRef.current.filePath, view.state);
          }
        },
      });

      viewRef.current = view;

      return () => {
        viewRef.current?.destroy();
        viewRef.current = undefined;
      };
    }, []);

    // Handle document changes
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;

      if (!doc) {
        const state = createEditorState('', onSaveRef, [languageCompartment.of([])]);
        view.setState(state);
        return;
      }

      if (doc.isBinary) {
        return;
      }

      let state = editorStatesRef.current.get(doc.filePath);

      if (!state) {
        state = createEditorState(doc.value, onSaveRef, [languageCompartment.of([])]);
        editorStatesRef.current.set(doc.filePath, state);
      }

      view.setState(state);

      // Update content if different
      if (doc.value !== view.state.doc.toString()) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: doc.value,
          },
        });
      }

      // Load language support
      getLanguage(doc.filePath).then((languageSupport) => {
        if (languageSupport) {
          view.dispatch({
            effects: [languageCompartment.reconfigure([languageSupport])],
          });
        }
      });
    }, [doc?.value, doc?.filePath, editable, languageCompartment]);

    // Handle scroll position
    useEffect(() => {
      if (!viewRef.current || !doc || doc.isBinary) return;

      if (typeof doc.scroll?.top === 'number' || typeof doc.scroll?.left === 'number') {
        viewRef.current.scrollDOM.scrollTo(doc.scroll.left ?? 0, doc.scroll.top ?? 0);
      }
    }, [doc?.scroll?.top, doc?.scroll?.left]);

    return (
      <div className={`relative h-full ${className}`}>
        {doc?.isBinary && (
          <div className="flex h-full items-center justify-center bg-gray-900 text-gray-400">
            <p>Binary file cannot be displayed</p>
          </div>
        )}
        <div className="h-full overflow-hidden" ref={containerRef} />
      </div>
    );
  }
);

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

function createEditorState(
  content: string,
  onFileSaveRef: React.MutableRefObject<OnSaveCallback | undefined>,
  extensions: Extension[]
) {
  return EditorState.create({
    doc: content,
    extensions: [
      vscodeDark,
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        { key: 'Tab', run: acceptCompletion },
        {
          key: 'Mod-s',
          preventDefault: true,
          run: () => {
            onFileSaveRef.current?.();
            return true;
          },
        },
      ]),
      indentUnit.of('  '),
      autocompletion({ closeOnBlur: false }),
      closeBrackets(),
      lineNumbers(),
      scrollPastEnd(),
      dropCursor(),
      drawSelection(),
      bracketMatching(),
      EditorState.tabSize.of(2),
      indentOnInput(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      foldGutter(),
      ...extensions,
    ],
  });
}

export default CodeMirrorEditor;
