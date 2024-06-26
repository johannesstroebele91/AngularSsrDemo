import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment"

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <h1>Welcome to {{title}}!</h1>
    <button (click)="getSecret()">Get</button>
    <router-outlet />
  `,
  styles: [],
})
export class AppComponent {
  title = 'AngularSsrDemo';

  constructor(private http: HttpClient) { }

  getSecret() {
    console.log(this.http.get<{ secret: string }>(environment.endpoint +'api/secret').subscribe({next: (data) => console.log(data)}))
  }
}
