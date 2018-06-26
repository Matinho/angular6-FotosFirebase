import { Injectable } from '@angular/core';

import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {

  private CARPETA_IMAGEN = 'img';

  constructor( private db: AngularFirestore ) { }

  cargarImagenesFirebase( imagenes: FileItem[] ) {

    const storageRef = firebase.storage().ref();

    for ( const item of imagenes ) {

      item.estaSubiendo = true;
      if ( item.progreso >= 100 ) {
        continue; // salgo al nuevo ciclo del for
      }

      const referenciaImagen = storageRef.child(`${ this.CARPETA_IMAGEN }/${ item.nombreArchivo }`);
      const uploadTask: firebase.storage.UploadTask = referenciaImagen.put( item.archivo ) ;

      // Actualizo cada vez que haya un cambio y recibo varias cosas
      uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
          ( snapshot: firebase.storage.UploadTaskSnapshot ) =>
                      item.progreso = ( snapshot.bytesTransferred / snapshot.totalBytes ) * 100,
          ( error ) => console.error('Error al subir', error ),
          () => {

            referenciaImagen.getDownloadURL().then(
              ( urlImagen ) => {
                console.log('Imagen cargada correctamente');
                item.URL = urlImagen;
                item.estaSubiendo = false;
                this.guardarImagen({
                    nombre: item.nombreArchivo,
                    url: item.URL
                });
              },
              ( error ) => console.log('No existe la URL')
            );

          }

       );

    }
    
  }

  private guardarImagen ( imagen: { nombre: string, url: string } ) {

    this.db.collection(`/${ this.CARPETA_IMAGEN }`)
            .add( imagen );

  }

}
