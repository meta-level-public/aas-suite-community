import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { SemanticIdHelper } from '@aas/helpers';
import { AfterViewInit, Component, computed, effect, ElementRef, input, signal, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';

interface AddressInfo {
  stepIndex: number;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
}

@Component({
  selector: 'aas-address-map',
  imports: [TranslateModule],
  templateUrl: './address-map.component.html',
  styleUrls: ['./address-map.component.css'],
})
export class AddressMapComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  steps = input.required<aas.types.SubmodelElementCollection[]>();
  initiallyExpanded = input(true);

  private readonly ADDRESS_INFORMATION_SEMANTIC_ID =
    'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation';

  // Semantic IDs für die Adressfelder
  private readonly SEMANTIC_IDS = {
    STREET: '0173-1#02-AAO128#002',
    CITY_TOWN: '0173-1#02-AAO132#002',
    NATIONAL_CODE: '0173-1#02-AAO134#002',
    ZIP_CODE: '0173-1#02-AAO129#002',
    COMPANY: '0173-1#02-AAW001#001',
  };
  private map: L.Map | undefined;
  private markerLayer: L.LayerGroup | undefined;
  private routeLayer: L.LayerGroup | undefined;
  private readonly viewInitialized = signal(false);
  private readonly geocodeCache = new Map<string, { lat: number; lng: number } | null>();
  private readonly pendingGeocodeRequests = new Map<string, Promise<{ lat: number; lng: number } | null>>();
  private lastRenderedSignature = '';
  private overviewStateInitialized = false;
  overviewExpanded = signal(true);
  expandedStepIndexes = signal<number[]>([]);

  // Computed signal für alle Adressen aus den Steps
  addresses = computed(() => {
    const stepList = this.steps();
    const addressList: AddressInfo[] = [];

    stepList.forEach((step, index) => {
      if (step.value && Array.isArray(step.value)) {
        const addressElement = step.value.find((element) =>
          SemanticIdHelper.hasSemanticId(element, this.ADDRESS_INFORMATION_SEMANTIC_ID),
        ) as aas.types.SubmodelElementCollection;

        if (addressElement && 'value' in addressElement && Array.isArray(addressElement.value)) {
          const addressInfo: AddressInfo = { stepIndex: index };

          // Extrahiere Adressdaten basierend auf Semantic IDs
          addressElement.value.forEach((addrField) => {
            if (SemanticIdHelper.hasSemanticId(addrField, this.SEMANTIC_IDS.STREET)) {
              // Street ist MultiLanguageProperty
              const mlp = addrField as aas.types.MultiLanguageProperty;
              if (mlp.value && Array.isArray(mlp.value) && mlp.value.length > 0) {
                addressInfo.address = mlp.value[0].text;
              }
            } else if (SemanticIdHelper.hasSemanticId(addrField, this.SEMANTIC_IDS.CITY_TOWN)) {
              // CityTown ist MultiLanguageProperty
              const mlp = addrField as aas.types.MultiLanguageProperty;
              if (mlp.value && Array.isArray(mlp.value) && mlp.value.length > 0) {
                addressInfo.city = mlp.value[0].text;
              }
            } else if (SemanticIdHelper.hasSemanticId(addrField, this.SEMANTIC_IDS.NATIONAL_CODE)) {
              // NationalCode ist MultiLanguageProperty
              const mlp = addrField as aas.types.MultiLanguageProperty;
              if (mlp.value && Array.isArray(mlp.value) && mlp.value.length > 0) {
                addressInfo.country = mlp.value[0].text;
              }
            } else if (SemanticIdHelper.hasSemanticId(addrField, this.SEMANTIC_IDS.ZIP_CODE)) {
              // Zipcode ist MultiLanguageProperty
              const mlp = addrField as aas.types.MultiLanguageProperty;
              if (mlp.value && Array.isArray(mlp.value) && mlp.value.length > 0) {
                addressInfo.zipCode = mlp.value[0].text;
              }
            }
          });
          if (addressInfo.address || addressInfo.city) {
            addressList.push(addressInfo);
          }
        }
      }
    });

    return addressList;
  });

  addressSignature = computed(() =>
    JSON.stringify(
      this.addresses().map((address) => ({
        stepIndex: address.stepIndex,
        address: address.address ?? '',
        city: address.city ?? '',
        country: address.country ?? '',
        zipCode: address.zipCode ?? '',
      })),
    ),
  );

  constructor() {
    this.fixLeafletIcons();

    effect(() => {
      const initiallyExpanded = this.initiallyExpanded();
      if (this.overviewStateInitialized) {
        return;
      }

      this.overviewExpanded.set(initiallyExpanded);
      this.overviewStateInitialized = true;
    });

    effect(() => {
      const isReady = this.viewInitialized();
      const signature = this.addressSignature();
      const isExpanded = this.overviewExpanded();
      if (!isReady || !isExpanded || signature === '[]' || signature === this.lastRenderedSignature) {
        return;
      }

      this.lastRenderedSignature = signature;
      this.renderAddresses(this.addresses());
    });

    effect(() => {
      const isReady = this.viewInitialized();
      const isExpanded = this.overviewExpanded();
      if (!isReady || !isExpanded || this.map == null) {
        return;
      }

      setTimeout(() => this.map?.invalidateSize(), 100);
    });
  }

  ngAfterViewInit() {
    this.viewInitialized.set(true);
  }

  toggleOverview() {
    this.overviewExpanded.update((value) => !value);
  }

  toggleStep(stepIndex: number) {
    this.expandedStepIndexes.update((indexes) =>
      indexes.includes(stepIndex) ? indexes.filter((index) => index !== stepIndex) : [...indexes, stepIndex],
    );
  }

  isStepExpanded(stepIndex: number) {
    return this.expandedStepIndexes().includes(stepIndex);
  }

  private renderAddresses(addressList: AddressInfo[]) {
    setTimeout(() => {
      this.initializeMap();
      this.addAddressMarkers(addressList);
    }, 0);
  }

  private fixLeafletIcons() {
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private createNumberedMarker(lat: number, lng: number, stepNumber: number): L.Marker {
    const numberIcon = L.divIcon({
      className: 'numbered-marker',
      html: `<div class="marker-circle">${stepNumber}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });

    return L.marker([lat, lng], { icon: numberIcon });
  }

  private drawRouteLines(coordinates: L.LatLng[]): void {
    if (!this.routeLayer || coordinates.length < 2) return;

    L.polyline(coordinates, {
      color: '#2e7d32',
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 5',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.routeLayer);
  }

  private initializeMap() {
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      return;
    }

    if (this.map == null) {
      try {
        this.map = L.map(this.mapContainer.nativeElement, {
          center: [51.1657, 10.4515],
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
          tileSize: 256,
          zoomOffset: 0,
        }).addTo(this.map);

        this.markerLayer = L.layerGroup().addTo(this.map);
        this.routeLayer = L.layerGroup().addTo(this.map);
      } catch {
        this.map = undefined;
        return;
      }
    }

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private async addAddressMarkers(addresses: AddressInfo[]) {
    if (!this.map || !this.markerLayer) {
      return;
    }

    this.markerLayer.clearLayers();
    this.routeLayer?.clearLayers();
    const bounds = L.latLngBounds([]);
    let hasValidCoordinates = false;
    const validCoordinates: L.LatLng[] = [];

    const sortedAddresses = [...addresses].sort((a, b) => a.stepIndex - b.stepIndex);

    for (const address of sortedAddresses) {
      try {
        const coords = await this.geocodeAddress(address);
        if (coords) {
          address.coordinates = coords;

          const latLng = L.latLng(coords.lat, coords.lng);
          validCoordinates.push(latLng);

          const marker = this.createNumberedMarker(coords.lat, coords.lng, address.stepIndex + 1).addTo(
            this.markerLayer,
          );

          const popupContent = `
            <div style="min-width: 200px;">
              <strong>Step ${address.stepIndex + 1}</strong><br/>
              ${address.address ? `${address.address}<br/>` : ''}
              ${address.zipCode || ''} ${address.city || ''}<br/>
              ${address.country || ''}
            </div>
          `;

          marker.bindPopup(popupContent);
          bounds.extend(latLng);
          hasValidCoordinates = true;
        }
      } catch {
        continue;
      }
    }

    if (validCoordinates.length > 1) {
      this.drawRouteLines(validCoordinates);
    }

    if (hasValidCoordinates && this.map) {
      try {
        if (validCoordinates.length === 1) {
          this.map.setView(validCoordinates[0], 13);
        } else {
          this.map.fitBounds(bounds, { padding: [20, 20] });
        }
        setTimeout(() => this.map?.invalidateSize(), 50);
      } catch {
        // Ignore transient fitBounds errors during rerender.
      }
    }
  }

  private async geocodeAddress(address: AddressInfo): Promise<{ lat: number; lng: number } | null> {
    // Baue eine bessere Suchanfrage zusammen
    const queryParts: string[] = [];

    if (address.address) queryParts.push(address.address);
    if (address.zipCode) queryParts.push(address.zipCode);
    if (address.city) queryParts.push(address.city);
    if (address.country) queryParts.push(address.country);

    const query = queryParts.join(', ');
    if (!query) {
      return null;
    }

    const cached = this.geocodeCache.get(query);
    if (cached !== undefined) {
      return cached;
    }

    const pendingRequest = this.pendingGeocodeRequests.get(query);
    if (pendingRequest != null) {
      return await pendingRequest;
    }

    const request = (async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'AAS-Viewer-Map-Component',
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const result = {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
          this.geocodeCache.set(query, result);
          return result;
        }
      } catch {
        this.geocodeCache.set(query, null);
        return null;
      } finally {
        this.pendingGeocodeRequests.delete(query);
      }

      this.geocodeCache.set(query, null);
      return null;
    })();

    this.pendingGeocodeRequests.set(query, request);
    return await request;
  }
}
