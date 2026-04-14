import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { QRCodeComponent, QRCodeErrorCorrectionLevel } from 'angularx-qrcode';

@Component({
  selector: 'aas-framed-qr-code',
  templateUrl: './framed-qr-code.component.html',
  styleUrls: ['./framed-qr-code.component.css'],
  imports: [QRCodeComponent],
})
export class FramedQrCodeComponent implements OnChanges, AfterViewInit {
  @Input() qrdata: string = '';
  @Input() width: number = 200;
  @Input() errorCorrectionLevel: QRCodeErrorCorrectionLevel = 'M';
  @Input() showFrame: boolean = true;

  @ViewChild('frameCanvas', { static: true }) frameCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('qrcode', { static: true }) qrCodeComponent!: QRCodeComponent;

  // Constants based on specification (in modules)
  private readonly QUIET_ZONE = 4; // Minimum 4 modules quiet zone for QR codes
  private readonly FRAME_DISTANCE = 4; // Distance from QR code (4 modules)
  private readonly FRAME_WIDTH = 1; // Frame line width (1 module)
  private readonly TRIANGLE_SIZE = 6; // Triangle leg size (6 modules)

  // Calculated module size
  private moduleSize = 4; // Will be calculated from actual QR code

  get totalSize(): number {
    // Total size depends on whether frame is shown
    if (!this.showFrame) {
      return this.width;
    }
    // Total size: QR code + 2 * (frame distance + frame width) in pixels
    return this.width + 2 * (this.FRAME_DISTANCE + this.FRAME_WIDTH) * this.moduleSize;
  }

  get qrOffset(): number {
    // Offset depends on whether frame is shown
    if (!this.showFrame) {
      return 0;
    }
    // Offset to center QR code: frame width + frame distance in pixels
    return (this.FRAME_WIDTH + this.FRAME_DISTANCE) * this.moduleSize;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['width'] || changes['qrdata']) {
      // Estimate module size from QR code width (typical QR codes are 21-177 modules)
      this.estimateModuleSize();
    }
  }

  ngAfterViewInit(): void {
    this.estimateModuleSize();
    this.drawFrame();
  }

  private estimateModuleSize(): void {
    // Estimate module size based on typical QR code sizes
    // Most QR codes for text data are between 21x21 and 41x41 modules
    const estimatedModules = this.estimateModulesFromData(this.qrdata);
    this.moduleSize = this.width / estimatedModules;
  }

  private estimateModulesFromData(data: string): number {
    // Rough estimation based on data length
    // QR code size depends on data amount and error correction level
    const dataLength = data.length;

    if (dataLength <= 25) return 21; // Version 1: 21x21
    if (dataLength <= 47) return 25; // Version 2: 25x25
    if (dataLength <= 77) return 29; // Version 3: 29x29
    if (dataLength <= 114) return 33; // Version 4: 33x33
    if (dataLength <= 154) return 37; // Version 5: 37x37
    if (dataLength <= 195) return 41; // Version 6: 41x41

    // For longer data, use a rough formula
    return Math.min(177, 21 + Math.floor(dataLength / 20) * 4);
  }

  onQrCodeGenerated(_qrCodeURL: SafeUrl | string): void {
    // QR code is ready, redraw frame with current dimensions
    setTimeout(() => this.drawFrame(), 50);
  }

  private drawFrame(): void {
    const canvas = this.frameCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Only draw frame if showFrame is true
    if (!this.showFrame) return;

    // Set drawing properties for black frame
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = this.FRAME_WIDTH * this.moduleSize;

    // Calculate frame position and size
    // const frameThickness = this.FRAME_WIDTH * this.moduleSize;
    const frameDistance = this.FRAME_DISTANCE * this.moduleSize;

    // Frame should be at distance of 4 modules from QR code
    const frameX = frameDistance;
    const frameY = frameDistance;
    const frameWidth = canvas.width - 2 * frameDistance;
    const frameHeight = canvas.height - 2 * frameDistance;

    // Draw frame rectangle (outline)
    ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

    // Draw triangular corner in bottom-right
    this.drawTriangleCorner(ctx, frameX + frameWidth, frameY + frameHeight);
  }

  private drawTriangleCorner(ctx: CanvasRenderingContext2D, frameRight: number, frameBottom: number): void {
    const triangleSizePx = this.TRIANGLE_SIZE * this.moduleSize;

    ctx.save();
    ctx.fillStyle = '#000000';

    ctx.beginPath();
    // Triangle positioned at the bottom-right corner of the frame
    // The triangle should be filled (solid black) with perpendicular legs of 6 modules each
    ctx.moveTo(frameRight, frameBottom); // Bottom-right corner
    ctx.lineTo(frameRight - triangleSizePx, frameBottom); // Left 6 modules
    ctx.lineTo(frameRight, frameBottom - triangleSizePx); // Up 6 modules
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  downloadQrCode(): void {
    // Create a temporary canvas to combine QR code and frame
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // Set canvas size to total size
    tempCanvas.width = this.totalSize;
    tempCanvas.height = this.totalSize;

    // Fill background with white
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Get QR code canvas from the QRCodeComponent
    const qrCanvas = this.qrCodeComponent.qrcElement?.nativeElement?.querySelector('canvas');
    if (qrCanvas) {
      // Draw QR code at the correct position
      tempCtx.drawImage(qrCanvas, this.qrOffset, this.qrOffset);
    }

    // Draw the frame on top (only if showFrame is true)
    if (this.showFrame) {
      const frameCanvas = this.frameCanvas.nativeElement;
      tempCtx.drawImage(frameCanvas, 0, 0);
    }

    // Create download link
    tempCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }
}
