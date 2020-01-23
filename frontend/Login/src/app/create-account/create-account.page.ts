import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import * as sha from 'js-sha256';
import * as bigInt from 'big-integer'

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {

  image: string = "https://source.unsplash.com/4miBe6zg5r0/800x450";

  postURL = window.location.protocol + "//" + window.location.hostname + ":" + (window.location.port ? window.location.port : "443") + "/create";

  username: string = "";
  password: string = "";
  password_confirm: string = "";

  @ViewChild('create.username', {static: false}) input_username: ElementRef;
  @ViewChild('create.password', {static: false}) input_password: ElementRef;
  @ViewChild('create.password.confirm', {static: false}) input_password_confirm: ElementRef;

  @ViewChild('hint.username', {static: false}) hint_username: ElementRef;
  @ViewChild('hint.password', {static: false}) hint_password: ElementRef;
  @ViewChild('hint.password.confirm', {static: false}) hint_password_confirm: ElementRef;

  username_valid: boolean = true;
  password_valid: boolean = true;
  password_confirm_valid: boolean = true;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    document.getElementById('createAccountForm').onsubmit = this.create.bind(this);
  }

  validateUsername() {
    if(this.username === "") {
      this.renderer.setStyle(this.input_username.nativeElement, "border", "1px solid red");
      this.renderer.setStyle(this.hint_username.nativeElement, "display", "inline");
      this.renderer.setProperty(this.hint_username.nativeElement, "innerHTML", "&#x26a0; The username cannot be empty");
      this.username_valid = false;
    } else {
      this.renderer.setStyle(this.input_username.nativeElement, "border", "1px solid #ccc");
      this.renderer.setStyle(this.hint_username.nativeElement, "display", "none");
      this.username_valid = true;
    }
  }

  validatePassword() {
    if(this.password !== "") {
      this.renderer.setStyle(this.input_password.nativeElement, "border", "1px solid #ccc");
      this.renderer.setStyle(this.hint_password.nativeElement, "display", "none");
      this.password_valid = true;
    } else {
      this.renderer.setStyle(this.input_password.nativeElement, "border", "1px solid red");
      this.renderer.setStyle(this.hint_password.nativeElement, "display", "inline");
      this.renderer.setProperty(this.hint_password.nativeElement, "innerHTML", "&#x26a0; The password cannot be empty");
      this.password_valid = false;
    }
  }

  validatePasswordConfirm() {
    if(this.password_confirm !== this.password) {
      this.renderer.setStyle(this.input_password_confirm.nativeElement, "border", "1px solid red");
      this.renderer.setStyle(this.hint_password_confirm.nativeElement, "display", "inline");
      this.renderer.setProperty(this.hint_password_confirm.nativeElement, "innerHTML", "&#x26a0; The passwords do not match");
      this.password_confirm_valid = false;
    } else {
      this.renderer.setStyle(this.input_password_confirm.nativeElement, "border", "1px solid #ccc");
      this.renderer.setStyle(this.hint_password_confirm.nativeElement, "display", "none");
      this.password_confirm_valid = true;
    }
  }

  checkEntries():boolean {
    this.validateUsername();
    this.validatePassword();
    this.validatePasswordConfirm();
    return this.username_valid && this.password_valid && this.password_confirm_valid;
  }

  create() {
    if(!this.checkEntries()) {
      console.log("Errors in creating user");
      return;
    }
    // TODO create user
    console.log("Creating:\n\tusername: ", this.username, "\n\tpassword: ", this.password);

    const form = <HTMLFormElement>document.getElementById('createAccountForm');
    console.log(form);

    const user = <HTMLInputElement>document.getElementById("createAccount/hidden/user");
    const pass = <HTMLInputElement>document.getElementById("createAccount/hidden/pass");

    const username = this.username;
    const password = this.password;

    const url = this.postURL;

    (async function() {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 201) {
            const data = JSON.parse(xhr.responseText);
            if(!data.big_a || !data.P) {
              alert("Data transmission error");
            }
            else {
              console.log("T: " + typeof data.big_a);
              console.log("A: " + data.big_a);

              let big_a = bigInt(data.big_a);
              let P = bigInt(data.P);

              let start = performance.now();
              let small_b = bigInt(sha.sha256(password), 16);
              let end = performance.now();
              console.log("SHA 256 time: " + (end - start));

              start = performance.now();
              let key = bigInt(big_a).modPow(bigInt(small_b), bigInt(P)).toString(16);
              end = performance.now();
              console.log("modPow time: " + (end - start));

              console.log("Key: " + key);

              pass.value = key;
              user.value = username;

              form.method = "post";
              form.action = url;
              form.submit();
            }
          }
          else if(xhr.status === 401) {
            alert("Could not create user");
          }
        }
      };
      xhr.open("OPTIONS", url + "?user=" + username, true);
      xhr.send();
    })();
  }

}
