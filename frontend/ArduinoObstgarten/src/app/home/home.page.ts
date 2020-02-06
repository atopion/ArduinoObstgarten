import { Component } from '@angular/core';
import {LogoutService} from "../logout.service";

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    incCounter: number = 4;
    username = this.logout.username;

    nodeList: {name: string, x: number, y: number}[] =
        [
            { name: "Node 1", x: 50,  y: 50},
            { name: "Node 2", x: 450, y: 50},
            { name: "Node 3", x: 50,  y: 450},
            { name: "Node 4", x: 450, y: 450}
        ];

    constructor(private logout: LogoutService) {
        console.log(this.username);
        this.load();
    }

    del(i) {
        this.nodeList.splice(i, 1);
    }

    add() {
        this.nodeList.push({name: "Node " + (++this.incCounter), x: 250, y: 250});
    }

    async load() {
        const load_url = window.location.protocol + "//" + window.location.hostname + ":3000/nodes";

        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    this.nodeList = JSON.parse(xhr.responseText);
                }
                else {
                    alert("The node list could not be loaded");
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("GET", load_url);
        xhr.send(JSON.stringify(this.nodeList));
    }

    async confirm() {
        const confirm_url = window.location.protocol + "//" + window.location.hostname + ":3000/nodes";

        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    return;
                }
                else {
                    alert("The node update could not be send.");
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", confirm_url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(this.nodeList));
    }
}
