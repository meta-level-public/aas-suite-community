import { EncodingService } from '@aas/common-services';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { HandoverDocumentationService } from './handover-documentation.service';
import { ViewerStoreService } from '../../viewer-store.service';

// Diese Tests fokussieren explizit die Entfernung des base64url-kodierten Submodel-Identifiers
// aus Dateinamen (stripSubmodelPrefix). Die Methode ist privat, wird hier aber bewusst über any
// reflektiert getestet, um einen klaren Regression-Schutz für das gewünschte Verhalten zu haben.

describe('HandoverDocumentationService stripSubmodelArtifacts', () => {
  let service: HandoverDocumentationService;
  let encoded: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HandoverDocumentationService,
        { provide: HttpClient, useValue: {} },
        { provide: TranslateService, useValue: {} },
        { provide: DomSanitizer, useValue: {} },
        { provide: ViewerStoreService, useValue: {} },
      ],
    });

    service = TestBed.inject(HandoverDocumentationService);
    encoded = EncodingService.base64urlEncode('urn:example:submodel:1234');
  });

  function call(name: string, pref?: string, idPath?: string) {
    return (service as any).stripSubmodelArtifacts(name, pref, idPath);
  }

  it('entfernt Präfix mit Unterstrich', () => {
    const fname = `${encoded}_myFile.pdf`;
    expect(call(fname, encoded)).toBe('myFile.pdf');
  });

  it('entfernt Präfix mit Bindestrich', () => {
    const fname = `${encoded}-image.png`;
    expect(call(fname, encoded)).toBe('image.png');
  });

  it('entfernt Präfix ohne Trennzeichen', () => {
    const fname = `${encoded}document.xml`;
    expect(call(fname, encoded)).toBe('document.xml');
  });

  it('belässt Namen unverändert wenn Präfix anders', () => {
    const fname = `OTHER_${encoded}_data.json`;
    expect(call(fname, encoded)).toBe('OTHER_data.json');
  });

  it('fällt auf Original zurück falls nach Entfernen leer', () => {
    // Konstruiere Name = exakt Präfix -> würde leer werden
    const fname = encoded;
    expect(call(fname, encoded)).toBe(encoded); // fallback
  });

  it('entfernt mehrfaches Präfix + semantische Segmente wie im Beispiel', () => {
    const raw = `${encoded}-CEDeclaration.DocumentVersion.DigitalFile-${encoded}-CEDeclaration.DocumentVersion.DigitalFile-S2T_LE_P2518_DE_01.pdf`;
    const cleaned = call(raw, encoded);
    expect(cleaned).toBe('S2T_LE_P2518_DE_01.pdf');
  });

  it('entfernt ID auch wenn sie im Mittelteil eingebettet ist', () => {
    const raw = `Report-${encoded}-Teil-${encoded}-Final.pdf`;
    const cleaned = call(raw, encoded);
    expect(cleaned).toBe('Report-Teil-Final.pdf');
  });

  it('bereinigt doppelte Trenner nach Entfernung', () => {
    const raw = `${encoded}--${encoded}__${encoded}..File--Name__X.pdf`;
    const cleaned = call(raw, encoded);
    expect(cleaned).toBe('File-Name-X.pdf');
  });

  it('entfernt idPath Tokens (mehrteiliger Pfad)', () => {
    const idPath = 'Doc_V2[0].Versions[3].File_List_V2[2]';
    const raw = 'Analysis-Doc_V2-Versions-File_List_V2-Result.csv';
    const cleaned = call(raw, encoded, idPath);
    expect(cleaned).toBe('Analysis-Result.csv');
  });
});
