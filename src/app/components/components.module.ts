import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { DetalleSolicitudComponent } from './detalle-solicitud/detalle-solicitud.component';



@NgModule({
  declarations: [
    HeaderComponent,
    DetalleSolicitudComponent
  ],
  exports: [
    HeaderComponent,
    DetalleSolicitudComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class ComponentsModule { }