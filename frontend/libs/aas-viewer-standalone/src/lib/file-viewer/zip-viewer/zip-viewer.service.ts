import { Injectable } from '@angular/core';
import { cloneDeep, toLower } from 'lodash-es';
import { PrimeIcons, TreeNode } from 'primeng/api';
import { v4 as uuid } from 'uuid';
import { FileTreeService } from './tree-viewer';
import { ZipTree } from './zip-tree';

@Injectable({
  providedIn: 'root',
})
export class ZipViewerService {
  static initFileTree(rootTree: FileStruct) {
    const fileTree: TreeNode[] = [];
    fileTree.push(rootTree);
    return fileTree;
  }

  static getFileIcon(file: string): string {
    const fileName = toLower(file);
    const imageFiles = ['.gif', '.png', '.jpg', '.svg', '.webp'];
    let fileIcon = PrimeIcons.FILE;
    if (file.endsWith('.pdf')) {
      fileIcon = PrimeIcons.FILE_PDF;
    } else if (imageFiles.some((extension) => fileName.endsWith(extension))) {
      fileIcon = PrimeIcons.IMAGE;
    } else if (fileName.endsWith('.doc')) {
      // Ist in den PrimeIcons aktuell nicht enthalten als constante 13.10.2022
      fileIcon = 'pi pi-file-word';
    } else if (fileName.endsWith('.xlsx')) {
      fileIcon = PrimeIcons.FILE_EXCEL;
    }
    return fileIcon;
  }

  initTree(name: string, data: any) {
    const rootTree: FileStruct = {
      key: ZipViewerService.buildNewKey(),
      label: cloneDeep(name) as string,
      data: 'Root Folder',
      expandedIcon: PrimeIcons.FOLDER_OPEN,
      collapsedIcon: PrimeIcons.FOLDER,
      children: [],
    };

    const fileTree: FileTreeService = new FileTreeService('');
    Object.keys(data).forEach((key) => {
      const zipFile: ZipFile[] = this.getZipFile(key, data);

      if (fileTree.hasElement(key)) {
        const treeNode = fileTree.getNodeByKey(key);
        treeNode?.addFiles(zipFile);
      } else {
        fileTree.insert(key, zipFile);
      }
    });

    return fileTree.toTree(rootTree);
  }

  static addElements(zipData: ZipTree, parentNode: TreeNode<any>) {
    // build folder
    const folder: FileStruct = {
      key: ZipViewerService.buildNewKey(),
      label: zipData.key,
      expandedIcon: PrimeIcons.FOLDER_OPEN,
      collapsedIcon: PrimeIcons.FOLDER,
      children: [],
    };

    if (zipData.hasFiles()) {
      const files = zipData.files.map((file) => {
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
      folder.children = [...files];
    }

    if (zipData.hasChildren()) {
      zipData.children.forEach((element) => {
        this.addElements(element, folder);
      });
    }

    parentNode.children?.push(folder);
  }

  private getZipFile(key: string, data: any) {
    return cloneDeep(data[key])?.flatMap((zipData: any) => {
      return {
        fullName: zipData?.fullName,
        lastWriteTime: zipData?.lastWriteTime,
        name: zipData?.name,
        size: zipData?.size,
        isDirectory: zipData?.isDirectory,
        path: zipData?.path,
        folder: zipData?.folder,
      } as ZipFile;
    });
  }

  static buildNewKey(): string {
    return uuid();
  }

  static getParent(currentKey: string, copyValues: string[]): string {
    let parent = copyValues.indexOf(currentKey);

    if (copyValues.indexOf(currentKey) !== 0) {
      parent = parent - 1;
    }

    return copyValues[parent] || '';
  }
}

export interface ZipFile {
  fullName: string;
  lastWriteTime: string;
  name: string;
  size: number;
  isDirectory: boolean;
  path: string;
  folder: string;
}

export interface FileStruct {
  key?: string;
  label: string;
  data?: any;
  icon?: string;
  expandedIcon?: string;
  collapsedIcon?: string;
  leaf?: boolean;
  expanded?: boolean;
  type?: string;
  children?: FileStruct[];
}
