// Medical Codes Database - ICD-10, LOINC, and CPT codes for clinical orders

// ICD-10 Diagnosis Codes
export const ICD10_CODES = [
  // Cardiovascular
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', category: 'Cardiovascular' },
  { code: 'I48.91', description: 'Unspecified atrial fibrillation', category: 'Cardiovascular' },
  { code: 'I50.9', description: 'Heart failure, unspecified', category: 'Cardiovascular' },
  { code: 'R00.0', description: 'Tachycardia, unspecified', category: 'Cardiovascular' },
  { code: 'R00.2', description: 'Palpitations', category: 'Cardiovascular' },
  { code: 'R07.9', description: 'Chest pain, unspecified', category: 'Cardiovascular' },

  // Respiratory
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism', category: 'Respiratory' },
  { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation', category: 'Respiratory' },
  { code: 'J45.20', description: 'Mild intermittent asthma, uncomplicated', category: 'Respiratory' },
  { code: 'R05.9', description: 'Cough, unspecified', category: 'Respiratory' },
  { code: 'R06.00', description: 'Dyspnea, unspecified', category: 'Respiratory' },

  // Gastrointestinal
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis', category: 'Gastrointestinal' },
  { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding', category: 'Gastrointestinal' },
  { code: 'K59.00', description: 'Constipation, unspecified', category: 'Gastrointestinal' },
  { code: 'R10.9', description: 'Unspecified abdominal pain', category: 'Gastrointestinal' },
  { code: 'R11.0', description: 'Nausea', category: 'Gastrointestinal' },
  { code: 'R11.2', description: 'Nausea with vomiting, unspecified', category: 'Gastrointestinal' },

  // Endocrine/Metabolic
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Endocrine' },
  { code: 'E03.9', description: 'Hypothyroidism, unspecified', category: 'Endocrine' },
  { code: 'E87.6', description: 'Hypokalemia', category: 'Endocrine' },

  // Neurological
  { code: 'G43.909', description: 'Migraine, unspecified, not intractable, without status migrainosus', category: 'Neurological' },
  { code: 'R42', description: 'Dizziness and giddiness', category: 'Neurological' },
  { code: 'R51.9', description: 'Headache, unspecified', category: 'Neurological' },
  { code: 'R55', description: 'Syncope and collapse', category: 'Neurological' },

  // Musculoskeletal
  { code: 'M54.5', description: 'Low back pain', category: 'Musculoskeletal' },
  { code: 'M54.9', description: 'Dorsalgia, unspecified', category: 'Musculoskeletal' },
  { code: 'M25.50', description: 'Pain in unspecified joint', category: 'Musculoskeletal' },

  // Infectious
  { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified', category: 'Infectious' },
  { code: 'B34.9', description: 'Viral infection, unspecified', category: 'Infectious' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified', category: 'Infectious' },

  // General/Symptoms
  { code: 'R50.9', description: 'Fever, unspecified', category: 'General' },
  { code: 'R53.83', description: 'Other fatigue', category: 'General' },
  { code: 'R61', description: 'Generalized hyperhidrosis', category: 'General' },
  { code: 'R69', description: 'Illness, unspecified', category: 'General' },

  // Hematologic
  { code: 'D64.9', description: 'Anemia, unspecified', category: 'Hematologic' },
  { code: 'D69.6', description: 'Thrombocytopenia, unspecified', category: 'Hematologic' },

  // Renal
  { code: 'N17.9', description: 'Acute kidney failure, unspecified', category: 'Renal' },
  { code: 'N18.9', description: 'Chronic kidney disease, unspecified', category: 'Renal' },
];

// LOINC Codes for Laboratory Tests
export const LOINC_CODES = [
  // Hematology
  { code: '58410-2', description: 'Complete blood count (CBC) panel - Blood by Automated count', category: 'Hematology' },
  { code: '57021-8', description: 'CBC W Auto Differential panel - Blood', category: 'Hematology' },
  { code: '6690-2', description: 'Leukocytes [#/volume] in Blood by Automated count', category: 'Hematology' },
  { code: '789-8', description: 'Erythrocytes [#/volume] in Blood by Automated count', category: 'Hematology' },
  { code: '718-7', description: 'Hemoglobin [Mass/volume] in Blood', category: 'Hematology' },
  { code: '4544-3', description: 'Hematocrit [Volume Fraction] of Blood by Automated count', category: 'Hematology' },
  { code: '777-3', description: 'Platelets [#/volume] in Blood by Automated count', category: 'Hematology' },

  // Chemistry
  { code: '24323-8', description: 'Comprehensive metabolic 2000 panel - Serum or Plasma', category: 'Chemistry' },
  { code: '24322-0', description: 'Basic metabolic 2000 panel - Serum or Plasma', category: 'Chemistry' },
  { code: '2160-0', description: 'Creatinine [Mass/volume] in Serum or Plasma', category: 'Chemistry' },
  { code: '3094-0', description: 'Urea nitrogen [Mass/volume] in Serum or Plasma', category: 'Chemistry' },
  { code: '2345-7', description: 'Glucose [Mass/volume] in Serum or Plasma', category: 'Chemistry' },
  { code: '2951-2', description: 'Sodium [Moles/volume] in Serum or Plasma', category: 'Chemistry' },
  { code: '2823-3', description: 'Potassium [Moles/volume] in Serum or Plasma', category: 'Chemistry' },
  { code: '2075-0', description: 'Chloride [Moles/volume] in Serum or Plasma', category: 'Chemistry' },
  { code: '1963-8', description: 'Bicarbonate [Moles/volume] in Serum or Plasma', category: 'Chemistry' },
  { code: '17861-6', description: 'Calcium [Mass/volume] in Serum or Plasma', category: 'Chemistry' },

  // Cardiac
  { code: '10839-9', description: 'Troponin I.cardiac [Mass/volume] in Serum or Plasma', category: 'Cardiac' },
  { code: '6598-7', description: 'Troponin T.cardiac [Mass/volume] in Serum or Plasma', category: 'Cardiac' },
  { code: '33762-6', description: 'Natriuretic peptide.B prohormone N-Terminal [Mass/volume] in Serum or Plasma', category: 'Cardiac' },
  { code: '30522-7', description: 'Creatine kinase.MB [Mass/volume] in Serum or Plasma', category: 'Cardiac' },

  // Coagulation
  { code: '5902-2', description: 'Prothrombin time (PT)', category: 'Coagulation' },
  { code: '3173-2', description: 'Activated partial thromboplastin time (aPTT) in Blood', category: 'Coagulation' },
  { code: '6301-6', description: 'INR in Platelet poor plasma by Coagulation assay', category: 'Coagulation' },
  { code: '48066-5', description: 'Fibrin D-dimer DDU [Mass/volume] in Platelet poor plasma', category: 'Coagulation' },

  // Liver
  { code: '24325-3', description: 'Hepatic function 2000 panel - Serum or Plasma', category: 'Liver' },
  { code: '1742-6', description: 'Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma', category: 'Liver' },
  { code: '1920-8', description: 'Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma', category: 'Liver' },
  { code: '1975-2', description: 'Bilirubin.total [Mass/volume] in Serum or Plasma', category: 'Liver' },
  { code: '6768-6', description: 'Alkaline phosphatase [Enzymatic activity/volume] in Serum or Plasma', category: 'Liver' },
  { code: '2885-2', description: 'Protein [Mass/volume] in Serum or Plasma', category: 'Liver' },
  { code: '1751-7', description: 'Albumin [Mass/volume] in Serum or Plasma', category: 'Liver' },

  // Thyroid
  { code: '3016-3', description: 'Thyrotropin [Units/volume] in Serum or Plasma', category: 'Thyroid' },
  { code: '3026-2', description: 'Thyroxine (T4) free [Mass/volume] in Serum or Plasma', category: 'Thyroid' },
  { code: '3053-6', description: 'Triiodothyronine (T3) Free [Mass/volume] in Serum or Plasma', category: 'Thyroid' },

  // Lipids
  { code: '24331-1', description: 'Lipid 1996 panel - Serum or Plasma', category: 'Lipids' },
  { code: '2093-3', description: 'Cholesterol [Mass/volume] in Serum or Plasma', category: 'Lipids' },
  { code: '2571-8', description: 'Triglyceride [Mass/volume] in Serum or Plasma', category: 'Lipids' },
  { code: '2085-9', description: 'Cholesterol in HDL [Mass/volume] in Serum or Plasma', category: 'Lipids' },
  { code: '13457-7', description: 'Cholesterol in LDL [Mass/volume] in Serum or Plasma', category: 'Lipids' },

  // Urinalysis
  { code: '24356-8', description: 'Urinalysis complete panel - Urine', category: 'Urinalysis' },
  { code: '5778-6', description: 'Color of Urine', category: 'Urinalysis' },
  { code: '5803-2', description: 'pH of Urine by Test strip', category: 'Urinalysis' },
  { code: '5811-5', description: 'Specific gravity of Urine by Test strip', category: 'Urinalysis' },

  // Inflammatory
  { code: '1988-5', description: 'C reactive protein [Mass/volume] in Serum or Plasma', category: 'Inflammatory' },
  { code: '30341-2', description: 'Erythrocyte sedimentation rate', category: 'Inflammatory' },

  // Diabetes
  { code: '4548-4', description: 'Hemoglobin A1c/Hemoglobin.total in Blood', category: 'Diabetes' },
  { code: '1558-6', description: 'Fasting glucose [Mass/volume] in Serum or Plasma', category: 'Diabetes' },
];

// CPT Codes for Procedures and Imaging
export const CPT_CODES = [
  // Radiology - Chest
  { code: '71046', description: 'Radiologic examination, chest; 2 views', category: 'Radiology' },
  { code: '71045', description: 'Radiologic examination, chest; single view', category: 'Radiology' },
  { code: '71250', description: 'Computed tomography, thorax; without contrast material', category: 'Radiology' },
  { code: '71260', description: 'Computed tomography, thorax; with contrast material(s)', category: 'Radiology' },
  { code: '71275', description: 'Computed tomographic angiography, chest, with contrast', category: 'Radiology' },

  // Radiology - Abdomen
  { code: '74018', description: 'Radiologic examination, abdomen; 1 view', category: 'Radiology' },
  { code: '74019', description: 'Radiologic examination, abdomen; 2 views', category: 'Radiology' },
  { code: '74150', description: 'Computed tomography, abdomen; without contrast material', category: 'Radiology' },
  { code: '74160', description: 'Computed tomography, abdomen; with contrast material(s)', category: 'Radiology' },
  { code: '74176', description: 'Computed tomography, abdomen and pelvis; without contrast', category: 'Radiology' },
  { code: '74177', description: 'Computed tomography, abdomen and pelvis; with contrast', category: 'Radiology' },

  // Radiology - Head
  { code: '70450', description: 'Computed tomography, head or brain; without contrast material', category: 'Radiology' },
  { code: '70460', description: 'Computed tomography, head or brain; with contrast material(s)', category: 'Radiology' },
  { code: '70553', description: 'MRI brain with and without contrast', category: 'Radiology' },

  // Radiology - Musculoskeletal
  { code: '73030', description: 'Radiologic examination, shoulder; complete, minimum of 2 views', category: 'Radiology' },
  { code: '73060', description: 'Radiologic examination, humerus; minimum of 2 views', category: 'Radiology' },
  { code: '73110', description: 'Radiologic examination, wrist; complete, minimum of 3 views', category: 'Radiology' },
  { code: '73562', description: 'Radiologic examination, knee; 3 views', category: 'Radiology' },
  { code: '72100', description: 'Radiologic examination, spine, lumbosacral; 2 or 3 views', category: 'Radiology' },

  // Ultrasound
  { code: '76700', description: 'Ultrasound, abdominal, real time with image documentation; complete', category: 'Ultrasound' },
  { code: '76705', description: 'Ultrasound, abdominal, real time; limited', category: 'Ultrasound' },
  { code: '93306', description: 'Echocardiography, transthoracic, real-time with image documentation', category: 'Ultrasound' },
  { code: '93880', description: 'Duplex scan of extracranial arteries; complete bilateral study', category: 'Ultrasound' },
  { code: '93971', description: 'Duplex scan of extremity veins; unilateral or limited study', category: 'Ultrasound' },

  // Cardiac
  { code: '93000', description: 'Electrocardiogram, routine ECG with at least 12 leads', category: 'Cardiac' },
  { code: '93015', description: 'Cardiovascular stress test using maximal or submaximal treadmill', category: 'Cardiac' },
  { code: '93017', description: 'Cardiovascular stress test using maximal or submaximal treadmill; tracing only', category: 'Cardiac' },

  // Laboratory Collection
  { code: '36415', description: 'Collection of venous blood by venipuncture', category: 'Laboratory' },
  { code: '36416', description: 'Collection of capillary blood specimen', category: 'Laboratory' },
];

// Search function for medical codes
export const searchMedicalCodes = (query, codeType = 'all') => {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return [];

  let results = [];

  const searchInArray = (arr, type) => {
    return arr.filter(item =>
      item.code.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    ).map(item => ({ ...item, type }));
  };

  if (codeType === 'all' || codeType === 'icd10') {
    results = [...results, ...searchInArray(ICD10_CODES, 'ICD-10')];
  }

  if (codeType === 'all' || codeType === 'loinc') {
    results = [...results, ...searchInArray(LOINC_CODES, 'LOINC')];
  }

  if (codeType === 'all' || codeType === 'cpt') {
    results = [...results, ...searchInArray(CPT_CODES, 'CPT')];
  }

  return results.slice(0, 50); // Limit results
};

// Get codes by category
export const getCodesByCategory = (category, codeType = 'all') => {
  let results = [];

  if (codeType === 'all' || codeType === 'icd10') {
    results = [...results, ...ICD10_CODES.filter(c => c.category === category).map(c => ({ ...c, type: 'ICD-10' }))];
  }

  if (codeType === 'all' || codeType === 'loinc') {
    results = [...results, ...LOINC_CODES.filter(c => c.category === category).map(c => ({ ...c, type: 'LOINC' }))];
  }

  if (codeType === 'all' || codeType === 'cpt') {
    results = [...results, ...CPT_CODES.filter(c => c.category === category).map(c => ({ ...c, type: 'CPT' }))];
  }

  return results;
};

// Get all categories
export const getAllCategories = () => {
  const categories = new Set();

  ICD10_CODES.forEach(c => categories.add(c.category));
  LOINC_CODES.forEach(c => categories.add(c.category));
  CPT_CODES.forEach(c => categories.add(c.category));

  return Array.from(categories).sort();
};

export default {
  ICD10_CODES,
  LOINC_CODES,
  CPT_CODES,
  searchMedicalCodes,
  getCodesByCategory,
  getAllCategories
};
