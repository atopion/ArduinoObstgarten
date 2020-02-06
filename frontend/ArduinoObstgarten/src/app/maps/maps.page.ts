import {AfterViewInit, Component, OnInit, Renderer2} from '@angular/core';
import {LogoutService} from "../logout.service";

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit, AfterViewInit {

    username = this.logout.username;

    mapLoading: boolean = true;
    screenWidth: number = 0;

    currentMap: string = "https://www.bat-obstgarten.de:3000/images/" + this.username + "_" + "humidity" + ".png";

    maps: {id: number, value: string, name: string}[] = [
        {id: 1, value: "humidity", name: "Humidity"},
        {id: 2, value: "sunlight", name: "Sunlight"}
    ];

    selectedMap:string = "1";

    constructor(private renderer: Renderer2, private logout: LogoutService) {}

    ngOnInit() {}

    ngAfterViewInit(): void {

    }

    /** Helpers **/
    getMapForID(id: number): string | null {
        for(let map of this.maps) {
            if(map.id === id)
                return map.value;
        }
        return null;
    }

    loadNewImage(): void {
        console.log("Load new image: " + this.selectedMap);
        let type = (this.getMapForID(Number(this.selectedMap)) || "humidity");
        console.log("Type: ", type);
        this.mapLoading = true;
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if(xhr.readyState === 4) {
                this.currentMap = "https://www.bat-obstgarten.de:3000/images/" + this.username + "_" + type + ".png";
                this.mapLoading = false;
            }
        };
        xhr.withCredentials = true;
        xhr.open("GET", "https://www.bat-obstgarten.de:3000/query?type=" + type);
        xhr.send();
    }

    mapLoaded(): void {
        this.mapLoading = false;
    }
}