import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Button } from './button';
import { Separator } from './separator';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Unlink,
    Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef, useImperativeHandle, useState } from 'react';

const RichTextEditor = forwardRef(({
    content = '',
    onChange,
    placeholder = 'Start typing...',
    className,
    editable = true
}, ref) => {
    const [showHtml, setShowHtml] = useState(false);
    const [htmlContent, setHtmlContent] = useState(content);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            if (!showHtml) {
                onChange?.(editor.getHTML());
            }
        },
    });

    useImperativeHandle(ref, () => ({
        getContent: () => editor?.getHTML() || '',
        setContent: (content) => editor?.commands.setContent(content),
        focus: () => editor?.commands.focus(),
    }));

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const toggleHtmlView = () => {
        if (showHtml) {
            // Switch back to editor view
            editor?.commands.setContent(htmlContent, false);
            onChange?.(htmlContent);
            setShowHtml(false);
        } else {
            // Switch to HTML view - use original content if available
            const currentHtml = content || editor?.getHTML() || '';
            setHtmlContent(currentHtml);
            setShowHtml(true);
        }
    };

    const handleHtmlChange = (e) => {
        const newHtml = e.target.value;
        setHtmlContent(newHtml);
        onChange?.(newHtml);
    };

    return (
        <div className={cn('border rounded-lg overflow-hidden', className)}>
            {editable && (
                <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-muted' : ''}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-muted' : ''}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'bg-muted' : ''}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                    >
                        <List className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={editor.isActive('blockquote') ? 'bg-muted' : ''}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addLink}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        disabled={!editor.isActive('link')}
                    >
                        <Unlink className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>

                    <Separator orientation="vertical" className="h-6" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleHtmlView}
                        className={showHtml ? 'bg-muted' : ''}
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {showHtml ? (
                <textarea
                    value={htmlContent}
                    onChange={handleHtmlChange}
                    className="w-full p-4 min-h-[200px] font-mono text-sm border-0 resize-none focus:outline-none bg-gray-50"
                    placeholder="Enter HTML content..."
                />
            ) : (
                <div className="prose prose-sm max-w-none min-h-[200px] focus-within:outline-none">
                    <EditorContent
                        editor={editor}
                        className="p-4"
                        placeholder={placeholder}
                    />
                </div>
            )}
        </div>
    );
});

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
