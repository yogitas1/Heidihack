from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union


class TranscriptRequest(BaseModel):
    transcript: str


class ExtractedFormData(BaseModel):
    chief_complaint: Optional[str] = None
    symptoms: Optional[List[str]] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    additional_notes: Optional[str] = None


# HPI (History of Present Illness) data structure
class HPIData(BaseModel):
    location: Optional[List[str]] = []
    radiation: Optional[List[str]] = []
    quality: Optional[List[str]] = []
    quality_other: Optional[str] = ""
    duration: Optional[str] = ""
    severity: Optional[int] = 5
    timing: Optional[str] = ""
    aggravating_factors: Optional[List[str]] = []
    relieving_factors: Optional[List[str]] = []


# Vital signs data structure
class VitalsData(BaseModel):
    bp: Optional[str] = ""
    hr: Optional[Union[str, int, float]] = ""
    temp: Optional[Union[str, int, float]] = ""
    spo2: Optional[Union[str, int, float]] = ""
    rr: Optional[Union[str, int, float]] = ""


# Physical exam data structure
class PhysicalExamData(BaseModel):
    general: Optional[List[str]] = []
    vitals: Optional[VitalsData] = VitalsData()
    cardiovascular: Optional[List[str]] = []
    respiratory: Optional[List[str]] = []


# Complete clinical form data
class ClinicalFormData(BaseModel):
    chief_complaint: str
    hpi: Optional[HPIData] = HPIData()
    associated_symptoms: Optional[List[str]] = []
    physical_exam: Optional[PhysicalExamData] = PhysicalExamData()
    doctor_notes: Optional[str] = ""


# Patient context for analysis
class PatientContext(BaseModel):
    name: Optional[str] = ""
    age: Optional[int] = 0
    gender: Optional[str] = ""
    mrn: Optional[str] = ""
    medical_history: Optional[List[str]] = []
    medications: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    vitals: Optional[Dict[str, Any]] = {}


# Analysis request combining form data and patient context
class AnalysisRequest(BaseModel):
    form_data: ClinicalFormData
    patient_context: Optional[PatientContext] = PatientContext()


# Legacy EncounterFormData for backwards compatibility
class EncounterFormData(BaseModel):
    chief_complaint: Optional[str] = None
    symptoms: Optional[List[str]] = None
    duration: Optional[str] = None
    severity: Optional[str] = None
    additional_notes: Optional[str] = None
    doctor_notes: Optional[str] = None


# ICD-10 code model
class ICD10Code(BaseModel):
    code: str
    description: str


# Task model
class Task(BaseModel):
    description: str
    priority: Optional[str] = None


# SOAP clinical note structure
class ClinicalNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str


# Differential diagnosis with risk and details
class DifferentialDiagnosis(BaseModel):
    name: str
    risk: str  # HIGH, MEDIUM, LOW
    supporting_factors: Optional[List[str]] = []
    recommended_actions: Optional[List[str]] = []


# Recommended action item
class RecommendedAction(BaseModel):
    name: str
    category: Optional[str] = ""  # Lab, Imaging, Medication, Referral, Follow-up
    details: Optional[str] = ""


# Recommended actions grouped by priority
class RecommendedActions(BaseModel):
    immediate: Optional[List[RecommendedAction]] = []
    urgent: Optional[List[RecommendedAction]] = []
    routine: Optional[List[RecommendedAction]] = []


# Follow-up recommendation
class FollowUpRecommendation(BaseModel):
    id: str
    reason: str
    priority: str  # urgent, routine, optional
    timeframe: str
    suggestedDates: List[str]
    duration: int
    notes: str


# Complete analysis response
class AnalysisResponse(BaseModel):
    clinical_note: ClinicalNote
    icd_codes: List[ICD10Code]
    differential_diagnoses: List[DifferentialDiagnosis]
    recommended_actions: RecommendedActions
    follow_up_recommendations: Optional[List[FollowUpRecommendation]] = []


# Legacy response format for backwards compatibility
class LegacyAnalysisResponse(BaseModel):
    clinical_note: str
    icd10_codes: List[ICD10Code]
    differential_diagnoses: List[str]
    tasks: List[Task]


# Appointment model
class Appointment(BaseModel):
    id: Optional[str] = None
    patientId: str
    patientName: str
    date: str
    duration: int = 30
    type: str = "initial"
    status: str = "scheduled"
    notes: Optional[str] = ""
    isFollowUp: bool = False


# Clinical Order Models

class PatientOrderInfo(BaseModel):
    patientId: Optional[str] = ""
    patientName: str
    dateOfBirth: Optional[str] = ""
    mrn: str
    gender: Optional[str] = ""
    phone: Optional[str] = ""
    address: Optional[str] = ""
    insuranceId: Optional[str] = ""


class ProviderOrderInfo(BaseModel):
    orderingProvider: str
    providerId: Optional[str] = ""
    npi: Optional[str] = ""
    facility: Optional[str] = ""
    department: Optional[str] = ""
    contactPhone: Optional[str] = ""
    contactFax: Optional[str] = ""


class OrderDetailsInfo(BaseModel):
    orderType: str  # lab, imaging, referral, medication, procedure
    orderName: str
    orderCode: Optional[str] = ""
    quantity: int = 1
    frequency: Optional[str] = "once"
    duration: Optional[str] = ""
    specialInstructions: Optional[str] = ""


class ClinicalJustificationInfo(BaseModel):
    indication: str
    icd10Codes: List[Dict[str, str]] = []  # [{code: "", description: ""}]
    clinicalHistory: Optional[str] = ""
    relevantFindings: Optional[str] = ""


class PriorityTimingInfo(BaseModel):
    priority: str = "routine"  # stat, urgent, routine, scheduled
    requestedDate: Optional[str] = ""
    requestedTime: Optional[str] = ""
    expirationDate: Optional[str] = ""
    recurring: bool = False
    recurringSchedule: Optional[str] = ""


class CollectionInstructionsInfo(BaseModel):
    fasting: bool = False
    fastingHours: Optional[str] = ""
    specimen: Optional[str] = ""
    collectionSite: Optional[str] = ""
    specialHandling: Optional[str] = ""
    transportInstructions: Optional[str] = ""


class SafetyChecksInfo(BaseModel):
    allergies: List[str] = []
    allergyNotes: Optional[str] = ""
    contraindications: List[str] = []
    contraindicationNotes: Optional[str] = ""
    pregnancyStatus: Optional[str] = ""
    renalFunction: Optional[str] = ""
    safetyConfirmed: bool = False


class AttachmentsInfo(BaseModel):
    documents: List[str] = []
    notes: Optional[str] = ""
    priorAuthRequired: bool = False
    priorAuthNumber: Optional[str] = ""


class AuthenticationInfo(BaseModel):
    authenticationId: str
    digitalSignature: Optional[str] = ""
    signatureTimestamp: Optional[str] = ""
    attestation: bool = False


class OrderMetadata(BaseModel):
    createdAt: str
    updatedAt: Optional[str] = ""
    status: str = "pending"  # pending, approved, in_progress, completed, cancelled
    version: int = 1


class AuditEntry(BaseModel):
    timestamp: str
    action: str
    userId: Optional[str] = ""
    userName: Optional[str] = ""
    details: Optional[str] = ""


# Complete Clinical Order
class ClinicalOrder(BaseModel):
    id: Optional[str] = None
    patientInfo: PatientOrderInfo
    providerInfo: ProviderOrderInfo
    orderDetails: OrderDetailsInfo
    clinicalJustification: ClinicalJustificationInfo
    priorityTiming: PriorityTimingInfo
    collectionInstructions: CollectionInstructionsInfo
    safetyChecks: SafetyChecksInfo
    attachments: AttachmentsInfo
    authentication: AuthenticationInfo
    metadata: OrderMetadata
    auditTrail: List[AuditEntry] = []


# Order creation request (subset of fields needed for validation)
class OrderCreateRequest(BaseModel):
    patientInfo: PatientOrderInfo
    providerInfo: ProviderOrderInfo
    orderDetails: OrderDetailsInfo
    clinicalJustification: ClinicalJustificationInfo
    priorityTiming: PriorityTimingInfo
    collectionInstructions: CollectionInstructionsInfo
    safetyChecks: SafetyChecksInfo
    attachments: AttachmentsInfo
    authentication: AuthenticationInfo
    metadata: Optional[OrderMetadata] = None


# Order response with ID
class OrderResponse(BaseModel):
    id: str
    status: str
    message: str
    order: ClinicalOrder


# Order list response
class OrderListResponse(BaseModel):
    orders: List[ClinicalOrder]
    total: int


# =============================================================================
# Patient Dashboard Models
# =============================================================================

# Allergy with severity
class AllergyInfo(BaseModel):
    allergen: str
    severity: str = "moderate"  # mild, moderate, severe
    reaction: Optional[str] = ""
    onsetDate: Optional[str] = ""


# Chronic condition
class ChronicCondition(BaseModel):
    condition: str
    icd10Code: Optional[str] = ""
    diagnosedDate: Optional[str] = ""
    status: str = "active"  # active, resolved, managed
    notes: Optional[str] = ""


# Surgical history entry
class SurgicalHistory(BaseModel):
    procedure: str
    date: Optional[str] = ""
    hospital: Optional[str] = ""
    surgeon: Optional[str] = ""
    notes: Optional[str] = ""


# Family history entry
class FamilyHistory(BaseModel):
    relation: str  # mother, father, sibling, etc.
    condition: str
    ageOfOnset: Optional[str] = ""
    notes: Optional[str] = ""


# Social history
class SocialHistory(BaseModel):
    smokingStatus: str = "never"  # never, former, current
    alcoholUse: str = "none"  # none, occasional, moderate, heavy
    drugUse: Optional[str] = "none"
    occupation: Optional[str] = ""
    exercise: Optional[str] = ""
    diet: Optional[str] = ""
    livingSituation: Optional[str] = ""


# Complete medical history
class MedicalHistory(BaseModel):
    chronicConditions: List[ChronicCondition] = []
    pastDiagnoses: List[Dict[str, str]] = []  # [{code, description, date}]
    surgicalHistory: List[SurgicalHistory] = []
    familyHistory: List[FamilyHistory] = []
    socialHistory: Optional[SocialHistory] = SocialHistory()
    allergies: List[AllergyInfo] = []
    medications: List[Dict[str, str]] = []  # [{name, dose, frequency, startDate}]
    immunizations: List[Dict[str, str]] = []  # [{vaccine, date, provider}]


# Encounter record (from ClinicalForm AI analysis)
class Encounter(BaseModel):
    id: Optional[str] = None
    date: str
    chiefComplaint: str
    hpi: Optional[Dict[str, Any]] = {}
    physicalExam: Optional[Dict[str, Any]] = {}
    vitals: Optional[Dict[str, Any]] = {}
    doctorNotes: Optional[str] = ""
    clinicalNote: Optional[Dict[str, str]] = {}  # SOAP note from AI
    icdCodes: List[Dict[str, str]] = []
    differentialDiagnoses: List[Dict[str, Any]] = []
    recommendedActions: Optional[Dict[str, List]] = {}
    status: str = "completed"  # draft, completed, amended
    provider: Optional[str] = ""
    createdAt: Optional[str] = ""
    updatedAt: Optional[str] = ""


# Follow-up record
class FollowUp(BaseModel):
    id: Optional[str] = None
    reason: str
    scheduledDate: str
    scheduledTime: Optional[str] = ""
    duration: int = 30
    status: str = "scheduled"  # scheduled, completed, cancelled, no-show
    priority: str = "routine"  # urgent, routine, optional
    notes: Optional[str] = ""
    encounterId: Optional[str] = ""  # Link to originating encounter
    completedDate: Optional[str] = ""
    completedNotes: Optional[str] = ""


# Patient alert
class PatientAlert(BaseModel):
    id: Optional[str] = None
    type: str  # critical, warning, info
    message: str
    createdAt: str
    resolvedAt: Optional[str] = ""
    isActive: bool = True


# Complete Patient Profile
class Patient(BaseModel):
    id: str
    # Demographics
    name: str
    firstName: Optional[str] = ""
    lastName: Optional[str] = ""
    dateOfBirth: str
    age: Optional[int] = 0
    gender: str
    mrn: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    emergencyContact: Optional[Dict[str, str]] = {}
    insuranceInfo: Optional[Dict[str, str]] = {}

    # Medical data
    medicalHistory: Optional[MedicalHistory] = MedicalHistory()
    encounters: List[Encounter] = []
    orders: List[str] = []  # Order IDs - full orders fetched separately
    followUps: List[FollowUp] = []
    alerts: List[PatientAlert] = []

    # Metadata
    primaryProvider: Optional[str] = ""
    lastVisitDate: Optional[str] = ""
    nextAppointmentDate: Optional[str] = ""
    status: str = "active"  # active, inactive, deceased
    createdAt: Optional[str] = ""
    updatedAt: Optional[str] = ""


# Patient list item (summary for dashboard)
class PatientSummary(BaseModel):
    id: str
    name: str
    mrn: str
    age: int
    gender: str
    lastVisitDate: Optional[str] = ""
    nextAppointmentDate: Optional[str] = ""
    pendingOrdersCount: int = 0
    activeAlertsCount: int = 0
    alertLevel: str = "stable"  # stable, warning, critical
    primaryProvider: Optional[str] = ""


# Patient list response
class PatientListResponse(BaseModel):
    patients: List[PatientSummary]
    total: int


# Patient profile response
class PatientProfileResponse(BaseModel):
    patient: Patient
    recentOrders: List[ClinicalOrder] = []


# Encounter list response
class EncounterListResponse(BaseModel):
    encounters: List[Encounter]
    total: int
    page: int
    pageSize: int


# Update medical history request
class UpdateMedicalHistoryRequest(BaseModel):
    medicalHistory: MedicalHistory


# Create encounter request
class CreateEncounterRequest(BaseModel):
    chiefComplaint: str
    hpi: Optional[Dict[str, Any]] = {}
    physicalExam: Optional[Dict[str, Any]] = {}
    vitals: Optional[Dict[str, Any]] = {}
    doctorNotes: Optional[str] = ""
    clinicalNote: Optional[Dict[str, str]] = {}
    icdCodes: List[Dict[str, str]] = []
    differentialDiagnoses: List[Dict[str, Any]] = []
    recommendedActions: Optional[Dict[str, List]] = {}
    provider: Optional[str] = ""
