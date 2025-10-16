import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-banner',
  imports: [MatCardModule, RouterLink],
  templateUrl: './banner.html',
  styleUrl: './banner.scss'
})
export class Banner {

}
