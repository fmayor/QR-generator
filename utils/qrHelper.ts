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
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          // Check if it matches expected content
          // Note: We use strict equality here. Sometimes encodings might vary slightly
          // but for generated content it should match.
          resolve(code.data === expectedContent);
        } else {
          resolve(false);
        }
      } catch (e) {
        console.error("Verification failed", e);
        resolve(false);
      }
    };
    
    img.onerror = () => resolve(false);
    img.src = dataUrl;
  });
};

export const downloadPDF = (dataUrl: string, filename: string = 'qrcode') => {
  const doc = new jsPDF();
  
  // Center image
  const x = (doc.internal.pageSize.getWidth() - 100) / 2;
  const y = (doc.internal.pageSize.getHeight() - 100) / 2;
  
  doc.addImage(dataUrl, 'PNG', x, y, 100, 100);
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