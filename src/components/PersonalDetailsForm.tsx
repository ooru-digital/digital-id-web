import React, { useState } from 'react';
import { User, Mail, Calendar, Users, AlertCircle, ArrowRight, ArrowLeft, MapPin, Flag, CreditCard, Home, Landmark, Crown, Info } from 'lucide-react';

export interface PersonalDetails {
  givenName: string;
  surName: string;
  email: string;
  sex: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  nrcNumber: string;
  district: string;
  villageName: string;
  chief: string;
}

interface PersonalDetailsFormProps {
  onNext: (details: PersonalDetails) => void;
  onBack?: () => void;
  initialValues?: PersonalDetails;
}

type FormErrors = Partial<Record<keyof PersonalDetails, string>>;

const emptyForm: PersonalDetails = {
  givenName: '',
  surName: '',
  email: '',
  sex: '',
  dateOfBirth: '',
  placeOfBirth: '',
  nationality: '',
  nrcNumber: '',
  district: '',
  villageName: '',
  chief: ''
};

const requiredMessages: Record<keyof PersonalDetails, string> = {
  givenName: 'Given name is required',
  surName: 'Surname is required',
  email: 'Email is required',
  sex: 'Sex is required',
  dateOfBirth: 'Date of birth is required',
  placeOfBirth: 'Place of birth is required',
  nationality: 'Nationality is required',
  nrcNumber: 'NRC number is required',
  district: 'District is required',
  villageName: 'Village name is required',
  chief: 'Chief is required'
};

export default function PersonalDetailsForm({ onNext, onBack, initialValues }: PersonalDetailsFormProps) {
  const [formData, setFormData] = useState<PersonalDetails>(initialValues || emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    (Object.keys(requiredMessages) as (keyof PersonalDetails)[]).forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = requiredMessages[field];
      }
    });

    if (!newErrors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5D5FEF] focus:border-[#5D5FEF] transition-all duration-200 text-sm ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    }`;

  const renderError = (field: keyof PersonalDetails) =>
    errors[field] && (
      <div className="flex items-center space-x-1 text-red-600 text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>{errors[field]}</span>
      </div>
    );

  const renderTextField = (
    field: keyof PersonalDetails,
    label: string,
    Icon: typeof User,
    placeholder: string,
    type: 'text' | 'email' = 'text',
    hint?: string
  ) => (
    <div className="space-y-1">
      <label htmlFor={field} className="block text-xs font-semibold text-gray-900">
        <Icon className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
        {label} *
      </label>
      <input
        type={type}
        id={field}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={placeholder}
        className={inputClass(!!errors[field])}
      />
      {errors[field] ? renderError(field) : hint && (
        <div className="flex items-center space-x-1 text-gray-500 text-xs">
          <Info className="w-3 h-3 flex-shrink-0 text-[#5D5FEF]" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#5D5FEF]/10 rounded-lg">
                <User className="w-5 h-5 text-[#5D5FEF]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Personal Information
            </h2>
            <p className="text-sm text-gray-600">
              Enter your personal details as they should appear on your Digital ID
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderTextField('givenName', 'Given Name', User, 'Enter your given name')}
              {renderTextField('surName', 'Surname', User, 'Enter your surname')}
            </div>

            {/* Contact & Sex */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderTextField('email', 'Email Address', Mail, 'Enter your email address', 'email')}

              <div className="space-y-1">
                <label htmlFor="sex" className="block text-xs font-semibold text-gray-900">
                  <Users className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
                  Sex *
                </label>
                <select
                  id="sex"
                  value={formData.sex}
                  onChange={(e) => handleInputChange('sex', e.target.value)}
                  className={inputClass(!!errors.sex)}
                >
                  <option value="">Select sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {renderError('sex')}
              </div>
            </div>

            {/* Birth Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-gray-900">
                  <Calendar className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={inputClass(!!errors.dateOfBirth)}
                />
                {renderError('dateOfBirth')}
              </div>

              {renderTextField('placeOfBirth', 'Place of Birth', MapPin, 'e.g., Lusaka')}
            </div>

            {/* Identity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderTextField('nationality', 'Nationality', Flag, 'e.g., Utopia')}
              {renderTextField(
                'nrcNumber',
                'NRC Number',
                CreditCard,
                'Enter a unique NRC number, e.g., NIDUT0003',
                'text',
                'Must be unique. Each NRC number can be issued only one Digital ID.'
              )}
            </div>

            {/* Residence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {renderTextField('district', 'District', Landmark, 'e.g., Central')}
              {renderTextField('villageName', 'Village Name', Home, 'e.g., Munyumbwe')}
              {renderTextField('chief', 'Chief', Crown, 'e.g., Chief Mukuni')}
            </div>

            <div className="bg-gradient-to-r from-[#5D5FEF]/10 to-[#7C3AED]/10 rounded-lg p-4 border border-[#5D5FEF]/20">
              <h3 className="font-semibold text-[#5D5FEF] mb-1 flex items-center text-sm">
                <div className="w-1.5 h-1.5 bg-[#5D5FEF] rounded-full mr-2"></div>
                Privacy Notice
              </h3>
              <p className="text-xs text-[#5D5FEF]/80">
                Your personal information is encrypted and securely stored. We only use this data for identity verification and credential issuance purposes.
              </p>
            </div>

            <div className={`flex pt-4 ${onBack ? 'justify-between' : 'justify-end'}`}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#5D5FEF] to-[#7C3AED] text-white font-semibold rounded-lg hover:from-[#5D5FEF]/90 hover:to-[#7C3AED]/90 focus:outline-none focus:ring-2 focus:ring-[#5D5FEF] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
              >
                Continue to Selfie
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
