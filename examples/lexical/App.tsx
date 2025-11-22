import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { useEffect, useState } from 'react';
import { cleanPaste } from 'paste-perfect';

const theme = {
  paragraph: 'editor-paragraph',
};

const initialConfig = {
  namespace: 'paste-perfect-lexical',
  theme,
  onError: (error: Error) => {
    console.error(error);
  },
};

// Note: Lexical paste handling is typically done via the RichTextPlugin's
// onPaste prop or by intercepting clipboard events on the ContentEditable element
function App() {
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (!editorRef) return;
    
    const handlePaste = async (e: ClipboardEvent) => {
      const html = e.clipboardData?.getData('text/html');
      if (html) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          const cleaned = await cleanPaste(html, { format: 'html' });
          
          // For this example, insert cleaned text
          // In production, parse HTML to Lexical nodes using @lexical/html
          const text = cleaned.replace(/<[^>]+>/g, '');
          
          // Find the editor instance and insert text
          // This is a simplified example - production would use proper Lexical APIs
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch (error) {
          console.error('Paste cleaning failed:', error);
        }
      }
    };
    
    editorRef.addEventListener('paste', handlePaste);
    return () => {
      editorRef.removeEventListener('paste', handlePaste);
    };
  }, [editorRef]);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1>Paste Perfect + Lexical</h1>
      <p>Try pasting content from Notion, Google Docs, Word, etc.</p>
      <div
        style={{
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1rem',
          minHeight: '300px',
        }}
        ref={setEditorRef}
      >
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable />}
            placeholder={<div style={{ position: 'absolute', color: '#999' }}>Paste content here...</div>}
          />
          <HistoryPlugin />
        </LexicalComposer>
      </div>
    </div>
  );
}

export default App;

