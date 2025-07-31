import { Component, inject, ViewContainerRef, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { DataService } from './data.service';
import { FooterComponent } from "./footer/footer";
import { PopupService } from './popup-message/popup.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private dataService = inject(DataService);
  private popupService = inject(PopupService);
  private vcr = inject(ViewContainerRef);

  protected readonly title = 'Expense Tracker';

  ngOnInit() {
    this.popupService.setViewContainer(this.vcr);
  }
}
