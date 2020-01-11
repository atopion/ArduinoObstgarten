import { Component, OnInit } from '@angular/core';
import {LogoutService} from "../logout.service";

@Component({
    selector: 'app-maturity',
    templateUrl: './maturity.page.html',
    styleUrls: ['./maturity.page.scss'],
})
export class MaturityPage implements OnInit {

    username = LogoutService.username;

    mapLoading: boolean = true;

    currentMap: string = "https://picsum.photos/500/500";

    maps: {id: number, value: string, name: string}[] = [
        {id: 1, value: "tomatoes", name: "Tomatoes"},
        {id: 2, value: "wheat", name: "Wheat"},
        {id: 3, value: "soybeans", name: "Soybeans"}
    ];

    selectedMap: string = "1";

    constructor(private logout: LogoutService) { }

    ngOnInit() {
    }

    loadNewImage(): void {
        console.log("Load new image");
        this.mapLoading = true;
        this.currentMap = this.currentMap + "?" + new Date().getTime();

        const url = "https://141.5.104.8/query?type=forecast&fruit=" + (this.getMapForID(Number(this.selectedMap)) || "tomatoes");
        console.log("URL: " + url);
    }

    mapLoaded(): void {
        this.mapLoading = false;
    }

    /** Helpers **/
    getMapForID(id: number): {id: number, value: string, name: string} | null {
        this.maps.forEach((value, index) => {
            if(value.id === id)
                return this.maps[index];
        });
        return null;
    }

}
