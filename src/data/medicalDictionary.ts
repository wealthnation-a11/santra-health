export interface MedicalTerm {
  term: string;
  definition: string;
  category?: string;
}

export const medicalTerms: MedicalTerm[] = [
  // A
  { term: "Abdomen", definition: "The part of the body between the chest and pelvis, containing the digestive organs.", category: "Anatomy" },
  { term: "Abscess", definition: "A localized collection of pus surrounded by inflamed tissue.", category: "Conditions" },
  { term: "Acute", definition: "A condition with rapid onset and short duration, often severe.", category: "General" },
  { term: "Allergen", definition: "A substance that causes an allergic reaction.", category: "Immunology" },
  { term: "Anemia", definition: "A condition in which the blood doesn't have enough healthy red blood cells.", category: "Blood" },
  { term: "Antibiotic", definition: "A medicine that inhibits the growth of or destroys microorganisms.", category: "Medications" },
  { term: "Antigen", definition: "A substance that triggers an immune response in the body.", category: "Immunology" },
  { term: "Arrhythmia", definition: "An irregular heartbeat caused by abnormal electrical activity in the heart.", category: "Cardiology" },
  { term: "Arthritis", definition: "Inflammation of one or more joints, causing pain and stiffness.", category: "Musculoskeletal" },
  { term: "Asthma", definition: "A chronic respiratory condition causing difficulty breathing due to narrowed airways.", category: "Respiratory" },
  
  // B
  { term: "Benign", definition: "Not cancerous; not harmful or dangerous.", category: "Oncology" },
  { term: "Biopsy", definition: "The removal of tissue for examination to diagnose disease.", category: "Procedures" },
  { term: "Blood Pressure", definition: "The force of blood pushing against artery walls, measured in mmHg.", category: "Cardiology" },
  { term: "Bronchitis", definition: "Inflammation of the bronchial tubes in the lungs.", category: "Respiratory" },
  { term: "BMI", definition: "Body Mass Index - a measure of body fat based on height and weight.", category: "General" },
  
  // C
  { term: "Carcinoma", definition: "A type of cancer that starts in cells that make up the skin or tissue lining organs.", category: "Oncology" },
  { term: "Cardiac", definition: "Relating to the heart.", category: "Cardiology" },
  { term: "Chronic", definition: "A condition that persists over a long period of time.", category: "General" },
  { term: "Cholesterol", definition: "A waxy substance found in blood, essential for building cells but harmful in excess.", category: "Cardiology" },
  { term: "Contraindication", definition: "A condition that makes a particular treatment inadvisable.", category: "General" },
  { term: "CT Scan", definition: "Computed Tomography - an imaging procedure using X-rays to create detailed pictures.", category: "Diagnostics" },
  
  // D
  { term: "Dermatitis", definition: "Inflammation of the skin, often causing itching and redness.", category: "Dermatology" },
  { term: "Diabetes", definition: "A metabolic disease causing high blood sugar due to insulin problems.", category: "Endocrinology" },
  { term: "Diagnosis", definition: "The identification of a disease or condition through examination.", category: "General" },
  { term: "Dialysis", definition: "A treatment that filters and purifies the blood when kidneys fail.", category: "Nephrology" },
  { term: "Dyspnea", definition: "Difficulty breathing or shortness of breath.", category: "Respiratory" },
  
  // E
  { term: "Edema", definition: "Swelling caused by excess fluid trapped in body tissues.", category: "General" },
  { term: "Electrocardiogram (ECG)", definition: "A test that records the electrical activity of the heart.", category: "Cardiology" },
  { term: "Embolism", definition: "A blockage of a blood vessel by a blood clot or foreign substance.", category: "Cardiology" },
  { term: "Endoscopy", definition: "A procedure using a camera to examine the inside of the body.", category: "Procedures" },
  { term: "Enzyme", definition: "A protein that speeds up chemical reactions in the body.", category: "Biochemistry" },
  { term: "Epidermis", definition: "The outermost layer of the skin.", category: "Anatomy" },
  
  // F
  { term: "Fatigue", definition: "Extreme tiredness resulting from physical or mental exertion.", category: "Symptoms" },
  { term: "Fever", definition: "An abnormally high body temperature, usually indicating infection.", category: "Symptoms" },
  { term: "Fibromyalgia", definition: "A chronic condition causing widespread muscle pain and fatigue.", category: "Musculoskeletal" },
  { term: "Fracture", definition: "A break or crack in a bone.", category: "Musculoskeletal" },
  
  // G
  { term: "Gastritis", definition: "Inflammation of the stomach lining.", category: "Gastroenterology" },
  { term: "Genetic", definition: "Relating to genes or heredity.", category: "Genetics" },
  { term: "Glucose", definition: "A simple sugar that is the main source of energy for the body.", category: "Biochemistry" },
  { term: "Glaucoma", definition: "An eye condition causing damage to the optic nerve, often from high pressure.", category: "Ophthalmology" },
  
  // H
  { term: "Hemorrhage", definition: "Excessive bleeding from damaged blood vessels.", category: "General" },
  { term: "Hepatitis", definition: "Inflammation of the liver, often caused by viral infection.", category: "Gastroenterology" },
  { term: "Hernia", definition: "A condition where an organ pushes through an opening in surrounding tissue.", category: "General" },
  { term: "Hypertension", definition: "High blood pressure, a risk factor for heart disease and stroke.", category: "Cardiology" },
  { term: "Hypoglycemia", definition: "Abnormally low blood sugar levels.", category: "Endocrinology" },
  { term: "Hypothyroidism", definition: "A condition where the thyroid gland doesn't produce enough hormones.", category: "Endocrinology" },
  
  // I
  { term: "Immunity", definition: "The body's ability to resist infection and disease.", category: "Immunology" },
  { term: "Incubation Period", definition: "Time between exposure to infection and appearance of symptoms.", category: "Infectious Disease" },
  { term: "Inflammation", definition: "The body's response to injury or infection, causing redness and swelling.", category: "General" },
  { term: "Insulin", definition: "A hormone that regulates blood sugar levels.", category: "Endocrinology" },
  { term: "Intravenous (IV)", definition: "Administered directly into a vein.", category: "Procedures" },
  
  // J
  { term: "Jaundice", definition: "Yellowing of the skin and eyes due to high bilirubin levels.", category: "Gastroenterology" },
  { term: "Joint", definition: "A point where two bones meet, allowing movement.", category: "Anatomy" },
  
  // K
  { term: "Kidney", definition: "An organ that filters waste from the blood and produces urine.", category: "Anatomy" },
  { term: "Ketosis", definition: "A metabolic state where the body burns fat for energy.", category: "Metabolism" },
  
  // L
  { term: "Lesion", definition: "An area of abnormal tissue, such as a wound or tumor.", category: "General" },
  { term: "Leukemia", definition: "A cancer of blood-forming tissues, affecting white blood cells.", category: "Oncology" },
  { term: "Lipid", definition: "A group of fats and fat-like substances in the body.", category: "Biochemistry" },
  { term: "Lymph", definition: "A fluid containing white blood cells that helps fight infection.", category: "Immunology" },
  
  // M
  { term: "Malignant", definition: "Cancerous; having the ability to spread to other parts of the body.", category: "Oncology" },
  { term: "Metabolism", definition: "The chemical processes in the body that convert food to energy.", category: "Biochemistry" },
  { term: "Metastasis", definition: "The spread of cancer from one part of the body to another.", category: "Oncology" },
  { term: "MRI", definition: "Magnetic Resonance Imaging - a scan using magnets and radio waves.", category: "Diagnostics" },
  { term: "Mucus", definition: "A slippery secretion that protects and lubricates body surfaces.", category: "General" },
  
  // N
  { term: "Nausea", definition: "A feeling of sickness with an urge to vomit.", category: "Symptoms" },
  { term: "Necrosis", definition: "Death of cells or tissues due to disease, injury, or lack of blood supply.", category: "Pathology" },
  { term: "Neurology", definition: "The branch of medicine dealing with the nervous system.", category: "Specialties" },
  { term: "Neuropathy", definition: "Damage to nerves, often causing weakness or numbness.", category: "Neurology" },
  
  // O
  { term: "Oncology", definition: "The branch of medicine dealing with cancer.", category: "Specialties" },
  { term: "Osteoporosis", definition: "A condition causing bones to become weak and brittle.", category: "Musculoskeletal" },
  { term: "Oxygen Saturation", definition: "The percentage of hemoglobin carrying oxygen in the blood.", category: "Respiratory" },
  
  // P
  { term: "Pathogen", definition: "A microorganism that can cause disease.", category: "Infectious Disease" },
  { term: "Pediatrics", definition: "The branch of medicine dealing with children's health.", category: "Specialties" },
  { term: "Platelet", definition: "A blood cell fragment that helps with clotting.", category: "Blood" },
  { term: "Pneumonia", definition: "An infection that inflames the air sacs in one or both lungs.", category: "Respiratory" },
  { term: "Prognosis", definition: "The likely course and outcome of a disease.", category: "General" },
  { term: "Psoriasis", definition: "A skin condition causing red, itchy, scaly patches.", category: "Dermatology" },
  
  // Q
  { term: "Quarantine", definition: "Isolation to prevent the spread of infectious disease.", category: "Infectious Disease" },
  
  // R
  { term: "Radiology", definition: "The use of imaging to diagnose and treat diseases.", category: "Specialties" },
  { term: "Remission", definition: "A period when symptoms of a disease decrease or disappear.", category: "General" },
  { term: "Respiratory", definition: "Relating to breathing and the lungs.", category: "Anatomy" },
  { term: "Rheumatoid Arthritis", definition: "An autoimmune disease causing chronic joint inflammation.", category: "Musculoskeletal" },
  
  // S
  { term: "Sepsis", definition: "A life-threatening response to infection causing organ damage.", category: "Infectious Disease" },
  { term: "Symptom", definition: "A physical or mental sign of a disease or condition.", category: "General" },
  { term: "Syndrome", definition: "A group of symptoms that occur together, indicating a condition.", category: "General" },
  { term: "Systolic", definition: "The top number in blood pressure, measuring heart contraction force.", category: "Cardiology" },
  
  // T
  { term: "Tachycardia", definition: "An abnormally fast heart rate, over 100 beats per minute.", category: "Cardiology" },
  { term: "Tendonitis", definition: "Inflammation of a tendon, often from overuse.", category: "Musculoskeletal" },
  { term: "Thrombosis", definition: "The formation of a blood clot inside a blood vessel.", category: "Cardiology" },
  { term: "Thyroid", definition: "A gland in the neck that regulates metabolism.", category: "Anatomy" },
  { term: "Tumor", definition: "An abnormal mass of tissue that may be benign or malignant.", category: "Oncology" },
  
  // U
  { term: "Ulcer", definition: "An open sore on the skin or mucous membrane.", category: "General" },
  { term: "Ultrasound", definition: "An imaging technique using high-frequency sound waves.", category: "Diagnostics" },
  { term: "Urinalysis", definition: "A test examining urine for signs of disease.", category: "Diagnostics" },
  
  // V
  { term: "Vaccine", definition: "A substance that stimulates immunity against a disease.", category: "Immunology" },
  { term: "Vein", definition: "A blood vessel that carries blood toward the heart.", category: "Anatomy" },
  { term: "Vertigo", definition: "A sensation of spinning or dizziness.", category: "Neurology" },
  { term: "Virus", definition: "A microscopic infectious agent that replicates inside living cells.", category: "Infectious Disease" },
  { term: "Vital Signs", definition: "Key body measurements including temperature, pulse, and blood pressure.", category: "General" },
  
  // W
  { term: "White Blood Cell", definition: "A blood cell that fights infection and disease.", category: "Blood" },
  
  // X
  { term: "X-ray", definition: "An imaging technique using radiation to view inside the body.", category: "Diagnostics" },
  
  // Z
  { term: "Zoonotic", definition: "Diseases that can be transmitted from animals to humans.", category: "Infectious Disease" },
];

export const categories = [...new Set(medicalTerms.map(t => t.category).filter(Boolean))] as string[];
