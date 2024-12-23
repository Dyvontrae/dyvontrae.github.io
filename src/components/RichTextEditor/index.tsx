import React, { useState, useCallback, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false
});

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder,
  error 
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [renderedHTML, setRenderedHTML] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
      if (!value) {
        setRenderedHTML('');
        return;
      }
      try {
        const html = await marked(value);
        const sanitizedHtml = DOMPurify.sanitize(html);
        setRenderedHTML(sanitizedHtml);
      } catch (err) {
        console.error('Error rendering markdown:', err);
        setRenderedHTML('Error rendering preview');
      }
    };

    renderMarkdown();
  }, [value]);

  const handleWrapText = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = document.querySelector(
      '[data-rich-text-editor="true"]'
    ) as HTMLTextAreaElement;
    
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const beforeSelection = textarea.value.substring(start - prefix.length, start);
    const afterSelection = textarea.value.substring(end, end + suffix.length);
    
    if (beforeSelection === prefix && afterSelection === suffix) {
      // Remove wrapping
      const newValue = 
        textarea.value.substring(0, start - prefix.length) +
        selectedText +
        textarea.value.substring(end + suffix.length);
      onChange(newValue);
      textarea.focus();
      textarea.setSelectionRange(
        start - prefix.length,
        end - prefix.length
      );
    } else {
      // Add wrapping
      const newValue = 
        textarea.value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        textarea.value.substring(end);
      onChange(newValue);
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }
  }, [onChange]);

  const handleAutoLink = useCallback((text: string) => {
    // Convert URLs to markdown links if they're not already
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => {
        const prevChar = text.charAt(text.indexOf(url) - 1);
        if (prevChar === '(' || prevChar === ']') return url;
        return `[${url}](${url})`;
      }
    );
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = handleAutoLink(e.target.value);
    onChange(newValue);
  }, [handleAutoLink, onChange]);

  const handleButton = (type: string) => {
    switch (type) {
      case 'bold':
        handleWrapText('**');
        break;
      case 'italic':
        handleWrapText('_');
        break;
      case 'list':
        handleWrapText('- ');
        break;
      case 'numbered':
        handleWrapText('1. ');
        break;
      case 'link':
        if (window.getSelection()?.toString()) {
          handleWrapText('[', '](url)');
        } else {
          handleWrapText('[text](url)');
        }
        break;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b border-gray-700 pb-2">
        <button
          type="button"
          onClick={() => handleButton('bold')}
          className="p-2 rounded hover:bg-gray-700"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          onClick={() => handleButton('italic')}
          className="p-2 rounded hover:bg-gray-700"
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={() => handleButton('list')}
          className="p-2 rounded hover:bg-gray-700"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => handleButton('numbered')}
          className="p-2 rounded hover:bg-gray-700"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => handleButton('link')}
          className="p-2 rounded hover:bg-gray-700"
        >
          🔗 Link
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`p-2 rounded hover:bg-gray-700 ${
            isPreview ? 'bg-gray-700' : ''
          }`}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {isPreview ? (
        <div 
          className="prose prose-sm max-w-none prose-invert bg-gray-800 rounded-lg p-4"
          dangerouslySetInnerHTML={{
            __html: renderedHTML
          }}
        />
      ) : (
        <textarea
          data-rich-text-editor="true"
          value={value}
          onChange={handleInput}
          placeholder={placeholder}
          className={`w-full min-h-[200px] p-4 bg-gray-800 rounded-lg border ${
            error ? 'border-red-500' : 'border-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
        />
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}