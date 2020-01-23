import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LogoutService {

    username:string = "  ";

    constructor() {
        this.get_usr();
    }

    async get_usr() {
        const usr_url = window.location.protocol + "//" + window.location.hostname + ":3000/usr";

        const xhr = new XMLHttpRequest();
        xhr.onloadend = () => {
            if(xhr.readyState === 4) {
                console.log("XHR: status: " + xhr.status);

                if(xhr.status === 200)
                    this.username = xhr.responseText;
                else
                    this.username = "USR";
            }
        };
        xhr.open("GET", usr_url);
        xhr.send();
    }

    logout() {
        const logout_url = window.location.protocol + "//" + window.location.hostname + ":" + (window.location.port ? window.location.port : "443") + "/logout";

        (async () => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", logout_url);
            xhr.onload = () => {
                if (xhr.readyState === 4 && xhr.status === 401) {
                    alert("You are not logged in.");
                } else if (xhr.readyState === 4 && xhr.status === 200) {
                    window.location.reload();
                }
            };
            xhr.send("");
        })();
    }
}
