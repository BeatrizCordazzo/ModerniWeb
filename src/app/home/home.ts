import { Component } from '@angular/core';
import { Nav } from "../nav/nav";
import { Banner } from '../banner/banner';
import { Projects } from "../projects/projects";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-home',
  imports: [Nav, Banner, Projects, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
