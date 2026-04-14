export class FileResult {
  fileName: string = '';
  filePath: string = '';
  contentType: string = '';
  size: string = '';
  isThumbnail: boolean = false;
  modelType = { name: 'SupplementalFile' };
  isLocal: boolean = false;
  file: File | null = null;
  mlGenUuid: string = '';

  static fromDto(dto: any) {
    const fileresult = new FileResult();

    Object.assign(fileresult, dto);
    const l = fileresult.filePath.split('/');
    fileresult.fileName = l[l.length - 1];

    return fileresult;
  }
}
