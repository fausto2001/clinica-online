"use strict";(self.webpackChunkclinica_online=self.webpackChunkclinica_online||[]).push([[886],{2886:(b,u,i)=>{i.r(u),i.d(u,{MailActivacionModule:()=>m});var f=i(6814),d=i(5920),r=i(90),c=i(2163),o=i(4946);const g=function(){return[""]},p=[{path:"",component:(()=>{class t{constructor(n){this.fire=n,this.mail=localStorage.getItem("emailForSignIn"),console.log(localStorage.getItem("emailForSignIn"));const e=(0,r.v0)();if((0,r.JB)(e,window.location.href)){let a=this.mail;a||(a=window.prompt("Por cuestiones de seguridad, necesitamos que nos proveas el mail de confirmaci\xf3n: "),this.mail=a)}(0,r.P6)(e,this.mail,window.location.href).then(a=>{this.getPacientes().subscribe(h=>{const s=h.find(l=>l.mail==this.mail);if(s){console.info(s);const l=(0,c.JU)(n,"pacientes",s.idDoc);(0,c.r7)(l,{validado:!0})}}),window.localStorage.removeItem("emailForSignIn")}).catch(a=>{console.info("error")})}getPacientes(){const n=(0,c.hJ)(this.fire,"pacientes");return(0,c.BS)(n,{idField:"idDoc"})}static#o=this.\u0275fac=function(e){return new(e||t)(o.Y36(c.gg))};static#t=this.\u0275cmp=o.Xpm({type:t,selectors:[["app-mail-activacion"]],decls:12,vars:3,consts:[[1,"container"],["src","../../assets/mail.png",2,"width","100px","margin-left","290px"],[2,"color","black","margin-left","245px"],[2,"color","black"],[1,"floating-button",3,"routerLink"]],template:function(e,a){1&e&&(o.TgZ(0,"body")(1,"div",0),o._UZ(2,"img",1)(3,"br")(4,"br"),o.TgZ(5,"h3",2),o._uU(6,"Login exitoso!"),o.qZA(),o._UZ(7,"br")(8,"br"),o.TgZ(9,"h4",3),o._uU(10),o.qZA()()(),o._UZ(11,"button",4)),2&e&&(o.xp6(10),o.hij("Se confirm\xf3 el link ",a.mail,". Ya pod\xe9s ingresar correctamente a cualquiera de nuestros servicios. "),o.xp6(1),o.Q6J("routerLink",o.DdM(2,g)))},dependencies:[d.rH],styles:["body[_ngcontent-%COMP%]{height:100%;background-color:#c70707;background-image:url(clinic.0a0eb57132030e74.jpg);height:100vh;background-repeat:no-repeat;background-attachment:fixed;background-size:cover;color:#fff}.container[_ngcontent-%COMP%]{background-color:#ffffff89;position:absolute;margin-left:30%;margin-top:5%;border-radius:8px;box-shadow:0 4px 8px #0000001a;width:700px;flex:1}.floating-button[_ngcontent-%COMP%]{position:fixed;top:20px;left:20px;width:140px;height:140px;border-radius:50%;background-color:#f99;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 6px #0000001a;transition:background-color .3s ease-in-out;background-image:url(casa.ee7bd0ec07fb5d4a.png);background-size:60%;background-position:center;background-repeat:no-repeat;display:flex;flex-direction:column;justify-content:center;align-items:center}"]})}return t})()}];let m=(()=>{class t{static#o=this.\u0275fac=function(e){return new(e||t)};static#t=this.\u0275mod=o.oAB({type:t});static#e=this.\u0275inj=o.cJS({imports:[f.ez,d.Bz.forChild(p)]})}return t})()}}]);