import { Component, OnInit } from '@angular/core';
import {LogoutService} from "../logout.service";

@Component({
    selector: 'app-maturity',
    templateUrl: './maturity.page.html',
    styleUrls: ['./maturity.page.scss'],
})
export class MaturityPage implements OnInit {

    username = this.logout.username;

    mapLoading: boolean = true;

    currentMap: string = "https://www.bat-obstgarten.de:3000/images/" + this.username + "_forecast_" + "tomato" + ".png";

    maps: {id: number, value: string, name: string}[] = [
        {id: 1, value: "tomato", name: "Tomatoes"},
        {id: 2, value: "apple", name: "Apple"},
        {id: 3, value: "soybeans", name: "Soybeans"}
    ];

    selectedMap: string = "1";

    constructor(private logout: LogoutService) { }

    ngOnInit() {
    }

    loadNewImage(): void {
        console.log("Load new image");
        this.mapLoading = true;
        let fruit = (this.getMapForID(Number(this.selectedMap)) || "tomato");
        console.log(fruit);
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if(xhr.readyState === 4) {
                this.currentMap = "https://www.bat-obstgarten.de:3000/images/" + this.username + "_forecast_" + fruit + ".png";
                this.mapLoading = false;
            }
        };
        xhr.withCredentials = true;
        xhr.open("GET", "https://www.bat-obstgarten.de:3000/query?type=forecast&fruit=" + fruit);
        xhr.send();
    }

    mapLoaded(): void {
        this.mapLoading = false;
    }

    /** Helpers **/
    getMapForID(id: number): string | null {
        for(let map of this.maps) {
            if(map.id === id)
                return map.value;
        }
        return null;
    }

}
