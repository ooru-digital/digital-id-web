import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from './ui/Button';
import Callout from './ui/Callout';
import Field, { inputClass } from './ui/Field';
import StepFooter from './ui/StepFooter';

export interface PersonalDetails {
  givenName: string;
  surName: string;
  email: string;
  sex: string;
  dateOfBirth: string;
  nrcNumber: string;
}

interface PersonalDetailsFormProps {
  onNext: (details: PersonalDetails) => void;
  onBack?: () => void;
  initialValues?: PersonalDetails;
  submitLabel?: string;
}

type FormErrors = Partial<Record<keyof PersonalDetails, string>>;

const emptyForm: PersonalDetails = {
  givenName: '',
  surName: '',
  email: '',
  sex: '',
  dateOfBirth: '',
  nrcNumber: ''
};

const requiredMessages: Record<keyof PersonalDetails, string> = {
  givenName: 'Given name is required',
  surName: 'Surname is required',
  email: 'Email is required',
  sex: 'Sex is required',
  dateOfBirth: 'Date of birth is required',
  nrcNumber: 'NRC number is required'
};

const validateField = (field: keyof PersonalDetails, value: string) => {
  if (!value.trim()) return requiredMessages[field];
  if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address';
  return undefined;
};

export default function PersonalDetailsForm({
  onNext,
  onBack,
  initialValues,
  submitLabel = 'Continue to selfie'
}: PersonalDetailsFormProps) {
  const [formData, setFormData] = useState<PersonalDetails>(initialValues || emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    (Object.keys(requiredMessages) as (keyof PersonalDetails)[]).forEach((field) => {
      newErrors[field] = validateField(field, formData[field]);
    });

    setErrors(newErrors);
    // Move focus to the first field that needs attention
    const firstInvalid = (Object.keys(requiredMessages) as (keyof PersonalDetails)[]).find(field => newErrors[field]);
    if (firstInvalid) document.getElementById(firstInvalid)?.focus();
    return !firstInvalid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const trimmedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value.trim()])
      ) as unknown as PersonalDetails;
      onNext(trimmedData);
    }
  };

  const handleInputChange = (field: keyof PersonalDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const inputProps = (field: keyof PersonalDetails) => ({
    id: field,
    value: formData[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(field, e.target.value),
    // Check each field as the user leaves it, not only on submit
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
      setErrors(prev => ({ ...prev, [field]: validateField(field, e.target.value) })),
    'aria-invalid': !!errors[field],
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    className: inputClass(!!errors[field])
  });

  const textField = (
    field: keyof PersonalDetails,
    label: string,
    placeholder: string,
    options: { type?: 'text' | 'email'; hint?: string; autoComplete?: string; className?: string } = {}
  ) => (
    <Field id={field} label={label} error={errors[field]} hint={options.hint} className={options.className}>
      <input
        type={options.type ?? 'text'}
        placeholder={placeholder}
        autoComplete={options.autoComplete ?? 'off'}
        {...inputProps(field)}
      />
    </Field>
  );

  const fieldset = (legend: string, description: string, fields: React.ReactNode) => (
    <fieldset className="mt-12 border-t border-line pt-6 first:mt-0 first:border-t-0 first:pt-0">
      <legend className="float-left mb-1 w-full text-lead-18">{legend}</legend>
      <p className="clear-left mb-6 text-small text-ink-muted">{description}</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">{fields}</div>
    </fieldset>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Callout tone="info" title="Coming soon: automatic prefill" className="mb-12">
        Your details will be fetched from the existing National ID (NID) database, so you won't need to type them in.
      </Callout>
      {fieldset('Your name', 'As it appears on your official documents.',
        <>
          {textField('givenName', 'Given name', 'e.g. Amara', { autoComplete: 'given-name' })}
          {textField('surName', 'Surname', 'e.g. Banda', { autoComplete: 'family-name' })}
        </>
      )}

      {fieldset('Birth and sex', 'Printed on the front of your Digital ID.',
        <>
          <Field id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth}>
            <input type="date" max={new Date().toISOString().split('T')[0]} {...inputProps('dateOfBirth')} />
          </Field>
          <Field id="sex" label="Sex" error={errors.sex}>
            <select {...inputProps('sex')}>
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
        </>
      )}

      {fieldset('Contact and registration', 'Your email address and National Registration Card number.',
        <>
          {textField('email', 'Email address', 'you@example.com', { type: 'email', autoComplete: 'email' })}
          {textField('nrcNumber', 'NRC number', 'e.g. NIDUT0003', {
            hint: 'Each NRC number can be issued only one Digital ID.'
          })}
        </>
      )}

      <StepFooter>
        {onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
        ) : <span />}
        <Button type="submit">{submitLabel}</Button>
      </StepFooter>
    </form>
  );
}
