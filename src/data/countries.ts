export interface Country {
  name: string;
  code: string;
  states: string[];
}

export const countries: Country[] = [
  {
    name: "Nigeria",
    code: "NG",
    states: [
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
      "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
      "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
      "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
      "Yobe", "Zamfara"
    ]
  },
  {
    name: "United States",
    code: "US",
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming"
    ]
  },
  {
    name: "United Kingdom",
    code: "GB",
    states: [
      "England", "Scotland", "Wales", "Northern Ireland",
      "Greater London", "West Midlands", "Greater Manchester", "West Yorkshire",
      "Merseyside", "South Yorkshire", "Tyne and Wear"
    ]
  },
  {
    name: "Canada",
    code: "CA",
    states: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
      "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
      "Quebec", "Saskatchewan", "Yukon"
    ]
  },
  {
    name: "Australia",
    code: "AU",
    states: [
      "Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland",
      "South Australia", "Tasmania", "Victoria", "Western Australia"
    ]
  },
  {
    name: "India",
    code: "IN",
    states: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
      "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
      "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
      "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
      "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
    ]
  },
  {
    name: "South Africa",
    code: "ZA",
    states: [
      "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga",
      "North West", "Northern Cape", "Western Cape"
    ]
  },
  {
    name: "Kenya",
    code: "KE",
    states: [
      "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kiambu", "Machakos",
      "Nyeri", "Meru", "Kakamega", "Kisii", "Thika", "Malindi", "Kitale"
    ]
  },
  {
    name: "Ghana",
    code: "GH",
    states: [
      "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Northern",
      "Upper East", "Upper West", "Volta", "Brong-Ahafo", "Savannah", "Bono East",
      "Ahafo", "Western North", "Oti", "North East"
    ]
  },
  {
    name: "Germany",
    code: "DE",
    states: [
      "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg",
      "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia",
      "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
    ]
  },
  {
    name: "France",
    code: "FR",
    states: [
      "Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Occitanie",
      "Nouvelle-Aquitaine", "Hauts-de-France", "Grand Est", "Bretagne", "Normandie",
      "Pays de la Loire", "Bourgogne-Franche-Comté", "Centre-Val de Loire", "Corse"
    ]
  },
  {
    name: "Brazil",
    code: "BR",
    states: [
      "São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná", "Rio Grande do Sul",
      "Pernambuco", "Ceará", "Pará", "Maranhão", "Santa Catarina", "Goiás", "Amazonas",
      "Espírito Santo", "Paraíba", "Rio Grande do Norte", "Alagoas", "Piauí", "Distrito Federal"
    ]
  },
  {
    name: "Japan",
    code: "JP",
    states: [
      "Tokyo", "Osaka", "Kanagawa", "Aichi", "Saitama", "Chiba", "Hyogo", "Hokkaido",
      "Fukuoka", "Shizuoka", "Ibaraki", "Hiroshima", "Kyoto", "Niigata", "Miyagi"
    ]
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    states: [
      "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Fujairah", "Ras Al Khaimah", "Umm Al Quwain"
    ]
  },
  {
    name: "Singapore",
    code: "SG",
    states: ["Central Region", "East Region", "North Region", "North-East Region", "West Region"]
  },
  {
    name: "Egypt",
    code: "EG",
    states: [
      "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor",
      "Aswan", "Mansoura", "Tanta", "Asyut", "Ismailia", "Faiyum", "Zagazig", "Damanhur"
    ]
  },
  {
    name: "Tanzania",
    code: "TZ",
    states: [
      "Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya", "Morogoro", "Tanga",
      "Zanzibar", "Kigoma", "Mtwara", "Iringa", "Tabora", "Kilimanjaro", "Shinyanga"
    ]
  },
  {
    name: "Uganda",
    code: "UG",
    states: [
      "Central Region", "Eastern Region", "Northern Region", "Western Region",
      "Kampala", "Wakiso", "Mukono", "Jinja", "Mbarara", "Gulu", "Lira", "Mbale"
    ]
  },
  {
    name: "Ethiopia",
    code: "ET",
    states: [
      "Addis Ababa", "Afar", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela",
      "Harari", "Oromia", "Sidama", "Somali", "SNNPR", "Tigray"
    ]
  },
  {
    name: "Other",
    code: "XX",
    states: ["Other"]
  }
];

export function getCountryByName(name: string): Country | undefined {
  return countries.find(c => c.name === name);
}

export function getStatesByCountry(countryName: string): string[] {
  const country = getCountryByName(countryName);
  return country?.states || [];
}
