import React, { useEffect, useState } from 'react';
import { sanitizeAndParseMarkdown } from './utils/markdown';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export function MarkdownDisplay({ content, className = '' }: MarkdownDisplayProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let mounted = true;

    async function processMarkdown() {
      try {
        const processed = await sanitizeAndParseMarkdown(content);
        if (mounted) {
          setHtml(processed);
        }
      } catch (error) {
        console.error('Error processing markdown:', error);
        if (mounted) {
          setHtml('Error rendering content');
        }
      }
    }

    processMarkdown();

    return () => {
      mounted = false;
    };
  }, [content]);

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}