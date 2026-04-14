export interface ImportProgressMessage {
  operationId: string;
  progressPercent: number;
  stage: 'preparing' | 'reading' | 'overwriting' | 'transforming' | 'saving' | 'completed' | string;
  message: string;
  processedFiles: number;
  totalFiles: number;
  currentFileName?: string;
  completed: boolean;
  failed: boolean;
  infrastructureId: number;
}
