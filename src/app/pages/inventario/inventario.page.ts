import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { UsuariosCrmService } from 'src/app/services/usuarios-crm.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: false
})
export class InventarioPage implements OnInit {

  mostrarModal = false;
  tabSeleccionado: string = 'asignados';
  public currentImageIndex = 0;
  EquiposAsignados: any[] = [];
  EquiposDisponibles: any[] = [];

  constructor(
    public admin: AdminService,
    public auth: AuthService,
    private usersCRM: UsuariosCrmService,
    public toastCtrl: ToastController,
    public router: Router,
    private alertCtrl: AlertController,
    private general: GeneralService
  ) {
    
  }

  @ViewChild('scrollable') scrollable: ElementRef | undefined;

  //Variables de tipo loading a usar
  public loading: boolean = false;
  public loading2: boolean = false;
  public loadingStatus: boolean = false;
  public loadingEnviar: boolean = false;
  public loadingSolicitud: boolean = false;
  public loadingImgEquipo: boolean = false;
  public loadingArchivoResponsiva: boolean = false;
  public idlider: boolean = false;

  // Variables para los filtros
  public searchKeywordFolio = '';
  public searchKeywordEquipo = '';
  public searchKeywordOrigen = '';
  public searchKeywordEstatus = '';

  //Variables a usar
  public departamentos: any;
  public subactividades: any;
  public usuariosDepa: any;
  public Usuario: any = this.auth.user;
  public persona: any = {};
  public seleccionado: any;
  public solicitudSeleccionada: any = [{}];

  // Variables para subir multiples comprobantes
  public documentosCargados: any = [];
  public textoDocumentos: any;
  public ArrayContratos: any = [];
  public ArrayImgEquipo: any = [];
  public ArrayResponsiva: any = [];

  public currDate: any; // Guarda fecha actual para el campo de fecha límite
  public modalToggle: any; // Almacena el modal para poder abrir o cerrar manualmente
  public opc: number = 1; // Almacena el tab en el que nos encontramos

  public user: any;
  public AgregarActividadopen: any;

  // Variables para fecha
  public FechaInicio: any;
  public FechaFin: any;

  // Variable para los tipos de equipos
  public TipoEquipos: any;

  // Variables del formulario
  public registros: any;
  public registro: any[] = [];
  public Usuarios: any;
  public selectedId: any;
  public Cuentas: any = [
    {
      TipoCuenta: '',
      Cuenta: '',
      Contrasena: '',
    },
  ];

  public history: any;


  // Variable para el almacenamiento historico
  public Historico: any = [];
  
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  abrirSelector() {
    this.fileInput.nativeElement.click();
  }

  ngOnInit() {
    this.modlistado(0);

    this.history = history.state;
    // console.log(this.history);
    
    if (this.history) {
      this.searchKeywordFolio = this.history.searchKeywordFolio;
      this.searchKeywordEquipo = this.history.searchKeywordEquipo;
      this.searchKeywordOrigen = this.history.searchKeywordOrigen;
    }
    //console.warn('ngOnInit');
    // Mandamos a traer la informacion del inventario
    this.general.listarInventario().subscribe((res: any) => {
      this.EquiposAsignados = res.Asignados;
      this.EquiposDisponibles = res.Disponibles;
      // console.log(this.EquiposAsignados);

      this.registro = this.EquiposAsignados;

      this.registro.forEach((element) => {
        if (element.Img_Equipo) {
          element.Img_Equipo = JSON.parse(element.Img_Equipo);
        }
      });
      this.loadingSolicitud = true;
    });
  }

  async abrirModal() {
    this.mostrarModal = true;
    document.getElementById('main-content')?.setAttribute('inert', '');
  }

  cerrarModal() {
    this.mostrarModal = false;
    document.getElementById('main-content')?.removeAttribute('inert');
  }

  onSegmentChanged(event: any) {
  const value = event.detail.value;

  if (value === 'asignados') {
    this.modlistado(0);
  } else if (value === 'disponibles') {
    this.modlistado(1);
  }
  }

  onInputChange(event: any) {
    const selectedOption = this.Usuarios.find(
      (option: any) => option.Nombre == event.target.value
    );
    this.selectedId = selectedOption ? selectedOption.IdPersona : undefined;

    if (selectedOption != undefined) {
      this.registros[0].IdUsuarioAsignado = selectedOption.IdPersona;
    } else {
      delete this.registros[0].IdConcepto;
      delete this.registros[0].Nombre;
    }
  }

  public AgregarCuenta() {
    console.log(this.Cuentas);
    this.Cuentas.push({
      TipoCuenta: '',
      Cuenta: '',
      Contrasena: '',
    });
    console.log(this.Cuentas);
  }

  public EliminarCuenta() {
    if (this.Cuentas.length > 1) {
      this.Cuentas.pop();
    }
  }

  public ObtenerDepartamentos() {
    this.admin.ObtenerDepartamentos().subscribe((res: any) => {
      // console.warn('ObtenerDepartamentos');
      // console.log(res.Departamentos);

      // Por el momento solo estará habilitado para Desarrollo
      // this.departamentos = res.Departamentos.filter((element) => element.IdDepartamento == 1);

      // Descomentar esto cuando se habilite para el resto de departamentos
      this.departamentos = res.Departamentos;
    });
  }

  modlistado(index: number) {
    if (index === 0) {
      // Datos para la pestaña "Asignados"
      this.registro = this.EquiposAsignados;
    } else if (index === 1) {
      // Datos para la pestaña "Disponible"
      this.registro = this.EquiposDisponibles;
    }
  }

  public subirImagen_Equipo(event: Event): void {
  this.loading = true;
  this.loadingImgEquipo = true;

  const input = event.target as HTMLInputElement;
  const archivos = input.files;

  if (!archivos || archivos.length === 0) {
    this.loading = false;
    this.loadingImgEquipo = false;
    return;
  }

  Array.from(archivos).forEach((documento: File) => {
    this.documentosCargados.push(documento.name);

    const formData = new FormData();
    formData.append('file', documento);

    this.admin.SubirImgEquipo(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.loadingImgEquipo = false;

        if (res.error) {
          this.toastCtrl.create({
            message: 'Ocurrió un error al cargar la imagen, intenta nuevamente',
            duration: 2000,
            color: 'danger'
          }).then(toast => toast.present());
        } else {
          this.ArrayImgEquipo.push({
            imagen: res.imagen,
            original: documento.name,
          });

          this.toastCtrl.create({
            message: 'Imagen guardada en el servidor',
            duration: 2000,
            color: 'success'
          }).then(toast => toast.present());

          this.textoDocumentos = this.documentosCargados.join(', ');

          if (this.registros && this.registros.length > 0) {
            setTimeout(() => {
              this.registros[0].Img_Equipo = JSON.stringify(this.ArrayImgEquipo);
            }, 1000);
          }
        }
      },
      error: () => {
        this.loading = false;
        this.loadingImgEquipo = false;
        this.toastCtrl.create({
          message: 'Error de red al subir imagen',
          duration: 2000,
          color: 'danger'
        }).then(toast => toast.present());
      }
    });
  });
}
  
    public eliminarArchivo(index: any) {
      //console.warn('eliminarArchivo');
      //console.log(index);
      //console.log(this.ArrayContratos);

    // Validamos que el 'index' que estamos enviando sea mayor a 0 y no mayor al tamaño del arreglo
    if (index >= 0 && index < this.ArrayImgEquipo.length) {
      // Eliminamos el archivo del arreglo
      this.ArrayImgEquipo.splice(index, 1);
      this.registros[0].Img_Equipo = JSON.stringify(this.ArrayImgEquipo);
    }

    if (this.ArrayImgEquipo.length == 0) {
      this.registros[0].Img_Equipo = null;
    }

    //console.log(this.registros[0].Img_Comprobante);
  }

  public listarUsuarios(IdDepartamento: any) {
    console.log(IdDepartamento);
    // Mandamos a traer la informacion de los usuarios del departamento solicitado
    this.general
      .listarUsuarios({ IdDepartamento: IdDepartamento })
      .subscribe((res: any) => {
        // console.log(res);
        this.Usuarios = res;
      });
  }

  public nuevoEquipo() {
    this.mostrarModal = true;
    //console.warn('nuevoEquipo);

    this.seleccionado = 0;
    // Limpiamos la variable en donde guardamos los datos de la solicitud.
    this.registros = [{}];
    this.Cuentas = [
      {
        TipoCuenta: '',
        Cuenta: '',
        Contrasena: '',
      },
    ];
    // this.FechaHoy();
    this.registros[0].IdUsrMod = this.Usuario.IdUsuario;
    this.registros[0].Comentario = null;
    this.registros[0].IdUsuarioAsignado = null;
    this.registros[0].IdDepartamento = null;
  }

  public RegistrarEquipo() {
    this.loadingEnviar = true;

    // Variable para marcar en rojo los campos inválidos
    let campo: HTMLElement | null;

    // Validamos el campo de 'Especificaciones' del formulario del modal
    if (!this.registros[0].MarcaModelo) {
      this.loadingEnviar = false;
      campo = document.getElementById('MarcaModelo');
      campo?.classList.add('error');
      document.querySelectorAll('.error').forEach((el) => {
        el.classList.remove('blue-color-border');
      });

      this.scrollable?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
      this.toastCtrl.create({
        message: 'Debes agregar las especificaciones del equipo a registrar',
        duration: 2000,
      }).then(toast => toast.present());
      setTimeout(() => {
        document.querySelectorAll('.error').forEach((el) => {
          el.classList.remove('error');
        });
        campo?.classList.add('blue-color-border');
      }, 2000);
      return;
    }

    // Validamos el campo de 'Tipo de equipo' del formulario del modal
    if (!this.registros[0].Tipo) {
      this.loadingEnviar = false;
      campo = document.getElementById('TipoEquipo');
      campo?.classList.add('error');
      document.querySelectorAll('.error').forEach((el) => {
          el.classList.remove('blue-color-border');
        });

      this.scrollable?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
      this.toastCtrl.create({
        message: 'Debes de elegir el tipo de equipo a registrar',
        duration: 2000,
      }).then(toast => toast.present());
      setTimeout(() => {
        document.querySelectorAll('.error').forEach((el) => {
          el.classList.remove('error');
        });
        campo?.classList.add('blue-color-border');
      }, 2000);
      return;
    }

    // Verificar si `NumeroSerieIMEI` es null y preguntar al usuario si desea continuar
  const verificarNumeroSerie = new Promise<void>(async (resolve, reject) => {
    if (!this.registros[0].NumeroSerieIMEI) {
      const alert = await this.alertCtrl.create({
        header: 'Número de Serie ausente',
        message: 'El equipo no tiene número de serie. ¿Deseas continuar?',
        buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.toastCtrl.create({
              message: 'Operación cancelada',
              duration: 2000,
              color: 'danger',
            }).then(toast => toast.present());
            this.loadingEnviar = false;
            reject();
          }
        },
        {
          text: 'Sí, continuar',
          handler: () => {
            resolve();
          }
        }
      ]
    });

    await alert.present();

    } else {
      resolve();
    }
  });

    // Si el usuario confirma, continuar con el registro
    verificarNumeroSerie
      .then(() => {
        this.registros[0].Cuentas = JSON.stringify(this.Cuentas);
        this.registros[0].IdUsuario = this.registros[0].IdUsuarioAsignado;

        this.usersCRM
          .InsertarEquipo(this.registros[0])
          .subscribe((res: any) => {
            if (res.Exito) {
              this.toastCtrl.create({
                message: 'Equipo registrado correctamente',
                duration: 2000,
                color: 'success',
              }).then(toast => toast.present());

              this.modalToggle.hide();
              window.location.reload();
            } else {
              this.toastCtrl.create({
                message: 'Intente nuevamente o contacte a soporte',
                duration: 2000,
                color: 'danger'
                }
              );
            }
            this.loadingEnviar = false;
          });
      })
      .catch(() => {
        // Si el usuario cancela en el Swal, no se hace nada y el flujo se detiene aquí.
      });
  }

  public seleccionarEQUIPO(dato: any) {
    this.router.navigate(['/crm/general/editar-equipo/', dato.IdEquipo], {
      state: {
        searchKeywordFolio: this.searchKeywordFolio,
        searchKeywordEquipo: this.searchKeywordEquipo,
        searchKeywordOrigen: this.searchKeywordOrigen
      },
    });
  }

  public OpcionesPorEquipo(equipo: any, Opc: number) {
    let Movimiento;
    let campo;
    if (Opc == 1) {
      Movimiento = 'Equipo reasignado ';
    } else if (Opc == 2) {
      Movimiento = 'Liberar equipo';
    } else if (Opc == 3) {
      Movimiento = 'Eliminar equipo ';
    } else {
      Movimiento = 'Modificación en especificaciones';
    }

    equipo.Opc = Opc;
    equipo.Movimiento = Movimiento;
    equipo.IdUsrMod = this.Usuario.IdUsuario;
    // this.loadingEnviar = true;

    this.general.ReasignarEquipo(equipo).subscribe((res: any) => {
      if (res.Exito) {
        this.toastCtrl.create({
          message: 'Inventario modificado',
          duration: 2000,
          color: 'success'
        });
        window.location.reload();
      } else {
        this.toastCtrl.create({
          message: 'Intente nuevamente o contacte a soporte',
          duration: 2000,
          color: 'danger'
          }
        );
      }
      // this.loadingEnviar = false;
    });
  }

}
