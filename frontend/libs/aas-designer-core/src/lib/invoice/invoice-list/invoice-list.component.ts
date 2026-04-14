import { Component, ElementRef, ViewChild } from '@angular/core';
import { OrgaRechnung } from '@aas-designer-model';
import { InvoiceService } from '../invoice.service';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MenuItem, PrimeTemplate } from 'primeng/api';

import { CurrencyPipe, DecimalPipe } from '@angular/common';
import moment from 'moment';

import { DateProxyPipe } from '@aas/common-pipes';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Menu } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { Toolbar } from 'primeng/toolbar';

@Component({
  selector: 'aas-invoice-list',
  templateUrl: './invoice-list.component.html',
  imports: [
    Toolbar,
    DatePicker,
    FormsModule,
    Button,
    TableModule,
    PrimeTemplate,
    Menu,
    CurrencyPipe,
    TranslateModule,
    DateProxyPipe,
  ],
})
export class InvoiceListComponent {
  @ViewChild('image') image?: ElementRef;
  invoices: OrgaRechnung[] = [];
  invoiceDate: Date | null = null;
  menuItems: MenuItem[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private translate: TranslateService,
    private decPipe: DecimalPipe,
  ) {
    registerLocaleData(localeDe, 'de-DE', localeDeExtra);
  }

  async load() {
    if (this.invoiceDate != null)
      this.invoices = await this.invoiceService.load(
        `${this.invoiceDate.getMonth() + 1}/${this.invoiceDate.getFullYear()}`,
      );
  }

  async generate() {
    if (this.invoiceDate != null)
      this.invoices = await this.invoiceService.generate(
        `${this.invoiceDate.getMonth() + 1}/${this.invoiceDate.getFullYear()}`,
      );
  }

  getInvoiceData(data: string) {
    const splittedData = data.split('\n');
    const result: { name: string; zeitraum: string; preis: number }[] = [];
    splittedData.forEach((d) => {
      const sp = d.split(';');
      result.push({ name: sp[0], zeitraum: sp[1], preis: Math.round(+sp[2] * 100) / 100 });
    });

    return result;
  }

  getInvoiceSumme(summe: number) {
    return Math.round(summe * 100) / 100;
  }

  getDataForExport(rechnung: OrgaRechnung) {
    const result: any[] = [];
    rechnung.daten.split('\n').forEach((d) => {
      const splitted = d.split(';');
      result.push({
        name: splitted[0],
        zeitraum: splitted[1],
        preis: `${this.decPipe.transform(Math.round(+splitted[2] * 100) / 100, '.2', 'de-DE')} €`,
      });
    });

    result.push({
      name: '',
      zeitraum: '',
      preis: '',
    });
    result.push({
      name: 'Summe (netto)',
      zeitraum: '',
      preis: `${this.decPipe.transform(Math.round(rechnung.summe * 100) / 100, '.2', 'de-DE')} €`,
    });
    result.push({
      name: 'Mwst. (19%)',
      zeitraum: '',
      preis: `${this.decPipe.transform(Math.round(rechnung.summe * 100 * 0.19) / 100, '.2', 'de-DE')} €`,
    });
    result.push({
      name: 'Summe',
      zeitraum: '',
      preis: `${this.decPipe.transform(Math.round(rechnung.summe * 100 * 1.19) / 100, '.2', 'de-DE')} €`,
    });

    return result;
  }

  async createPdf(rechnung: OrgaRechnung) {
    const doc = new jsPDF('portrait', 'mm', [210, 297]);
    autoTable(doc, {
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255] },
      footStyles: { fillColor: undefined, textColor: 0 },
      bodyStyles: { halign: 'center', valign: 'middle' },
      showFoot: 'lastPage',
      head: [
        [
          {
            content: 'AAS Generator by Meta-Level Software AG',
            colSpan: 3,
            styles: {
              fillColor: undefined,
              textColor: [33, 150, 243],
              minCellHeight: 12,
              valign: 'middle',
            },
          },
        ],
        [
          {
            content: '       Meta-Level Software AG | Lyonerring 1 | 66121 Saarbrücken',
            colSpan: 3,
            styles: {
              fillColor: undefined,
              textColor: [33, 150, 243],
              fontSize: 6,
              minCellHeight: 28,
              valign: 'bottom',
            },
          },
        ],
        [
          {
            content: `       ${rechnung.organisation?.name}`,
            colSpan: 2,
            styles: { fillColor: undefined, textColor: 0, fontSize: 11, valign: 'bottom' },
          },
          {
            content: 'Meta-Level Software AG',
            colSpan: 1,
            styles: { fillColor: undefined, textColor: 0, fontSize: 0, valign: 'bottom' },
          },
        ],
        [
          {
            content: `       ${rechnung.organisation?.strasse}`,
            colSpan: 2,
            styles: { fillColor: undefined, textColor: 0, fontSize: 11 },
          },
          {
            content: 'Lyonerring 1',
            colSpan: 1,
            styles: { fillColor: undefined, textColor: 0, fontSize: 10 },
          },
        ],
        [
          {
            content: `       ${rechnung.organisation?.plz} ${rechnung.organisation?.ort}`,
            colSpan: 2,
            styles: { fillColor: undefined, textColor: 0, fontSize: 11 },
          },
          {
            content: '66115 Saarbrücken',
            colSpan: 1,
            styles: { fillColor: undefined, textColor: 0, fontSize: 10 },
          },
        ],
        [
          {
            content: '',
            colSpan: 2,
            styles: { fillColor: undefined, textColor: 0, fontSize: 10 },
          },
          {
            content: `Rechnungsdatum: ${moment(rechnung.rechnungsdatum, 'DD.MM.YYYY HH:mm:ss').format('L')}`,
            colSpan: 1,
            styles: { fillColor: undefined, textColor: 0, fontSize: 10 },
          },
        ],

        [
          {
            content: 'Rechnung  >>Rechnungsnummer<< >>Kundennummer<<',
            colSpan: 3,
            styles: { fillColor: undefined, textColor: 0, fontSize: 14, minCellHeight: 30, valign: 'bottom' },
          },
        ],
        ['Titel', 'Zeitraum', 'Preis'],
      ],
      columns: [
        { header: '1', dataKey: 'name' },
        { header: '2', dataKey: 'zeitraum' },
        { header: '3', dataKey: 'preis' },
      ],
      body: this.getDataForExport(rechnung),

      foot: [
        [{ content: '', colSpan: 3, styles: { minCellHeight: 30 } }],
        [{ content: '', colSpan: 3 }],
        [
          {
            content: 'Bankverbindung:',
          },
          {
            content: 'Phantasiebank\nkto:12345\nblz:12345678',
          },
          {
            content: 'Phantasiebank2\nkto:0815\nblz:4711',
          },
        ],
      ],
      didParseCell: function (data: any) {
        // if (data.section === 'head') {
        //   if (data.row.index === 0) {
        //     data.row.
        //   }
        // }
        if (data.section === 'body') {
          // if (data.column.index % 2 === 0) {
          //   data.cell.styles.fillColor = [255, 255, 255];
          // } else {
          //   data.cell.styles.fillColor = [210, 210, 210];
          // }
          if (data.column.index === 0) {
            data.cell.styles.halign = 'left';
            data.cell.styles.cellWidth = 60;
          }
          if (data.column.index === 1) {
            data.cell.styles.halign = 'left';
            data.cell.styles.cellWidth = 60;
          }
          if (data.column.index === 2) {
            data.cell.styles.halign = 'right';
            data.cell.styles.cellWidth = 60;
          }
          if (data.row.index === data.table.body.length - 1) {
            data.cell.styles.fontStyle = 'bold';
          }
        }

        if (data.section === 'foot') {
          if (data.row.index === 2) {
            doc.setDrawColor(255, 0, 0);
            doc.line(
              data.cell.getTextPos().x,
              data.cell.getTextPos().y,
              data.cell.getTextPos().x + data.cell.width,
              data.cell.getTextPos().y,
            );
          }
        }
      },
      willDrawCell: function (data: any) {
        if (data.section === 'foot') {
          if (data.row.index === 2) {
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.3);
            doc.line(
              data.cell.getTextPos().x,
              data.cell.getTextPos().y - 2,
              data.cell.getTextPos().x + data.cell.width,
              data.cell.getTextPos().y - 2,
            );
          }
        }
      },
    });

    // Load image using browser Image API
    const img = new Image();
    img.src = 'assets/generator-black.svg';

    // Wait for image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });

    // Create canvas and draw image
    const myCanvas = document.createElement('canvas');
    myCanvas.width = img.width;
    myCanvas.height = img.height;
    const ctx = myCanvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const result = myCanvas.toDataURL();
      doc.addImage(result, 130, 15, (img.width / 10) * 2, (img.height / 10) * 2);
    }

    return doc;
  }

  setPdfTitle(doc: jsPDF): string {
    const title = 'AAS Generator Rechnung';
    doc.setProperties({
      title,
    });
    return title;
  }
  async print(rechnung: OrgaRechnung) {
    const doc = await this.createPdf(rechnung);
    if (doc) {
      this.setPdfTitle(doc);
      doc.autoPrint({ variant: 'non-conform' });
      doc.output('dataurlnewwindow');
    }
  }

  async download(rechnung: OrgaRechnung) {
    const doc = await this.createPdf(rechnung);
    {
      if (doc) {
        doc.save('Rechnung.pdf');
      }
    }
  }

  onShowActions(rechnung: OrgaRechnung) {
    this.menuItems = [
      {
        label: this.translate.instant('DOWNLOAD'),
        icon: 'pi pi-download',
        command: (_event) => {
          this.download(rechnung);
        },
      },
      {
        label: this.translate.instant('PRINT'),
        icon: 'pi pi-print',
        command: (_event) => {
          this.print(rechnung);
        },
      },
    ];
  }
}
