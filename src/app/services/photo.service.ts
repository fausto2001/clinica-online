import { Injectable } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import { getStorage, ref, updateMetadata, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor(private fire: FirebaseApp) { }

  public async subirFoto(foto:File, dni:string, key:string = 'default')
  {
    const storage = getStorage(this.fire);
    const photoRef = ref(storage, dni + key + ".jpg");
    const bytes = await foto;
    console.info(bytes.size);
    const metadata = 
    {
      customMetadata:
      {
        dni : dni,
        key : key
      }
    }
    await uploadBytesResumable(photoRef, bytes).then((snapshot) =>
    {
      updateMetadata(photoRef, metadata);
      console.log(snapshot);
      console.log("uplodeado!");
    })
  }
}
