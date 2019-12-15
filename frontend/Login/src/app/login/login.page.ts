import { Component, OnInit } from '@angular/core';
import * as bigInt from "big-integer";
import * as sha from "js-sha256";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  postURL: string = "http://localhost:3000/usr";

  image: string = "https://source.unsplash.com/ygCOdo61k3E/800x450";

  username: string = "";
  password: string = "";

  constructor() { }

  ngOnInit() {
    document.getElementById('loginForm').onsubmit = this.login.bind(this);
  }

  validate():boolean {
    if(this.username === "")
      return false;
    return true;
  }

  submit() {
    (<HTMLFormElement>document.getElementById('loginForm')).submit();
  }

  login(e: Event) {
    if(e)
      e.preventDefault();
    if(!this.validate())
      return;
    console.log("Logging in with\n  username: ", this.username, "\n  password: ", this.password);

    const form = <HTMLFormElement>document.getElementById('loginForm');
    console.log(form);

    const user = <HTMLInputElement>document.getElementById("login/hidden/user");
    const pass = <HTMLInputElement>document.getElementById("login/hidden/pass");

    const user_field = <HTMLInputElement>document.getElementById("login/username");
    const pass_field = <HTMLInputElement>document.getElementById("login/password");

    user_field.disabled = true;
    pass_field.disabled = true;

    //pass.value = this.password;
    const url = this.postURL;
    const username = this.username;
    const password = this.password;

    /*form.method = "post";
    form.action = this.postURL;
    form.submit();*/


    (async function() {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if(!data.G || !data.P) {
              alert("Data transmission error");
            }
            else {
              console.log("T: " + typeof data.G);
              console.log("A: " + data.G);

              let G = bigInt(data.G, 16);
              let P = bigInt(data.P, 16);

              let start = performance.now();
              let small_b = bigInt(sha.sha256(password), 16);
              let end = performance.now();
              console.log("SHA 256 time: " + (end - start));

              start = performance.now();
              let big_b = bigInt(G).modPow(bigInt(small_b), bigInt(P)).toString(16);
              end = performance.now();
              console.log("modPow time: " + (end - start));

              console.log("Big_b: " + big_b);

              user.value = username;
              pass.value = big_b;

              form.method = "post";
              form.action = url;
              form.submit();

              user_field.disabled = false;
              pass_field.disabled = false;
            }
          }
          else {
            console.log(xhr.status);
          }
        }
      };
      xhr.open("OPTIONS", url, true);
      xhr.send();
    })();
  }
}
