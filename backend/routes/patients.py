"""
Patient Dashboard API Routes

Provides endpoints for patient management, medical history, encounters, and orders.
"""

import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from models import (
    Patient,
    PatientSummary,
    PatientListResponse,
    PatientProfileResponse,
    Encounter,
    EncounterListResponse,
    UpdateMedicalHistoryRequest,
    CreateEncounterRequest,
    MedicalHistory,
    ClinicalOrder,
    OrderListResponse,
    PatientAlert,
    FollowUp,
)

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/patients", tags=["patients"])

# In-memory storage (replace with database in production)
patients_db = {}

# Import orders_db from orders route to link orders to patients
from routes.orders import orders_db


def init_sample_patients():
    """Initialize sample patient data for demo purposes."""
    sample_patients = [
        {
            "id": "1",
            "name": "Maria Alvarez",
            "firstName": "Maria",
            "lastName": "Alvarez",
            "dateOfBirth": "1982-06-20",
            "age": 42,
            "gender": "Female",
            "mrn": "MRN-2024-001",
            "phone": "(555) 123-4567",
            "email": "maria.a@email.com",
            "address": "123 Oak Street, Medical City, MC 12345",
            "primaryProvider": "Dr. Smith",
            "lastVisitDate": "2024-01-15",
            "nextAppointmentDate": "2024-01-22T09:00:00",
            "status": "active",
            "medicalHistory": {
                "chronicConditions": [
                    {"condition": "Hypertension", "icd10Code": "I10", "diagnosedDate": "2019-03-20", "status": "active"},
                    {"condition": "Mild anemia", "icd10Code": "D64.9", "diagnosedDate": "2021-05-10", "status": "managed"}
                ],
                "allergies": [
                    {"allergen": "Penicillin", "severity": "severe", "reaction": "Anaphylaxis"},
                    {"allergen": "Sulfa drugs", "severity": "moderate", "reaction": "Rash"}
                ],
                "medications": [
                    {"name": "Lisinopril", "dose": "10mg", "frequency": "once daily"},
                    {"name": "Multivitamin", "dose": "1 tablet", "frequency": "once daily"},
                    {"name": "Iron supplement", "dose": "65mg", "frequency": "once daily"}
                ],
                "surgicalHistory": [
                    {"procedure": "Appendectomy", "date": "2010-08-22", "hospital": "General Hospital"}
                ],
                "familyHistory": [
                    {"relation": "Mother", "condition": "Type 2 Diabetes"},
                    {"relation": "Father", "condition": "Hypertension"}
                ],
                "socialHistory": {
                    "smokingStatus": "never",
                    "alcoholUse": "occasional",
                    "occupation": "Teacher",
                    "exercise": "3x weekly"
                }
            },
            "encounters": [],
            "orders": [],
            "followUps": [],
            "alerts": [
                {"id": "alert-1", "type": "warning", "message": "Overdue for HbA1c test", "createdAt": "2024-01-10T08:00:00Z", "isActive": True}
            ]
        },
        {
            "id": "2",
            "name": "James Thompson",
            "firstName": "James",
            "lastName": "Thompson",
            "dateOfBirth": "1957-07-22",
            "age": 67,
            "gender": "Male",
            "mrn": "MRN-2024-002",
            "phone": "(555) 234-5678",
            "email": "m.chen@email.com",
            "primaryProvider": "Dr. Smith",
            "lastVisitDate": "2024-01-18",
            "nextAppointmentDate": "2024-01-25T14:30:00",
            "status": "active",
            "medicalHistory": {
                "chronicConditions": [
                    {"condition": "Coronary Artery Disease", "icd10Code": "I25.10", "diagnosedDate": "2022-01-10", "status": "active"},
                    {"condition": "Hyperlipidemia", "icd10Code": "E78.5", "diagnosedDate": "2018-05-15", "status": "managed"}
                ],
                "allergies": [],
                "medications": [
                    {"name": "Aspirin", "dose": "81mg", "frequency": "once daily"},
                    {"name": "Atorvastatin", "dose": "40mg", "frequency": "once daily"},
                    {"name": "Metoprolol", "dose": "25mg", "frequency": "twice daily"}
                ],
                "surgicalHistory": [
                    {"procedure": "Cardiac Catheterization with Stent", "date": "2022-01-15", "hospital": "Cardiac Center"}
                ],
                "familyHistory": [
                    {"relation": "Father", "condition": "MI at age 55"}
                ],
                "socialHistory": {
                    "smokingStatus": "former",
                    "alcoholUse": "none",
                    "occupation": "Engineer",
                    "exercise": "Walking daily"
                }
            },
            "encounters": [],
            "orders": [],
            "followUps": [],
            "alerts": [
                {"id": "alert-2", "type": "critical", "message": "Chest pain reported - needs urgent follow-up", "createdAt": "2024-01-18T10:00:00Z", "isActive": True}
            ]
        },
        {
            "id": "3",
            "name": "Emily Rodriguez",
            "firstName": "Emily",
            "lastName": "Rodriguez",
            "dateOfBirth": "1990-11-08",
            "age": 33,
            "gender": "Female",
            "mrn": "MRN-2024-003",
            "phone": "(555) 345-6789",
            "primaryProvider": "Dr. Smith",
            "lastVisitDate": "2024-01-12",
            "status": "active",
            "medicalHistory": {
                "chronicConditions": [
                    {"condition": "Asthma", "icd10Code": "J45.20", "diagnosedDate": "2005-09-01", "status": "managed"}
                ],
                "allergies": [
                    {"allergen": "Dust mites", "severity": "moderate", "reaction": "Wheezing"}
                ],
                "medications": [
                    {"name": "Albuterol inhaler", "dose": "90mcg", "frequency": "as needed"}
                ],
                "surgicalHistory": [],
                "familyHistory": [],
                "socialHistory": {
                    "smokingStatus": "never",
                    "alcoholUse": "occasional",
                    "occupation": "Graphic Designer"
                }
            },
            "encounters": [],
            "orders": [],
            "followUps": [],
            "alerts": []
        },
        {
            "id": "4",
            "name": "Robert Williams",
            "firstName": "Robert",
            "lastName": "Williams",
            "dateOfBirth": "1965-04-30",
            "age": 58,
            "gender": "Male",
            "mrn": "MRN-2024-004",
            "phone": "(555) 456-7890",
            "primaryProvider": "Dr. Smith",
            "lastVisitDate": "2024-01-20",
            "nextAppointmentDate": "2024-02-01T10:00:00",
            "status": "active",
            "medicalHistory": {
                "chronicConditions": [
                    {"condition": "COPD", "icd10Code": "J44.1", "diagnosedDate": "2019-11-20", "status": "active"},
                    {"condition": "Type 2 Diabetes", "icd10Code": "E11.9", "diagnosedDate": "2015-03-10", "status": "managed"}
                ],
                "allergies": [
                    {"allergen": "Latex", "severity": "mild", "reaction": "Skin irritation"}
                ],
                "medications": [
                    {"name": "Tiotropium", "dose": "18mcg", "frequency": "once daily"},
                    {"name": "Metformin", "dose": "1000mg", "frequency": "twice daily"}
                ],
                "surgicalHistory": [],
                "familyHistory": [],
                "socialHistory": {
                    "smokingStatus": "former",
                    "alcoholUse": "moderate",
                    "occupation": "Retired"
                }
            },
            "encounters": [],
            "orders": [],
            "followUps": [
                {"id": "fu-1", "reason": "COPD follow-up", "scheduledDate": "2024-02-01", "scheduledTime": "10:00", "status": "scheduled", "priority": "routine"}
            ],
            "alerts": []
        },
        {
            "id": "5",
            "name": "Jennifer Martinez",
            "firstName": "Jennifer",
            "lastName": "Martinez",
            "dateOfBirth": "1978-09-12",
            "age": 45,
            "gender": "Female",
            "mrn": "MRN-2024-005",
            "phone": "(555) 567-8901",
            "primaryProvider": "Dr. Smith",
            "lastVisitDate": "2024-01-08",
            "status": "active",
            "medicalHistory": {
                "chronicConditions": [
                    {"condition": "Hypothyroidism", "icd10Code": "E03.9", "diagnosedDate": "2016-07-22", "status": "managed"},
                    {"condition": "Migraine", "icd10Code": "G43.909", "diagnosedDate": "2010-01-15", "status": "active"}
                ],
                "allergies": [],
                "medications": [
                    {"name": "Levothyroxine", "dose": "75mcg", "frequency": "once daily"},
                    {"name": "Sumatriptan", "dose": "50mg", "frequency": "as needed"}
                ],
                "surgicalHistory": [],
                "familyHistory": [
                    {"relation": "Mother", "condition": "Hypothyroidism"}
                ],
                "socialHistory": {
                    "smokingStatus": "never",
                    "alcoholUse": "occasional",
                    "occupation": "Accountant"
                }
            },
            "encounters": [],
            "orders": [],
            "followUps": [],
            "alerts": []
        }
    ]

    for patient in sample_patients:
        patients_db[patient["id"]] = patient

    logger.info(f"Initialized {len(sample_patients)} sample patients")


# Initialize sample data
init_sample_patients()


@router.get("", response_model=PatientListResponse)
async def get_patients(
    search: Optional[str] = Query(None, description="Search by name or MRN"),
    status: Optional[str] = Query(None, description="Filter by status"),
    alert_level: Optional[str] = Query(None, description="Filter by alert level"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Get list of all patients for the doctor's dashboard.
    """
    logger.info(f"Fetching patients list, search={search}")

    patients = list(patients_db.values())

    # Apply search filter
    if search:
        search_lower = search.lower()
        patients = [
            p for p in patients
            if search_lower in p.get('name', '').lower() or
               search_lower in p.get('mrn', '').lower()
        ]

    # Apply status filter
    if status:
        patients = [p for p in patients if p.get('status') == status]

    # Calculate summary fields and convert to PatientSummary
    summaries = []
    for p in patients:
        # Count pending orders for this patient
        pending_orders = sum(
            1 for order in orders_db
            if order.get('patientInfo', {}).get('mrn') == p.get('mrn') and
               order.get('metadata', {}).get('status') == 'pending'
        )

        # Count active alerts
        active_alerts = sum(1 for alert in p.get('alerts', []) if alert.get('isActive'))

        # Determine alert level
        alert_level_value = "stable"
        for alert in p.get('alerts', []):
            if alert.get('isActive'):
                if alert.get('type') == 'critical':
                    alert_level_value = "critical"
                    break
                elif alert.get('type') == 'warning':
                    alert_level_value = "warning"

        summaries.append(PatientSummary(
            id=p.get('id'),
            name=p.get('name'),
            mrn=p.get('mrn'),
            age=p.get('age', 0),
            gender=p.get('gender', ''),
            lastVisitDate=p.get('lastVisitDate', ''),
            nextAppointmentDate=p.get('nextAppointmentDate', ''),
            pendingOrdersCount=pending_orders,
            activeAlertsCount=active_alerts,
            alertLevel=alert_level_value,
            primaryProvider=p.get('primaryProvider', '')
        ))

    # Apply alert level filter
    if alert_level:
        summaries = [s for s in summaries if s.alertLevel == alert_level]

    # Sort by alert level (critical first), then by name
    alert_priority = {'critical': 0, 'warning': 1, 'stable': 2}
    summaries.sort(key=lambda x: (alert_priority.get(x.alertLevel, 2), x.name))

    total = len(summaries)
    summaries = summaries[offset:offset + limit]

    return PatientListResponse(patients=summaries, total=total)


@router.get("/{patient_id}/profile", response_model=PatientProfileResponse)
async def get_patient_profile(patient_id: str):
    """
    Get complete patient profile with all historical data.
    """
    logger.info(f"Fetching profile for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    patient_data = patients_db[patient_id]

    # Get recent orders for this patient
    patient_orders = [
        ClinicalOrder(**order) for order in orders_db
        if order.get('patientInfo', {}).get('mrn') == patient_data.get('mrn')
    ]
    # Sort by date, newest first
    patient_orders.sort(
        key=lambda x: x.metadata.createdAt if x.metadata else '',
        reverse=True
    )

    return PatientProfileResponse(
        patient=Patient(**patient_data),
        recentOrders=patient_orders[:10]
    )


@router.post("/{patient_id}/medical-history")
async def update_medical_history(patient_id: str, request: UpdateMedicalHistoryRequest):
    """
    Update patient's medical history.
    """
    logger.info(f"Updating medical history for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    patients_db[patient_id]['medicalHistory'] = request.medicalHistory.model_dump()
    patients_db[patient_id]['updatedAt'] = datetime.utcnow().isoformat() + "Z"

    return {
        "status": "success",
        "message": "Medical history updated successfully",
        "patientId": patient_id
    }


@router.get("/{patient_id}/encounters", response_model=EncounterListResponse)
async def get_patient_encounters(
    patient_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """
    Get all encounters for a patient with pagination.
    """
    logger.info(f"Fetching encounters for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    encounters = patients_db[patient_id].get('encounters', [])

    # Sort by date, newest first
    encounters.sort(key=lambda x: x.get('date', ''), reverse=True)

    total = len(encounters)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = encounters[start:end]

    return EncounterListResponse(
        encounters=[Encounter(**e) for e in paginated],
        total=total,
        page=page,
        pageSize=page_size
    )


@router.post("/{patient_id}/encounters")
async def create_encounter(patient_id: str, request: CreateEncounterRequest):
    """
    Save new encounter from ClinicalForm AI analysis.
    """
    logger.info(f"Creating encounter for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    encounter_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    encounter = {
        "id": encounter_id,
        "date": now.split('T')[0],
        "chiefComplaint": request.chiefComplaint,
        "hpi": request.hpi,
        "physicalExam": request.physicalExam,
        "vitals": request.vitals,
        "doctorNotes": request.doctorNotes,
        "clinicalNote": request.clinicalNote,
        "icdCodes": request.icdCodes,
        "differentialDiagnoses": request.differentialDiagnoses,
        "recommendedActions": request.recommendedActions,
        "status": "completed",
        "provider": request.provider or "Dr. Smith",
        "createdAt": now,
        "updatedAt": now
    }

    if 'encounters' not in patients_db[patient_id]:
        patients_db[patient_id]['encounters'] = []

    patients_db[patient_id]['encounters'].append(encounter)
    patients_db[patient_id]['lastVisitDate'] = now.split('T')[0]
    patients_db[patient_id]['updatedAt'] = now

    logger.info(f"Encounter created: {encounter_id}")

    return {
        "status": "success",
        "message": "Encounter saved successfully",
        "encounterId": encounter_id
    }


@router.get("/{patient_id}/orders", response_model=OrderListResponse)
async def get_patient_orders(
    patient_id: str,
    status: Optional[str] = Query(None, description="Filter by status"),
    order_type: Optional[str] = Query(None, description="Filter by type")
):
    """
    Get all orders for a specific patient.
    """
    logger.info(f"Fetching orders for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    patient_mrn = patients_db[patient_id].get('mrn')

    # Filter orders by patient MRN
    patient_orders = [
        order for order in orders_db
        if order.get('patientInfo', {}).get('mrn') == patient_mrn
    ]

    # Apply status filter
    if status:
        patient_orders = [
            o for o in patient_orders
            if o.get('metadata', {}).get('status') == status
        ]

    # Apply type filter
    if order_type:
        patient_orders = [
            o for o in patient_orders
            if o.get('orderDetails', {}).get('orderType') == order_type
        ]

    # Sort by date
    patient_orders.sort(
        key=lambda x: x.get('metadata', {}).get('createdAt', ''),
        reverse=True
    )

    return OrderListResponse(
        orders=[ClinicalOrder(**o) for o in patient_orders],
        total=len(patient_orders)
    )


@router.post("/{patient_id}/follow-ups")
async def add_follow_up(patient_id: str, follow_up: FollowUp):
    """
    Add a follow-up appointment for a patient.
    """
    logger.info(f"Adding follow-up for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    follow_up_id = follow_up.id or str(uuid.uuid4())
    follow_up_data = follow_up.model_dump()
    follow_up_data['id'] = follow_up_id

    if 'followUps' not in patients_db[patient_id]:
        patients_db[patient_id]['followUps'] = []

    patients_db[patient_id]['followUps'].append(follow_up_data)

    return {
        "status": "success",
        "message": "Follow-up added successfully",
        "followUpId": follow_up_id
    }


@router.patch("/{patient_id}/follow-ups/{follow_up_id}")
async def update_follow_up(
    patient_id: str,
    follow_up_id: str,
    status: str = Query(..., description="New status"),
    notes: str = Query("", description="Notes")
):
    """
    Update follow-up status (complete, cancel, reschedule).
    """
    logger.info(f"Updating follow-up {follow_up_id} for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    follow_ups = patients_db[patient_id].get('followUps', [])
    for fu in follow_ups:
        if fu.get('id') == follow_up_id:
            fu['status'] = status
            if status == 'completed':
                fu['completedDate'] = datetime.utcnow().isoformat() + "Z"
                fu['completedNotes'] = notes

            return {
                "status": "success",
                "message": f"Follow-up marked as {status}"
            }

    raise HTTPException(status_code=404, detail=f"Follow-up not found: {follow_up_id}")


@router.post("/{patient_id}/alerts")
async def add_alert(patient_id: str, alert: PatientAlert):
    """
    Add an alert for a patient.
    """
    logger.info(f"Adding alert for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    alert_id = alert.id or str(uuid.uuid4())
    alert_data = alert.model_dump()
    alert_data['id'] = alert_id

    if 'alerts' not in patients_db[patient_id]:
        patients_db[patient_id]['alerts'] = []

    patients_db[patient_id]['alerts'].append(alert_data)

    return {
        "status": "success",
        "message": "Alert added successfully",
        "alertId": alert_id
    }


@router.patch("/{patient_id}/alerts/{alert_id}/resolve")
async def resolve_alert(patient_id: str, alert_id: str):
    """
    Resolve/dismiss a patient alert.
    """
    logger.info(f"Resolving alert {alert_id} for patient: {patient_id}")

    if patient_id not in patients_db:
        raise HTTPException(status_code=404, detail=f"Patient not found: {patient_id}")

    alerts = patients_db[patient_id].get('alerts', [])
    for alert in alerts:
        if alert.get('id') == alert_id:
            alert['isActive'] = False
            alert['resolvedAt'] = datetime.utcnow().isoformat() + "Z"
            return {
                "status": "success",
                "message": "Alert resolved"
            }

    raise HTTPException(status_code=404, detail=f"Alert not found: {alert_id}")
