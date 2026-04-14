import {
  MultiLanguageProperty,
  Property,
  Submodel,
  SubmodelElementCollection,
} from '@aas-core-works/aas-core3.1-typescript/types';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, inject, Input, model, OnChanges, OnDestroy, OnInit, output, signal } from '@angular/core';
import { lastValueFrom } from 'rxjs';

import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { formatDateLike, SemanticIdHelper } from '@aas/helpers';

import { jsonization } from '@aas-core-works/aas-core3.1-typescript';

import { HelpLabelComponent } from '@aas/common-components';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { DatePicker } from 'primeng/datepicker';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ViewerStoreService } from '../../viewer-store.service';

type LinkedSegmentOption = { label: string; segmentIdShort: string; url: string; query: string };
type TimeSeriesDataPoint = { semanticId: string; idShort: string };
type InternalSegmentOption = { label: string; segmentIdShort: string; records: SubmodelElementCollection[] };
type ExternalSegmentOption = {
  label: string;
  segmentIdShort: string;
  filePath: string | null;
  blob: Uint8Array | null;
};
type PapaParseApi = typeof import('papaparse');
type ViewerSelectionSnapshot = {
  linkedSegmentIdShort: string | null;
  internalSegmentIdShort: string | null;
  externalSegmentIdShort: string | null;
  timePointIdShort: string | null;
  dataPointIdShorts: string[];
};

@Component({
  selector: 'aas-time-series-viewer',
  templateUrl: './time-series-viewer.component.html',
  imports: [
    Card,
    HelpLabelComponent,
    ToggleSwitch,
    FormsModule,
    InputGroup,
    InputNumber,
    InputGroupAddon,
    Select,
    MultiSelect,
    InputText,
    Button,
    DatePicker,
    Message,
    UIChart,
    TranslateModule,
  ],
})
export class TimeSeriesViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) timeSeries: Submodel | null | undefined;
  segmentUrls: LinkedSegmentOption[] = [];
  selectedSegmentUrl: LinkedSegmentOption | undefined | null;
  token: string = '';

  dataPoints: TimeSeriesDataPoint[] = [];
  selectedDataPoint: TimeSeriesDataPoint | null = null;
  selectedDataPoints: TimeSeriesDataPoint[] = [];
  selectedTimePoint: TimeSeriesDataPoint | null = null;
  method: 'HTTP-GET' | 'HTTP-POST' = 'HTTP-GET';

  currentData: any;

  chartData: any;
  chartOptions: any;
  chartType: 'line' | 'doughnut' | 'pie' | 'polarArea' | 'radar' | 'bar' | 'scatter' | 'bubble' | undefined = 'line';
  hasLinkedSegmentApi: boolean = false;
  hasInternalSegmentData: boolean = false;

  startDate: Date | null = null;
  endDate: Date | null = null;

  internalSegments: InternalSegmentOption[] = [];
  selectedInternalSegment: InternalSegmentOption | undefined;

  hasExternalSegmentData: boolean = false;

  externalSegments: ExternalSegmentOption[] = [];
  selectedExternalSegment: ExternalSegmentOption | undefined;
  colors: string[];
  filteredDataPoints: TimeSeriesDataPoint[] = [];

  autorefresh = model(true);
  refreshInterval = model(10);

  reloadData = output();

  viewerStore = inject(ViewerStoreService);
  hasLoadingError = signal(false);
  private papaModuleLoader?: Promise<PapaParseApi>;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    this.chartOptions = {
      animation: {
        duration: 0,
      },
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    this.colors = [
      'blue',
      'green',
      'yellow',
      'cyan',
      'pink',
      'indigo',
      'teal',
      'orange',
      'bluegray',
      'purple',
      'red',
      'gray',
      'primary',
    ];
  }

  ngOnInit() {
    this.setAutoRefresh();
  }

  ngOnChanges(): void {
    this.rebuildViewerState();
  }

  // init() {
  //   this.currentData = null;
  //   this.selectedDataPoint = null;
  //   this.selectedDataPoints = [];
  //   this.selectedTimePoint = null;
  //   this.selectedSegmentUrl = null;
  //   this.segmentUrls = [];
  //   this.internalSegments = [];
  //   this.hasExternalSegmentData = false;
  //   this.hasInternalSegmentData = false;
  //   this.hasLinkedSegmentApi = false;
  //   this.dataPoints = [];

  //   this.chartData = [];

  //   this.initSegments();
  //   this.initDataPoints();
  // }

  private rebuildViewerState() {
    const selectionSnapshot = this.captureSelectionSnapshot();

    this.resetViewerState();
    this.initSegments();
    this.initDataPoints();
    this.restoreSelectionSnapshot(selectionSnapshot);

    if (this.currentData != null) {
      void this.drawChart();
    }
  }

  private captureSelectionSnapshot(): ViewerSelectionSnapshot {
    return {
      linkedSegmentIdShort: this.selectedSegmentUrl?.segmentIdShort ?? null,
      internalSegmentIdShort: this.selectedInternalSegment?.segmentIdShort ?? null,
      externalSegmentIdShort: this.selectedExternalSegment?.segmentIdShort ?? null,
      timePointIdShort: this.selectedTimePoint?.idShort ?? null,
      dataPointIdShorts: this.selectedDataPoints.map((dataPoint) => dataPoint.idShort),
    };
  }

  private resetViewerState() {
    this.segmentUrls = [];
    this.selectedSegmentUrl = null;
    this.dataPoints = [];
    this.selectedDataPoint = null;
    this.selectedDataPoints = [];
    this.selectedTimePoint = null;
    this.filteredDataPoints = [];
    this.hasLinkedSegmentApi = false;
    this.hasInternalSegmentData = false;
    this.hasExternalSegmentData = false;
    this.internalSegments = [];
    this.selectedInternalSegment = undefined;
    this.externalSegments = [];
    this.selectedExternalSegment = undefined;
  }

  private restoreSelectionSnapshot(selectionSnapshot: ViewerSelectionSnapshot) {
    this.selectedSegmentUrl =
      this.segmentUrls.find((segment) => segment.segmentIdShort === selectionSnapshot.linkedSegmentIdShort) ??
      this.segmentUrls[0] ??
      null;

    this.selectedInternalSegment =
      this.internalSegments.find((segment) => segment.segmentIdShort === selectionSnapshot.internalSegmentIdShort) ??
      this.selectedInternalSegment ??
      this.internalSegments[0];

    this.selectedExternalSegment =
      this.externalSegments.find((segment) => segment.segmentIdShort === selectionSnapshot.externalSegmentIdShort) ??
      this.externalSegments[0];

    this.selectedTimePoint =
      this.dataPoints.find((dataPoint) => dataPoint.idShort === selectionSnapshot.timePointIdShort) ??
      this.selectedTimePoint;

    this.filterDataPoints();

    const restoredDataPoints = this.filteredDataPoints.filter((dataPoint) =>
      selectionSnapshot.dataPointIdShorts.includes(dataPoint.idShort),
    );

    this.selectedDataPoints = restoredDataPoints.length > 0 ? restoredDataPoints : [...this.filteredDataPoints];
  }

  initSegments() {
    if (this.timeSeries != null) {
      const segments = this.timeSeries.submodelElements?.find(
        (sme: any) => sme.idShort === 'Segments',
      ) as SubmodelElementCollection;
      if (segments != null) {
        const linkedSegments = segments.value?.filter(
          (el: any) =>
            el.idShort.startsWith('LinkedSegment') ||
            SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/TimeSeries/Segments/LinkedSegment/1/1'),
        ) as SubmodelElementCollection[] | undefined;
        if (linkedSegments != null) {
          this.segmentUrls = [];

          linkedSegments.forEach((el: any) => {
            this.getDataUrls(el);
          });
        }

        const internalSegments = segments.value?.filter(
          (el: any) =>
            el.idShort.startsWith('InternalSegment') ||
            SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/TimeSeries/Segments/InternalSegment/1/1'),
        ) as SubmodelElementCollection[] | undefined;
        if (internalSegments != null) {
          internalSegments.forEach((el: any) => {
            this.getInternalSegmentsData(el);
          });
        }

        const externalSegments = segments.value?.filter(
          (el: any) =>
            el.idShort.startsWith('ExternalSegment') ||
            SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/TimeSeries/Segments/ExternalSegment/1/1'),
        ) as SubmodelElementCollection[] | undefined;
        if (externalSegments != null) {
          externalSegments.forEach((el: any) => {
            this.getExternalSegmentsData(el);
          });
        }
      }

      if (this.internalSegments.length === 1) {
        this.selectedInternalSegment = this.internalSegments[0];
      }

      if (this.segmentUrls.length === 1) {
        this.selectedSegmentUrl = this.segmentUrls[0];
      }

      if (this.externalSegments.length === 1) {
        this.selectedExternalSegment = this.externalSegments[0];
      }
    }
  }

  getInternalSegmentsData(el: SubmodelElementCollection) {
    if (this.timeSeries != null) {
      const records = el.value?.find((endpointEl) =>
        (endpointEl as any).idShort.toLowerCase().startsWith('records'),
      ) as SubmodelElementCollection;
      if (records != null && (records.value?.length ?? 0) > 0) {
        this.hasInternalSegmentData = true;
      }

      if (
        this.internalSegments.length === 0 ||
        this.internalSegments.find((s) => s.segmentIdShort === el.idShort) == null
      ) {
        this.internalSegments.push({
          label: this.getSegmentLabel(el),
          segmentIdShort: el.idShort ?? '',
          records: (records.value as SubmodelElementCollection[]) ?? [],
        });
      } else {
        const segment = this.internalSegments.find((s) => s.segmentIdShort === el.idShort);
        if (segment != null) {
          segment.records = (records.value as SubmodelElementCollection[]) ?? [];
        }
      }
    }
  }

  getExternalSegmentsData(el: SubmodelElementCollection) {
    if (this.timeSeries != null) {
      const file = el.value?.find((endpointEl) =>
        (endpointEl as any).idShort.toLowerCase().startsWith('file'),
      ) as aas.types.File;
      if (file != null && file.value !== '') {
        this.hasExternalSegmentData = true;
      }
      const blob = el.value?.find((endpointEl) =>
        (endpointEl as any).idShort.toLowerCase().startsWith('blob'),
      ) as aas.types.Blob;
      if (blob?.value != null) {
        this.hasExternalSegmentData = true;
      }

      this.externalSegments.push({
        label: this.getSegmentLabel(el),
        segmentIdShort: el.idShort ?? '',
        filePath: file?.value,
        blob: blob?.value,
      });
    }
  }

  initDataPoints() {
    if (this.timeSeries != null) {
      const metadata = this.timeSeries.submodelElements?.find(
        (sme: any) => sme.idShort === 'Metadata',
      ) as SubmodelElementCollection;
      if (metadata != null) {
        const points = (metadata.value?.find((el: any) => el.idShort === 'Record') as SubmodelElementCollection)?.value;
        if (points != null) {
          points.forEach((point: any) => {
            this.dataPoints.push({ idShort: point.idShort, semanticId: point.semanticId?.keys[0].value });
          });
        }
      }
    }

    this.setTimepointIfPossible();
  }

  setTimepointIfPossible() {
    if (this.dataPoints.length > 0) {
      const timePoint = this.dataPoints.find(
        (dp) =>
          dp.semanticId === 'https://admin-shell.io/idta/TimeSeries/UtcTime/1/1' ||
          dp.semanticId === 'https://admin-shell.io/idta/TimeSeries/TaiTime/1/1' ||
          dp.semanticId === 'https://admin-shell.io/idta/TimeSeries/RelativePointInTime/1/1',
      );
      if (timePoint != null) {
        this.selectedTimePoint = timePoint;
      }
    }

    this.filterDataPoints();

    if (this.selectedDataPoints.length === 0) {
      this.selectedDataPoints = [...this.filteredDataPoints];
    }

    if (this.hasInternalSegmentData) {
      void this.loadInternalDataAndDraw();
    }
  }

  getDataUrls(el: SubmodelElementCollection) {
    if (this.timeSeries != null) {
      const endpoint = el.value?.find((endpointEl) =>
        (endpointEl as any).idShort.toLowerCase().startsWith('endpoint'),
      ) as Property;

      if (endpoint?.value != null && endpoint.value !== '') {
        this.hasLinkedSegmentApi = true;
      }

      const query = el.value?.find((queryEl) => (queryEl as any).idShort.toLowerCase().startsWith('query')) as Property;

      this.segmentUrls.push({
        label: this.getSegmentLabel(el),
        segmentIdShort: el.idShort ?? '',
        url: endpoint.value ?? '',
        query: query.value ?? '',
      });
    }
  }

  private getSegmentLabel(el: SubmodelElementCollection) {
    const semanticName = el.value?.find((child) =>
      SemanticIdHelper.hasSemanticId(child, 'https://admin-shell.io/idta/TimeSeries/Metadata/Name/1/1'),
    ) as MultiLanguageProperty | undefined;

    const fallbackName = el.value?.find((child) => (child as any).idShort?.toLowerCase().startsWith('name')) as
      | MultiLanguageProperty
      | undefined;

    const name = semanticName ?? fallbackName;

    return name?.value?.find((entry) => entry.language === 'de')?.text ?? name?.value?.[0]?.text ?? el.idShort ?? '';
  }

  async loadLinkedDataAndDraw() {
    await this.loadLinkedData();
    this.drawChart();
  }

  async loadInternalDataAndDraw() {
    await this.loadInternalData();
    await this.drawChart();
  }

  async loadExternalDataAndDraw() {
    await this.loadExternalData();
    this.drawChart();
  }

  async loadInternalData() {
    if (this.selectedInternalSegment != null) {
      const Papa = await this.loadPapa();
      const data: any[] = [];
      this.selectedInternalSegment.records.forEach((record: any) => {
        const recordEntries = record as SubmodelElementCollection;
        const dataEntry: any = {};
        recordEntries.value?.forEach((entry: any) => {
          const entryProp = entry as Property;
          if (entryProp.idShort != null && entryProp.idShort !== '') {
            dataEntry[entryProp.idShort] = entry.value;
          }
        });
        data.push(dataEntry);
      });

      this.currentData = Papa.unparse(data);
    }
  }

  async loadExternalData() {
    if (this.selectedExternalSegment != null) {
      if (this.selectedExternalSegment.filePath?.startsWith('http')) {
        try {
          // datei laden
          this.http.get(this.selectedExternalSegment.filePath, { responseType: 'blob' }).subscribe((blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result as ArrayBuffer;
              const binaryString = String.fromCharCode(...new Uint8Array(arrayBuffer));
              const text = window.btoa(binaryString);

              this.currentData = text;
            };
            reader.readAsArrayBuffer(blob);
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e);
          this.hasLoadingError.set(true);
          this.notificationService.showMessageAlways('LOADING_EXTERNAL_DATA_ERROR', 'info');
        }
      }
    }
  }

  async loadLinkedData() {
    if (this.selectedSegmentUrl != null) {
      if (this.method === 'HTTP-GET') {
        const headers = new HttpHeaders()
          .append('ignoreAuth', 'true')
          .append('ignoreContentType', 'true')
          .append('Authorization', 'Token ' + this.token);

        const params = new HttpParams().append('query', this.selectedSegmentUrl?.query ?? '');

        try {
          this.currentData = await lastValueFrom(
            this.http.get(this.selectedSegmentUrl.url, { params, headers, responseType: 'text' }),
          );
          this.hasLoadingError.set(false);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e);
          this.hasLoadingError.set(true);
        }
      }
      if (this.method === 'HTTP-POST') {
        const headers = new HttpHeaders()
          .append('ignoreAuth', 'true')
          .append('ignoreContentType', 'true')
          .append('Authorization', 'Token ' + this.token);

        try {
          this.currentData = await lastValueFrom(
            this.http.post(this.selectedSegmentUrl.url, this.selectedSegmentUrl?.query, {
              headers,
              responseType: 'text',
            }),
          );
          this.hasLoadingError.set(false);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log(e);
          this.hasLoadingError.set(true);
        }
      }
    }
  }

  async drawChart() {
    if (this.selectedDataPoints.length > 0 && this.currentData != null && this.selectedTimePoint != null) {
      const Papa = await this.loadPapa();
      const documentStyle = getComputedStyle(document.documentElement);

      const config = {
        header: true,
      };
      const data = Papa.parse(this.currentData, config).data;

      const filteredData = data.filter(
        (d: any) =>
          (this.startDate != null
            ? new Date(d[this.selectedTimePoint?.idShort ?? ''] ?? d['_' + this.selectedTimePoint?.idShort]) >
              this.startDate
            : true) &&
          (this.endDate != null
            ? new Date(d[this.selectedTimePoint?.idShort ?? ''] ?? d['_' + this.selectedTimePoint?.idShort]) <
              this.endDate
            : true),
      );

      const datasets: any[] = [];
      for (let i = 0; i < this.selectedDataPoints.length; i++) {
        const dp = this.selectedDataPoints[i];
        datasets.push({
          label: dp.idShort,
          data: filteredData.map((d: any) => {
            return d[dp.idShort] ?? d['_' + dp.idShort];
          }),
          backgroundColor: documentStyle.getPropertyValue(
            this.colors[i % 13] + '--' + (i * 100 + 300) / this.colors.length,
          ),
          tension: 0.4,
        });
      }

      const labels = filteredData.map((d: any) => {
        if (this.selectedTimePoint != null) {
          return (
            formatDateLike(
              d[this.selectedTimePoint.idShort] ?? d['_' + this.selectedTimePoint.idShort],
              'de',
              'L LTS',
            ) ?? ''
          );
        } else {
          return '';
        }
      });

      this.chartData = {
        labels: labels,
        datasets: datasets,
      };
    }
  }

  private async loadPapa() {
    this.papaModuleLoader ??= import('papaparse');

    return this.resolvePapaParseApi(await this.papaModuleLoader);
  }

  private resolvePapaParseApi(module: PapaParseApi) {
    const defaultExport = (module as PapaParseApi & { default?: PapaParseApi }).default;

    return typeof module.unparse === 'function' ? module : (defaultExport ?? module);
  }

  filterDataPoints() {
    this.filteredDataPoints = this.dataPoints.filter((dp) => dp !== this.selectedTimePoint);
  }

  ngOnDestroy(): void {
    // eslint-disable-next-line no-console
    console.log('destroyed');
    this.resetAutorerefresh();
  }

  intervalId: ReturnType<typeof setTimeout> | undefined;

  updateAutorefresh() {
    if (this.autorefresh()) {
      this.resetAutorerefresh();
      this.setAutoRefresh();
    } else {
      this.resetAutorerefresh();
    }
  }

  resetAutorerefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  setAutoRefresh() {
    if (this.autorefresh() && this.refreshInterval() > 0) {
      this.intervalId = setInterval(() => {
        // this.reloadData.emit();
        this.loadChartData();
      }, this.refreshInterval() * 1000);
    }
  }

  async loadChartData() {
    const smUrl = await this.viewerStore.currentSmUrl();
    const res = await lastValueFrom(this.http.get<any>(smUrl));
    this.timeSeries = jsonization.submodelFromJsonable(res).value;

    this.rebuildViewerState();
    if (this.hasLinkedSegmentApi) {
      void this.loadLinkedDataAndDraw();
    }
    if (this.hasInternalSegmentData) {
      void this.loadInternalDataAndDraw();
    }
  }
}
