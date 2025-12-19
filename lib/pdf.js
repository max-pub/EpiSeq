import { jsPDF } from 'https://esm.sh/jspdf@3.0.3';
import html2canvas from 'https://esm.sh/html2canvas@1.4.1';

/**
 * Hardened Vector Export function for HTML + SVGs
 */
export async function exportVectorPdf(selector, filename = 'document.pdf') {
  const element = document.querySelector(selector);
  if (!element) return;

  // 1. Pre-process: Explicitly fix SVG dimensions and styles
  const svgs = element.querySelectorAll('svg');
  svgs.forEach(svg => {
    const box = svg.getBoundingClientRect();
    // If attributes are missing, html2canvas/jsPDF will skip the element
    if (!svg.getAttribute('width')) svg.setAttribute('width', box.width || 100);
    if (!svg.getAttribute('height')) svg.setAttribute('height', box.height || 100);
    
    // Force inline styles (important for vector translation)
    const computed = window.getComputedStyle(svg);
    svg.style.display = 'inline-block';
    svg.style.visibility = 'visible';
  });

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4',
    hotfixes: ['px_scaling']
  });

  const margin = 20;
  const pdfWidth = doc.internal.pageSize.getWidth() - (margin * 2);

  try {
    // 2. Use the HTML module with specific html2canvas overrides
    await doc.html(element, {
      x: margin,
      y: margin,
      width: pdfWidth,
      windowWidth: element.scrollWidth || 1200,
      autoPaging: 'text',
      html2canvas: {
        scale: 2,           // Higher scale helps the parser "see" the SVG paths
        useCORS: true,
        allowTaint: false,
        logging: false,
        // Crucial: This ensures the SVG is rendered as a vector-compatible object
        onclone: (clonedDoc) => {
            const clonedSvg = clonedDoc.querySelector(selector).querySelectorAll('svg');
            clonedSvg.forEach(s => s.style.display = 'block');
        }
      },
      callback: (d) => d.save(filename)
    });
  } catch (error) {
    console.error("PDF Export failed:", error);
  }
}