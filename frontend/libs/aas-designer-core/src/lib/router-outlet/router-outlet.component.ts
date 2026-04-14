import { Component, EventEmitter, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'aas-router-outlet',
  templateUrl: './router-outlet.component.html',
  styleUrls: ['./router-outlet.component.scss'],
  imports: [RouterOutlet],
  host: {
    class: 'flex flex-col flex-1 min-h-0',
  },
})
export class RouterOutletComponent {
  @Output() deactivate = new EventEmitter<unknown>();
}
