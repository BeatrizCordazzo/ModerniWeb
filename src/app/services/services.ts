import { Component } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [Nav, Footer, RouterLink, RouterOutlet],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class Services {

}