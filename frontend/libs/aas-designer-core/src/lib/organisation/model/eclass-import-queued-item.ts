export class EclassImportQueuedItem {
  dateStarted: Date | null = null;
  dateError: Date | null = null;
  id: number | null = null;
  error: boolean = false;

  static fromDto(dto: any) {
    const item = new EclassImportQueuedItem();
    Object.assign(item, dto);
    if (dto.dateStarted != null) item.dateStarted = new Date(dto.dateStarted);
    if (dto.dateError != null) item.dateError = new Date(dto.dateError);

    return item;
  }
}
