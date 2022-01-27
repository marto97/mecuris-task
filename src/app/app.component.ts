import { Component } from '@angular/core';
import { AppServiceService } from './app-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '3D configurator';

  constructor(private service: AppServiceService){}

  ngOnInit(): void {
    this.getDataFromAPI();
  }

  getDataFromAPI(){
    this.service.getData().subscribe((response) =>{
      console.log('Response from API is ' + response)
    }, (error)=>{
      console.log('Error is ', console.error);

    }
    )
  }
}
