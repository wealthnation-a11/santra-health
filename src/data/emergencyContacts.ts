export interface EmergencyContact {
  country: string;
  code: string;
  number: string;
  label: string;
}

export const emergencyContacts: EmergencyContact[] = [
  { country: "Nigeria", code: "NG", number: "112", label: "Emergency Services" },
  { country: "United States", code: "US", number: "911", label: "Emergency Services" },
  { country: "United Kingdom", code: "GB", number: "999", label: "Emergency Services" },
  { country: "Canada", code: "CA", number: "911", label: "Emergency Services" },
  { country: "Australia", code: "AU", number: "000", label: "Emergency Services" },
  { country: "India", code: "IN", number: "112", label: "Emergency Services" },
  { country: "South Africa", code: "ZA", number: "10177", label: "Emergency Medical" },
  { country: "Kenya", code: "KE", number: "999", label: "Emergency Services" },
  { country: "Ghana", code: "GH", number: "112", label: "Emergency Services" },
  { country: "Germany", code: "DE", number: "112", label: "Notruf" },
  { country: "France", code: "FR", number: "15", label: "SAMU (Medical)" },
  { country: "Brazil", code: "BR", number: "192", label: "SAMU (Medical)" },
  { country: "Japan", code: "JP", number: "119", label: "Fire & Ambulance" },
  { country: "United Arab Emirates", code: "AE", number: "998", label: "Ambulance" },
  { country: "Singapore", code: "SG", number: "995", label: "Emergency Services" },
  { country: "Egypt", code: "EG", number: "123", label: "Ambulance" },
  { country: "Tanzania", code: "TZ", number: "114", label: "Emergency Services" },
  { country: "Uganda", code: "UG", number: "999", label: "Emergency Services" },
  { country: "Ethiopia", code: "ET", number: "907", label: "Ambulance" },
];

export function getEmergencyContact(country?: string | null): EmergencyContact {
  if (!country) return { country: "International", code: "XX", number: "112", label: "Emergency Services" };
  const found = emergencyContacts.find((c) => c.country === country);
  return found || { country: country, code: "XX", number: "112", label: "Emergency Services" };
}
