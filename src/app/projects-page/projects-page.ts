import { Component } from '@angular/core';
import { Nav } from "../nav/nav";
import { Footer } from "../footer/footer";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects-page',
  imports: [Nav, Footer, CommonModule, RouterLink],
  templateUrl: './projects-page.html',
  styleUrl: './projects-page.scss'
})
export class ProjectsPage {
}
