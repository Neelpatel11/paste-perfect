import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { cleanPaste } from 'paste-perfect';

function App() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Paste content here from Notion, Google Docs, Word, etc.</p>',
    editorProps: {
      handlePaste: async (view, event) => {
        const html = event.clipboardData?.getData('text/html');
        if (html) {
          event.preventDefault();
          
          try {
            const cleaned = await cleanPaste(html, { format: 'html' });
            
            // Insert cleaned HTML
            const { state, dispatch } = view;
            const { schema } = state;
            const slice = state.schema.nodeFromJSON({
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: cleaned }] }],
            });
            
            // For simplicity, insert as text
            // In production, parse HTML to ProseMirror nodes
            const text = cleaned.replace(/<[^>]+>/g, '');
            const transaction = state.tr.insertText(text);
            dispatch(transaction);
            
            return true;
          } catch (error) {
            console.error('Paste cleaning failed:', error);
            return false; // Fall back to default paste
          }
        }
        
        return false;
      },
    },
  });

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1>Paste Perfect + Tiptap</h1>
      <p>Try pasting content from Notion, Google Docs, Word, etc.</p>
      <div
        style={{
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '1rem',
          minHeight: '300px',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default App;

