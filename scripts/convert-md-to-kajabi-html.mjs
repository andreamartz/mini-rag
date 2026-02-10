#!/usr/bin/env node

/**
 * Convert Markdown or HTML files to Kajabi-compatible HTML
 *
 * This script converts all .md and .html files in the 15-applied-ai directory
 * to clean HTML that works well with Kajabi's learning platform.
 *
 * For HTML files: Strips out <style> tags and applies inline styles
 * For MD files: Converts markdown to HTML with inline styles
 *
 * Usage:
 *   node scripts/convert-md-to-kajabi-html.mjs
 *
 * Or add to package.json and run:
 *   yarn convert-curriculum
 */

import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure marked for clean HTML output
marked.setOptions({
  headerIds: true,
  mangle: false,
  breaks: true,
  gfm: true, // GitHub Flavored Markdown
});

// Escape HTML special characters
function escapeHtml(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Style map for inline styles (used when Kajabi strips <style> tags)
const INLINE_STYLES = {
  body: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;',
  h1: 'margin-top: 24px; margin-bottom: 12px; font-size: 32px; font-weight: bold;',
  h2: 'margin-top: 24px; margin-bottom: 12px; font-size: 28px; font-weight: bold;',
  h3: 'margin-top: 24px; margin-bottom: 12px; font-size: 24px; font-weight: bold;',
  h4: 'margin-top: 24px; margin-bottom: 12px; font-size: 20px; font-weight: bold;',
  h5: 'margin-top: 24px; margin-bottom: 12px; font-size: 18px; font-weight: bold;',
  h6: 'margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: bold;',
  p: 'margin: 12px 0; line-height: 1.6;',
  a: 'color: #0066cc; text-decoration: underline;',
  strong: 'font-weight: bold;',
  em: 'font-style: italic;',
  code: 'background-color: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: "Courier New", Courier, monospace; font-size: 0.9em;',
  pre: 'background-color: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 20px 0;',
  blockquote: 'border-left: 4px solid #ddd; margin: 20px 0; padding: 10px 20px; background-color: #f9f9f9;',
  hr: 'border: none; border-top: 2px solid #eee; margin: 30px 0;',
  img: 'max-width: 100%; height: auto; display: block; margin: 20px 0;',
  iframe: 'max-width: 100%; margin: 20px 0;',
  details: 'margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;',
  summary: 'cursor: pointer; font-weight: bold; margin-bottom: 10px;',
  ol: 'margin: 10px 0; padding-left: 30px;',
  ul: 'margin: 10px 0; padding-left: 30px;',
  li: 'margin: 5px 0;',
  table: 'border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #ddd;',
  th: 'padding: 8px; border: 1px solid #ddd; text-align: left; background-color: #f4f4f4; font-weight: bold;',
  td: 'padding: 8px; border: 1px solid #ddd; text-align: left;',
};

// Apply inline styles to HTML elements (for Kajabi compatibility)
function applyInlineStyles(html) {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  // Apply inline styles to all relevant elements
  Object.entries(INLINE_STYLES).forEach(([tag, style]) => {
    const elements = document.querySelectorAll(tag);
    elements.forEach((el) => {
      const existingStyle = el.getAttribute('style') || '';
      el.setAttribute('style', existingStyle ? `${existingStyle}; ${style}` : style);
    });
  });

  // Special handling for pre > code (remove background from code inside pre)
  const preCodeElements = document.querySelectorAll('pre code');
  preCodeElements.forEach((el) => {
    el.setAttribute('style', 'background-color: transparent; padding: 0;');
  });

  // Make all links open in new window
  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return document.body.innerHTML;
}

// Convert existing HTML file to Kajabi-compatible HTML
function convertHtmlToKajabi(htmlFilePath) {
  try {
    const html = fs.readFileSync(htmlFilePath, 'utf-8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // Extract title
    const titleEl = document.querySelector('title');
    const title = titleEl ? titleEl.textContent : path.basename(htmlFilePath, '.html');

    // Get body content only (strip out head, style, etc.)
    const bodyContent = document.body.innerHTML;

    // Apply inline styles to all elements
    const styledContent = applyInlineStyles(bodyContent);

    // Overwrite the original file with just the styled content (no wrapper)
    fs.writeFileSync(htmlFilePath, styledContent, 'utf-8');

    console.log(`✅ Converted HTML: ${path.relative(process.cwd(), htmlFilePath)}`);

    return htmlFilePath;
  } catch (error) {
    console.error(`❌ Error converting HTML ${htmlFilePath}:`, error.message);
    return null;
  }
}

// Wrap HTML in proper document structure for Kajabi
function wrapInKajabiTemplate(html, title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }

    h1 {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 32px;
      font-weight: bold;
    }

    h2 {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 28px;
      font-weight: bold;
    }

    h3 {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 24px;
      font-weight: bold;
    }

    h4 {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 20px;
      font-weight: bold;
    }

    h5 {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 18px;
      font-weight: bold;
    }

    h6 {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: bold;
    }

    p {
      margin: 12px 0;
      line-height: 1.6;
    }

    a {
      color: #0066cc;
      text-decoration: underline;
    }

    strong {
      font-weight: bold;
    }

    em {
      font-style: italic;
    }

    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9em;
    }

    pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 20px 0;
    }

    pre code {
      background-color: transparent;
      padding: 0;
    }

    blockquote {
      border-left: 4px solid #ddd;
      margin: 20px 0;
      padding: 10px 20px;
      background-color: #f9f9f9;
    }

    hr {
      border: none;
      border-top: 2px solid #eee;
      margin: 30px 0;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px 0;
    }

    iframe {
      max-width: 100%;
      margin: 20px 0;
    }

    details {
      margin: 20px 0;
      padding: 15px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }

    summary {
      cursor: pointer;
      font-weight: bold;
      margin-bottom: 10px;
    }

    ol, ul {
      margin: 10px 0;
      padding-left: 30px;
    }

    li {
      margin: 5px 0;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      border: 1px solid #ddd;
    }

    th, td {
      padding: 8px;
      border: 1px solid #ddd;
      text-align: left;
    }

    th {
      background-color: #f4f4f4;
      font-weight: bold;
    }

    input[type="checkbox"] {
      margin-right: 5px;
    }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}

// Process a single markdown file
function convertMdToHtml(mdFilePath) {
  try {
    // Read markdown file
    const markdown = fs.readFileSync(mdFilePath, 'utf-8');

    // Extract title from first heading or filename
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : path.basename(mdFilePath, '.md');

    // Convert to HTML
    const htmlContent = marked.parse(markdown);

    // Wrap in template
    const fullHtml = wrapInKajabiTemplate(htmlContent, title);

    // Determine output path
    const htmlFilePath = mdFilePath.replace(/\.md$/, '.html');

    // Write HTML file
    fs.writeFileSync(htmlFilePath, fullHtml, 'utf-8');

    console.log(`✅ Converted: ${path.relative(process.cwd(), mdFilePath)} → ${path.basename(htmlFilePath)}`);

    return htmlFilePath;
  } catch (error) {
    console.error(`❌ Error converting ${mdFilePath}:`, error.message);
    return null;
  }
}

// Recursively find all .md and .html files in a directory
function findMarkdownFiles(dir) {
  const files = { md: [], html: [] };

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recurse into subdirectories
      const subFiles = findMarkdownFiles(fullPath);
      files.md.push(...subFiles.md);
      files.html.push(...subFiles.html);
    } else if (stat.isFile() && item.endsWith('.md')) {
      files.md.push(fullPath);
    } else if (stat.isFile() && item.endsWith('.html') && !item.endsWith('-kajabi.html')) {
      files.html.push(fullPath);
    }
  }

  return files;
}

// Main function
function main() {
  const curriculumDir = path.join(__dirname, '..', '15-applied-ai');

  if (!fs.existsSync(curriculumDir)) {
    console.error(`❌ Directory not found: ${curriculumDir}`);
    process.exit(1);
  }

  console.log('🔄 Converting files to Kajabi-compatible HTML...\n');

  // Find all markdown and HTML files
  const files = findMarkdownFiles(curriculumDir);

  console.log(`📁 Found ${files.md.length} Markdown files`);
  console.log(`📁 Found ${files.html.length} HTML files\n`);

  // Convert each file
  let successCount = 0;
  let errorCount = 0;

  // Convert markdown files
  for (const mdFile of files.md) {
    const result = convertMdToHtml(mdFile);
    if (result) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  // Convert HTML files
  for (const htmlFile of files.html) {
    const result = convertHtmlToKajabi(htmlFile);
    if (result) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`\n✨ Conversion complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\n📂 Files updated in: 15-applied-ai/`);
  console.log(`   - Markdown → .html (with <style> tags)`);
  console.log(`   - HTML → inline styles (Kajabi-ready)`);
}

// Run the script
main();

export { convertMdToHtml, convertHtmlToKajabi, findMarkdownFiles, applyInlineStyles };
