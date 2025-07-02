import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: false
})
export class UsuariosPage implements OnInit {

  public userData: any = {};

  public subscriptions = new Subscription();

  public loading: boolean = false;

  public modalA = null;
  public pwd: any;
  public npwd: any;
  public npwd1: any;
  public showPassword: boolean[] = [];
  public loadingData: boolean = true;
  public savingPassword: boolean = false;

  constructor(
    private auth: AuthService,
    private ngZone: NgZone,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) {

  }

  async ngOnInit(): Promise<void> {
    await this.auth.refreshUserData();
    this.loadingData = false;
    this.userData = this.auth.user;
    // console.log(this.userData);

    if (this.userData.CorreosAdicionales) this.userData.CorreosAdicionales = JSON.parse(this.userData.CorreosAdicionales);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  async mostrarToast(mensaje: string, color: string = 'danger') {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 3000,
    position: 'bottom',
    color, // success | warning | danger | light | dark
  });
  toast.present();
}

async mostrarAlertaError() {
  const alert = await this.alertController.create({
    header: 'La contraseña no fue actualizada',
    message: 'Por favor intente nuevamente',
    buttons: ['OK']
  })
}

async mostrarAlertaCambioContraseña() {
  const alert = await this.alertController.create({
    header: '¡Contraseña actualizada!',
    message: 'Recuerde este cambio cuando inicie sesión',
    buttons: ['OK']
  });
  await alert.present();
}

  public cambiarpwd() {
    if (this.pwd == null) {
      this.mostrarToast('La contraseña actual es obligatoria', 'danger');
      return;
    }
    if (this.npwd == null) {
      this.mostrarToast('La nueva contraseña es obligatoria', 'danger');
      return;
    }
    if (this.npwd != this.npwd1) {
      this.mostrarToast('Las contraseñas no coinciden', 'danger');
      return;
    }
    if (this.npwd.length < 8) {
      this.mostrarToast('La contraseña debe tener al menos 8 caracteres', 'danger');
      return;
    }

    this.savingPassword = true;

    this.subscriptions.add(
      this.auth
        .CambiarPwd({
          IdUsuario: this.auth.user.IdUsuario,
          Pwd: this.pwd,
          NPwd: this.npwd,
        })
        .subscribe((res: any) => {
          if (res.updated == true) {

            this.mostrarAlertaCambioContraseña();
            
            this.pwd = null;
            this.npwd = null;
            this.npwd1 = null;
          } else {
            this.mostrarAlertaError();
          }

          this.savingPassword = false;
        })
    );
  }

  mostrarContrasenia(index: number): void {
    // Alterna la visibilidad de la contraseña para el índice dado
    this.showPassword[index] = !this.showPassword[index];
  }

}

