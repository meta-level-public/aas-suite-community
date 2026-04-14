import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import * as N3 from 'n3';

@Injectable({
  providedIn: 'root',
})
export class SiDatatypeDataService {
  loading = signal<boolean>(false);
  http = inject(HttpClient);

  quads = signal<any[]>([]);
  groupedData = signal<any[]>([]);
  flattenedData = signal<any[]>([]);
  flattenedDataKeys = signal<string[]>([]);

  constructor() {
    this.fetchTTLFile();
  }

  async fetchTTLFile() {
    try {
      const url = 'assets/lookups/si-units.ttl';

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
    let _i = 0;
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
    flattenedDataKeys.push('groupName');
    flattenedDataKeys.push('shortGroupName');

    let _i = 0;

    data.forEach((group) => {
      const obj: any = {};
      obj.groupName = group.groupName;
      obj.shortGroupName = group.groupName.split('/')[group.groupName.split('/').length - 1];
      if (!obj.shortGroupName.includes('_:n')) {
        group.data.forEach((quad: any) => {
          let shortPredicate = quad.predicate.value.split('#')[1];
          if (shortPredicate == null || shortPredicate === '') {
            shortPredicate = quad.predicate.value.split('/')[quad.predicate.value.split('/').length - 1];
          }
          if (shortPredicate != null && shortPredicate !== '') {
            if (!flattenedDataKeys.includes(shortPredicate)) {
              flattenedDataKeys.push(shortPredicate);
            }
            if (shortPredicate === 'label' || shortPredicate === 'comment' || shortPredicate === 'prefLabel') {
              // für alle Sprachen übernehmen!
              if (obj[shortPredicate] == null) {
                obj[shortPredicate] = [];
              }
              obj[shortPredicate].push({ label: quad.object.value, lang: quad.object.id.split('@')[1] });
            } else {
              obj[shortPredicate] = quad.object.value;
            }
          }
          obj[quad.predicate.value] = quad.object.value;
        });
        flattenedData.push(obj);
      }
    });
    this.flattenedDataKeys.set(flattenedDataKeys);
    this.flattenedData.set(flattenedData);
  }
}
