import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

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
    e.preventDefault();
    if(!this.validate())
      return;
    console.log("Loggin in with\n  username: ", this.username, "\n  password: ", this.password);

    const form = <HTMLFormElement>document.getElementById('loginForm');
    console.log(form);

    const user = <HTMLInputElement>document.getElementById("login/hidden/user");
    const pass = <HTMLInputElement>document.getElementById("login/hidden/pass");

    user.value = this.username;
    pass.value = this.password;

    form.method = "post";
    form.action = this.postURL;
    form.submit();

    /*const user = this.username;
    const pass = this.password;
    const url = this.postURL;
    (async function() {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if(xhr.status === 200 && xhr.readyState === 4) {
          // ...
          alert("Success");
        }
      };
      xhr.open("POST", url, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify({user: user, pass: pass}));
    })();*/
  }
}
