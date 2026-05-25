import {AbstractControl, ValidationErrors} from '@angular/forms';

export function isAdultValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const birth = new Date(control.value);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return age >= 18 ? null : {notAdult: true};
}
