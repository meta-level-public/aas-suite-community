import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { SplitterModule } from 'primeng/splitter';
import { SidebarTreeNavComponent } from '../../general/sidebar-tree-nav/sidebar-tree-nav.component';

@Component({
  selector: 'aas-userdata',
  imports: [SplitterModule, TranslateModule, RouterModule, SidebarTreeNavComponent],
  templateUrl: './my-userdata.component.html',
  styleUrls: ['../../../host.scss'],
})
export class MyUserdataComponent {
  areas = signal<TreeNode[]>([]);
  selectedNodeKey: string | null = null;
  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor() {
    const areas: TreeNode[] = [
      { key: 'profile', label: 'PROFILE', data: { value: 'profile' }, icon: 'pi pi-user', expanded: true },
      {
        key: 'organisations',
        label: 'ORGANISATIONS',
        data: { value: 'organisations' },
        icon: 'pi pi-building',
        expanded: true,
      },
      { key: 'addresses', label: 'ADDRESSES', data: { value: 'addresses' }, icon: 'pi pi-map-marker', expanded: true },
      {
        key: 'product-root',
        label: 'PRODUCT_ROOTS',
        data: { value: 'product-root' },
        icon: 'pi pi-sitemap',
        expanded: true,
      },
      {
        key: 'product-family',
        label: 'PRODUCT_FAMILIES',
        data: { value: 'product-family' },
        icon: 'pi pi-tags',
        expanded: true,
      },
      {
        key: 'product-designation',
        label: 'PRODUCT_DESIGNATIONS',
        data: { value: 'product-designation' },
        icon: 'pi pi-box',
        expanded: true,
      },
      { key: 'snippets', label: 'SNIPPETS', data: { value: 'snippets' }, icon: 'pi pi-file-edit', expanded: true },
      {
        key: 'shared-links',
        label: 'SHARED_LINKS',
        data: { value: 'shared-links' },
        icon: 'pi pi-share-alt',
        expanded: true,
      },
    ];
    this.areas.set(areas);

    this.syncSelectionFromRoute();
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncSelectionFromRoute();
      }
    });
  }

  selectPage(entry: TreeNode) {
    const value = entry.data?.value;
    if (value == null) {
      return;
    }

    this.router.navigate([value], { relativeTo: this.route });
  }

  private syncSelectionFromRoute() {
    const currentPath = this.router.url.split('?')[0].split('#')[0].split('/').pop();
    if (currentPath == null || currentPath === '') {
      this.selectedNodeKey = null;
      return;
    }

    this.selectedNodeKey = this.areas().find((node) => node.data?.value === currentPath)?.key ?? null;
  }
}
