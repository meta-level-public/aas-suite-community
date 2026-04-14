import { cloneDeep, first } from 'lodash-es';
import { ZipTree } from './zip-tree';
import { FileStruct, ZipFile, ZipViewerService } from './zip-viewer.service';

export class FileTreeService {
  private readonly root: ZipTree;

  constructor(key: string) {
    this.root = new ZipTree(key, '', null);
  }

  getNodeByKey(key: string): any {
    for (const node of this.getTreeElement()) {
      if (node.key === key) {
        return node;
      }
    }
  }

  hasElement(key: string) {
    for (const node of this.getTreeElement()) {
      if (node.key === key) {
        return true;
      }
    }
    return false;
  }

  insert(parentNodeKey: string, value: ZipFile[]) {
    const rootPath = cloneDeep(parentNodeKey);
    const currentKey: string[] = rootPath.split('/').filter((v) => v !== '');
    this.addToTree(currentKey, rootPath, value);
  }

  private getRootElement() {
    return this.root;
  }

  private insertChild(parentNode: ZipTree, nodeKey: string, path: string, zipFiles: ZipFile[]) {
    const foundChild = parentNode.children.find((zT) => zT.key === nodeKey);

    if (foundChild) {
      foundChild.addFiles(zipFiles);
    } else {
      const newElement = new ZipTree(nodeKey, path, parentNode);
      newElement.addFiles(zipFiles);
      parentNode.children.push(newElement);
    }
  }

  private addToTree(keys: string[], rootPath: string, zipFiles: ZipFile[]) {
    if (keys?.length !== 0 && keys[0] !== '') {
      const folderValues = cloneDeep(keys);
      // Aktuelles Verzeichnis
      const currentRootPath = cloneDeep(rootPath) || '';
      // Aktuelles Verzeichnis der Datei
      const currentKey = first(zipFiles)?.folder || '';

      let parentFolder = ZipViewerService.getParent(currentKey, folderValues);

      folderValues.shift();

      if (this.hasElement(currentKey)) {
        // Erweitert vorhandenen Eintrag
        this.insertChild(this.getNodeByKey(currentKey)?.parent, currentKey, currentRootPath, zipFiles);
      } else if (this.hasElement(parentFolder)) {
        // Erweitert Eltern knoten um ein Element
        this.insertChild(this.getNodeByKey(parentFolder), currentKey, currentRootPath, zipFiles);
      } else {
        if (parentFolder === currentKey) parentFolder = '';

        this.insertChildNote(parentFolder, currentKey, currentRootPath, zipFiles);
      }

      if (folderValues?.length !== 0 && currentKey !== folderValues[0]) {
        this.addToTree(folderValues, rootPath, zipFiles);
      }
    }
  }

  private insertChildNote(parentNodeKey: string, key: string, path: string, zipFiles: ZipFile[]) {
    const node = this.getRootElement();
    if (node) {
      if (node.key === parentNodeKey) {
        this.insertChild(node, key, path, zipFiles);
      } else {
        const elementPath = path.replace(key + '/', '');
        if (zipFiles.length > 0 && zipFiles[0].folder === elementPath) {
          this.insertChild(node, key, elementPath, zipFiles);
        } else {
          // Fügt ein neues Eltern-Element mit child Element hinzu

          const newParentNode = new ZipTree(parentNodeKey, elementPath, node);

          const newChildNode = new ZipTree(key, path, newParentNode);

          let fileData: ZipFile[] = [];

          // Wenn File aus dem Folder ist, nur hinzufügen
          if (zipFiles.length > 0 && zipFiles.some((z) => z.folder === key)) {
            fileData = zipFiles;
          }

          newChildNode.addFiles(fileData);

          newParentNode.children.push(newChildNode);

          node.children.push(newParentNode);
        }
      }
    }
  }

  private *getTreeElement(node = this.root): any {
    // Aus Performance gründen mit yield beendet
    yield node;
    if (node.children.length) {
      for (const child of node.children) {
        yield* this.getTreeElement(child);
      }
    }
  }

  toTree(rootTree: FileStruct) {
    const fileTree = ZipViewerService.initFileTree(rootTree);

    if (this.root) {
      const data = cloneDeep(this.root);

      if (data.files) {
        // add root files to root tree
        const files = data.files.map((file) => {
          let fileIcon: string = '';
          if (!file.isDirectory) {
            fileIcon = ZipViewerService.getFileIcon(file.name);
          }
          return {
            key: ZipViewerService.buildNewKey(),
            label: file.name,
            icon: fileIcon,
          } as FileStruct;
        });
        fileTree[0].children?.push(...files);
      }

      if (data.children.length > 0) {
        data.children.forEach((zipData: ZipTree) => {
          ZipViewerService.addElements(zipData, fileTree[0]);
        });
      }
    }
    return fileTree;
  }
}
