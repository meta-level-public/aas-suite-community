import { Injectable } from '@angular/core';
import { DirtyCheckable } from '@aas-designer-model';

@Injectable({
  providedIn: 'root',
})
export class ActiveComponentsService {
  #components: DirtyCheckable[] = [];
  register(component: DirtyCheckable) {
    if (!this.#components.includes(component)) this.#components.push(component);
  }
  unregister(component: DirtyCheckable) {
    const index = this.#components.indexOf(component);
    if (index !== -1) this.#components.splice(index, 1);
  }

  get components() {
    return this.#components;
  }
}
