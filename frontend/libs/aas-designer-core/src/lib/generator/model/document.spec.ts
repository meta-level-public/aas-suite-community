import { HandoverSemantics } from '@aas/helpers';
import { describe, expect, it } from 'vitest';
import { Document } from './document';

describe('Document', () => {
  it('extracts handover documents with the plain V2 document semantic id', () => {
    const dto = {
      administration: {
        templateId: 'https://admin-shell.io/idta-02035-2',
      },
      submodelElements: [
        {
          idShort: 'Documents',
          modelType: 'SubmodelElementList',
          semanticId: { keys: [{ value: HandoverSemantics.CONTAINER_V2 }] },
          value: [
            {
              idShort: 'Document00',
              modelType: 'SubmodelElementCollection',
              semanticId: { keys: [{ value: HandoverSemantics.DOCUMENT_V2 }] },
              value: [
                {
                  idShort: 'DocumentId',
                  modelType: 'SubmodelElementCollection',
                  semanticId: { keys: [{ value: '0173-1#02-ABI501#001/0173-1#01-AHF580#001' }] },
                  value: [
                    { idShort: 'DocumentDomainId', modelType: 'Property', value: 'domain' },
                    { idShort: 'ValueId', modelType: 'Property', value: 'doc-1' },
                    { idShort: 'IsPrimary', modelType: 'Property', value: 'true' },
                  ],
                },
                {
                  idShort: 'DocumentVersion',
                  modelType: 'SubmodelElementCollection',
                  semanticId: { keys: [{ value: '0173-1#02-ABI503#001/0173-1#01-AHF582#001' }] },
                  value: [
                    { idShort: 'Language', modelType: 'Property', value: 'en' },
                    { idShort: 'DocumentVersionId', modelType: 'Property', value: '1.0' },
                    {
                      idShort: 'Title',
                      modelType: 'MultiLanguageProperty',
                      value: [{ language: 'en', text: 'Battery passport PDF' }],
                    },
                    {
                      idShort: 'File_List_V2',
                      modelType: 'SubmodelElementList',
                      semanticId: { keys: [{ value: HandoverSemantics.FILE_LIST_V2 }] },
                      value: [
                        {
                          idShort: 'DigitalFile',
                          modelType: 'File',
                          value: 'battery-passport.pdf',
                          contentType: 'application/pdf',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const document = Document.fromDto(dto, 'en');

    expect(document.documentItems).toHaveLength(1);
    expect(document.documentItems[0].idShort).toBe('Document00');
    expect(document.documentItems[0].vdi2770FileFileName).toBe('battery-passport.pdf');
  });
});
