import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as Leaflet from 'leaflet';
import { tileLayer } from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { ContactInformation } from './contact-information';

@Component({
  selector: 'aas-contact-information-map',
  imports: [CommonModule, LeafletModule],
  templateUrl: './contact-information-map.component.html',
  styleUrls: ['./contact-information-map.component.css'],
})
export class ContactInformationMap {
  contactInformation = input.required<ContactInformation>();
  showLayer = input.required<boolean>();

  options: Leaflet.MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '<a href="https://www.meta-level.de" target="_blank"> &copy; Meta Level Software AG, 2024</a>',
      }),
    ],
    zoom: 5,
    center: new Leaflet.LatLng(51.1642292, 10.4541194),
  };

  layer = computed(async () => {
    const showLayer = this.showLayer(); // trigger
    if (showLayer === true) {
      try {
        const provider = new OpenStreetMapProvider();
        const query = `${this.contactInformation().street}, ${this.contactInformation().zip} ${this.contactInformation().city}`;
        const results = await provider.search({
          query: query,
        });
        if (results.length > 0) {
          this.options.center = new Leaflet.LatLng(results[0].y, results[0].x);
          return Leaflet.marker([results[0].y, results[0].x], {
            icon: Leaflet.icon({
              ...Leaflet.Icon.Default.prototype.options,
              iconUrl: 'assets/map-images/marker-icon-pcf.png',
              iconRetinaUrl: 'assets/map-images/marker-icon-2x-pcf.png',
              shadowUrl: 'assets/map-images/marker-shadow.png',
            }),
          });
        }
      } catch (_e) {
        // ignore;
      }
    }
    return null;
  });
}
