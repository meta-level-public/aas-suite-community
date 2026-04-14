import { MenuAction } from '@aas-designer-model';
import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private itemsSource = new Subject<MenuItem[]>();
  private actionsSource = new Subject<MenuAction[]>();

  itemsHandler = this.itemsSource.asObservable();
  actionsHandler = this.actionsSource.asObservable();

  setItems(items: MenuItem[]) {
    this.itemsSource.next(items);
  }

  setActions(actions: MenuAction[]) {
    this.actionsSource.next(actions);
  }
}
