import { Component } from '@angular/core';
import {LogoutService} from "../logout.service";

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    username = LogoutService.username;

    constructor(private logout: LogoutService) {
        console.log(this.username)
    }
}
