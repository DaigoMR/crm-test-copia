import { Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit{

  modoOscuro: boolean = false;

  @Input() defaultBackHref: string = '/inicio';
  @Input() titulo: string = '';

  ngOnInit() {
    // Detecta si el sistema está en modo oscuro
    this.modoOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // También puedes actualizar automáticamente si cambia el modo:
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.modoOscuro = e.matches;
    });
  }
}
