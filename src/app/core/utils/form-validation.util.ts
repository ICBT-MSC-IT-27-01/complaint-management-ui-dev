import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import Swal from 'sweetalert2';

export type ValidationFieldType = 'text' | 'email' | 'number' | 'contact' | 'password';

export interface ValidationFieldConfig {
  label: string;
  type: ValidationFieldType;
}

export function textFieldValidator(required = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    const trimmed = value.trim();

    if (!trimmed) {
      if (required) return { required: true };
      return value.length > 0 ? { blankText: true } : null;
    }

    return null;
  };
}

export function nonNegativeNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawValue = control.value;

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return null;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value)) return { invalidNumber: true };
    if (value < 0) return { negativeNumber: true };
    return null;
  };
}

export function contactNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) return null;
    if (!/^\d+$/.test(value)) return { invalidContactNumber: true };
    return null;
  };
}

export function trimFormValues(form: FormGroup, fieldNames: string[]): void {
  for (const fieldName of fieldNames) {
    const control = form.get(fieldName);
    if (!control) continue;

    const value = control.value;
    if (typeof value === 'string') {
      control.setValue(value.trim(), { emitEvent: false });
    }
  }
}

export function showValidationAlert(
  form: FormGroup,
  fields: Record<string, ValidationFieldConfig>
): void {
  form.markAllAsTouched();

  const firstInvalidKey = Object.keys(fields).find((key) => form.get(key)?.invalid);
  if (!firstInvalidKey) return;

  const control = form.get(firstInvalidKey);
  const field = fields[firstInvalidKey];
  const errorMessage = getValidationMessage(field, control?.errors ?? {});

  void Swal.fire({
    icon: 'warning',
    title: 'Please check your input',
    text: errorMessage,
    confirmButtonText: 'OK'
  });
}

export function showErrorAlert(message: string): void {
  void Swal.fire({
    icon: 'error',
    title: 'Validation error',
    text: message,
    confirmButtonText: 'OK'
  });
}

function getValidationMessage(field: ValidationFieldConfig, errors: ValidationErrors): string {
  if (errors['required']) return `${field.label} is required.`;
  if (errors['email']) return `Please enter a valid email address for ${field.label}.`;
  if (errors['blankText']) return `${field.label} cannot be only spaces.`;
  if (errors['negativeNumber']) return `${field.label} cannot be a negative number.`;
  if (errors['invalidNumber']) return `${field.label} must be a valid number.`;
  if (errors['invalidContactNumber']) return `${field.label} must contain only numbers.`;
  if (errors['minlength']) return `${field.label} is too short.`;
  if (errors['maxlength']) return `${field.label} is too long.`;
  return `Please enter a valid ${field.type} value for ${field.label}.`;
}
