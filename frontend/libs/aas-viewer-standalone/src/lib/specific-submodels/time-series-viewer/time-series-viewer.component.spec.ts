import { NotificationService } from '@aas/common-services';
import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ViewerStoreService } from '../../viewer-store.service';
import { TimeSeriesViewerComponent } from './time-series-viewer.component';

function semanticId(value: string) {
  return {
    keys: [{ value }],
  };
}

function createTimeSeriesSubmodel() {
  return {
    submodelElements: [
      {
        idShort: 'Segments',
        value: [
          {
            idShort: 'InternalSegment1',
            value: [
              {
                idShort: 'Records',
                value: [],
              },
              {
                idShort: 'Name',
                value: [{ language: 'de', text: 'Internal Segment' }],
              },
            ],
          },
          {
            idShort: 'ExternalSegment1',
            value: [
              {
                idShort: 'File',
                value: 'https://example.com/segment-1.csv',
              },
              {
                idShort: 'Name',
                value: [{ language: 'de', text: 'External Segment 1' }],
              },
            ],
          },
          {
            idShort: 'ExternalSegment2',
            value: [
              {
                idShort: 'File',
                value: 'https://example.com/segment-2.csv',
              },
              {
                idShort: 'Name',
                value: [{ language: 'de', text: 'External Segment 2' }],
              },
            ],
          },
        ],
      },
      {
        idShort: 'Metadata',
        value: [
          {
            idShort: 'Record',
            value: [
              {
                idShort: 'Time',
                semanticId: semanticId('https://admin-shell.io/idta/TimeSeries/UtcTime/1/1'),
              },
              {
                idShort: 'Value',
                semanticId: semanticId('urn:test:value'),
              },
            ],
          },
        ],
      },
    ],
  } as any;
}

describe('TimeSeriesViewerComponent', () => {
  let component: TimeSeriesViewerComponent;
  let fixture: ComponentFixture<TimeSeriesViewerComponent>;
  let httpTesting: HttpTestingController;
  let currentSmUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    currentSmUrl = vi.fn(() => '');
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), TimeSeriesViewerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: NotificationService,
          useValue: {
            showMessageAlways: vi.fn(),
          },
        },
        {
          provide: ViewerStoreService,
          useValue: {
            currentSubmodelId: vi.fn(),
            currentSmUrl,
            headers: vi.fn(() => new HttpHeaders()),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSeriesViewerComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('does not request the page root on auto refresh when no submodel url is known', async () => {
    component.timeSeries = createTimeSeriesSubmodel();

    await component.loadChartData();

    httpTesting.expectNone((req) => !req.url.includes('GetHelpTexts'));
  });

  it('reloads the submodel from the passed submodel url on auto refresh', async () => {
    fixture.componentRef.setInput('timeSeries', createTimeSeriesSubmodel());
    fixture.componentRef.setInput('submodelUrl', '/proxy/call?target=sm');

    const reload = component.loadChartData();
    httpTesting.expectOne('/proxy/call?target=sm');
    expect(currentSmUrl).not.toHaveBeenCalled();
    void reload;
  });

  it('rebuilds viewer state without duplicating metadata and keeps all external segments', () => {
    component.timeSeries = createTimeSeriesSubmodel();

    component.ngOnChanges();
    component.ngOnChanges();

    expect(component.dataPoints.map((dataPoint) => dataPoint.idShort)).toEqual(['Time', 'Value']);
    expect(component.externalSegments.map((segment) => segment.segmentIdShort)).toEqual([
      'ExternalSegment1',
      'ExternalSegment2',
    ]);
    expect(component.selectedDataPoints.map((dataPoint) => dataPoint.idShort)).toEqual(['Value']);
  });

  it('resolves the papaparse default export when unparse is nested there', async () => {
    const unparse = vi.fn(() => 'Time,Value\n2026-03-24T10:00:00Z,1');

    (component as any).papaModuleLoader = Promise.resolve({
      default: {
        unparse,
      },
    });

    const papa = await (component as any).loadPapa();

    expect(typeof papa.unparse).toBe('function');
    expect(papa.unparse([])).toBe('Time,Value\n2026-03-24T10:00:00Z,1');
    expect(unparse).toHaveBeenCalledWith([]);
  });
});
