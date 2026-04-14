import { IdGenerationUtil } from '@aas/helpers';
import { IdentifierType } from '@aas/model';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { EclassExplanationService } from '../../general/eclass-explanation/help-explanation.service';
import { Helper } from './helper';

export class Marking {
  name: string = '';
  file: File | undefined;
  filename: string | undefined;
  additionalText: string | undefined;

  mimeType: string | undefined;
  tempId: number = 0;
  benennung: string | undefined;
  definition: string | undefined;
  raw: any;

  async initEclass(eclassService?: EclassExplanationService) {
    if (this.benennung === undefined) {
      if (eclassService == null || this.name.trim() === '') {
        this.benennung = '';
        this.definition = '';

        return;
      }

      try {
        const eclassItem = await eclassService.getEclassData(this.name, 'de');
        this.benennung = eclassItem.benennung;
        this.definition = eclassItem.definition;
      } catch {
        // ignorieren
        this.benennung = '';
        this.definition = '';
      }
    }
  }

  static fromDto(dto: any) {
    const marking = new Marking();

    if (dto != null) {
      marking.raw = dto;
      marking.filename = dto.value?.find((sme: any) => sme.idShort === 'MarkingFile')?.value;
      marking.mimeType = dto.value?.find((sme: any) => sme.idShort === 'MarkingFile')?.mimeType;
      marking.name = dto.value?.find((sme: any) => sme.idShort === 'MarkingName')?.value ?? '';
      marking.additionalText = dto.value?.find((sme: any) => sme.idShort === 'MarkingAdditionalText')?.value ?? '';
    }

    return marking;
  }

  async toDto(num: number, apiPath: string, prefix: string, http?: HttpClient) {
    if (this.raw != null) {
      this.raw.idShort = `Marking${num.toString().padStart(2, '0')}`;
      Helper.setValue(this.raw.value, 'MarkingFile', this.filename, prefix);
      Helper.setMimeType(this.raw.value, 'MarkingFile', this.mimeType);
      Helper.setValue(this.raw.value, 'MarkingName', this.name, prefix);
      Helper.setValue(this.raw.value, 'MarkingAdditionalText', this.additionalText, prefix);

      if (this.raw.semanticId == null) {
        const id = IdGenerationUtil.generateIri('smc', prefix);
        this.raw.semanticId = {};
        this.raw.semanticId.keys = [];
        this.raw.semanticId.keys.push({
          idType: 'IRI',
          value: id,
          local: true,
          type: IdentifierType.SubmodelElementCollection,
        });
      }
    } else {
      if (http == null) {
        throw new Error('HttpClient is required to create a new marking dto');
      }

      const template = await lastValueFrom(http.get<any>(`${apiPath}/SubmodelTemplate/GetMarkingTemplate`));
      template.idShort = `Marking${num.toString().padStart(2, '0')}`;
      Helper.setValue(template.value, 'MarkingFile', this.filename, prefix);
      Helper.setMimeType(template.value, 'MarkingFile', this.mimeType);
      Helper.setValue(template.value, 'MarkingName', this.name, prefix);
      Helper.setValue(template.value, 'MarkingAdditionalText', this.additionalText, prefix);

      const id = IdGenerationUtil.generateIri('smc', prefix);
      template.semanticId = {};
      template.semanticId.keys = [];
      template.semanticId.keys.push({
        idType: 'IRI',
        value: id,
        local: true,
        type: IdentifierType.SubmodelElementCollection,
      });

      this.raw = template;
    }
    return this.raw;
  }
}
