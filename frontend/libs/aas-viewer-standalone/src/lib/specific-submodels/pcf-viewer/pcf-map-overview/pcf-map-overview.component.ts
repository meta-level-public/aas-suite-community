import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';

import { Component, Input, OnChanges } from '@angular/core';
import { LeafletDirective, LeafletLayersDirective } from '@bluehalo/ngx-leaflet';
import * as Leaflet from 'leaflet';
import { tileLayer } from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { PcfHelper } from '../pcf-helper';

@Component({
  selector: 'aas-pcf-map-overview',
  templateUrl: './pcf-map-overview.component.html',
  imports: [LeafletDirective, LeafletLayersDirective],
})
export class PcfMapOverviewComponent implements OnChanges {
  @Input({ required: true }) pcfList: SubmodelElementCollection[] = [];
  @Input({ required: true }) tcfList: SubmodelElementCollection[] = [];

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

  async ngOnChanges() {
    this.layers = [];
    const provider = new OpenStreetMapProvider();

    if (this.pcfList != null) {
      this.createPcfLayerFromSmcList(this.pcfList, provider);
    }
    if (this.tcfList != null) {
      this.createLayerFromSmcList(this.tcfList, provider);
    }
  }

  createLayerFromSmcList(smcList: SubmodelElementCollection[], provider: OpenStreetMapProvider) {
    smcList.forEach(async (smc) => {
      let addr = PcfHelper.getTcfHandoverAddress(smc);

      let lat = PcfHelper.getLat(addr);
      let lng = PcfHelper.getLng(addr);

      if (lat && lng) {
        this.addLayer(lat, lng, 'tcf-handover');
      } else {
        const results = await provider.search({
          query: `${PcfHelper.getStreet(addr)} ${PcfHelper.getHousenumber(addr)}, ${PcfHelper.getZip(
            addr,
          )} ${PcfHelper.getCityTown(addr)}`,
        });
        if (results.length > 0) {
          this.addLayer(results[0].y, results[0].x, 'tcf-handover');
        }
      }

      addr = PcfHelper.getTcfTakeoverAddress(smc);

      lat = PcfHelper.getLat(addr);
      lng = PcfHelper.getLng(addr);

      if (lat && lng) {
        this.addLayer(lat, lng, 'tcf-takeover');
      } else {
        const results = await provider.search({
          query: `${PcfHelper.getStreet(addr)} ${PcfHelper.getHousenumber(addr)}, ${PcfHelper.getZip(
            addr,
          )} ${PcfHelper.getCityTown(addr)}`,
        });
        if (results.length > 0) {
          this.addLayer(results[0].y, results[0].x, 'tcf-takeover');
        }
      }
    });
  }
  createPcfLayerFromSmcList(smcList: SubmodelElementCollection[], provider: OpenStreetMapProvider) {
    smcList.forEach(async (smc) => {
      const addr = PcfHelper.getPcfAddress(smc);

      const lat = PcfHelper.getLat(addr);
      const lng = PcfHelper.getLng(addr);

      if (lat && lng) {
        this.addLayer(lat, lng, 'pcf');
      } else {
        const results = await provider.search({
          query: `${PcfHelper.getStreet(addr)} ${PcfHelper.getHousenumber(addr)}, ${PcfHelper.getZip(
            addr,
          )} ${PcfHelper.getCityTown(addr)}`,
        });
        if (results.length > 0) {
          this.addLayer(results[0].y, results[0].x, 'pcf');
        }
      }
    });
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
