import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InversionistasService {

  constructor(private http: HttpClient) { }

  private urlRecuperar = environment.api + 'reclutamiento/recuperar_contrasena_crm';

  public recuperarClave(data: any) {
  return this.http.post(this.urlRecuperar, data);
}
}

