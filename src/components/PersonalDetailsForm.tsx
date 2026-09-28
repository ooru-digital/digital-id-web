import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Users, AlertCircle, ArrowRight } from 'lucide-react';

interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
}

interface PersonalDetailsFormProps {
  onNext: (details: PersonalDetails) => void;
  initialValues?: PersonalDetails;
}

const emptyForm: PersonalDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  nationalId: ''
};

export default function PersonalDetailsForm({ onNext, initialValues }: PersonalDetailsFormProps) {
  const [formData, setFormData] = useState<PersonalDetails>(initialValues || emptyForm);
  const [errors, setErrors] = useState<Partial<PersonalDetails>>({});

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return false;
    
    // Remove all non-digit characters except + for country code
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    
    if (cleanPhone.startsWith('+')) {
      // International format with + prefix
      const withoutPlus = cleanPhone.substring(1);
      return withoutPlus.length >= 7 && withoutPlus.length <= 18 && /^\d+$/.test(withoutPlus);
    } else {
      // National format or international without +
      return (cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone));
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Clean the phone number but preserve the + for country codes
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it starts with +, format as international
    if (cleaned.startsWith('+')) {
      // Keep the + and format the rest
      const countryAndNumber = cleaned.substring(1);
      if (countryAndNumber.length > 10) {
        // Likely has country code, format as +CC NNNNN NNNNN
        const countryCode = countryAndNumber.substring(0, countryAndNumber.length - 10);
        const number = countryAndNumber.substring(countryAndNumber.length - 10);
        const part1 = number.substring(0, 5);
        const part2 = number.substring(5);
        return `+${countryCode} ${part1} ${part2}`;
      }
    }
    
    // For national format, just return the cleaned number
    return cleaned;
  };

  const validateForm = () => {
    const newErrors: Partial<PersonalDetails> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'National ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Format the phone number before submitting
      const formattedData = {
        ...formData,
        phone: formatPhoneNumber(formData.phone)
      };
      onNext(formattedData);
    }
  };

  const handleInputChange = (field: keyof PersonalDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    // Allow users to type freely, validation happens on submit
    setFormData(prev => ({ ...prev, phone: value }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5D5FEF] focus:border-[#5D5FEF] transition-all duration-200 text-sm ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    }`;

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
              Enter your personal details as they appear on your National ID
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="firstName" className="block text-xs font-semibold text-gray-900">
                  <User className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                  className={inputClass(!!errors.firstName)}
                />
                {errors.firstName && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.firstName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="lastName" className="block text-xs font-semibold text-gray-900">
                  <User className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                  className={inputClass(!!errors.lastName)}
                />
                {errors.lastName && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.lastName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-900">
                  <Mail className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
                  Email Address *
                  <span className="ml-1 text-xs text-gray-500">(Required for notifications)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className={inputClass(!!errors.email)}
                />
                {errors.email && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="block text-xs font-semibold text-gray-900">
                  <Phone className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
                  Phone Number *
                  <span className="ml-1 text-xs text-gray-500">(Required for notifications)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="e.g., +91 98765 43210 or 9876543210"
                  className={inputClass(!!errors.phone)}
                />
                {errors.phone && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="gender" className="block text-xs font-semibold text-gray-900">
                  <Users className="w-3 h-3 inline mr-1 text-[#5D5FEF]" />
                  Gender *
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={inputClass(!!errors.gender)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.gender}</span>
                  </div>
                )}
              </div>

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
                {errors.dateOfBirth && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.dateOfBirth}</span>
                  </div>
                )}
              </div>
            </div>

            {/* National ID */}
            <div className="space-y-1">
              <label htmlFor="nationalId" className="block text-xs font-semibold text-gray-900">
                National ID Number *
              </label>
              <input
                type="text"
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                placeholder="Enter your National ID number"
                className={inputClass(!!errors.nationalId)}
              />
              {errors.nationalId && (
                <div className="flex items-center space-x-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.nationalId}</span>
                </div>
              )}
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

            <div className="flex justify-end pt-4">
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
