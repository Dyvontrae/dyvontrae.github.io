import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options for security and features
marked.setOptions({
  breaks: true,
  gfm: true,
  pedantic: false
});

/**
 * Sanitizes and parses markdown content to safe HTML
 */
export async function sanitizeAndParseMarkdown(markdown: string): Promise<string> {
  if (!markdown) return '';
  
  try {
    // Parse markdown to HTML
    const rawHtml = await marked(markdown);
    
    // Sanitize the HTML to prevent XSS
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code',
        'pre', 'hr', 'span'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      FORCE_BODY: false,
      ALLOW_DATA_ATTR: false
    });
    
    return cleanHtml;
  } catch (error) {
    console.error('Error processing markdown:', error);
    return '';
  }
}

/**
 * Validates if a string contains valid markdown syntax
 */
export async function isValidMarkdown(markdown: string): Promise<boolean> {
  try {
    await marked(markdown);
    return true;
  } catch {
    return false;
  }
}