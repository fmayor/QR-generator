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
    
    // Size of the internal QR matrix (including margin)
    const rawQrSize = size + (margin * 2);
    
    const pixelSize = 20; // Internal pixels per module
    
    // Determine canvas dimensions based on frame shape
    let canvasWidth = rawQrSize * pixelSize;
    let canvasHeight = rawQrSize * pixelSize;
    let offsetX = 0;
    let offsetY = 0;
    
    // If Circle, we need a larger canvas to fit the square QR inside the circle without cutting corners.
    // Diagonal of square = side * sqrt(2). 
    // We add a little extra padding (1.1x) to be safe and look good.
    if (options.frameShape === 'circle') {
      const diagonal = rawQrSize * Math.sqrt(2);
      const dimension = Math.ceil(diagonal * pixelSize);
      canvasWidth = dimension;
      canvasHeight = dimension;
      
      // Calculate offset to center the QR code in the new larger canvas
      offsetX = (canvasWidth - (rawQrSize * pixelSize)) / 2;
      offsetY = (canvasHeight - (rawQrSize * pixelSize)) / 2;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Clear canvas for transparency
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw Background Shape (Only if NOT transparent)
    if (options.color.light !== 'transparent') {
      ctx.fillStyle = options.color.light;
      
      if (options.frameShape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.clip(); // Clip further drawing to this circle
      } else if (options.frameShape === 'rounded') {
        // RoundRect with radius approx 10% of size
        ctx.beginPath();
        const radius = canvasWidth * 0.1; 
        if (ctx.roundRect) {
           ctx.roundRect(0, 0, canvasWidth, canvasHeight, radius);
        } else {
           // Fallback for older browsers if needed, though most support roundRect now
           ctx.rect(0, 0, canvasWidth, canvasHeight);
        }
        ctx.fill();
        ctx.clip();
      } else {
        // Standard Square
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }

    // 3. Draw Modules
    ctx.fillStyle = options.color.dark;
    
    const style = options.style || 'square';
    const dotScale = 0.8; // Scaling for dots so they don't touch (looks cleaner)

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules.get(r, c)) {
          const x = offsetX + (c + margin) * pixelSize;
          const y = offsetY + (r + margin) * pixelSize;
          
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
        // We render onto a new canvas of the requested output options.width
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = options.width;
        finalCanvas.height = options.width;
        const fCtx = finalCanvas.getContext('2d');
        
        if (!fCtx) {
           resolve(baseQRUrl); 
           return;
        }

        // Draw the QR (which now has the shape)
        fCtx.drawImage(qrImage, 0, 0, options.width, options.width);

        logoImage.onload = () => {
          const sizeMultiplier = options.logoSize || 0.2;
          const maxLogoSize = options.width * sizeMultiplier;
          
          // Calculate Aspect Ratio to prevent distortion
          const aspect = logoImage.width / logoImage.height;
          let drawWidth = maxLogoSize;
          let drawHeight = maxLogoSize;
          
          if (aspect > 1) {
            // Landscape: Width matches box, Height is reduced
            drawHeight = maxLogoSize / aspect;
          } else {
            // Portrait or Square: Height matches box, Width is reduced
            drawWidth = maxLogoSize * aspect;
          }
          
          const x = (options.width - drawWidth) / 2;
          const y = (options.width - drawHeight) / 2;
          
          fCtx.drawImage(logoImage, x, y, drawWidth, drawHeight);
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
    
    // Internal coordinate system size
    const rawQrSize = size + (margin * 2);
    
    let viewBoxSize = rawQrSize;
    let offset = 0;

    // Handle Circle Frame scaling
    if (options.frameShape === 'circle') {
       // Using same math as canvas: scale to fit diagonal
       const diagonal = rawQrSize * Math.sqrt(2);
       // We'll just increase viewBox dimensions
       viewBoxSize = diagonal; 
       offset = (viewBoxSize - rawQrSize) / 2;
    }

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="${options.style === 'dots' ? 'auto' : 'crispEdges'}">`;
    
    // Background Shape
    if (options.color.light !== 'transparent') {
      if (options.frameShape === 'circle') {
        const r = viewBoxSize / 2;
        svgContent += `<circle cx="${r}" cy="${r}" r="${r}" fill="${options.color.light}" />`;
      } else if (options.frameShape === 'rounded') {
        const radius = viewBoxSize * 0.1;
        svgContent += `<rect x="0" y="0" width="${viewBoxSize}" height="${viewBoxSize}" rx="${radius}" fill="${options.color.light}" />`;
      } else {
        svgContent += `<rect width="100%" height="100%" fill="${options.color.light}" />`;
      }
    }
    
    // Group for QR modules to handle offset if needed
    svgContent += `<g transform="translate(${offset}, ${offset})">`;

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
    svgContent += `</g>`;

    // Logo embedding
    if (options.logo) {
      const sizeMultiplier = options.logoSize || 0.2;
      // Logo size relative to the VIEWBOX
      const maxLogoSize = viewBoxSize * sizeMultiplier;
      const pos = (viewBoxSize - maxLogoSize) / 2;
      
      // Use preserveAspectRatio to fit the image inside the square box without distortion
      svgContent += `<image href="${options.logo}" x="${pos}" y="${pos}" height="${maxLogoSize}" width="${maxLogoSize}" preserveAspectRatio="xMidYMid meet" />`;
    }

    svgContent += '</svg>';
    return svgContent;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const verifyQRCode = async (dataUrl: string, expectedContent: string, simulationColor?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas with padding if simulation needed
      // If simulationColor is present, we pad the canvas and fill it with that color.
      // This simulates placing the QR code on a background of that color.
      // If the QR code has 0 margin, the modules will touch this background.
      const padding = simulationColor ? 50 : 0;
      const canvas = document.createElement('canvas');
      canvas.width = img.width + (padding * 2);
      canvas.height = img.height + (padding * 2);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(false);
        return;
      }

      if (simulationColor) {
        ctx.fillStyle = simulationColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Draw image centered
      ctx.drawImage(img, padding, padding);
      
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
        const sampleW = Math.floor(w / 2);
        const sampleH = Math.floor(h / 2);

        for (let y = 0; y < sampleH; y++) {
          for (let x = 0; x < sampleW; x++) {
            const i = (y * w + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
            
            if (luma < minLuma) minLuma = luma;
            if (luma > maxLuma) maxLuma = luma;
          }
        }

        // If the range is too small, we might be looking at a flat color (like margin 0 bleeding into background)
        // But we attempt enhancement anyway.
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
  
  // Center alignment
  const xOffset = (pageWidth - qrSize) / 2;
  const yOffset = (pageHeight - qrSize) / 2;
  
  // Background Shape for PDF (Only if NOT transparent)
  if (options.color.light && options.color.light !== 'transparent') {
    doc.setFillColor(options.color.light);
    if (options.frameShape === 'circle') {
       // Draw circle
       const r = qrSize / 2;
       doc.circle(xOffset + r, yOffset + r, r, 'F');
    } else if (options.frameShape === 'rounded') {
       // Draw rounded rect
       const r = qrSize * 0.1;
       doc.roundedRect(xOffset, yOffset, qrSize, qrSize, r, r, 'F');
    } else {
       // Standard square
       doc.rect(xOffset, yOffset, qrSize, qrSize, 'F');
    }
  }

  // Calculate cell size
  let drawSize = qrSize;
  let drawXOffset = xOffset;
  let drawYOffset = yOffset;

  if (options.frameShape === 'circle') {
     const side = qrSize / Math.sqrt(2);
     const safeSide = side * 0.95; 
     drawSize = safeSide;
     drawXOffset = xOffset + (qrSize - safeSide) / 2;
     drawYOffset = yOffset + (qrSize - safeSide) / 2;
  }

  const cellSize = drawSize / totalCount;

  // Modules
  doc.setFillColor(options.color.dark);
  const modules = qr.modules;
  const style = options.style || 'square';
  const dotScale = 0.8;

  for (let r = 0; r < rawCount; r++) {
    for (let c = 0; c < rawCount; c++) {
      if (modules.get(r, c)) {
        const x = drawXOffset + (c + margin) * cellSize;
        const y = drawYOffset + (r + margin) * cellSize;
        
        if (isFinderPattern(r, c, rawCount) || style === 'square') {
           doc.rect(x, y, cellSize, cellSize, 'F');
        } else if (style === 'dots') {
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
    const maxLogoSize = qrSize * sizeMultiplier;
    
    // The logo box is centered in the visual QR area
    const boxX = xOffset + (qrSize - maxLogoSize) / 2;
    const boxY = yOffset + (qrSize - maxLogoSize) / 2;

    const logoFormat = options.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    
    try {
      // Get dimensions to preserve aspect ratio
      const props = doc.getImageProperties(options.logo);
      const aspect = props.width / props.height;
      
      let drawW = maxLogoSize;
      let drawH = maxLogoSize;
      
      if (aspect > 1) {
         // Landscape
         drawH = maxLogoSize / aspect;
      } else {
         // Portrait
         drawW = maxLogoSize * aspect;
      }
      
      // Center the image inside the calculated box
      const finalX = boxX + (maxLogoSize - drawW) / 2;
      const finalY = boxY + (maxLogoSize - drawH) / 2;

      doc.addImage(options.logo, logoFormat, finalX, finalY, drawW, drawH);
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