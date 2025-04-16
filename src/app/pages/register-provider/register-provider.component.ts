import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {CommonModule, NgForOf, NgOptimizedImage} from "@angular/common";
import {MatPaginatorModule} from "@angular/material/paginator";
import {SharedModule} from "../../_metronic/shared/shared.module";
import {MatInputModule} from "@angular/material/input";
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {FormAddUser, UserService} from "../../services/user.service";
import {AuthHTTPService} from "../../modules/auth/services/auth-http";

@Component({
  selector: 'app-register-provider',
  standalone: true,
  imports: [MatPaginatorModule,
    SharedModule,
    MatInputModule,
    NgForOf,
    FormsModule,
    CommonModule,
    RouterLinkActive,
    RouterLink,
    NgOptimizedImage, ReactiveFormsModule],
  templateUrl: './register-provider.component.html',
  styleUrl: './register-provider.component.scss'
})
export class RegisterProviderComponent implements OnInit {
  registrationForm: FormGroup;
  userType: string = '1';  // Mặc định là '1-personal 2-company'
  imagePreviewBefore: string | ArrayBuffer | null = null;
  imagePreviewAfter: string | ArrayBuffer | null = null;

  fileBefore: File
  fileAfter: File
  constructor(private fb: FormBuilder,
              private userService: UserService,
              private authService: AuthHTTPService,
              private router: Router) {}

  ngOnInit(): void {
    // Khởi tạo form
    this.registrationForm = this.fb.group({
      userType: ['1'],
      cardId: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: [''],
      website: [''],
      cardIdImageBefore: [''], // Custom validation for file input
      cardIdImageAfter: ['']
    });

  }

  onFileChangeBefore(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewBefore = reader.result;  // Set the image preview
      };
      reader.readAsDataURL(file);
      this.fileBefore = file;
    }
  }

  onFileChangeAfter(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewAfter = reader.result;  // Set the image preview
      };
      reader.readAsDataURL(file);
      this.fileAfter = file;

    }
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      const token = <string>localStorage.getItem('v8.2.3-auth-token');
      this.authService.getUserByToken(token).subscribe((user: any) => {
        const formAddInfo = new FormAddUser();
        formAddInfo.kind = Number.parseInt(this.registrationForm.get('userType')?.value, 10);
        formAddInfo.cardId =this.registrationForm.get('cardId')?.value;
        formAddInfo.phone = this.registrationForm.get('phoneNumber')?.value;
        formAddInfo.website = this.registrationForm.get('website')?.value;

        this.addInfo(user.uid, formAddInfo, token);

        this.uploadImage(user.uid, this.fileBefore, this.fileBefore.name, token)
        this.uploadImage(user.uid, this.fileAfter, this.fileAfter.name, token)

        this.registerProvider(token)

        this.router.navigate(['/'])
        window.location.reload();
      })
    } else {
      console.log('Form is invalid');
    }
  }



  addInfo(customerId: number, formAddUser: FormAddUser, token: string) {
    this.userService.addInfo(customerId, formAddUser, token).subscribe((result: any) => {
    })
  }

  uploadImage(customerId: number, image: File, imageKey: string, token: string) {
    this.userService.uploadImage(image, imageKey, customerId, token).subscribe((result: any) => {
    })
  }

  registerProvider(token: string) {
    this.userService.registerProvider(token).subscribe((result: any) => {
    })
  }
}
