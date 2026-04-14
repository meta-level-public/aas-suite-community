import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import * as N3 from 'n3';

@Injectable({
  providedIn: 'root',
})
export class VecDataService {
  groupedData = signal<any[]>([]);
  flattenedData = signal<any[]>([]);
  flattenedDataKeys = signal<string[]>([]);
  loading = signal<boolean>(false);
  http = inject(HttpClient);

  constructor() {
    this.fetchTTLFile();
  }

  async fetchTTLFile() {
    try {
      // wurde von prostep offenbar verhindert
      // const url = 'https://ecad.prostep.org/ontologies/2024/03/vec#';
      const url = 'assets/lookups/vec.ttl';
      this.loading.set(true);

      this.http.get(url, { responseType: 'text' }).subscribe(
        (ttlData) => {
          this.parseTTLFile(ttlData);
        },
        (_error) => {
          // eslint-disable-next-line no-console
          console.log('Error fetching TTL file:', _error);
        },
      );
    } finally {
      this.loading.set(false);
    }
  }

  async parseTTLFile(ttlData: string) {
    const parser = new N3.Parser();
    const quads: any[] = [];
    parser.parse(ttlData, (_error: any, parsedQuad: any, _prefixes: any) => {
      if (parsedQuad) {
        quads.push(parsedQuad);
      } else {
        const groupedData: any[] = [];
        quads.forEach((quadItem) => {
          const found = groupedData.find((d) => d.groupName === quadItem.subject.id);
          if (!found) {
            groupedData.push({
              groupName: quadItem.subject.id,
              data: [quadItem],
            });
          } else {
            found.data.push(quadItem);
          }

          this.groupedData.set(groupedData);
        });
        this.flattenData();
      }
    });
  }

  flattenData() {
    const data = this.groupedData();
    const flattenedData: any[] = [];
    const flattenedDataKeys: string[] = [];

    data.forEach((group) => {
      const obj: any = {};
      obj.groupName = group.groupName;
      obj.shortGroupName = group.groupName.split('#')[1];
      if (obj.shortGroupName != null && obj.shortGroupName !== '') {
        group.data.forEach((quad: any) => {
          const colShort = quad.predicate.value.split('#')[1];

          if (colShort === 'type') {
            obj.typeShort = quad.object.value.split('#')[1];
            if (!flattenedDataKeys.includes('typeShort')) {
              flattenedDataKeys.push('typeShort');
            }
          }
          if (!flattenedDataKeys.includes(colShort)) {
            flattenedDataKeys.push(colShort);
          }
          if (colShort === 'label' || colShort === 'comment') {
            // für alle Sprachen übernehmen!
            if (obj[colShort] == null) {
              obj[colShort] = [];
            }
            obj[colShort].push({ label: quad.object.value, lang: quad.object.id.split('@')[1] });
          } else {
            obj[colShort] = quad.object.value;
          }
        });
        flattenedData.push(obj);
      }
    });

    this.flattenedDataKeys.set(flattenedDataKeys);
    this.flattenedData.set(flattenedData);
  }
}
