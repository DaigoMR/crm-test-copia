import { Injectable, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {
  
  private urlLogin = environment.api + 'login/login_crm';
  private urlFoto = environment.dominio + "api/storage/uploadFotoCrm.php";
  private urlGetData = environment.api + 'login/crm_me';
  private urlPwd = environment.api + 'users/password';
  private urlDocuments = environment.dominio + "api/storage/downloadDocuments.php";
  private urlVerificarEmail = environment.api + "login/verificarEmail";
  private urlVerificarPersonaRelacionada = environment.api + "login/verificarPersonaRelacionada";
  private urlUpgradeObtenerIdPersona = environment.api + 'reclutamiento/upgrade_obteneridpersona';

  public logged = false;
  public origen = 1;
  public user: any = {};
  public permisos: any = {};
  public menus: any = [];
  public environment = environment.dominio
  auth: any;

  constructor(public http: HttpClient,
              private router: Router
  ) {
    const userData = localStorage.getItem('user_data');

    if (userData) {
      this.user = JSON.parse(userData);
      this.refreshUserData();
    } else {
      //this.logout();
      //location.href = '/login';
    }

    // this.config = require('../../assets/config.json');
    // // console.log(this.config.version);

    // const headers = new HttpHeaders()
    //   .set('Cache-Control', 'no-cache')
    //   .set('Pragma', 'no-cache'); 
      
    //   this.http
    //   .get<{ version: string }>("assets/config.json", {headers})
    //   .subscribe(config => {
    //     // console.log(config.version);

    //    if (config.version !== this.config.version) {
    //       location.reload(); 
    //     }
    //   });
  }
  
  ngOnInit() {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user_data');

  if (token && user) {
    this.auth.logged = true;
    this.auth.user = JSON.parse(user);
  } else {
    this.router.navigate(['/login']);
  }
}

  public login(data: any) {
    return this.http.post(this. urlLogin, data);
  }

  public CambiarPwd(data: any) {
    return this.http.post(this.urlPwd, data);
  }

  public logout() {
    localStorage.clear();
  }

  public cambiarFoto(data: any) {
    return this.http.post(this.urlFoto, data);
  }

  public descargarDocumentos(data: any) {
    return this.http.post(this.urlDocuments, data, { responseType: 'blob' });
  }

  public refreshUserData() {
    return new Promise((resolve, reject) => {
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(this.urlGetData, {}, { headers }).subscribe((res: any) => {
      console.log('Respuesta backend:', res);
        // console.warn('refreshUserData');
        // console.log(res);
        if (res.unauthorized) {
          alert('Tu sesión ha caducado!');
          this.logout();
          this.router.navigate(['/login']);
          resolve(true)
        } else {
          this.permisos = JSON.parse(res.permisos);
          localStorage.setItem('user_data', JSON.stringify(res));
          //console.log(this.permisos);

          this.user = res;
          this.generateMenus();
          resolve(true);
        }
      });
    })
  }

  public generateMenus() {
    this.permisos.Menus.forEach((menu: { Menus: { Lectura: number; IdMenu: any; }; }) => {
      if (menu.Menus.Lectura === 1) {
        this.menus.push(menu.Menus.IdMenu);
      }
    });
    this.menus.push(0);
  }

  public verificarEmail(data: any) {
    return this.http.post(this.urlVerificarEmail, data);
  }
  
  public verificarPersonaRelacionada(data: any) {
    return this.http.post(this.urlVerificarPersonaRelacionada, data);
  }

  public Upgrade_ObtenerIdPersona(data: any) {
    return this.http.post(this.urlUpgradeObtenerIdPersona, data);
  }
}