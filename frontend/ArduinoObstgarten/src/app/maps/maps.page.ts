import {AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';
import * as h337 from 'heatmap.js'
import {Heatmap} from 'heatmap.js';
import {LogoutService} from "../logout.service";
import {Events} from "@ionic/angular";

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit, AfterViewInit {

    username = LogoutService.username;

    mapLoading: boolean = true;
    screenWidth: number = 0;
    dummyData: Array<any> = [];

    maps: {id: number, value: string, name: string}[] = [
        {id: 1, value: "humidity", name: "Humidity"},
        {id: 2, value: "sunlight", name: "Sunlight"},
        {id: 3, value: "wind", name: "Wind"}
    ];

    selectedMapID: number = -1;

    heatmap: Heatmap<string, string, string> = null;

    @ViewChild('heatmapContainer', {static: false}) container: ElementRef;

    constructor(private renderer: Renderer2, private logout: LogoutService) {
        //this.getScreenSize();
    }

    ngOnInit() {}

    ngAfterViewInit(): void {

        console.log("DEBUG: 0");
        if(this.screenWidth - 20 > 500) {
            this.renderer.setStyle(this.container.nativeElement, "width", "500px");
            this.renderer.setStyle(this.container.nativeElement, "height", "500px");
        }

        console.log("DEBUG: 1");
        this.heatmap = h337.create({
            container: document.getElementById('heatmapContainer'),
            radius: 10,
            maxOpacity: .5,
            minOpacity: 0,
            blur: .75,
        });

        console.log("DEBUG: 2");
        const initData = {
            min: 0,
            max: 100,
            data: []
        };

        console.log("DEBUG: 3");
        this.heatmap.setData(initData);

        console.log("DEBUG: 4");
        this.generateData();
    }

    generateData() {
        let data = [];
        this.mapLoading = true;
        this.heatmap.setData({min: 0, max: 100, data: []});
        console.log("DEBUG: 5");

        if(this.selectedMapID === -1)
            this.generateDummyData((x,y) => x+y);
        else if(this.selectedMapID === 1)
            this.generateDummyData((x,y) => (500-x) + y);
        else if(this.selectedMapID === 2)
            this.generateDummyData((x,y) => x + (500 -y));
        else if(this.selectedMapID === 3)
            this.generateDummyData((x,y) => (500-x) + (500-y));
        console.log("DEBUG: 6");
    }


    /** Helpers **/
    getMapForID(id: number): {id: number, value: string, name: string} | null {
        this.maps.forEach((value, index) => {
            if(value.id === id)
                return this.maps[index];
        });
        return null;
    }

    /*@HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
        this.screenWidth = window.innerWidth;
        console.log(this.screenWidth);
    }*/

    generateDummyData(fn:(x: number, y: number) => number) {
            // Produce dummy data
            for(let x = 0; x < 500; x += 20) {
                for (let y = 0; y < 500; y += 20) {
                    const val = { x: x, y: y, value: fn(x,y) };
                    console.log("Index: ", x, " ", y);
                    this.heatmap.addData(val);
                }
            }
            console.log("DEBUG: 7");

            //this.heatmap.addData(this.dummyData);
            //console.log(this.heatmap.getData());
            console.log("DEBUG: 8");
            this.heatmap.repaint();
            console.log("DEBUG: 9");
            this.mapLoading = false;
    }
}