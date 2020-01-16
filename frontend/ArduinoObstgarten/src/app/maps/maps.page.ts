import {AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import {LogoutService} from "../logout.service";
import {Events} from "@ionic/angular";

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit, AfterViewInit {

    username = this.logout.username;

    mapLoading: boolean = true;
    screenWidth: number = 0;

    currentMap: string = "https://picsum.photos/500/500";

    maps: {id: number, value: string, name: string}[] = [
        {id: 1, value: "humidity", name: "Humidity"},
        {id: 2, value: "sunlight", name: "Sunlight"},
        {id: 3, value: "wind", name: "Wind"}
    ];

    selectedMap:string = "1";

    constructor(private renderer: Renderer2, private logout: LogoutService) {
    }

    ngOnInit() {}

    ngAfterViewInit(): void {

    }

    /** Helpers **/
    getMapForID(id: number): {id: number, value: string, name: string} | null {
        this.maps.forEach((value, index) => {
            if(value.id === id)
                return this.maps[index];
        });
        return null;
    }

    loadNewImage(): void {
        console.log("Load new image: " + this.selectedMap);
        this.mapLoading = true;
        this.currentMap = this.currentMap + "?" + new Date().getTime();

        const url = "https://141.5.104.8/query?type=" + (this.getMapForID(Number(this.selectedMap)) || "humidity");
        console.log("URL: " + url);
    }

    mapLoaded(): void {
        this.mapLoading = false;
    }
}