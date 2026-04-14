import { orderBy, uniqBy } from 'lodash-es';
import { ZipFile } from './zip-viewer.service';

export class ZipTree {
  key: string;
  path: string;
  files: ZipFile[];
  parent: any;
  children: ZipTree[];

  constructor(key: string, path: string, parent: any) {
    this.key = key;
    this.path = path;
    this.parent = parent;
    this.files = [];
    this.children = [];
  }

  hasChildren() {
    return this.children.length > 0;
  }

  hasFiles(): boolean {
    return this.files.length > 0;
  }

  addFiles(files: ZipFile[]) {
    const uniqList = uniqBy(files, 'fullName');
    const orderFiles = orderBy(uniqList, [(file) => file.name.toLowerCase()], ['asc']);

    this.files = [...orderFiles];
  }
}
