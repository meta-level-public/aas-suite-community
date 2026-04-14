import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input, OnChanges } from '@angular/core';
import { LeafletDirective, LeafletLayersDirective } from '@bluehalo/ngx-leaflet';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';
import * as Leaflet from 'leaflet';
import { tileLayer } from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { PcfHelper } from '../pcf-helper';
@Component({
  selector: 'aas-tcf-address',
  templateUrl: './tcf-address.component.html',
  imports: [TableModule, PrimeTemplate, LeafletDirective, LeafletLayersDirective, TranslateModule],
})
export class TcfAddressComponent implements OnChanges {
  @Input({ required: true }) takeoverAddress: SubmodelElementCollection | undefined | null;
  @Input({ required: true }) handoverAddress: SubmodelElementCollection | undefined | null;
  map: L.Map | undefined;
  PcfHelper = PcfHelper;

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

  layers: any[] = [];
  showLayer: boolean = false;

  async ngOnChanges() {
    const provider = new OpenStreetMapProvider();

    let lat = PcfHelper.getLat(this.handoverAddress);
    let lng = PcfHelper.getLng(this.handoverAddress);

    if (lat && lng) {
      this.addLayer(lat, lng, 'tcf-handover');
    } else {
      const results = await provider.search({
        query: `${PcfHelper.getStreet(this.handoverAddress)} ${PcfHelper.getHousenumber(
          this.handoverAddress,
        )}, ${PcfHelper.getZip(this.handoverAddress)} ${PcfHelper.getCityTown(this.handoverAddress)}`,
      });
      if (results.length > 0) {
        this.addLayer(results[0].y, results[0].x, 'tcf-handover');
      }
    }

    lat = PcfHelper.getLat(this.takeoverAddress);
    lng = PcfHelper.getLng(this.takeoverAddress);

    if (lat && lng) {
      this.addLayer(lat, lng, 'tcf-takeover');
    } else {
      const results = await provider.search({
        query: `${PcfHelper.getStreet(this.takeoverAddress)} ${PcfHelper.getHousenumber(
          this.takeoverAddress,
        )}, ${PcfHelper.getZip(this.takeoverAddress)} ${PcfHelper.getCityTown(this.takeoverAddress)}`,
      });
      if (results.length > 0) {
        this.addLayer(results[0].y, results[0].x, 'tcf-takeover');
      }
    }
  }

  async onMapReady(map: Leaflet.Map) {
    this.map = map;
  }

  addLayer(lat: number, lng: number, markerType: 'pcf' | 'tcf-handover' | 'tcf-takeover') {
    this.layers.push(
      Leaflet.marker([lat, lng], {
        icon: Leaflet.icon({
          ...Leaflet.Icon.Default.prototype.options,
          iconUrl: `assets/map-images/marker-icon-${markerType}.png`,
          iconRetinaUrl: `assets/map-images/marker-icon-2x-${markerType}.png`,
          shadowUrl: 'assets/map-images/marker-shadow.png',
        }),
      }),
    );
  }
}
