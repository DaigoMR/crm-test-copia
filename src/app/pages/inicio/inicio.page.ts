import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Componente } from 'src/app/interfaces/interfaces';
import { DataService } from 'src/app/services/data.service';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { ActionSheetController, AlertController, MenuController, PopoverController } from '@ionic/angular';
import { Action } from 'rxjs/internal/scheduler/Action';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  mostrarPopover = false; 
  modoOscuro: boolean = false;

  componentes!: Observable<Componente[]>;
  currentRoute: string = '';
  public userData: any = {};

  constructor( private dataService: DataService,
               private router: Router,
               private actionSheetCtrl: ActionSheetController,
               private popoverCtrl: PopoverController,
               private menuCtrl: MenuController,
               private auth: AuthService
  ) { }

  ngOnInit() {
    this.userData = this.auth.user;
    this.showComponents();
    this.rutaEncabezado();

    this.modoOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // También puedes actualizar automáticamente si cambia el modo:
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.modoOscuro = e.matches;
    });
  }
  
  showComponents() {
    this.componentes = this.dataService.getMenuOpts();
  }

  rutaEncabezado() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects.split('/').pop();
      });
  }

  irPerfil() {
    this.router.navigate(['/usuarios']);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  async presentActionSheet() {
  const actionSheet = await this.actionSheetCtrl.create({
    header: 'Opciones',
    backdropDismiss: false,
    buttons: [
      {
        text: 'Perfil',
        icon: 'person-circle-outline',
        handler: () => {
          this.irPerfil();
        }
      },
      {
        text: 'Cerrar sesión',
        icon: 'log-out-outline',
        role: 'destructive',
        handler: () => {
          this.cerrarSesion();
        }
      },
      {
        text: 'Cancelar',
        icon: 'close-outline',
        role: 'cancel'
      }
    ]
  });

  await actionSheet.present();
}
}