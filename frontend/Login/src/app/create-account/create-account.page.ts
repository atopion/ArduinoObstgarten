import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';

const URL = "http://localhost:3000/usr";

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit, AfterViewInit {

  image: string = "https://source.unsplash.com/4miBe6zg5r0/800x450";

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

  ngOnInit() {}

  ngAfterViewInit() {
    console.log(this.input_username);
    console.log(this.input_password);
    console.log(this.input_password_confirm);
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
