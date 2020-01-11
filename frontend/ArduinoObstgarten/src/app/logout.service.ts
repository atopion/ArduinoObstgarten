import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LogoutService {

    static username = "user";

    constructor() { }

    logout() {
        const logout_url = "http://localhost:3000/logout";

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
