import { Component, OnInit } from '@angular/core';

const URL = "http://localhost:3000/usr";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  image: string = "https://source.unsplash.com/ygCOdo61k3E/800x450";

  username: string = "";
  password: string = "";

  constructor() { }

  ngOnInit() {}

  validate():boolean {
    if(this.username === "")
      return false;
    return true;
  }

  login() {
    if(!this.validate())
      return;
    console.log("Loggin in with\n  username: ", this.username, "\n  password: ", this.password);

    const user = this.username;
    const pass = this.password;
    (async function() {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if(xhr.status === 200 && xhr.readyState === 4) {
          // ...
          alert("Success");
        }
      };
      xhr.open("POST", URL, true);
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify({user: user, pass: pass}));
    })();
  }
}
