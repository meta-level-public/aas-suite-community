import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input, OnChanges } from '@angular/core';
import { LeafletDirective, LeafletLayerDirective } from '@bluehalo/ngx-leaflet';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';
import * as Leaflet from 'leaflet';
import { tileLayer } from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { PcfHelper } from '../pcf-helper';
@Component({
  selector: 'aas-pcf-address',
  templateUrl: './pcf-address.component.html',
  imports: [TableModule, PrimeTemplate, LeafletDirective, LeafletLayerDirective, TranslateModule],
})
export class PcfAddressComponent implements OnChanges {
  @Input({ required: true }) pcfAddress: SubmodelElementCollection | undefined | null;
  @Input({ required: true }) markerType: 'pcf' | 'tcf-handover' | 'tcf-takeover' = 'pcf';
  map: L.Map | undefined;

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

  layer: any;
  showLayer: boolean = false;

  async ngOnChanges() {
    if (this.lat && this.lng) {
      this.options.center = new Leaflet.LatLng(this.lat, this.lng);
      this.showLayer = true;
      this.layer = Leaflet.marker([this.lat, this.lng], {
        icon: Leaflet.icon({
          ...Leaflet.Icon.Default.prototype.options,
          iconUrl: `assets/map-images/marker-icon-${this.markerType}.png`,
          iconRetinaUrl: `assets/map-images/marker-icon-2x-${this.markerType}.png`,
          shadowUrl: 'assets/map-images/marker-shadow.png',
        }),
      });
    } else {
      const provider = new OpenStreetMapProvider();
      const query = `${this.street} ${this.housenumber}, ${this.zip} ${this.cityTown}`;
      const results = await provider.search({
        query: query,
      });
      if (results.length > 0) {
        this.showLayer = true;
        this.layer = Leaflet.marker([results[0].y, results[0].x], {
          icon: Leaflet.icon({
            ...Leaflet.Icon.Default.prototype.options,
            iconUrl: `assets/map-images/marker-icon-${this.markerType}.png`,
            iconRetinaUrl: `assets/map-images/marker-icon-2x-${this.markerType}.png`,
            shadowUrl: 'assets/map-images/marker-shadow.png',
          }),
        });

        this.options.center = new Leaflet.LatLng(results[0].y, results[0].x);
      } else {
        this.showLayer = false;
      }
    }
  }

  async onMapReady(map: Leaflet.Map) {
    this.map = map;
  }

  get smcIdShort() {
    return this.pcfAddress?.idShort ?? '';
  }

  get street() {
    return PcfHelper.getStreet(this.pcfAddress);
  }

  get housenumber() {
    return PcfHelper.getHousenumber(this.pcfAddress);
  }

  get zip() {
    return PcfHelper.getZip(this.pcfAddress);
  }

  get cityTown() {
    return PcfHelper.getCityTown(this.pcfAddress);
  }

  get countryCode() {
    return PcfHelper.getCountryCode(this.pcfAddress);
  }

  get lat() {
    return PcfHelper.getLat(this.pcfAddress);
  }

  get lng() {
    return PcfHelper.getLng(this.pcfAddress);
  }
}
