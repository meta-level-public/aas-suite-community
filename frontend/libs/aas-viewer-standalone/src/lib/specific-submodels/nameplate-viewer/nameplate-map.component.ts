import { AsyncPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { LeafletDirective, LeafletLayerDirective } from '@bluehalo/ngx-leaflet';
import * as Leaflet from 'leaflet';
import { tileLayer } from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

@Component({
  selector: 'aas-nameplate-map',
  templateUrl: './nameplate-map.component.html',
  imports: [LeafletDirective, LeafletLayerDirective, AsyncPipe],
})
export class NameplateMapComponent {
  street = input.required<string>();
  zip = input.required<string>();
  city = input.required<string>();

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
    const provider = new OpenStreetMapProvider();
    const query = `${this.street()}, ${this.zip()} ${this.city()}`;

    try {
      const results = await provider.search({ query });
      if (results.length > 0) {
        this.options.center = new Leaflet.LatLng(results[0].y, results[0].x);

        return Leaflet.marker([results[0].y, results[0].x], {
          icon: Leaflet.icon({
            iconUrl: 'assets/map-images/marker-icon-pcf.png',
            iconRetinaUrl: 'assets/map-images/marker-icon-2x-pcf.png',
            shadowUrl: 'assets/map-images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        });
      }
    } catch (_e) {
      return null;
    }

    return null;
  });
}
