import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Componente } from './interfaces/interfaces';
import { DataService } from './services/data.service';
import { Router } from '@angular/router';
import { AlertController, MenuController, PopoverController } from '@ionic/angular';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {

  modoOscuro: boolean = false;
  componentes!: Observable<Componente[]>;
  
  constructor(private dataService: DataService,
              private router: Router,
              private alertController: AlertController,
              private popoverCtrl: PopoverController,
              private menuCtrl: MenuController,
              private auth: AuthService
   ) { }
  
  ngOnInit() {

    this.modoOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // También puedes actualizar automáticamente si cambia el modo:
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.modoOscuro = e.matches;
    });
    this.componentes = this.dataService.getMenuOpts();

    const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');

  if (token && userData) {
    this.auth.user = JSON.parse(userData);
    this.auth.logged = true;
    // Opcional: refresca permisos o datos
    this.auth.refreshUserData();
  } else {
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  }

}
