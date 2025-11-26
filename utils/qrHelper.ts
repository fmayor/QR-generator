import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import jsQR from 'jsqr';
import { QROptions } from '../types';

export const generateQRDataURL = async (text: string, options: QROptions): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: options.width,
      margin: options.margin,
      color: options.color,
      errorCorrectionLevel: options.errorCorrectionLevel,
    });

    if (!options.logo) {
      return qrDataUrl;
    }

    // Composite Logo onto QR Code
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.width;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(qrDataUrl);
        return;
      }

      const qrImage = new Image();
      const logoImage = new Image();

      qrImage.onload = () => {
        // Draw the QR code (which handles its own background from options.color.light)
        ctx.drawImage(qrImage, 0, 0, options.width, options.width);

        logoImage.onload = () => {
          // Calculate logo dimensions using options.logoSize (default 20%)
          const sizeMultiplier = options.logoSize || 0.2;
          const logoSize = options.width * sizeMultiplier;
          const xy = (options.width - logoSize) / 2;

          // Optional: Draw a white background behind the logo for better visibility
          // ctx.fillStyle = '#ffffff';
          // ctx.fillRect(xy, xy, logoSize, logoSize);
          
          ctx.drawImage(logoImage, xy, xy, logoSize, logoSize);
          resolve(canvas.toDataURL());
        };
        
        logoImage.onerror = () => {
          console.warn('Failed to load logo, returning bare QR');
          resolve(qrDataUrl);
        };
        
        logoImage.src = options.logo!;
      };

      qrImage.onerror = (e) => reject(e);
      qrImage.src = qrDataUrl;
    });

  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const generateQRSVG = async (text: string, options: QROptions): Promise<string> => {
  try {
    let svg = await QRCode.toString(text, {
      type: 'svg',
      width: options.width,
      margin: options.margin,
      color: options.color,
      errorCorrectionLevel: options.errorCorrectionLevel,
    });

    if (options.logo) {
      // Calculate position using logoSize (default 20%)
      const sizeMultiplier = options.logoSize || 0.2;
      const logoSize = options.width * sizeMultiplier;
      const pos = (options.width - logoSize) / 2;
      
      // Create an image tag
      // We must use the data URL of the logo
      const imageTag = `<image href="${options.logo}" x="${pos}" y="${pos}" height="${logoSize}" width="${logoSize}" />`;
      
      // Inject before the closing svg tag
      svg = svg.replace('</svg>', `${imageTag}</svg>`);
    }

    return svg;
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
      // This is robust for Custom Background Colors.
      // Instead of assuming white background, we find the dynamic range.
      try {
        const data = imageData.data;
        let minLuma = 255;
        let maxLuma = 0;

        // 1. Find min and max luminance in the image
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luma < minLuma) minLuma = luma;
          if (luma > maxLuma) maxLuma = luma;
        }

        // 2. Calculate dynamic threshold
        const threshold = (minLuma + maxLuma) / 2;

        // 3. Binarize based on dynamic threshold
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

      // If both passes fail
      resolve(false);
    };
    
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
};

export const downloadPDF = (text: string, options: QROptions, filename: string = 'qrcode') => {
  const doc = new jsPDF();
  
  // Create raw QR modules to allow vector drawing
  const qr = QRCode.create(text, { 
    errorCorrectionLevel: options.errorCorrectionLevel 
  });
  
  const rawCount = qr.modules.size;
  const margin = options.margin;
  const totalCount = rawCount + (margin * 2);
  
  // Size calculations (Center on A4 page, 60% of min dimension)
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const qrSize = Math.min(pageWidth, pageHeight) * 0.6; 
  const xOffset = (pageWidth - qrSize) / 2;
  const yOffset = (pageHeight - qrSize) / 2;
  const cellSize = qrSize / totalCount;

  // Draw Background
  if (options.color.light) {
    doc.setFillColor(options.color.light);
    doc.rect(xOffset, yOffset, qrSize, qrSize, 'F');
  }

  // Draw Modules (Vector Rectangles)
  doc.setFillColor(options.color.dark);
  const modules = qr.modules.data;
  
  for (let row = 0; row < rawCount; row++) {
    for (let col = 0; col < rawCount; col++) {
      if (modules[row * rawCount + col]) {
        doc.rect(
          xOffset + (col + margin) * cellSize,
          yOffset + (row + margin) * cellSize,
          cellSize,
          cellSize,
          'F'
        );
      }
    }
  }

  // Overlay Logo
  if (options.logo) {
    const sizeMultiplier = options.logoSize || 0.2;
    const logoSize = qrSize * sizeMultiplier;
    const logoPos = (qrSize - logoSize) / 2;
    
    // Determine format
    const logoFormat = options.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    
    try {
      doc.addImage(
        options.logo, 
        logoFormat, 
        xOffset + logoPos, 
        yOffset + logoPos, 
        logoSize, 
        logoSize
      );
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