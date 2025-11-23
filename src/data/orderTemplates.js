// Pre-filled templates for common clinical orders

export const ORDER_TEMPLATES = {
  // Laboratory Orders
  lab: {
    cbc: {
      id: 'lab-cbc',
      name: 'Complete Blood Count (CBC)',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Complete Blood Count with Differential',
        testCode: '58410-2',
        cptCode: '85025',
        specimen: 'Whole Blood',
        container: 'Lavender top (EDTA)',
        volume: '3 mL',
        instructions: 'Invert tube gently 8-10 times after collection',
      },
      clinicalJustification: {
        commonIndications: [
          'Anemia workup',
          'Infection evaluation',
          'Bleeding disorder',
          'Pre-operative evaluation',
          'Monitoring chemotherapy',
        ],
        icd10Suggestions: ['D64.9', 'R50.9', 'Z01.812'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Any time',
        specialInstructions: 'Avoid prolonged tourniquet time',
      },
      priority: 'routine',
    },
    cmp: {
      id: 'lab-cmp',
      name: 'Comprehensive Metabolic Panel (CMP)',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Comprehensive Metabolic Panel',
        testCode: '24323-8',
        cptCode: '80053',
        specimen: 'Serum or Plasma',
        container: 'Gold top (SST) or Green top (Lithium Heparin)',
        volume: '5 mL',
        instructions: 'Separate serum/plasma within 2 hours',
      },
      clinicalJustification: {
        commonIndications: [
          'Electrolyte imbalance',
          'Kidney function assessment',
          'Liver function assessment',
          'Diabetes monitoring',
          'Medication monitoring',
        ],
        icd10Suggestions: ['E87.6', 'N18.9', 'E11.9'],
      },
      collectionInstructions: {
        fasting: true,
        timing: 'Morning preferred (8-12 hours fasting)',
        specialInstructions: 'Patient may drink water',
      },
      priority: 'routine',
    },
    bmp: {
      id: 'lab-bmp',
      name: 'Basic Metabolic Panel (BMP)',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Basic Metabolic Panel',
        testCode: '24322-0',
        cptCode: '80048',
        specimen: 'Serum or Plasma',
        container: 'Gold top (SST) or Green top (Lithium Heparin)',
        volume: '3 mL',
        instructions: 'Separate serum/plasma within 2 hours',
      },
      clinicalJustification: {
        commonIndications: [
          'Electrolyte evaluation',
          'Renal function',
          'Glucose assessment',
          'Dehydration',
        ],
        icd10Suggestions: ['E87.6', 'N17.9', 'E86.0'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Any time (fasting for glucose accuracy)',
        specialInstructions: 'Note if fasting or non-fasting',
      },
      priority: 'routine',
    },
    lipidPanel: {
      id: 'lab-lipid',
      name: 'Lipid Panel',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Lipid Panel',
        testCode: '24331-1',
        cptCode: '80061',
        specimen: 'Serum',
        container: 'Gold top (SST)',
        volume: '3 mL',
        instructions: 'Patient must fast 9-12 hours',
      },
      clinicalJustification: {
        commonIndications: [
          'Cardiovascular risk assessment',
          'Hyperlipidemia monitoring',
          'Statin therapy monitoring',
          'Metabolic syndrome evaluation',
        ],
        icd10Suggestions: ['E78.5', 'Z13.220', 'I25.10'],
      },
      collectionInstructions: {
        fasting: true,
        timing: 'Morning (9-12 hours fasting)',
        specialInstructions: 'Water only, no coffee or juice',
      },
      priority: 'routine',
    },
    troponin: {
      id: 'lab-troponin',
      name: 'Troponin I/T',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Troponin I, High Sensitivity',
        testCode: '10839-9',
        cptCode: '84484',
        specimen: 'Serum or Plasma',
        container: 'Gold top or Green top',
        volume: '3 mL',
        instructions: 'STAT processing required',
      },
      clinicalJustification: {
        commonIndications: [
          'Acute coronary syndrome evaluation',
          'Chest pain workup',
          'Rule out myocardial infarction',
          'Heart failure assessment',
        ],
        icd10Suggestions: ['R07.9', 'I21.9', 'I50.9'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Serial: 0, 3, 6 hours from presentation',
        specialInstructions: 'Order serial troponins for ACS workup',
      },
      priority: 'stat',
    },
    tsh: {
      id: 'lab-tsh',
      name: 'Thyroid Stimulating Hormone (TSH)',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Thyroid Stimulating Hormone',
        testCode: '3016-3',
        cptCode: '84443',
        specimen: 'Serum',
        container: 'Gold top (SST)',
        volume: '3 mL',
        instructions: 'Separate serum within 2 hours',
      },
      clinicalJustification: {
        commonIndications: [
          'Thyroid dysfunction screening',
          'Fatigue evaluation',
          'Weight changes',
          'Thyroid medication monitoring',
        ],
        icd10Suggestions: ['E03.9', 'R53.83', 'Z01.812'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Morning preferred',
        specialInstructions: 'Take thyroid medication after collection',
      },
      priority: 'routine',
    },
    hba1c: {
      id: 'lab-hba1c',
      name: 'Hemoglobin A1c',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Hemoglobin A1c',
        testCode: '4548-4',
        cptCode: '83036',
        specimen: 'Whole Blood',
        container: 'Lavender top (EDTA)',
        volume: '3 mL',
        instructions: 'Stable at room temperature for 7 days',
      },
      clinicalJustification: {
        commonIndications: [
          'Diabetes monitoring',
          'Diabetes screening',
          'Prediabetes evaluation',
          'Treatment efficacy assessment',
        ],
        icd10Suggestions: ['E11.9', 'R73.09', 'Z13.1'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Any time',
        specialInstructions: 'Reflects 2-3 month glucose average',
      },
      priority: 'routine',
    },
    urinalysis: {
      id: 'lab-ua',
      name: 'Urinalysis with Microscopy',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Urinalysis, Complete',
        testCode: '24356-8',
        cptCode: '81001',
        specimen: 'Urine',
        container: 'Urine cup',
        volume: '30 mL',
        instructions: 'Midstream clean catch preferred',
      },
      clinicalJustification: {
        commonIndications: [
          'Urinary tract infection',
          'Hematuria evaluation',
          'Proteinuria screening',
          'Kidney disease monitoring',
        ],
        icd10Suggestions: ['N39.0', 'R31.9', 'R80.9'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'First morning void preferred',
        specialInstructions: 'Clean catch technique; deliver within 1 hour',
      },
      priority: 'routine',
    },
    coagulation: {
      id: 'lab-coag',
      name: 'Coagulation Panel (PT/INR, PTT)',
      category: 'Laboratory',
      type: 'lab',
      orderDetails: {
        testName: 'Prothrombin Time with INR and PTT',
        testCode: '5902-2',
        cptCode: '85610',
        specimen: 'Plasma',
        container: 'Blue top (Sodium Citrate)',
        volume: '2.7 mL',
        instructions: 'Fill tube completely; mix gently',
      },
      clinicalJustification: {
        commonIndications: [
          'Anticoagulation monitoring',
          'Pre-operative evaluation',
          'Bleeding disorder workup',
          'Liver disease assessment',
        ],
        icd10Suggestions: ['Z79.01', 'Z01.812', 'D68.9'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Consistent timing for INR monitoring',
        specialInstructions: 'Note anticoagulant medications and dosing',
      },
      priority: 'routine',
    },
  },

  // Imaging Orders
  imaging: {
    chestXray: {
      id: 'img-cxr',
      name: 'Chest X-ray (2 views)',
      category: 'Imaging',
      type: 'imaging',
      orderDetails: {
        studyName: 'Chest X-ray PA and Lateral',
        cptCode: '71046',
        modality: 'X-ray',
        views: 'PA and Lateral',
        contrast: 'None',
        preparation: 'Remove jewelry and metal objects',
      },
      clinicalJustification: {
        commonIndications: [
          'Pneumonia evaluation',
          'Shortness of breath',
          'Chest pain workup',
          'Cough evaluation',
          'Pre-operative clearance',
        ],
        icd10Suggestions: ['R06.00', 'J18.9', 'R05.9'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Any time',
        specialInstructions: 'Patient should be able to stand; portable if needed',
      },
      priority: 'routine',
    },
    ctChest: {
      id: 'img-ct-chest',
      name: 'CT Chest with Contrast',
      category: 'Imaging',
      type: 'imaging',
      orderDetails: {
        studyName: 'CT Thorax with Contrast',
        cptCode: '71260',
        modality: 'CT',
        views: 'Axial with reconstructions',
        contrast: 'IV Iodinated contrast',
        preparation: 'NPO 4 hours; check creatinine and allergies',
      },
      clinicalJustification: {
        commonIndications: [
          'Pulmonary nodule evaluation',
          'Lung mass characterization',
          'Mediastinal adenopathy',
          'Pulmonary embolism (with CTA protocol)',
        ],
        icd10Suggestions: ['R91.1', 'J98.4', 'R59.0'],
      },
      collectionInstructions: {
        fasting: true,
        timing: 'Any time (NPO 4 hours)',
        specialInstructions: 'Verify creatinine < 1.5; contrast allergy protocol if needed',
      },
      safetyChecks: {
        allergies: ['Iodinated contrast', 'Shellfish'],
        contraindications: ['Renal insufficiency (GFR < 30)', 'Pregnancy'],
        requiredLabs: ['Creatinine within 30 days'],
      },
      priority: 'urgent',
    },
    ctAbdomenPelvis: {
      id: 'img-ct-abdpelvis',
      name: 'CT Abdomen/Pelvis with Contrast',
      category: 'Imaging',
      type: 'imaging',
      orderDetails: {
        studyName: 'CT Abdomen and Pelvis with Contrast',
        cptCode: '74177',
        modality: 'CT',
        views: 'Axial with reconstructions',
        contrast: 'IV and Oral contrast',
        preparation: 'NPO 4 hours; oral contrast 1-2 hours before',
      },
      clinicalJustification: {
        commonIndications: [
          'Abdominal pain evaluation',
          'Appendicitis',
          'Diverticulitis',
          'Abdominal mass',
          'Bowel obstruction',
        ],
        icd10Suggestions: ['R10.9', 'K35.80', 'K57.92'],
      },
      collectionInstructions: {
        fasting: true,
        timing: 'Schedule with oral contrast timing',
        specialInstructions: 'Oral contrast 1-2 hours prior; IV contrast at time of scan',
      },
      safetyChecks: {
        allergies: ['Iodinated contrast'],
        contraindications: ['Renal insufficiency', 'Pregnancy', 'Metformin (hold 48h post)'],
        requiredLabs: ['Creatinine within 30 days'],
      },
      priority: 'urgent',
    },
    ecg: {
      id: 'img-ecg',
      name: '12-Lead ECG',
      category: 'Cardiac',
      type: 'imaging',
      orderDetails: {
        studyName: '12-Lead Electrocardiogram',
        cptCode: '93000',
        modality: 'ECG',
        views: '12-lead with interpretation',
        contrast: 'None',
        preparation: 'None required',
      },
      clinicalJustification: {
        commonIndications: [
          'Chest pain evaluation',
          'Arrhythmia workup',
          'Syncope evaluation',
          'Pre-operative assessment',
          'Medication monitoring (QTc)',
        ],
        icd10Suggestions: ['R07.9', 'R00.0', 'R55'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Any time',
        specialInstructions: 'Patient should be at rest; compare to prior if available',
      },
      priority: 'stat',
    },
    echo: {
      id: 'img-echo',
      name: 'Transthoracic Echocardiogram',
      category: 'Cardiac',
      type: 'imaging',
      orderDetails: {
        studyName: 'Transthoracic Echocardiogram',
        cptCode: '93306',
        modality: 'Ultrasound',
        views: 'Complete with Doppler',
        contrast: 'None (or agitated saline if bubble study)',
        preparation: 'None required',
      },
      clinicalJustification: {
        commonIndications: [
          'Heart failure evaluation',
          'Valvular disease',
          'Cardiomyopathy',
          'Pericardial effusion',
          'Endocarditis workup',
        ],
        icd10Suggestions: ['I50.9', 'I35.0', 'I42.9'],
      },
      collectionInstructions: {
        fasting: false,
        timing: 'Any time',
        specialInstructions: 'Allow 45-60 minutes for complete study',
      },
      priority: 'routine',
    },
    ultrasoundAbdomen: {
      id: 'img-us-abd',
      name: 'Abdominal Ultrasound',
      category: 'Imaging',
      type: 'imaging',
      orderDetails: {
        studyName: 'Ultrasound Abdomen Complete',
        cptCode: '76700',
        modality: 'Ultrasound',
        views: 'Complete abdominal survey',
        contrast: 'None',
        preparation: 'NPO 8 hours',
      },
      clinicalJustification: {
        commonIndications: [
          'Right upper quadrant pain',
          'Gallbladder evaluation',
          'Liver assessment',
          'Kidney evaluation',
          'Aortic aneurysm screening',
        ],
        icd10Suggestions: ['R10.11', 'K80.20', 'K76.0'],
      },
      collectionInstructions: {
        fasting: true,
        timing: 'Morning (NPO after midnight)',
        specialInstructions: 'Full bladder may be needed for pelvic views',
      },
      priority: 'routine',
    },
  },

  // Referral Templates
  referral: {
    cardiology: {
      id: 'ref-cardio',
      name: 'Cardiology Consultation',
      category: 'Referral',
      type: 'referral',
      orderDetails: {
        specialty: 'Cardiology',
        urgency: 'Routine',
        reasonForReferral: '',
      },
      clinicalJustification: {
        commonIndications: [
          'Chest pain requiring further evaluation',
          'Heart failure management',
          'Arrhythmia management',
          'Valvular heart disease',
          'Pre-operative cardiac clearance',
        ],
        icd10Suggestions: ['R07.9', 'I50.9', 'I48.91'],
      },
      priority: 'routine',
    },
    pulmonology: {
      id: 'ref-pulm',
      name: 'Pulmonology Consultation',
      category: 'Referral',
      type: 'referral',
      orderDetails: {
        specialty: 'Pulmonology',
        urgency: 'Routine',
        reasonForReferral: '',
      },
      clinicalJustification: {
        commonIndications: [
          'COPD management',
          'Asthma optimization',
          'Interstitial lung disease',
          'Sleep apnea evaluation',
          'Chronic cough workup',
        ],
        icd10Suggestions: ['J44.1', 'J45.20', 'G47.33'],
      },
      priority: 'routine',
    },
    gastroenterology: {
      id: 'ref-gi',
      name: 'Gastroenterology Consultation',
      category: 'Referral',
      type: 'referral',
      orderDetails: {
        specialty: 'Gastroenterology',
        urgency: 'Routine',
        reasonForReferral: '',
      },
      clinicalJustification: {
        commonIndications: [
          'GERD refractory to PPI',
          'Chronic abdominal pain',
          'Abnormal liver enzymes',
          'GI bleeding',
          'Colonoscopy screening',
        ],
        icd10Suggestions: ['K21.0', 'R10.9', 'K92.2'],
      },
      priority: 'routine',
    },
  },
};

// Helper function to get template by ID
export const getTemplateById = (templateId) => {
  for (const category of Object.values(ORDER_TEMPLATES)) {
    for (const template of Object.values(category)) {
      if (template.id === templateId) {
        return template;
      }
    }
  }
  return null;
};

// Helper function to get all templates as flat array
export const getAllTemplates = () => {
  const templates = [];
  for (const category of Object.values(ORDER_TEMPLATES)) {
    for (const template of Object.values(category)) {
      templates.push(template);
    }
  }
  return templates;
};

// Helper function to search templates
export const searchTemplates = (query) => {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return getAllTemplates();

  return getAllTemplates().filter(template =>
    template.name.toLowerCase().includes(searchTerm) ||
    template.category.toLowerCase().includes(searchTerm) ||
    template.clinicalJustification?.commonIndications?.some(ind =>
      ind.toLowerCase().includes(searchTerm)
    )
  );
};

// Priority levels
export const ORDER_PRIORITIES = [
  { value: 'stat', label: 'STAT', description: 'Immediate - Life threatening', color: 'red' },
  { value: 'urgent', label: 'Urgent', description: 'Within 24 hours', color: 'orange' },
  { value: 'routine', label: 'Routine', description: 'Standard timing', color: 'blue' },
  { value: 'scheduled', label: 'Scheduled', description: 'Future date', color: 'gray' },
];

export default ORDER_TEMPLATES;
