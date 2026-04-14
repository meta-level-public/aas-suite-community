import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, output, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { lastValueFrom } from 'rxjs';
import { LookupSource } from './lookup-source';

@Component({
  selector: 'aas-additional-lookup-sources',
  imports: [AccordionModule, TranslateModule],
  templateUrl: './additional-lookup-sources.component.html',
})
export class AdditionalLookupSourcesComponent implements OnInit {
  http = inject(HttpClient);
  translate = inject(TranslateService);

  lookupSources = signal<LookupSource[]>([]);

  closeClicked = output();

  ngOnInit() {
    this.loadSources();
  }

  async loadSources() {
    const res = await lastValueFrom(this.http.get<LookupSource[]>('assets/lookups/additional-lookup-sources.json'));
    this.lookupSources.set(res);
  }

  close() {
    this.closeClicked.emit();
  }
}
