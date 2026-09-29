import type { PersonalDetails } from '../components/PersonalDetailsForm';

export interface CredentialPhoto {
  storage: 'base64';
  name: string;
  url: string;
  size: number;
  type: string;
  originalName: string;
  hash: string;
}

export interface DigitalIdCredentialData {
  sex: string;
  chief: string;
  email: string;
  photo: CredentialPhoto[];
  surName: string;
  district: string;
  givenName: string;
  nrcNumber: string;
  mrz_line_1: string;
  mrz_line_2: string;
  dateOfBirth: string;
  dateOfIssue: string;
  nationality: string;
  villageName: string;
  placeOfBirth: string;
}

// Fields not collected from the applicant; sent with fixed values
export const MOCKED_DETAILS = {
  nationality: 'Utopia',
  placeOfBirth: 'Lusaka',
  district: 'Central',
  villageName: 'Munyumbwe',
  chief: 'Chief Mukuni'
};

const TD1_LINE_LENGTH = 30;

const toMrzChars = (value: string): string =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '<');

const padMrz = (value: string, length: number): string =>
  value.padEnd(length, '<').substring(0, length);

// ICAO 9303 check digit: weights 7-3-1, A-Z = 10-35, '<' = 0
const mrzCheckDigit = (value: string): string => {
  const weights = [7, 3, 1];
  const sum = value.split('').reduce((acc, char, index) => {
    let charValue = 0;
    if (/[0-9]/.test(char)) charValue = Number(char);
    else if (/[A-Z]/.test(char)) charValue = char.charCodeAt(0) - 55;
    return acc + charValue * weights[index % 3];
  }, 0);
  return String(sum % 10);
};

const toCountryCode = (nationality: string): string =>
  padMrz(nationality.toUpperCase().replace(/[^A-Z]/g, ''), 3);

// yyyy-mm-dd -> YYMMDD
const toMrzDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${year.substring(2)}${month}${day}`;
};

const toMrzSex = (sex: string): string => {
  if (sex === 'Male') return 'M';
  if (sex === 'Female') return 'F';
  return '<';
};

// ICAO 9303 TD1 (ID card) lines 1 and 2; no expiry date is captured, so it is left as fillers
export const buildMrzLines = (details: PersonalDetails): { line1: string; line2: string } => {
  const countryCode = toCountryCode(MOCKED_DETAILS.nationality);
  const documentNumber = toMrzChars(details.nrcNumber);

  let documentField: string;
  let optionalData: string;
  if (documentNumber.length <= 9) {
    const paddedNumber = padMrz(documentNumber, 9);
    documentField = paddedNumber + mrzCheckDigit(paddedNumber);
    optionalData = '';
  } else {
    documentField = documentNumber.substring(0, 9) + '<';
    optionalData = documentNumber.substring(9) + mrzCheckDigit(documentNumber);
  }

  const line1 = padMrz(`ID${countryCode}${documentField}${optionalData}`, TD1_LINE_LENGTH);

  const birthDate = toMrzDate(details.dateOfBirth);
  const birthField = birthDate + mrzCheckDigit(birthDate);
  const expiryField = '<<<<<<<';
  const line2WithoutComposite = padMrz(
    `${birthField}${toMrzSex(details.sex)}${expiryField}${countryCode}`,
    TD1_LINE_LENGTH - 1
  );
  const compositeInput =
    line1.substring(5, 30) +
    line2WithoutComposite.substring(0, 7) +
    line2WithoutComposite.substring(8, 15) +
    line2WithoutComposite.substring(18, 29);
  const line2 = line2WithoutComposite + mrzCheckDigit(compositeInput);

  return { line1, line2 };
};

const toIsoDateTime = (isoDate: string): string => `${isoDate}T00:00:00.000Z`;

const todayIsoDate = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const buildPhoto = (givenName: string, imageDataUrl: string): CredentialPhoto => {
  const mimeType = imageDataUrl.substring(5, imageDataUrl.indexOf(';')) || 'image/jpeg';
  const extension = mimeType.split('/')[1] || 'jpeg';
  const base64 = imageDataUrl.substring(imageDataUrl.indexOf(',') + 1);
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  const safeName = givenName.replace(/[^a-zA-Z0-9-]/g, '') || 'photo';

  return {
    storage: 'base64',
    name: `${safeName}-photo-${crypto.randomUUID()}.${extension}`,
    url: imageDataUrl,
    size: Math.floor((base64.length * 3) / 4) - padding,
    type: mimeType,
    originalName: `${safeName}-photo.${extension}`,
    hash: ''
  };
};

export const buildDigitalIdCredentialData = (
  details: PersonalDetails,
  selfieDataUrl: string
): DigitalIdCredentialData => {
  const { line1, line2 } = buildMrzLines(details);

  return {
    ...MOCKED_DETAILS,
    sex: details.sex,
    email: details.email,
    photo: [buildPhoto(details.givenName, selfieDataUrl)],
    surName: details.surName,
    givenName: details.givenName,
    nrcNumber: details.nrcNumber,
    mrz_line_1: line1,
    mrz_line_2: line2,
    dateOfBirth: toIsoDateTime(details.dateOfBirth),
    dateOfIssue: toIsoDateTime(todayIsoDate())
  };
};
