import { Component } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-services',
  imports: [Nav, Footer],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class Services {

}