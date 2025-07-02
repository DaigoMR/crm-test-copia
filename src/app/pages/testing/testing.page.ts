import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { DetalleSolicitudComponent } from 'src/app/components/detalle-solicitud/detalle-solicitud.component';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.page.html',
  styleUrls: ['./testing.page.scss'],
  standalone: false
})
export class TestingPage implements OnInit {

  tabSeleccionado: number = 5; //? Variable para almacenar el número de tab donde se encuentra el usuario

  datos = [
    {
      folio: '1',
      vehiculo: 'Toyota Corolla',
      estatus: 'Disponible',
      foto: 'Sin Imagen',
    },
    {
      folio: '2',
      vehiculo: 'Nissan March',
      estatus: 'Disponible',
      foto: 'Sin Imagen',
    }
    // más objetos...
  ];

  onClick() {
    console.log('Button clicked!');
  }

  async mostrarToast() {
  const toast = await this.toastController.create({
    message: 'Inicio de sesión exitoso',
    duration: 2000,
    color: 'success',
    position: 'bottom'  // 'top', 'middle', 'bottom'
  });
  await toast.present();
}

  async abrirDetalle(item: any) {
  const modal = await this.modalCtrl.create({
    component: DetalleSolicitudComponent,
    componentProps: { item: item }
  });
  await modal.present();
  }

  public vehiculos: any = []; //? Almacena la lista de vehículos a escoger en la solicitud
  public registros: any = [];
  public spinners = {
    loadingRegistros: false,
    sendingSolicitud: false,
    loadingArchivos: false,
  }
  modalAbierto: boolean = false; //? Variable para saber si el modal de solicitud está abierto
  public solicitudForm: FormGroup;
  public usuario: any = this.auth.user;
  public minDate = new Date().toISOString().split('T')[0]; //? Variable para el campo "Fecha" de la solicitud
  public modal: any; //? Variable para instanciar el modal de la solicitud
  public selectedTab: number = 1; //? Variable para almacenar el numero de tab donde se encuentra el usuario
  public permisosAceptar: boolean = (this.usuario.IdLider == 1 || [1, 7].includes(this.usuario.IdPerfil)) //? variable para dar permisos para aceptar solicitudes
  public permisosEntregar: boolean = [1, 7].includes(this.usuario.IdPerfil) //? variable para dar permisos para entregar solicitudes
  public archivos: any[] = []; //? Variable para almacenar los documentos que se subirán a l

  constructor(private modalCtrl: ModalController,
              private router: Router,
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
        this.modal?.dismiss();
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
modificarSolicitud(opcion: number, documentos?: string) {
  this.spinners.sendingSolicitud = true;

  const acciones = [
    'Solicitud devuelta a pendiente',          // 0
    'Solicitud aceptada',                      // 1
    'Solicitud rechazada',                     // 2
    'Solicitud en revisión',                   // 3
    'Solicitud entregada',                     // 4
    'Devuelto a aceptado para resubir documentos' // 5
  ];

  this.admin.vehiculosModificarSolicitud({
    ...this.solicitudForm.getRawValue(),       // incluye campos deshabilitados
    IdUsuarioModificado: this.usuario.IdUsuario,
    IdStatus: opcion,
    Accion: acciones[opcion] || '',
    Documentos: documentos ?? null
  }).subscribe((res: any) => {
    this.spinners.sendingSolicitud = false;

    if (res.updated) {
      this.presentToast('Solicitud actualizada correctamente', 'success');
      this.reiniciarSolicitud();
      this.modalAbierto = false;               // cierra IonModal
      this.obtenerRegistros(this.selectedTab);
      this.obtenerVehiculosDisponibles();
    } else if (res.apartado) {
      this.presentToast(res.message, 'warning');
    } else {
      this.presentToast('Intente nuevamente o contacte a soporte', 'danger');
    }
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
      this.modalAbierto = false;
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

  async presentToast(message: string, color: string = 'primary') {
  const toast = await this.toastController.create({
    message,
    duration: 2500,
    color,
  });
  toast.present();
}

}
