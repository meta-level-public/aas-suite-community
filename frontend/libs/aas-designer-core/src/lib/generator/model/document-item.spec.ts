import { of } from 'rxjs';
import { DocumentItem } from './document-item';

describe('DocumentItem', () => {
  it('creates a document dto with an explicit HttpClient dependency', async () => {
    const documentItem = new DocumentItem();
    documentItem.idShort = 'Document01';
    documentItem.documentType = 'Manual';
    documentItem.vdi2770DomainId = 'DOC-01';
    documentItem.vdi2770IdType = 'Primary';
    documentItem.vdi2770FileFormat = 'application/pdf';
    documentItem.vdi2770FileFileName = 'manual.pdf';
    documentItem.vdi2770Title = 'Manual';

    const template = {
      idShort: '',
      value: [
        { idShort: 'File', value: '', mimeType: '' },
        { idShort: 'DocumentType', value: '' },
        { idShort: 'VDI2770_DomainId', value: '' },
        { idShort: 'VDI2770_IdType', value: '' },
        { idShort: 'VDI2770_FileFormat', value: '' },
        { idShort: 'VDI2770_FileName', value: '' },
        { idShort: 'VDI2770_Title', value: '' },
      ],
    };
    const http = {
      get: vi.fn().mockReturnValue(of(template)),
    } as any;

    const dto = await documentItem.toDto('/api', 'https://example.com', http);

    expect(http.get).toHaveBeenCalledWith('/api/SubmodelTemplate/GetDocumentTemplate');
    expect(dto.idShort).toBe('Document01');
    expect(dto.value.find((entry: any) => entry.idShort === 'DocumentType')?.value).toBe('Manual');
    expect(dto.value.find((entry: any) => entry.idShort === 'VDI2770_FileName')?.value).toBe('manual.pdf');
  });
});
