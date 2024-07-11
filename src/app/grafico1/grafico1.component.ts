import { Component, ElementRef, ViewChild } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire/app';
import { Observable, catchError, forkJoin, from, of, switchMap, take } from 'rxjs';
import { getDownloadURL, getStorage, listAll, ref } from '@angular/fire/storage';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-grafico1',
  templateUrl: './grafico1.component.html',
  styleUrls: ['./grafico1.component.css']
})

export class Grafico1Component {
  @ViewChild('doughnutCanvas') private doughnutCanvas : ElementRef | undefined;
  @ViewChild('doughnutCanvas2') private doughnutCanvas2: ElementRef | undefined;

  doughnutChart : any;
  doughnutChart2 : any;
  storage = getStorage(this.firebase);
  fotos : any[] = [];
  loading : boolean = true;
  fotosRef = ref(this.storage);
  turnos : any[] = [];
  especialistas: any[] = [];
  turnosPorMedico : any[] = [];
  finalArray : any[] = [];
  chart: any;
  especialidades: any[] = [];
  turnosPorEspecialidad: any[] = [];
  finalArray2 : any[] = [];

  constructor(private fire: Firestore, private firebase: FirebaseApp){
    Chart.register(...registerables)
  }

  ngOnInit(){
    forkJoin({
      especialistas: this.getEspecialistas().pipe(take(1)),
      turnos: this.getTurnos().pipe(take(1)),
      especialidades: this.getEspecialidades().pipe(take(1))
    }).pipe(
      switchMap(({especialistas, turnos, especialidades}) =>{
        this.especialistas = especialistas;
        this.turnos = turnos;
        this.especialidades = especialidades;
        return this.getFotos().pipe(take(1))
      })
    ).subscribe({
      next: (fotos) =>{
        this.fotos = fotos;
        this.loading = false;
        this.llenarTurnosPorMedico();
        this.llenarTurnosPorEspecialidad();
        this.doughnutChartMethod();
        console.log(this.finalArray);
        console.log(this.finalArray2);
        this.doughnutChartMethod2();
      },
      error: () => {
        this.loading = false;
      }
    })
  }

  getEspecialidades(): Observable<any[]> {
    const espRef = collection(this.fire, 'especialidades');
    return collectionData(espRef) as Observable<any[]>;
  }

  getTurnos() : Observable<any[]>{
    const turRef = collection(this.fire, 'turnos');
    return collectionData(turRef) as Observable<any[]>;
  }

  getEspecialistas() : Observable<any[]>{
    const espRef = collection(this.fire, 'especialistas');
    return collectionData(espRef) as Observable<any[]>;
  }

  getFotos(): Observable<string[]> {
    return from(listAll(this.fotosRef)).pipe(
        switchMap(res => {
            const urlPromises = res.items.map(itemRef => getDownloadURL(itemRef));
            return forkJoin(urlPromises);
        })
    );
  }

  llenarTurnosPorEspecialidad(){
    this.finalArray2 = [];
    this.turnosPorEspecialidad = [];
    this.especialidades.forEach(especialidad =>{
      console.log(this.turnos);
      const turnosDeEspecialidad = this.turnos.filter(turno => turno.especialidad == especialidad.especialidad);
      if(turnosDeEspecialidad.length > 0){
        this.turnosPorEspecialidad.push({
          especialidad: especialidad.especialidad,
          turnos: turnosDeEspecialidad
        })
      }
    })
    this.turnosPorEspecialidad.forEach(turno =>{
      this.finalArray2.push({
        especialidad: turno.especialidad,
        turnos: turno.turnos.length
      })
    })
  }

  llenarTurnosPorMedico() {
    this.finalArray = [];
    this.turnosPorMedico = [];
    this.especialistas.forEach(especialista => {
        const turnosDelEspecialista = this.turnos.filter(turno => turno.especialista === especialista.dni);
        if (turnosDelEspecialista.length > 0) {
            this.turnosPorMedico.push({
                nombre: especialista.nombre,
                apellido: especialista.apellido,
                turnos: turnosDelEspecialista
            });
        }
    });
    this.turnosPorMedico.forEach(turno =>{
      this.finalArray.push({
        nombre: turno.nombre + " " + turno.apellido,
        turnos: turno.turnos.length
      })
    });
  }

  doughnutChartMethod2() {
    if (this.doughnutCanvas2 && this.doughnutCanvas2.nativeElement) {
      const ctx = this.doughnutCanvas2.nativeElement.getContext('2d');

      const labels = this.finalArray2.map(item => item.especialidad);
      const data = this.finalArray2.map(item => item.turnos);

      this.doughnutChart2 = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Turnos por especialidad',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
              // Add more colors as needed
            ],
            //hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem: any) {
                  return `${tooltipItem.label}: ${tooltipItem.raw}`;
                }
              }
            }
          }
        }
      });
    }
  }

  doughnutChartMethod() {
    if (this.doughnutCanvas && this.doughnutCanvas.nativeElement) {
      const ctx = this.doughnutCanvas.nativeElement.getContext('2d');
  
      const labels = this.finalArray.map(item => item.nombre);
      const data = this.finalArray.map(item => item.turnos);
  
      // Creating the doughnut chart
      this.doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Turnos por Médico',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)'
              // Add more colors as needed
            ],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem: any) {
                  return `${tooltipItem.label}: ${tooltipItem.raw}`;
                }
              }
            }
          }
        }
      });
    }
  }
}
