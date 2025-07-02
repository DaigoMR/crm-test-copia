import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalle-solicitud',
  templateUrl: './detalle-solicitud.component.html',
  styleUrls: ['./detalle-solicitud.component.scss'],
  standalone: false
})
export class DetalleSolicitudComponent  implements OnInit {

  @Input() item: any;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  cerrarModal() { 
    this.modalCtrl.dismiss();
  }

}
