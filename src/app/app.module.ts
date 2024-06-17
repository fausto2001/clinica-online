import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MailActivacionComponent } from './mail-activacion/mail-activacion.component';

@NgModule({
  declarations: [
    AppComponent,
    MailActivacionComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    provideFirebaseApp(() => initializeApp({"projectId":"clinica-online-47d16","appId":"1:406208429027:web:12dee30e70d237e3d43ed6",
      "storageBucket":"clinica-online-47d16.appspot.com","apiKey":"AIzaSyB9VGncLe0OChtq_Orfa-E4ntVqOCek2h4",
      "authDomain":"clinica-online-47d16.firebaseapp.com","messagingSenderId":"406208429027","measurementId":"G-BSJF70LDNX"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
