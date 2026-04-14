import { ShellListDto, ShellsClient } from '@aas/webapi-client';
import { Injectable, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';

import { ShellListDtoNameplateData } from './shell-list-dto-nameplate-data';
import { ShellListDtoSubmodelData } from './shell-list-dto-submodel-data';
import { ShellListDtoThumbData } from './shell-list-dto-thumb-data';

@Injectable()
export class ShellsListStore {
  private static readonly maxConcurrentLoads = 6;

  constructor(
    private readonly shellsClient: ShellsClient,
    private readonly sanitizer: DomSanitizer,
  ) {}

  shells = signal<ShellListDto[]>([]);
  thumbDatas = signal<ShellListDtoThumbData[]>([]);
  submodelDatas = signal<ShellListDtoSubmodelData[]>([]);
  nameplateDatas = signal<ShellListDtoNameplateData[]>([]);

  private thumbDataById = new Map<string, ShellListDtoThumbData>();
  private thumbUrlCache = new Map<string, SafeResourceUrl>();
  private thumbObjectUrls = new Map<string, string>();
  private thumbLoadPromises = new Map<string, Promise<void>>();

  private submodelDataById = new Map<string, ShellListDtoSubmodelData>();
  private submodelCache = new Map<string, ShellListDtoSubmodelData['submodelMetadata']>();
  private submodelLoadPromises = new Map<string, Promise<void>>();

  private nameplateDataById = new Map<string, ShellListDtoNameplateData>();
  private nameplateCache = new Map<string, ShellListDtoNameplateData['nameplateData']>();
  private nameplateLoadPromises = new Map<string, Promise<void>>();
  private activeLoadCount = 0;
  private readonly pendingLoadQueue: Array<() => void> = [];

  async applyShellsResult(shells: ShellListDto[], visibleFields: string[]): Promise<void> {
    this.shells.set(shells);
    await this.refreshVisibleColumnData(visibleFields);
  }

  async refreshVisibleColumnData(visibleFields: string[]): Promise<void> {
    const loadTasks: Promise<void>[] = [];

    if (visibleFields.includes('thumbnail')) {
      loadTasks.push(this.startLoadingThumbs());
    }
    if (visibleFields.includes('productDesignation')) {
      loadTasks.push(this.startLoadingNameplates());
    }
    if (visibleFields.includes('containedSubmodels')) {
      loadTasks.push(this.startLoadingSubmodels());
    }

    if (loadTasks.length > 0) {
      await Promise.allSettled(loadTasks);
    }
  }

  getThumb(shellId: string) {
    return this.thumbDataById.get(shellId);
  }

  ensureThumbLoaded(shellId: string): Promise<void> {
    const thumbData = this.getThumb(shellId);
    if (
      !thumbData ||
      thumbData.thumbLoaded ||
      thumbData.thumbLoading ||
      (thumbData.requested && thumbData.thumbError)
    ) {
      return Promise.resolve();
    }

    thumbData.thumbLoading = true;
    thumbData.thumbError = false;
    this.thumbDatas.set([...this.thumbDatas()]);

    return this.loadThumb(thumbData);
  }

  async onThumbnailError(shellId: string): Promise<void> {
    const thumbData = this.getThumb(shellId);
    if (!thumbData) {
      return;
    }

    if (thumbData.fallbackAttempted) {
      thumbData.thumbError = true;
      thumbData.thumbLoaded = false;
      this.thumbDatas.set([...this.thumbDatas()]);
      return;
    }

    thumbData.fallbackAttempted = true;
    thumbData.thumbLoading = true;
    thumbData.thumbLoaded = false;
    thumbData.thumbError = false;
    this.thumbDatas.set([...this.thumbDatas()]);

    try {
      await this.loadThumb(thumbData);
    } catch (_e) {
      thumbData.thumbError = true;
    } finally {
      this.thumbDatas.set([...this.thumbDatas()]);
    }
  }

  getSubmodels(shellId: string) {
    return this.submodelDataById.get(shellId);
  }

  getNameplateData(shellId: string) {
    return this.nameplateDataById.get(shellId);
  }

  ensureSubmodelsLoaded(shellId: string): void {
    const smData = this.getSubmodels(shellId);
    if (!smData || smData.requested || smData.dataLoading) {
      return;
    }

    smData.dataLoading = true;
    this.submodelDatas.set([...this.submodelDatas()]);
    void this.loadSubmodels(smData);
  }

  ensureNameplateLoaded(shellId: string): void {
    const nameplateData = this.getNameplateData(shellId);
    if (!nameplateData || nameplateData.requested || nameplateData.dataLoading) {
      return;
    }

    nameplateData.dataLoading = true;
    this.nameplateDatas.set([...this.nameplateDatas()]);
    void this.loadNameplate(nameplateData);
  }

  destroy(): void {
    for (const objectUrl of this.thumbObjectUrls.values()) {
      URL.revokeObjectURL(objectUrl);
    }
    this.thumbObjectUrls.clear();
  }

  private async startLoadingThumbs(): Promise<void> {
    const previousById = new Map(this.thumbDatas().map((t) => [t.shellListDtoId, t]));
    const thumbDatas: ShellListDtoThumbData[] = [];

    this.shells().forEach((shell) => {
      if (shell.id == null) {
        return;
      }

      const existing = previousById.get(shell.id);
      if (existing) {
        thumbDatas.push(existing);
        return;
      }

      const thumbData = new ShellListDtoThumbData();
      thumbData.shellListDtoId = shell.id;

      if (this.thumbUrlCache.has(thumbData.shellListDtoId)) {
        thumbData.fileUrl = this.thumbUrlCache.get(thumbData.shellListDtoId);
        thumbData.thumbLoaded = true;
        thumbData.thumbError = false;
        thumbData.requested = true;
      }

      thumbDatas.push(thumbData);
    });

    this.thumbDataById = new Map(thumbDatas.map((t) => [t.shellListDtoId, t]));
    this.thumbDatas.set(thumbDatas);
  }

  private async loadThumb(thumbData: ShellListDtoThumbData): Promise<void> {
    const shellId = thumbData.shellListDtoId;
    const runningTask = this.thumbLoadPromises.get(shellId);
    if (runningTask) {
      await runningTask;
      return;
    }

    const task = this.enqueueLimited(async () => {
      try {
        thumbData.requested = true;
        const res = await lastValueFrom(this.shellsClient.shells_GetThumbnail(shellId));
        thumbData.fileData = res.data;
        if (thumbData.fileData != null) {
          const resourceUrl = await this.createThumbResourceUrl(shellId, thumbData.fileData);
          thumbData.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl);
          this.thumbUrlCache.set(shellId, thumbData.fileUrl);
          thumbData.thumbLoaded = true;
          thumbData.thumbError = false;
        } else {
          thumbData.thumbError = true;
          thumbData.thumbLoaded = false;
        }
      } catch (_e) {
        thumbData.thumbError = true;
        thumbData.thumbLoaded = false;
      } finally {
        thumbData.thumbLoading = false;
        this.thumbLoadPromises.delete(shellId);
        this.thumbDatas.set([...this.thumbDatas()]);
      }
    });

    this.thumbLoadPromises.set(shellId, task);
    await task;
  }

  private async startLoadingSubmodels(): Promise<void> {
    const previousById = new Map(this.submodelDatas().map((t) => [t.shellListDtoId, t]));
    const smDatas: ShellListDtoSubmodelData[] = [];

    this.shells().forEach((shell) => {
      if (shell.id == null) {
        return;
      }

      const existing = previousById.get(shell.id);
      if (existing) {
        smDatas.push(existing);
        return;
      }

      const smData = new ShellListDtoSubmodelData();
      smData.shellListDtoId = shell.id;
      if (this.submodelCache.has(smData.shellListDtoId)) {
        smData.submodelMetadata = this.submodelCache.get(smData.shellListDtoId);
        smData.requested = true;
      }
      smDatas.push(smData);
    });

    this.submodelDataById = new Map(smDatas.map((t) => [t.shellListDtoId, t]));
    this.submodelDatas.set(smDatas);
  }

  private async loadSubmodels(smData: ShellListDtoSubmodelData): Promise<void> {
    const shellId = smData.shellListDtoId;
    const runningTask = this.submodelLoadPromises.get(shellId);
    if (runningTask) {
      await runningTask;
      return;
    }

    const task = this.enqueueLimited(async () => {
      try {
        smData.requested = true;
        const sms = await lastValueFrom(this.shellsClient.shells_GetContainedSubmdels(shellId));
        smData.submodelMetadata = sms.containedSubmodels;
        this.submodelCache.set(shellId, smData.submodelMetadata);
      } catch (_e) {
        smData.requested = false;
      } finally {
        smData.dataLoading = false;
        this.submodelLoadPromises.delete(shellId);
        this.submodelDatas.set([...this.submodelDatas()]);
      }
    });

    this.submodelLoadPromises.set(shellId, task);
    await task;
  }

  private async startLoadingNameplates(): Promise<void> {
    const previousById = new Map(this.nameplateDatas().map((t) => [t.shellListDtoId, t]));
    const nameplateDatas: ShellListDtoNameplateData[] = [];

    this.shells().forEach((shell) => {
      if (shell.id == null) {
        return;
      }

      const existing = previousById.get(shell.id);
      if (existing) {
        nameplateDatas.push(existing);
        return;
      }

      const nameplateData = new ShellListDtoNameplateData();
      nameplateData.shellListDtoId = shell.id;
      if (this.nameplateCache.has(nameplateData.shellListDtoId)) {
        nameplateData.nameplateData = this.nameplateCache.get(nameplateData.shellListDtoId);
        nameplateData.requested = true;
      }
      nameplateDatas.push(nameplateData);
    });

    this.nameplateDataById = new Map(nameplateDatas.map((t) => [t.shellListDtoId, t]));
    this.nameplateDatas.set(nameplateDatas);
  }

  private async loadNameplate(nameplateData: ShellListDtoNameplateData): Promise<void> {
    const shellId = nameplateData.shellListDtoId;
    const runningTask = this.nameplateLoadPromises.get(shellId);
    if (runningTask) {
      await runningTask;
      return;
    }

    const task = this.enqueueLimited(async () => {
      try {
        nameplateData.requested = true;
        nameplateData.nameplateData = await lastValueFrom(this.shellsClient.shells_GetNameplateInfos(shellId));
        this.nameplateCache.set(shellId, nameplateData.nameplateData);
      } catch (_e) {
        nameplateData.requested = false;
      } finally {
        nameplateData.dataLoading = false;
        this.nameplateLoadPromises.delete(shellId);
        this.nameplateDatas.set([...this.nameplateDatas()]);
      }
    });

    this.nameplateLoadPromises.set(shellId, task);
    await task;
  }

  private async enqueueLimited<T>(taskFactory: () => Promise<T>): Promise<T> {
    if (this.activeLoadCount >= ShellsListStore.maxConcurrentLoads) {
      await new Promise<void>((resolve) => this.pendingLoadQueue.push(resolve));
    }

    this.activeLoadCount += 1;

    try {
      return await taskFactory();
    } finally {
      this.activeLoadCount -= 1;
      const nextTask = this.pendingLoadQueue.shift();
      nextTask?.();
    }
  }

  private disposeThumbObjectUrl(shellId: string): void {
    const previousObjectUrl = this.thumbObjectUrls.get(shellId);
    if (previousObjectUrl) {
      URL.revokeObjectURL(previousObjectUrl);
      this.thumbObjectUrls.delete(shellId);
    }
  }

  private async createThumbResourceUrl(shellId: string, fileData: Blob): Promise<string> {
    if (typeof URL.createObjectURL === 'function') {
      const objectUrl = URL.createObjectURL(fileData);
      this.disposeThumbObjectUrl(shellId);
      this.thumbObjectUrls.set(shellId, objectUrl);
      return objectUrl;
    }

    return this.createDataUrl(fileData);
  }

  private async createDataUrl(fileData: Blob): Promise<string> {
    const bytes = new Uint8Array(await fileData.arrayBuffer());
    let binary = '';

    for (let index = 0; index < bytes.length; index += 0x8000) {
      const chunk = bytes.subarray(index, index + 0x8000);
      binary += String.fromCharCode(...chunk);
    }

    const base64 = btoa(binary);
    const mimeType = fileData.type || 'application/octet-stream';
    return `data:${mimeType};base64,${base64}`;
  }
}
