import { DateProxyPipe } from '@aas/common-pipes';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { AasConfirmationService } from '@aas/aas-designer-shared';
import { RequestForOfferService } from './request-for-offer.service';

import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver-es';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { RequestForOffer } from '@aas/aas-designer-shared';

function loadFile(url: any, callback: any) {
  PizZipUtils.getBinaryContent(url, callback);
}

@Component({
  selector: 'app-request-for-offer',
  imports: [ToolbarModule, TableModule, ButtonModule, TranslateModule, DateProxyPipe, MenuModule],
  styleUrls: ['../../host.scss'],
  templateUrl: './request-for-offer.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RequestForOfferComponent implements OnInit {
  requests: RequestForOffer[] = [];
  loading: boolean = false;
  menuItems: MenuItem[] = [];

  private requestsService = inject(RequestForOfferService);
  private translate = inject(TranslateService);
  private confirmationService = inject(AasConfirmationService);

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.requests = await this.requestsService.getAll();
    } finally {
      this.loading = false;
    }
  }

  onShowActions(request: RequestForOffer) {
    this.menuItems = [
      {
        label: this.translate.instant('CREATE_OFFER'),
        icon: 'pi pi-pencil',
        command: () => {
          this.createOffer(request);
        },
      },
      // {
      //   label: this.translate.instant('EDIT'),
      //   icon: 'pi pi-pencil',
      //   command: () => {
      //     this.showEditDialog(config);
      //   },
      // },
      {
        label: this.translate.instant('DELETE'),
        icon: 'pi pi-trash',
        command: () => {
          if (request.id != null) {
            this.deleteConfig(request.id);
          }
        },
      },
    ];
  }
  async deleteConfig(id: number) {
    if (
      await this.confirmationService.confirm({
        message: this.translate.instant('DELETE_CONFIG_Q'),
      })
    ) {
      await this.requestsService.delete(id);
      this.loadData();
    }
  }

  async createOffer(request: RequestForOffer, lang: string = '') {
    let fileToLoad = '';
    if (request.paymentPeriod === 'MONTHLY') fileToLoad = 'assets/offer' + lang + '.docx';
    if (request.paymentPeriod === 'YEARLY') fileToLoad = 'assets/offer_rabattiert' + lang + '.docx';
    loadFile(fileToLoad, function (error: Error | null, content: string) {
      if (error) {
        throw error;
      }
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      const validDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30);
      const data = {
        name: request.name,
        vorname: request.firstname,
        orga_name: request.organisation?.name,
        orga_strasse: request.organisation?.strasse,
        orga_plz: request.organisation?.plz,
        orga_ort: request.organisation?.ort,
        orga_land: request.organisation?.laenderCode,
        orga_email: request.organisation?.email,
        orga_phone: request.organisation?.telefon,
        angebotsgueltigkeit: validDate.getDate() + '.' + (validDate.getMonth() + 1) + '.' + validDate.getFullYear(),
        price: request.price.toFixed(2),
        sum_price: (request.price * 12).toFixed(2),
        price_rabatt: (request.price * 12 * 0.05).toFixed(2),
        sum_price_rabatt: (request.price * 12 - request.price * 12 * 0.05).toFixed(2),
      };
      doc.setData(data);
      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render();
      } catch (_error) {
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).

        // eslint-disable-next-line no-console
        console.log(error);

        throw error;
      }
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      // Output the document using Data-URI
      saveAs(out, 'output.docx');
    });
  }
}
