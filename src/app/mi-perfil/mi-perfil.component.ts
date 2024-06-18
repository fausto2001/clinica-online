import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { FirebaseApp } from '@angular/fire/app';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent {

  usuarioActual:any;
  storage = getStorage(this.firebase);
  fotosRef = ref(this.storage);
  foto1:any = "";
  foto2:any = "";
  paciente:boolean=false;
  
  constructor(private service:AuthService, private firebase: FirebaseApp){
    this.usuarioActual = service.currentUser;
    this.usuarioActual = this.usuarioActual.source.value;
    if(this.usuarioActual.perfil == 'paciente')
    {this.paciente=true}
    console.info(this.usuarioActual);
    this.getFoto();
  }

  async getFoto(){
    await(listAll(this.fotosRef)).then((res) =>{
      res.items.forEach((itemRef) =>{
        getDownloadURL(itemRef).then((url)=>{
          if(this.usuarioActual.perfil == 'paciente'){
            if(itemRef.fullPath.includes(this.usuarioActual.dni)){
              if(itemRef.fullPath.includes("perfil"))
              {
                this.foto1 = url;
              }
              else
              {
                this.foto2 = url;
              }
            }
          }
          else
          {
            if(itemRef.fullPath.includes(this.usuarioActual.dni))
            {
              this.foto1 = url;
            }
          }
        })
      })
    })
  }
}
