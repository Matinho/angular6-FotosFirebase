import { Directive, EventEmitter, ElementRef,
         HostListener, Input, Output
       } from '@angular/core';
import { FileItem } from '../models/file-item';

@Directive({
  selector: '[appNgDropFiles]'
})
export class NgDropFilesDirective {

  @Input() archivos: FileItem[] = [];

  @Output() mouseSobre: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  // Verifica que tiene un elemento encima
  @HostListener( 'dragover', ['$event'] )
  public onDragEnter( event: any ) {
    this.mouseSobre.emit( true );
    this._prevenirDetener( event );
  }

  @HostListener( 'dragleave', ['$event'] )
  public onDragLeave( event: any ) {
    this.mouseSobre.emit( false );
  }

  @HostListener( 'drop', ['$event'] )
  public onDrop( event: any ) {

    const transferencia = this._getTransferencia( event );

    if ( !transferencia ) {
      return;
    }

    this._extraerArchivos( transferencia.files );
    this._prevenirDetener( event );
    this.mouseSobre.emit( false );
  }

  // verifico la compatibilidad de los navegadores
  private _getTransferencia( event: any ) {

    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;

  }

  private _extraerArchivos( archivoLista: FileList ) {

    console.log( archivoLista );

    // tslint:disable-next-line:forin
    for ( const propiedad in Object.getOwnPropertyNames( archivoLista ) ) {

      const archivoTemporal = archivoLista[ propiedad ];

      if ( this._archivoPuedeSerCargado(archivoTemporal) ) {

        const nuevoArchivo = new FileItem( archivoTemporal );
        this.archivos.push( nuevoArchivo );

      }
    }

    console.log( this.archivos );

  }

  // Validaciones

    // verifico si el archivo es una imagen y no se cargó antes
  private _archivoPuedeSerCargado( archivo: File ): boolean {
    if ( !this._archivoYaFueDroppeado( archivo.name ) && this._esImagen( archivo.type )) {
      return true;
    } else {
      return false;
    }
  }

    // Prevengo que el navegador cargue el archivo
  private _prevenirDetener( event ) {
    event.preventDefault();
    event.stopPropagation();
  }

    // prevento que el archivo ya este
  private _archivoYaFueDroppeado( nombreArchivo: string ): boolean {

    for ( const archivo of this.archivos ) {

      if (archivo.nombreArchivo === nombreArchivo ) {
        console.log('El archivo ' + nombreArchivo + ' ya existe');
        return true;
      }
    }

    return false;

  }

    // Verifico que lo que dropeo sean imagenes
  private _esImagen( tipoArchivo: string ): boolean {
    return ( tipoArchivo === '' || tipoArchivo === undefined ) ? false : tipoArchivo.startsWith('image');
  }

}
