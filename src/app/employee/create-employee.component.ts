import { Component, OnInit } from '@angular/core';
// Import FormGroup and FormControl classes
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { CustomValidators } from '../shared/custom.validators';

import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from './employee.service';
import { IEmployee } from './IEmployee';
import { ISkill } from './ISkill';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  //styles: []
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  // This FormGroup contains fullName and Email form controls
  employeeForm: FormGroup;
  employee: IEmployee;
  pageTitle: string;

  constructor(private fb: FormBuilder,private route: ActivatedRoute,
    private employeeService: EmployeeService, private router : Router
) { 
   
    
  }

  // Initialise the FormGroup with the 2 FormControls we need.
  // ngOnInit ensures the FormGroup and it's form controls are
  // created when the component is initialised
  ngOnInit() {
    // this.employeeForm = new FormGroup({
    //   fullName: new FormControl(),
    //   email: new FormControl(),
    //   //Create skills form group
    //   skills: new FormGroup({
    //       skillName: new FormControl(),
    //       experienceInYears: new FormControl(),
    //       proficiency: new FormControl()
    //     })
    // });



    // this.employeeForm = this.fb.group({
    //   fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
    //   email: [''],
    //   skills: this.fb.group({
    //     skillName: [''],
    //     experienceInYears: [''],
    //     proficiency: ['beginner']
    //   }),
    // });

    // Modify the code to include required validators on
    // all form controls

    // email and confirmEmail form controls are grouped using a nested form group
// Notice, the validator is attached to the nested emailGroup using an object
// with key validator. The value is our validator function matchEmails() which
// is defined below. The important point to keep in mind is when the validation
// fails, the validation key is attached the errors collection of the emailGroup
// This is the reason we added emailGroup key both to formErrors object and
// validationMessages object.

    this.employeeForm = this.fb.group({
      fullName: ['', [Validators.required,Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference:['email'],
      //email: ['', [Validators.required, this.emailDomain]],
      //email: ['', [Validators.required, this.emailDomain('dell.com')]],
      //email: ['', [Validators.required, CustomValidators.emailDomain('dell.com')]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, CustomValidators.emailDomain('dell.com')]],
        confirmEmail: ['', [Validators.required]],
        }, { validator: matchEmails }),
  

      phone: [''],
      
      // skills: this.fb.group({
      //   skillName: ['', Validators.required],
      //   experienceInYears: ['', Validators.required],
      //   proficiency: ['', Validators.required]
      // }),

    // Create skills FormArray using the injected FormBuilder
    // class array() method. At the moment, in the created
    // FormArray we only have one FormGroup instance that is
    // returned by addSkillFormGroup() method
    skills: this.fb.array([
      this.addSkillFormGroup()
    ])
    });





    // // Subscribe to valueChanges observable
    // this.employeeForm.get('fullName').valueChanges.subscribe(
    //   value => {
    //     console.log(value);
    //   }
    // );

    // // Subscribe to FormGroup valueChanges observable
    // this.employeeForm.valueChanges.subscribe(
    //   value => {
    //     console.log(JSON.stringify(value));
    //   }
    // );

    // When any of the form control value in employee form changes
    // our validation function logValidationErrors() is called
    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
    });

    this.employeeForm.get('contactPreference').valueChanges.subscribe((data: string) => {
        this.onContactPrefernceChange(data);
      });

    // this.route.paramMap.subscribe(params => {
    //   const empId = +params.get('id');
    //     if (empId) {
    //       this.getEmployee(empId);
    //     }
    //   });

    this.route.paramMap.subscribe(params => {
      const empId = +params.get('id');
      if (empId) {
        this.pageTitle = 'Edit Employee';
        this.getEmployee(empId);
      } else {
        this.pageTitle = 'Create Employee';
        this.employee = {
          id: null,
          fullName: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        };
      }
    });
    

  }

  getEmployee(id: number) {
    this.employeeService.getEmployee(id)
      .subscribe(
        (employee: IEmployee) => 
        {
          this.employee = employee;
          this.editEmployee(employee)
        },
        (err: any) => console.log(err)
      );
  }
  
  // editEmployee(employee: IEmployee) {
  //   this.employeeForm.patchValue({
  //     fullName: employee.fullName,
  //     contactPreference: employee.contactPreference,
  //     emailGroup: {
  //       email: employee.email,
  //       confirmEmail: employee.email
  //     },
  //     phone: employee.phone
  //   });
  // }
  editEmployee(employee: IEmployee) {
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });
  
    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }
  
  setExistingSkills(skillSets: ISkill[]): FormArray {
    const formArray = new FormArray([]);
    skillSets.forEach(s => {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears: s.experienceInYears,
        proficiency: s.proficiency
      }));
    });
  
    return formArray;
  }
  
  addSkillFormGroup(): FormGroup {
    return this.fb.group({
      skillName: ['', Validators.required],
      experienceInYears: ['', Validators.required],
      proficiency: ['', Validators.required]
    });
  }
  
  removeSkillButtonClick(skillGroupIndex: number): void {
    //(<FormArray>this.employeeForm.get('skills')).removeAt(skillGroupIndex);
    const skillsFormArray = <FormArray>this.employeeForm.get('skills');
  skillsFormArray.removeAt(skillGroupIndex);
  skillsFormArray.markAsDirty();
  skillsFormArray.markAsTouched();

  }
  

  onSubmit(): void {
    // console.log(this.employeeForm.value);
    // console.log(this.employeeForm);

    // this.logKeyValuePairs(this.employeeForm);

    // this.mapFormValuesToEmployeeModel();
    // this.employeeService.updateEmployee(this.employee).subscribe(
    //   () => this.router.navigate(['list']),
    //   (err: any) => console.log(err)
    // );
  
    this.mapFormValuesToEmployeeModel();

    if (this.employee.id) {
      this.employeeService.updateEmployee(this.employee).subscribe(
        () => this.router.navigate(['list']),
        (err: any) => console.log(err)
      );
    } else {
      this.employeeService.addEmployee(this.employee).subscribe(
        () => this.router.navigate(['list']),
        (err: any) => console.log(err)
      );
    }
  

    //this.logValidationErrors(this.employeeForm);
  }
  
  mapFormValuesToEmployeeModel() {
    this.employee.fullName = this.employeeForm.value.fullName;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email = this.employeeForm.value.emailGroup.email;
    this.employee.phone = this.employeeForm.value.phone;
    this.employee.skills = this.employeeForm.value.skills;
  }
  

  onLoadDataClick(): void {
    // this.employeeForm.setValue({
    //   fullName: 'Pragim Technologies',
    //   email: 'pragim@pragimtech.com',
    //   skills: {
    //     skillName: 'C#',
    //     experienceInYears: 5,
    //     proficiency: 'beginner'
    //   }
    // });

    // this.employeeForm.patchValue({
    //   fullName: 'Pragim Technologies',
    //   email: 'pragim@pragimtech.com'
    // });


    this.logValidationErrors(this.employeeForm);
    console.log(this.formErrors);
  
  }
  

  logKeyValuePairs(group: FormGroup): void {
    // loop through each key in the FormGroup
    Object.keys(group.controls).forEach((key: string) => {
      // Get a reference to the control using the FormGroup.get() method
      const abstractControl = group.get(key);
      // If the control is an instance of FormGroup i.e a nested FormGroup
      // then recursively call this same method (logKeyValuePairs) passing it
      // the FormGroup so we can get to the form controls in it
      if (abstractControl instanceof FormGroup) {
        this.logKeyValuePairs(abstractControl);
        // If the control is not a FormGroup then we know it's a FormControl
      } else {
        console.log('Key = ' + key + ' && Value = ' + abstractControl.value);
      }
    });
  }
  

  // This object will hold the messages to be displayed to the user
  // Notice, each key in this object has the same name as the
  // corresponding form control
  // Group properties on the formErrors object. The UI will bind to these properties
  // to display the respective validation messages
  formErrors = {
    'fullName': '',
    'email': '',
    'confirmEmail' : '',
    'emailGroup': '',
    'phone' : '', // Include phone property
    // 'skillName': '',
    // 'experienceInYears': '',
    // 'proficiency': ''
  };

  // This object contains all the validation messages for this form
  // This structure stoes all the validation messages for the form Include validation
  // messages for confirmEmail and emailGroup properties. Notice to store the
  // validation message for the emailGroup we are using emailGroup key. This is the
  // same key that the matchEmails() validation function below returns, if the email
  // and confirm email do not match.
  validationMessages = {
    'fullName': {
      'required': 'Full Name is required.',
      'minlength': 'Full Name must be greater than 2 characters.',
      'maxlength': 'Full Name must be less than 10 characters.'
    },
    'email': {
      'required': 'Email is required.',
      //'emailDomain': 'Email domian should be pragimtech.com'
      'emailDomain': 'Email domian should be dell.com'
    },
    'confirmEmail': {
      'required': 'Confirm Email is required.'
    },
    'emailGroup': {
      'emailMismatch': 'Email and Confirm Email do not match.'
    },
    'phone': { // Include required error message for phone form control
      'required': 'Phone is required.'
    }
    // ,
    // 'skillName': {
    //   'required': 'Skill Name is required.',
    // },
    // 'experienceInYears': {
    //   'required': 'Experience is required.',
    // },
    // 'proficiency': {
    //   'required': 'Proficiency is required.',
    // },
  };


  // If the Selected Radio Button value is "phone", then add the
  // required validator function otherwise remove it
  onContactPrefernceChange(selectedValue: string) {
    const phoneFormControl = this.employeeForm.get('phone');
    const emailFormControl = this.employeeForm.get('email');

    if (selectedValue === 'phone') {
      phoneFormControl.setValidators(Validators.required);
      emailFormControl.clearValidators();
    } else {
      phoneFormControl.clearValidators();
      emailFormControl.setValidators(Validators.required);
    }
    phoneFormControl.updateValueAndValidity();
    emailFormControl.updateValueAndValidity();
  }


  addSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormGroup());
  }
  

  //  emailDomain(control: AbstractControl): { [key: string]: any } | null {
  //   const email: string = control.value;
  //   const domain = email.substring(email.lastIndexOf('@') + 1);
  //   if (email === '' || domain.toLowerCase() === 'pragimtech.com') {
  //     return null;
  //   } else {
  //     return { 'emailDomain': true };
  //   }
  // }
  
   emailDomain(domainName: string) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const email: string = control.value;
      const domain = email.substring(email.lastIndexOf('@') + 1);
      if (email === '' || domain.toLowerCase() === domainName.toLowerCase()) {
        return null;
      } else {
        return { 'emailDomain': true };
      }
    };
  }
  

  // logValidationErrors(group: FormGroup = this.employeeForm): void {
  //   // Loop through each control key in the FormGroup
  //   Object.keys(group.controls).forEach((key: string) => {
  //     // Get the control. The control can be a nested form group
  //     const abstractControl = group.get(key);
  //     // If the control is nested form group, recursively call
  //     // this same method
  //     if (abstractControl instanceof FormGroup) {
  //       this.logValidationErrors(abstractControl);
  //       // If the control is a FormControl
  //     } else {
  //       // Clear the existing validation errors
  //       this.formErrors[key] = '';
  //       if (abstractControl && !abstractControl.valid) {
  //         // Get all the validation messages of the form control
  //         // that has failed the validation
  //         const messages = this.validationMessages[key];
  //         // Find which validation has failed. For example required,
  //         // minlength or maxlength. Store that error message in the
  //         // formErrors object. The UI will bind to this object to
  //         // display the validation errors
  //         for (const errorKey in abstractControl.errors) {
  //           if (errorKey) {
  //             this.formErrors[key] += messages[errorKey] + ' ';
  //           }
  //         }
  //       }
  //     }
  //   });
  // }


  // logValidationErrors(group: FormGroup = this.employeeForm): void {
  //   Object.keys(group.controls).forEach((key: string) => {
  //     const abstractControl = group.get(key);
  //     this.formErrors[key] = '';
  //     // Loop through nested form groups and form controls to check
  //     // for validation errors. For the form groups and form controls
  //     // that have failed validation, retrieve the corresponding
  //     // validation message from validationMessages object and store
  //     // it in the formErrors object. The UI binds to the formErrors
  //     // object properties to display the validation errors.
  //     if (abstractControl && !abstractControl.valid
  //       && (abstractControl.touched || abstractControl.dirty)) {
  //       const messages = this.validationMessages[key];
  //       for (const errorKey in abstractControl.errors) {
  //         if (errorKey) {
  //           this.formErrors[key] += messages[errorKey] + ' ';
  //         }
  //       }
  //     }
  
  //     if (abstractControl instanceof FormGroup) {
  //       this.logValidationErrors(abstractControl);
  //     }
  //   });
  // }
  
  logValidationErrors(group: FormGroup = this.employeeForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
  
      this.formErrors[key] = '';
      if (abstractControl && !abstractControl.valid &&
        (abstractControl.touched || abstractControl.dirty || abstractControl.value !== '')) {
        const messages = this.validationMessages[key];
  
        for (const errorKey in abstractControl.errors) {
          if (errorKey) {
            this.formErrors[key] += messages[errorKey] + ' ';
          }
        }
      }
  
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      }
  
      // // We need this additional check to get to the FormGroup
      // // in the FormArray and then recursively call this
      // // logValidationErrors() method to fix the broken validation
      // if (abstractControl instanceof FormArray) {
      //   for (const control of abstractControl.controls) {
      //     if (control instanceof FormGroup) {
      //       this.logValidationErrors(control);
      //     }
      //   }
      // }


    });
  }
  


}

// Nested form group (emailGroup) is passed as a parameter. Retrieve email and
// confirmEmail form controls. If the values are equal return null to indicate
// validation passed otherwise an object with emailMismatch key. Please note we
// used this same key in the validationMessages object against emailGroup
// property to store the corresponding validation error message
function matchEmails(group: AbstractControl): { [key: string]: any } | null {
  const emailControl = group.get('email');
  const confirmEmailControl = group.get('confirmEmail');

  if (emailControl.value === confirmEmailControl.value
    || (confirmEmailControl.pristine && confirmEmailControl.value === '')) {
    return null;
  } else {
    return { 'emailMismatch': true };
  }
}
