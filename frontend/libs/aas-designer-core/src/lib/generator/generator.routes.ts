import { Routes } from '@angular/router';
import { NameplateComponent } from '../general/assistenten/nameplate/nameplate.component';
import { AuthGuard } from '../guards/auth.guard';
import { AssetMetadataComponent } from './asset-metadata/asset-metadata.component';
import { BatteryHandoverComponent } from './battery-handover/battery-handover.component';
import { BatterySubmodelsComponent } from './battery-submodels/battery-submodels.component';
import { BatteryTechnicalDataComponent } from './battery-technical-data/battery-technical-data.component';
import { DocumentComponent } from './document/document.component';
import { DppCoreDataComponent } from './dpp-core-data/dpp-core-data.component';
import { GeneratorStartComponent } from './generator-start/generator-start.component';
import { SaveAndConfirmComponent } from './save-and-confirm/save-and-confirm.component';
import { SelectTypeComponent } from './select-type/select-type.component';

export const GENERATOR_ROUTES: Routes = [
  {
    path: '',
    component: GeneratorStartComponent,
    children: [
      { path: '', redirectTo: 'select-type', pathMatch: 'full' },
      { path: 'select-type', component: SelectTypeComponent, canActivate: [AuthGuard] },
      { path: 'asset-metadata', component: AssetMetadataComponent, canActivate: [AuthGuard] },
      { path: 'select-type/:id', component: SelectTypeComponent, canActivate: [AuthGuard] },
      { path: 'nameplate', component: NameplateComponent, canActivate: [AuthGuard] },
      { path: 'dpp-core', component: DppCoreDataComponent, canActivate: [AuthGuard] },
      { path: 'battery-carbon-footprint', component: DppCoreDataComponent, canActivate: [AuthGuard] },
      { path: 'technical-data', component: BatteryTechnicalDataComponent, canActivate: [AuthGuard] },
      { path: 'battery-handover', component: BatteryHandoverComponent, canActivate: [AuthGuard] },
      { path: 'battery-submodels', component: BatterySubmodelsComponent, canActivate: [AuthGuard] },
      { path: 'battery-submodels/:submodelIndex', component: BatterySubmodelsComponent, canActivate: [AuthGuard] },
      { path: 'document', component: DocumentComponent, canActivate: [AuthGuard] },
      { path: 'confirmation', component: SaveAndConfirmComponent, canActivate: [AuthGuard] },
    ],
  },
];
