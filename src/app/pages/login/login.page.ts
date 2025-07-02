import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ModalController, NavController, ToastController } from '@ionic/angular';
import { Toast, ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { InversionistasService } from 'src/app/services/inversionistas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {

  public loginData = {
  Correo: null,
  Pwd: null
  };

  public verPassword: boolean = false;

  public subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private navCtrl: NavController,
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}


  ngOnInit(): void {
    
  }

  async openDialog() {
  const modal = await this.modalCtrl.create({
    component: RecuperarContrasenia,
    cssClass: 'mini-modal',
    breakpoints: [0, 0.4],
    initialBreakpoint: 0.4,
    backdropDismiss: false,
    handle: false,               // Desactiva el swipe
    canDismiss: true  
  });
  await modal.present();
}

  ionViewWillEnter() {
    // Aquí reseteas los datos al mostrar la página
    this.loginData = {
      Correo: null,
      Pwd: null
    };
    this.verPassword = false;
  }

  
  togglePassword() {
    this.verPassword = !this.verPassword;
  }

  async presentToast(message: string) {
  const toast = await this.toastCtrl.create({
    message,
    duration: 3000,
    position: 'bottom',
    color: 'danger'
  });
  await toast.present();
}

  public login() {
    console.log(this.loginData);

    if (this.loginData.Correo === null) {
      return;
    }

    if (this.loginData.Pwd === null) {
      return;
    }
    this.subscription.add(
      this.auth.login(this.loginData).subscribe({
        next: (res: any) => {
        console.log('Respuesta del servidor:', res); 

        // console.log(res);
        if (res.token) {
          this.auth.user = res.persona;
          this.auth.logged = true;
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('user_data', JSON.stringify(res.persona));
          this.auth.permisos = JSON.parse(res.persona.permisos);
          this.router.navigate(['/inicio'], { replaceUrl: true });
        } else {
          this.presentToast('Verifica tus datos');
        }
      },
      error: (err) => {
        console.error('Error al hacer login:', err);
      try {
        console.error('Detalles JSON:', JSON.stringify(err));
      } catch (e) {
        console.error('No se pudo convertir el error a JSON');
  }
}
    }) // <- correcto: cierre del subscribe
  );   // <- correcto: cierre del add
}
}

@Component({
  selector: 'dialog-elements-example-dialog',
  templateUrl: './recuperar-contraseña.html',
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, FormsModule, CommonModule]
})
export class RecuperarContrasenia {

  constructor(
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private inversionistas: InversionistasService,
    private fb: FormBuilder,
    private alertController: AlertController
  ) { 

  }

  correoRec = new FormControl('', [Validators.required, Validators.email]);
  isLoading = false;  

  validarCorreo() {
    // console.warn('validarCorreo');
    // console.log(this.correoRec.value);
    
    if (this.correoRec.hasError('required')) {
      return 'Ingrese su correo';
    }

    return this.correoRec.hasError('email') ? 'Correo inválido' : '';
  }

  
  cerrarModal() {
    this.modalCtrl.dismiss(); // cerrar sin enviar datos
  }


  enviarCorreo() {    
    this.isLoading = true;
    if (this.correoRec.invalid) {
      this.presentToast('El correo ingresado no es válido', 'Error',);
      this.isLoading = false;
    } else {
      this.inversionistas.recuperarClave({
        Email: this.correoRec.value
      }).subscribe((res: any) => {
        // console.log(res);
        
        if (res.error !== true) {
          this.mostrarAlertaExito();

        } else {
          this.mostrarAlertaError(res.message);
        }
        this.modalCtrl.dismiss();
        this.isLoading = false;
      });
    }
  }

  async mostrarAlertaExito() {
  const alert = await this.alertController.create({
    header: '¡Listo!',
    message: 'Te enviamos un correo de recuperación de contraseña',
    buttons: ['OK'],
    cssClass: 'alert-success'
  });
  await alert.present();
}

async mostrarAlertaError(mensaje: string) {
  const alert = await this.alertController.create({
    header: 'Error',
    message: mensaje,
    buttons: ['OK'],
    cssClass: 'alert-error'
  });
  await alert.present();
}

  async presentToast(message: string, color: string = 'primary') {
  const toast = await this.toastController.create({
    message,
    duration: 2500,
    color: 'danger',
  });
  toast.present();
}}
