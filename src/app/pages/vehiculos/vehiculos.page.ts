import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
  standalone: false
})
export class VehiculosPage implements OnInit {

  mostrarModal = false;
  public vehiculos: any = []; //? Almacena la lista de vehículos a escoger en la solicitud
  public registros: any = [];
  public spinners = {
    loadingRegistros: false,
    sendingSolicitud: false,
    loadingArchivos: false,
  }

  caracteresRestantes: number = 150;

  public loadingSolicitud: boolean = false;
  public solicitudForm: FormGroup;
  public usuario: any = this.auth.user;
  public minDate = new Date().toISOString().split('T')[0]; //? Variable para el campo "Fecha" de la solicitud
  public modal: any; //? Variable para instanciar el modal de la solicitud
  public selectedTab: number = 5; //? Variable para almacenar el numero de tab donde se encuentra el usuario
  public permisosAceptar: boolean = (this.usuario.IdLider == 1 || [1, 7].includes(this.usuario.IdPerfil)) //? variable para dar permisos para aceptar solicitudes
  public permisosEntregar: boolean = [1, 7].includes(this.usuario.IdPerfil) //? variable para dar permisos para entregar solicitudes
  public archivos: any[] = []; //? Variable para almacenar los documentos que se subirán a l

  constructor(private router: Router,
              private auth: AuthService,
              private fb: FormBuilder,
              private loadingController: LoadingController,
              private admin: AdminService,
              private toastController: ToastController) { 
                this.solicitudForm = this.fb.group({
                  IdSolicitudVehiculo: [''], //? Campo solo en caso de que sea una solicitud existente
                  IdVehiculo: ['', Validators.required],
                  IdUsuario: [this.usuario.IdUsuario],
                  FechaSalida: ['', Validators.required],
                  HoraSalida: ['', Validators.required],
                  HoraRegreso: ['', Validators.required],
                  Solicitante: [{ value: this.usuario.Nombre + ' ' + this.usuario.Apellidos, disabled: true }],
                  Motivo: [''],
                  IdStatus: [''], //? Campo solo en caso de que sea una solicitud existente
    });
  }

  ngOnInit(): void {
    this.obtenerVehiculosDisponibles();
    this.obtenerRegistros(5);


    this.solicitudForm.get('Motivo')?.valueChanges.subscribe(valor => {
      this.caracteresRestantes = 150 - (valor?.length || 0);
    });
  }

  async abrirModal() {
    this.mostrarModal = true;
    document.getElementById('main-content')?.setAttribute('inert', '');
  }

  async abrirModalConRegistro(registro: any) {
  if (this.loadingSolicitud) return;
  this.loadingSolicitud = true;

  const toast = await this.mostrarToastCarga(); // 👈 mostrar toast

  await this.seleccionarSolicitud(registro);
  this.mostrarModal = true;

  toast.dismiss(); // 👈 ocultar toast cuando ya cargó
  this.loadingSolicitud = false;
}

  async mostrarToastCarga() {
  const toast = await this.toastController.create({
    message: 'Cargando solicitud...',
    duration: 0, // No se cierra automáticamente
    position: 'bottom',
    cssClass: 'toast-cargando',
    translucent: true,
    animated: true
  });

  await toast.present();
  return toast;
  }

  cerrarModal() {
    this.mostrarModal = false;
    document.getElementById('main-content')?.removeAttribute('inert');
    this.reiniciarSolicitud();
  }

  obtenerVehiculosDisponibles() {
  this.admin.vehiculosObtenerDisponibles().subscribe((res: any) => {
    if (!res.error) {
      this.vehiculos = res;
    }
  });
}

obtenerRegistros(opcion: number) {
  this.selectedTab = opcion;
  this.registros = [];
  this.spinners.loadingRegistros = true;

  this.admin.vehiculosObtenerRegistros({ Opcion: opcion, IdUsuario: this.usuario.IdUsuario }).subscribe((res: any) => {
    this.spinners.loadingRegistros = false;
    console.log('Registros obtenidos:', res);

    if (!res?.error && res != null) {
      this.registros = res;
    } else {
      this.presentToast('Ocurrió un error al cargar la información', 'danger');
      this.registros = [];
    }
  });
}

solicitarVehiculo() {
  const vehiculo = this.vehiculos.find((v: { IdVehiculo: any; }) => v.IdVehiculo == this.solicitudForm.get('IdVehiculo')?.value);
  if (vehiculo && vehiculo.Apartado == 1) {
    this.presentToast('El vehículo seleccionado actualmente se encuentra apartado', 'warning');
    return;
  }

  const horaSalida = this.solicitudForm.get('HoraSalida')?.value;
  const horaRegreso = this.solicitudForm.get('HoraRegreso')?.value;
  if (horaRegreso <= horaSalida) {
    this.presentToast('La hora de regreso no puede ser menor o igual a la de salida', 'warning');
    return;
  }

  if (this.solicitudForm.valid) {
    this.spinners.sendingSolicitud = true;
    this.admin.vehiculosInsertarSolicitud(this.solicitudForm.value).subscribe((res: any) => {
      this.spinners.sendingSolicitud = false;

      if (res.inserted) {
        this.presentToast('Solicitud generada correctamente', 'success');
        this.reiniciarSolicitud();
        this.mostrarModal = false; // cierra IonModal
        this.obtenerRegistros(this.selectedTab);
        this.obtenerVehiculosDisponibles();
      } else {
        this.presentToast('Intente nuevamente o contacte a soporte', 'danger');
      }
    });
  }
}

reiniciarSolicitud(): void {
    setTimeout(() => {

      //* Reiniciamos los valores del formulario
      this.solicitudForm.reset({
        IdSolicitudVehiculo: '',
        IdVehiculo: '',
        IdUsuario: this.usuario.IdUsuario,
        FechaSalida: '',
        HoraSalida: '',
        HoraRegreso: '',
        Solicitante: this.usuario.Nombre + ' ' + this.usuario.Apellidos,
        Motivo: '',
        IdStatus: '',
      });

      //* Limpiamos el arreglo de archivos
      this.archivos = [];

      //* Habilitamos el formulario
      this.solicitudForm.enable();

      //* Deshabilitar solo el campo de 'Solicitante'
      this.solicitudForm.get('Solicitante')?.disable();

    }, 250);
  }

  seleccionarSolicitud(solicitud: any) {
  // 1. Traer archivos si el status es 3 o 4
  if ([3, 4].includes(solicitud.IdStatus)) {
    this.spinners.loadingArchivos = true;
    this.admin.vehiculosArchivosSolicitud(solicitud).subscribe((res: any) => {
      if (!res.error) this.archivos = res;
      this.spinners.loadingArchivos = false;
    });
  }

  // 2. Poblar el formulario en modo lectura
  this.solicitudForm.setValue({
    IdSolicitudVehiculo: solicitud.IdSolicitudVehiculo,
    IdVehiculo: solicitud.IdVehiculo,
    IdUsuario: solicitud.IdUsuario,
    FechaSalida: solicitud.FechaSalida,
    HoraSalida: solicitud.HoraSalida,
    HoraRegreso: solicitud.HoraRegreso,
    Solicitante: solicitud.Usuario,
    Motivo: solicitud.Motivo,
    IdStatus: solicitud.IdStatus
  });
  this.solicitudForm.disable();

  // 3. Si el usuario puede editar (pendiente/aceptado + permisos RH/Admin)
  if ([0, 1].includes(solicitud.IdStatus) && this.permisosEntregar) {
    ['IdSolicitudVehiculo', 'FechaSalida', 'HoraSalida', 'HoraRegreso', 'Motivo']
      .forEach(ctrl => this.solicitudForm.get(ctrl)?.enable());
  }
}

/* ══════════ CAMBIAR ESTATUS DE LA SOLICITUD ══════════ */
modificarSolicitud(opcion: number, documentos?: string): void {
    this.spinners.sendingSolicitud = true;

    //* Evaluamos la opción que se desea realizar para el histórico
    let accion = '';
    switch (opcion) {
      case 0:
        accion = 'Solicitud devuelta a pendiente';
        break;

      case 1:
        accion = 'Solicitud aceptada';
        break;

      case 2:
        accion = 'Solicitud rechazada';
        break;

      case 3:
        accion = 'Solicitud en revisión';
        break;

      case 4:
        accion = 'Solicitud entregada';
        break;

      case 5:
        accion = 'Devuelto a aceptado para resubir documentos';
        break;

      default:
        break;
    }

    this.admin.vehiculosModificarSolicitud({
      ...this.solicitudForm.value,
      IdUsuarioModificado: this.usuario.IdUsuario,
      IdStatus: opcion,
      Accion: accion,
      Documentos: documentos,
    }).subscribe((res: any) => {
      if (res.updated) {
        this.presentToast(res?.message ? res?.message : 'Solicitud actualizada correctamente', '');
        //* Reiniciamos los valores del formulario de solicitud
        this.reiniciarSolicitud();
        //* Cerramos el modal de la solicitud
        this.mostrarModal = false;
        //* Actualizamos los registros según el tab donde nos encontremos
        this.obtenerRegistros(this.selectedTab);
        //* Actualizamos la lista de vehículos disponibles
        this.obtenerVehiculosDisponibles();
      } else if (res.apartado) {
        this.presentToast(res.message, '');
      } else {
        this.presentToast('Intente nuevamente o contacte a soporte', 'Ocurrió un error');
      }

      this.spinners.sendingSolicitud = false;
    });
  }

/* ══════════ MODIFICAR SOLO DATOS (sin cambiar estatus) ══════════ */
modificarDatosSolicitud() {
  this.spinners.sendingSolicitud = true;

  this.admin.vehiculosModificarDatosSolicitud({
    ...this.solicitudForm.getRawValue(),
    IdUsuarioModificado: this.usuario.IdUsuario
  }).subscribe((res: any) => {
    this.spinners.sendingSolicitud = false;

    if (res.updated) {
      this.presentToast('Solicitud actualizada correctamente', 'success');
      this.reiniciarSolicitud();
      this.mostrarModal = false;
      this.obtenerRegistros(this.selectedTab);
      this.obtenerVehiculosDisponibles();
    } else if (res.warning) {
      this.presentToast(res.message, 'warning');
    } else {
      this.presentToast('Intente nuevamente o contacte a soporte', 'danger');
    }
  });
}

/* ══════════ SUBIR / ELIMINAR ARCHIVOS LOCALES ══════════ */
cargarDocumentos(files: FileList) {
  this.archivos = Array.from(files);
}

abrirInput() {
  const input = document.getElementById('documentos-input') as HTMLInputElement;
  input?.click();
}

onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input?.files) {
    this.cargarDocumentos(input.files);
  }
}

async mostrarTooltip() {
  const toast = await this.toastController.create({
    message: 'Sube una imagen del kilometraje y del medidor de gasolina del vehículo al momento de la entrega',
    duration: 3000,
    position: 'top',
    color: 'medium'
  });
  await toast.present();
}

eliminarDocumento(file: File) {
  this.archivos = this.archivos.filter(f => f !== file);

  // actualiza el input file
  const input = document.getElementById('documentos-input') as HTMLInputElement;
  if (input) {
    const dt = new DataTransfer();
    this.archivos.forEach(a => dt.items.add(a));
    input.files = dt.files;
  }
}

/* ══════════ SUBIR DOCUMENTOS AL SERVIDOR ══════════ */
async subirDocumentos() {
  try {
    if (this.archivos.length === 0 && !this.permisosEntregar) {
      this.presentToast('No se encontraron documentos cargados', 'warning');
      return;
    }

    // Si hay archivos, súbelos uno por uno
    let documentos: { archivo: string; nombre: string }[] = [];
    if (this.archivos.length > 0) {
      for (const archivo of this.archivos) {
        const fd = new FormData();
        fd.append('file', archivo);
        fd.append('IdSolicitudVehiculo', this.solicitudForm.get('IdSolicitudVehiculo')?.value);

        const result: any = await this.admin.vehiculosSubirDocumentos(fd);
        if (result.error) throw new Error('Error al subir archivo al servidor');
        documentos.push({ archivo: result.archivo, nombre: result.nombre });
      }
    }

    // Actualiza la solicitud según tu rol
    const nuevoStatus = this.permisosEntregar ? 4 : 3;
    const docsString = documentos.length ? JSON.stringify(documentos) : undefined;
    this.modificarSolicitud(nuevoStatus, docsString);

  } catch (err) {
    console.error(err);
    this.presentToast('Intente nuevamente o contacte a soporte', 'danger');
    this.spinners.sendingSolicitud = false;
  }
}

  onClick() {}

  async presentToast(message: string, color: string = 'primary') {
  const toast = await this.toastController.create({
    message,
    duration: 2500,
    color: 'success',
  });
  toast.present();
}}
