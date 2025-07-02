import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-solicitud-vehiculo',
  templateUrl: './solicitud-vehiculo.component.html',
  styleUrls: ['./solicitud-vehiculo.component.scss'],
  standalone: false
})
export class SolicitudVehiculoComponent implements OnInit {

  formulario!: FormGroup;

  caracteresRestantes: number = 150;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      vehiculo: ['', Validators.required],
      fechasalida: ['', Validators.required],
      horasalida: ['', Validators.required],
      horaregreso: ['', Validators.required],
      nombreSoli: ['', Validators.required],
      motivo: ['', Validators.required]
    });

    this.formulario.get('motivo')!
      .valueChanges
      .subscribe(valor => this.actualizarContador(valor));
  }

    private actualizarContador(valor: string) {
    this.caracteresRestantes = 150 - (valor?.length || 0);
  }

  enviarSolicitud() {
    if (this.formulario.valid) {
      console.log('Datos enviados:', this.formulario.value);
      this.modalCtrl.dismiss(this.formulario.value); // o enviar a la API
    }
  }

  async mostrarToast() {
  const toast = await this.toastController.create({
    message: 'Solicitud guardada correctamente',
    duration: 2000,
    color: 'success',
    position: 'bottom'  // 'top', 'middle', 'bottom'
  });
  await toast.present();
  }
    
  dismiss() {
    this.modalCtrl.dismiss();
  }

  
}
