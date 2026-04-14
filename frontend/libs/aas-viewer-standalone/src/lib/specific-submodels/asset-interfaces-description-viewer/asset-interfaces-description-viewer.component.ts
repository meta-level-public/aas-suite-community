import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { HelpLabelComponent } from '@aas/common-components';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  inject,
} from '@angular/core';
import { SemanticIdHelper } from '@aas/helpers';
import { TranslateModule } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';

type FormSummary = {
  idShort: string;
  protocol: string;
  target: string;
  contentType: string;
  securityConfiguration: string;
  httpMethod: string;
  httpHeaders: { name: string; value: string }[];
  mqttQos: string;
  mqttRetain: string;
  modbusFunction: string;
  modbusEntity: string;
};
type PropertySummary = {
  idShort: string;
  key: string;
  title: string;
  dataType: string;
  unitCode: string;
  isObservable: string;
  valueSemantics: string;
  children: PropertySummary[];
};
type SecuritySchemeSummary = {
  idShort: string;
  scheme: string;
  in: string;
  name: string;
  description: string;
};

type InterfaceSummary = {
  idShort: string;
  title: string;
  endpoint: string;
  interactionType: string;
  forms: FormSummary[];
  securitySchemes: SecuritySchemeSummary[];
  propertyDefinitions: PropertySummary[];
};

@Component({
  selector: 'aas-asset-interfaces-description-viewer',
  templateUrl: './asset-interfaces-description-viewer.component.html',
  styleUrls: ['./asset-interfaces-description-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    InputGroup,
    InputGroupAddon,
    InputText,
    Tag,
    TranslateModule,
    HelpLabelComponent,
  ],
})
export class AssetInterfacesDescriptionViewerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) submodel!: aas.types.Submodel;
  private readonly cdr = inject(ChangeDetectorRef);
  private renderToken = 0;

  interfaces: InterfaceSummary[] = [];
  loading = false;

  get totalForms(): number {
    return this.interfaces.reduce((acc, item) => acc + item.forms.length, 0);
  }

  get totalProperties(): number {
    return this.interfaces.reduce((acc, item) => acc + item.propertyDefinitions.length, 0);
  }

  get totalSecuritySchemes(): number {
    return this.interfaces.reduce((acc, item) => acc + item.securitySchemes.length, 0);
  }

  ngOnChanges(): void {
    this.scheduleInterfaceExtraction();
  }

  ngOnDestroy(): void {
    this.renderToken++;
  }

  private scheduleInterfaceExtraction(): void {
    const token = ++this.renderToken;
    const currentSubmodel = this.submodel;

    this.loading = true;
    this.interfaces = [];
    this.cdr.markForCheck();

    requestAnimationFrame(() => {
      // Let the selection/render update first; then do the heavier extraction work.
      setTimeout(() => {
        if (token !== this.renderToken) return;
        this.interfaces = this.extractInterfaces(currentSubmodel);
        this.loading = false;
        this.cdr.markForCheck();
      }, 0);
    });
  }

  private extractInterfaces(submodel: aas.types.Submodel): InterfaceSummary[] {
    const elements = submodel.submodelElements ?? [];
    const interfaces = elements.filter(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection &&
        (SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/Interface') ||
          (el.idShort ?? '').toLowerCase().startsWith('interface')),
    );

    return interfaces.map((entry, index) => {
      const endpointMetadata = this.findCollection(
        entry.value ?? [],
        'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/EndpointMetadata',
        'EndpointMetadata',
      );
      const interactionMetadata = this.findInteractionCollection(entry.value ?? []);

      const endpoint = this.findPropertyValue(
        endpointMetadata?.value ?? [],
        'https://www.w3.org/2019/wot/td#baseURI',
        'baseURI',
      );
      const title = this.findPropertyValue(entry.value ?? [], 'https://www.w3.org/2019/wot/td#title', 'title');
      const securitySchemes = this.readSecuritySchemes(endpointMetadata);
      const forms = this.readForms(interactionMetadata);
      const propertyDefinitions = this.readPropertyDefinitions(interactionMetadata);

      return {
        idShort: entry.idShort?.trim() || `Interface${index.toString().padStart(2, '0')}`,
        title: title || '-',
        endpoint: endpoint || '-',
        interactionType: this.getInteractionType(interactionMetadata),
        forms,
        securitySchemes,
        propertyDefinitions,
      };
    });
  }

  private findCollection(
    elements: aas.types.ISubmodelElement[],
    semanticId: string,
    idShort: string,
  ): aas.types.SubmodelElementCollection | undefined {
    return elements.find(
      (el): el is aas.types.SubmodelElementCollection =>
        el instanceof aas.types.SubmodelElementCollection &&
        (SemanticIdHelper.hasSemanticId(el, semanticId) || (el.idShort ?? '').toLowerCase() === idShort.toLowerCase()),
    );
  }

  private findInteractionCollection(
    elements: aas.types.ISubmodelElement[],
  ): aas.types.SubmodelElementCollection | undefined {
    return (
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#InteractionAffordance', 'InteractionMetadata') ??
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#PropertyAffordance', 'InteractionMetadata') ??
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#ActionAffordance', 'InteractionMetadata') ??
      this.findCollection(elements, 'https://www.w3.org/2019/wot/td#EventAffordance', 'InteractionMetadata')
    );
  }

  private getInteractionType(collection: aas.types.SubmodelElementCollection | undefined): string {
    const semanticId = `${collection?.semanticId?.keys?.[0]?.value ?? ''}`.toLowerCase();
    if (semanticId.includes('actionaffordance')) return 'Action';
    if (semanticId.includes('eventaffordance')) return 'Event';
    if (semanticId.includes('propertyaffordance')) return 'Property';
    return 'Property';
  }

  private readForms(interactionMetadata: aas.types.SubmodelElementCollection | undefined): FormSummary[] {
    const formsCollection = this.findCollection(
      interactionMetadata?.value ?? [],
      'https://www.w3.org/2019/wot/td#hasForm',
      'forms',
    );

    return (formsCollection?.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((form, index) => {
        const target = this.findPropertyValue(
          form.value ?? [],
          'https://www.w3.org/2019/wot/hypermedia#hasTarget',
          'target',
        );
        const protocol = this.findPropertyValue(
          form.value ?? [],
          'https://www.w3.org/2019/wot/hypermedia#forSubProtocol',
          'Protocol',
        );

        return {
          idShort: form.idShort?.trim() || `Form${index.toString().padStart(2, '0')}`,
          protocol: this.normalizeProtocol(protocol, target),
          target: target || '-',
          contentType:
            this.findPropertyValue(
              form.value ?? [],
              'https://www.w3.org/2019/wot/hypermedia#forContentType',
              'contentType',
            ) || '-',
          securityConfiguration:
            this.findPropertyValue(
              form.value ?? [],
              'https://www.w3.org/2019/wot/td#hasSecurityConfiguration',
              'security',
            ) || '-',
          httpMethod:
            this.findPropertyValue(form.value ?? [], 'https://www.w3.org/2011/http#methodName', 'methodName') || '-',
          httpHeaders: this.readHttpHeaders(form),
          mqttQos:
            this.findPropertyValue(form.value ?? [], 'https://www.w3.org/2019/wot/mqtt#hasQoSFlag', 'qos') || '-',
          mqttRetain:
            this.findPropertyValue(form.value ?? [], 'https://www.w3.org/2019/wot/mqtt#hasRetainFlag', 'retain') || '-',
          modbusFunction:
            this.findPropertyValue(
              form.value ?? [],
              'https://www.w3.org/2019/wot/modbus#hasFunction',
              'modv_function',
            ) || '-',
          modbusEntity:
            this.findPropertyValue(form.value ?? [], 'https://www.w3.org/2019/wot/modbus#hasEntity', 'modv_entity') ||
            '-',
        };
      });
  }

  private readSecuritySchemes(
    endpointMetadata: aas.types.SubmodelElementCollection | undefined,
  ): SecuritySchemeSummary[] {
    const schemesCollection = this.findCollection(
      endpointMetadata?.value ?? [],
      'https://www.w3.org/2019/wot/td#definesSecurityScheme',
      'securityDefinitions',
    );

    return (schemesCollection?.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((scheme, index) => {
        return {
          idShort: scheme.idShort?.trim() || `securityScheme${index.toString().padStart(2, '0')}`,
          scheme: this.findPropertyValue(scheme.value ?? [], 'https://www.w3.org/2019/wot/td#scheme', 'scheme') || '-',
          in: this.findPropertyValue(scheme.value ?? [], 'https://www.w3.org/2019/wot/td#in', 'in') || '-',
          name: this.findPropertyValue(scheme.value ?? [], 'https://www.w3.org/2019/wot/td#name', 'name') || '-',
          description:
            this.findPropertyValue(scheme.value ?? [], 'https://www.w3.org/2019/wot/td#description', 'description') ||
            '-',
        };
      })
      .filter((scheme) => scheme.idShort !== '');
  }

  private readPropertyDefinitions(
    interactionMetadata: aas.types.SubmodelElementCollection | undefined,
  ): PropertySummary[] {
    const propertiesCollection = this.findCollection(
      interactionMetadata?.value ?? [],
      'https://www.w3.org/2019/wot/json-schema#properties',
      'properties',
    );

    return (propertiesCollection?.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((entry, index) => this.readPropertyDefinition(entry, index));
  }

  private readPropertyDefinition(entry: aas.types.SubmodelElementCollection, index: number): PropertySummary {
    const nestedCollection = this.findCollection(
      entry.value ?? [],
      'https://www.w3.org/2019/wot/json-schema#properties',
      'properties',
    );

    return {
      idShort: entry.idShort?.trim() || `property${index.toString().padStart(2, '0')}`,
      key: this.findPropertyValue(
        entry.value ?? [],
        'https://admin-shell.io/idta/AssetInterfacesDescription/1/0/key',
        'key',
      ),
      title: this.findPropertyValue(entry.value ?? [], 'https://www.w3.org/2019/wot/td#title', 'title'),
      dataType: this.findPropertyValue(entry.value ?? [], 'https://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'type'),
      unitCode: this.findPropertyValue(entry.value ?? [], 'https://schema.org/unitCode', 'unitCode'),
      isObservable:
        this.findPropertyValue(entry.value ?? [], 'https://www.w3.org/2019/wot/td#isObservable', 'isObservable') || '-',
      valueSemantics: this.findPropertyValue(
        entry.value ?? [],
        'https://adminshell.io/idta/AssetInterfacesDescription/1/0/valueSemantics',
        'valueSemantics',
      ),
      children: (nestedCollection?.value ?? [])
        .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
        .map((child, childIndex) => this.readPropertyDefinition(child, childIndex)),
    };
  }

  private findPropertyValue(elements: aas.types.ISubmodelElement[], semanticId: string, idShort: string): string {
    const property = elements.find(
      (el): el is aas.types.Property =>
        el instanceof aas.types.Property &&
        (SemanticIdHelper.hasSemanticId(el, semanticId) || (el.idShort ?? '').toLowerCase() === idShort.toLowerCase()),
    );
    return `${property?.value ?? ''}`.trim();
  }

  private normalizeProtocol(protocol: string, target: string): string {
    const lowerProtocol = protocol.toLowerCase();
    const lowerTarget = target.toLowerCase();

    if (lowerProtocol.includes('mqtt') || lowerTarget.startsWith('mqtt://')) return 'MQTT';
    if (lowerProtocol.includes('modbus') || lowerTarget.startsWith('modbus://')) return 'Modbus';
    if (lowerProtocol.includes('http') || lowerTarget.startsWith('http://') || lowerTarget.startsWith('https://')) {
      return 'HTTP';
    }

    return protocol || '-';
  }

  private readHttpHeaders(form: aas.types.SubmodelElementCollection | undefined): { name: string; value: string }[] {
    const headersCollection = this.findCollection(form?.value ?? [], 'https://www.w3.org/2011/http#headers', 'headers');
    if (headersCollection == null) return [];

    return (headersCollection.value ?? [])
      .filter((el): el is aas.types.SubmodelElementCollection => el instanceof aas.types.SubmodelElementCollection)
      .map((entry) => {
        const name = this.findPropertyValue(entry.value ?? [], 'https://www.w3.org/2011/http#fieldName', 'fieldName');
        const value = this.findPropertyValue(
          entry.value ?? [],
          'https://www.w3.org/2011/http#fieldValue',
          'fieldValue',
        );
        return { name, value };
      })
      .filter((header) => header.name !== '' || header.value !== '');
  }
}
