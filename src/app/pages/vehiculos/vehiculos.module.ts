import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehiculosPageRoutingModule } from './vehiculos-routing.module';

import { VehiculosPage } from './vehiculos.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { SolicitudVehiculoComponent } from './solicitud-vehiculo/solicitud-vehiculo.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VehiculosPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule
  ],
  declarations: [VehiculosPage, SolicitudVehiculoComponent]
})
export class VehiculosPageModule {}
