import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import jsQR from 'jsqr';
import { QROptions } from '../types';

/**
 * Common logic to check if a module is part of the 3 large position patterns (Finder Patterns)
 * This allows us to keep them solid/readable while styling the rest of the code.
 */
const isFinderPattern = (row: number, col: number, size: number) => {
  // Top-left finder
  if (row < 7 && col < 7) return true;
  // Top-right finder
  if (row < 7 && col >= size - 7) return true;
  // Bottom-left finder
  if (row >= size - 7 && col < 7) return true;
  return false;
};

export const generateQRDataURL = async (text: string, options: QROptions): Promise<string> => {
  try {
    // 1. Get Raw QR Data Modules
    const qr = QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel });
    const modules = qr.modules;
    const size = modules.size;
    const margin = options.margin;
    
    // Calculate sizing
    const totalSize = size + (margin * 2);
    // Use high resolution for canvas
    const pixelSize = 20; // Internal pixels per module
    const canvasSize = totalSize * pixelSize;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // 2. Draw Background
    ctx.fillStyle = options.color.light;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 3. Draw Modules
    ctx.fillStyle = options.color.dark;
    
    const style = options.style || 'square';
    const dotScale = 0.8; // Scaling for dots so they don't touch (looks cleaner)

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          const x = (c + margin) * pixelSize;
          const y = (r + margin) * pixelSize;
          
          if (isFinderPattern(r, c, size) || style === 'square') {
            // Default Square
            ctx.fillRect(x, y, pixelSize, pixelSize);
          } else if (style === 'dots') {
            // Circle / Dot
            const cx = x + pixelSize / 2;
            const cy = y + pixelSize / 2;
            const radius = (pixelSize * dotScale) / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    const baseQRUrl = canvas.toDataURL();

    if (!options.logo) {
      return baseQRUrl;
    }

    // 4. Composite Logo
    return new Promise((resolve, reject) => {
      const qrImage = new Image();
      const logoImage = new Image();

      qrImage.onload = () => {
        // We need to respect the requested output width here, 
        // effectively resizing the high-res canvas down or up.
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = options.width;
        finalCanvas.height = options.width;
        const fCtx = finalCanvas.getContext('2d');
        
        if (!fCtx) {
           resolve(baseQRUrl); 
           return;
        }

        // Draw the QR
        fCtx.drawImage(qrImage, 0, 0, options.width, options.width);

        logoImage.onload = () => {
          const sizeMultiplier = options.logoSize || 0.2;
          const logoSize = options.width * sizeMultiplier;
          const xy = (options.width - logoSize) / 2;
          
          // Optional: Add whitespace around logo?
          // fCtx.fillStyle = options.color.light;
          // fCtx.fillRect(xy - 5, xy - 5, logoSize + 10, logoSize + 10);

          fCtx.drawImage(logoImage, xy, xy, logoSize, logoSize);
          resolve(finalCanvas.toDataURL());
        };

        logoImage.onerror = () => resolve(baseQRUrl);
        logoImage.src = options.logo!;
      };

      qrImage.src = baseQRUrl;
    });

  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const generateQRSVG = async (text: string, options: QROptions): Promise<string> => {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel });
    const modules = qr.modules;
    const size = modules.size;
    const margin = options.margin;
    const totalSize = size + (margin * 2);
    
    // We'll define viewbox = totalSize, then users can scale the SVG arbitrarily
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">`;
    
    // Background
    svgContent += `<rect width="100%" height="100%" fill="${options.color.light}" />`;
    
    const style = options.style || 'square';
    const dotScale = 0.8;

    // Draw Modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          const x = c + margin;
          const y = r + margin;
          
          if (isFinderPattern(r, c, size) || style === 'square') {
            svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${options.color.dark}" />`;
          } else if (style === 'dots') {
            const cx = x + 0.5;
            const cy = y + 0.5;
            const rVal = dotScale / 2;
            svgContent += `<circle cx="${cx}" cy="${cy}" r="${rVal}" fill="${options.color.dark}" />`;
          }
        }
      }
    }

    // Logo embedding
    if (options.logo) {
      const sizeMultiplier = options.logoSize || 0.2;
      const logoSize = totalSize * sizeMultiplier;
      const pos = (totalSize - logoSize) / 2;
      
      svgContent += `<image href="${options.logo}" x="${pos}" y="${pos}" height="${logoSize}" width="${logoSize}" />`;
    }

    svgContent += '</svg>';
    return svgContent;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const verifyQRCode = async (dataUrl: string, expectedContent: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(false);
        return;
      }
      
      // Draw image onto canvas
      ctx.drawImage(img, 0, 0);
      
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.getImageData(0, 0, w, h);
      
      // --- PASS 1: STANDARD SCAN ---
      try {
        const code = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
        if (code && code.data === expectedContent) {
          resolve(true);
          return;
        }
      } catch (e) {
        console.warn("Pass 1 failed", e);
      }

      // --- PASS 2: DYNAMIC CONTRAST BOOST ---
      try {
        const data = imageData.data;
        let minLuma = 255;
        let maxLuma = 0;

        // Sampling: Only check the top-left quadrant for calculating the contrast threshold.
        // This ensures that an image logo (usually centered) with colors different from the 
        // QR code doesn't skew the min/max luma.
        const sampleW = Math.floor(w / 2);
        const sampleH = Math.floor(h / 2);

        for (let y = 0; y < sampleH; y++) {
          for (let x = 0; x < sampleW; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Calculate Luma (Rec. 601)
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (luma < minLuma) minLuma = luma;
            if (luma > maxLuma) maxLuma = luma;
          }
        }

        const threshold = (minLuma + maxLuma) / 2;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          
          if (luma < threshold) { 
             data[i] = 0;     // Black
             data[i + 1] = 0; 
             data[i + 2] = 0; 
          } else {
             data[i] = 255;   // White
             data[i + 1] = 255; 
             data[i + 2] = 255; 
          }
        }
        
        const code = jsQR(data, w, h, { inversionAttempts: "attemptBoth" });
        if (code && code.data === expectedContent) {
          resolve(true);
          return;
        }
      } catch (e) {
        console.warn("Pass 2 failed", e);
      }

      resolve(false);
    };
    
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
};

export const downloadPDF = (text: string, options: QROptions, filename: string = 'qrcode') => {
  const doc = new jsPDF();
  
  const qr = QRCode.create(text, { errorCorrectionLevel: options.errorCorrectionLevel });
  const rawCount = qr.modules.size;
  const margin = options.margin;
  const totalCount = rawCount + (margin * 2);
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const qrSize = Math.min(pageWidth, pageHeight) * 0.6; 
  const xOffset = (pageWidth - qrSize) / 2;
  const yOffset = (pageHeight - qrSize) / 2;
  const cellSize = qrSize / totalCount;

  // Background
  if (options.color.light) {
    doc.setFillColor(options.color.light);
    doc.rect(xOffset, yOffset, qrSize, qrSize, 'F');
  }

  // Modules
  doc.setFillColor(options.color.dark);
  const modules = qr.modules;
  const style = options.style || 'square';
  const dotScale = 0.8;

  for (let r = 0; r < rawCount; r++) {
    for (let c = 0; c < rawCount; c++) {
      if (modules.get(r, c)) {
        const x = xOffset + (c + margin) * cellSize;
        const y = yOffset + (r + margin) * cellSize;
        
        if (isFinderPattern(r, c, rawCount) || style === 'square') {
           doc.rect(x, y, cellSize, cellSize, 'F');
        } else if (style === 'dots') {
           // circle(x, y, r, style) - x,y are center
           const cx = x + cellSize / 2;
           const cy = y + cellSize / 2;
           const radius = (cellSize * dotScale) / 2;
           doc.circle(cx, cy, radius, 'F');
        }
      }
    }
  }

  // Logo
  if (options.logo) {
    const sizeMultiplier = options.logoSize || 0.2;
    const logoSize = qrSize * sizeMultiplier;
    const logoPos = (qrSize - logoSize) / 2;
    const logoFormat = options.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    
    try {
      doc.addImage(options.logo, logoFormat, xOffset + logoPos, yOffset + logoPos, logoSize, logoSize);
    } catch (e) {
      console.warn("Could not add logo to PDF", e);
    }
  }
  
  doc.save(`${filename}.pdf`);
};

export const downloadSVG = (svgString: string, filename: string = 'qrcode') => {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};