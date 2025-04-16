import {Component, OnInit} from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-explore-main-drawer',
  templateUrl: './explore-main-drawer.component.html',
})
export class ExploreMainDrawerComponent implements OnInit {
  appThemeName: string = "VNPT";
  appPurchaseUrl: string = "VNPT";
  appPreviewUrl: string = "VNPT";
  appDemos = "VNPT";

  constructor() {
  }

  ngOnInit(): void {
  }
}
