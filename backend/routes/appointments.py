"""
Appointment routes for FastAPI
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Union
from datetime import datetime, timedelta
from pydantic import BaseModel, validator
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import from db_models to avoid conflict with models.py
from db_models.appointment import (
    create_appointment,
    get_appointments,
    get_appointment_by_id,
    update_appointment,
    delete_appointment,
    check_availability
)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

class AppointmentCreateRequest(BaseModel):
    patientId: Optional[Union[str, int]] = ""
    patientName: Optional[str] = ""
    date: str
    duration: Optional[int] = 30
    type: Optional[str] = "follow-up"
    status: Optional[str] = "scheduled"
    notes: Optional[str] = ""
    isFollowUp: Optional[bool] = False
    relatedFormId: Optional[str] = None

    @validator('patientId', pre=True, always=True)
    def convert_patient_id(cls, v):
        if v is None:
            return ""
        return str(v)

    @validator('duration', pre=True)
    def convert_duration(cls, v):
        if v is None:
            return 30
        return int(v)

    class Config:
        extra = 'ignore'  # Ignore extra fields

class AppointmentUpdateRequest(BaseModel):
    patientId: Optional[str] = None
    patientName: Optional[str] = None
    date: Optional[str] = None
    duration: Optional[int] = None
    type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    isFollowUp: Optional[bool] = None

@router.get("")
async def list_appointments(
    startDate: Optional[str] = Query(None, description="Start date filter (ISO format)"),
    endDate: Optional[str] = Query(None, description="End date filter (ISO format)")
):
    """Get all appointments, optionally filtered by date range"""
    try:
        start = datetime.fromisoformat(startDate.replace('Z', '+00:00')) if startDate else None
        end = datetime.fromisoformat(endDate.replace('Z', '+00:00')) if endDate else None

        appointments = get_appointments(start, end)
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_new_appointment(request: AppointmentCreateRequest):
    """Create a new appointment"""
    try:
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Creating appointment: {request.dict()}")

        # Parse and validate date
        apt_date = datetime.fromisoformat(request.date.replace('Z', '+00:00'))

        # Check business hours (8 AM - 6 PM)
        hour = apt_date.hour
        if hour < 8 or hour >= 18:
            raise HTTPException(
                status_code=400,
                detail="Appointments must be scheduled between 8 AM and 6 PM"
            )

        # Validate duration
        if request.duration not in [15, 30, 45, 60]:
            raise HTTPException(
                status_code=400,
                detail="Duration must be 15, 30, 45, or 60 minutes"
            )

        # Check availability
        if not check_availability(apt_date, request.duration):
            raise HTTPException(
                status_code=409,
                detail="This time slot is not available. Please choose another time."
            )

        # Create appointment
        appointment = create_appointment(request.dict())
        return appointment

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{appointment_id}")
async def get_single_appointment(appointment_id: str):
    """Get a single appointment by ID"""
    appointment = get_appointment_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@router.put("/{appointment_id}")
async def update_existing_appointment(appointment_id: str, request: AppointmentUpdateRequest):
    """Update an appointment"""
    try:
        # Check if appointment exists
        existing = get_appointment_by_id(appointment_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Appointment not found")

        # If updating date, check availability
        if request.date:
            apt_date = datetime.fromisoformat(request.date.replace('Z', '+00:00'))
            duration = request.duration or existing["duration"]

            if not check_availability(apt_date, duration, exclude_id=appointment_id):
                raise HTTPException(
                    status_code=409,
                    detail="This time slot is not available"
                )

        # Update
        update_data = {k: v for k, v in request.dict().items() if v is not None}
        updated = update_appointment(appointment_id, update_data)

        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update appointment")

        return updated

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{appointment_id}")
async def delete_existing_appointment(appointment_id: str):
    """Delete (cancel) an appointment"""
    try:
        existing = get_appointment_by_id(appointment_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Appointment not found")

        success = delete_appointment(appointment_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete appointment")

        return {"message": "Appointment deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patient/{patient_id}")
async def get_patient_appointments(patient_id: str):
    """Get all appointments for a specific patient"""
    from models.appointment import get_appointments_by_patient
    appointments = get_appointments_by_patient(patient_id)
    return appointments

@router.post("/check-availability")
async def check_slot_availability(
    date: str = Query(..., description="Date/time to check (ISO format)"),
    duration: int = Query(30, description="Duration in minutes")
):
    """Check if a time slot is available"""
    try:
        apt_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
        available = check_availability(apt_date, duration)
        return {"available": available, "date": date, "duration": duration}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Follow-up recommendation generation (integrated with AI analysis)
class FollowUpRecommendation(BaseModel):
    id: str
    reason: str
    priority: str  # urgent, routine, optional
    timeframe: str
    suggestedDates: List[str]
    duration: int
    notes: str

def generate_follow_up_recommendations(form_data: dict, analysis: dict) -> List[dict]:
    """
    Generate follow-up recommendations based on clinical form data and AI analysis.
    This would typically call an AI/LLM service.
    """
    from datetime import datetime, timedelta
    import uuid

    recommendations = []
    base_date = datetime.now()

    # Determine urgency based on severity
    severity = form_data.get("severity", 5)
    chief_complaint = form_data.get("chiefComplaint", "").lower()
    urgency_level = analysis.get("urgencyLevel", "routine")

    # High severity or urgent conditions
    if severity >= 8 or urgency_level == "urgent" or any(kw in chief_complaint for kw in ["chest pain", "difficulty breathing", "severe"]):
        # Urgent follow-up in 1-3 days
        dates = [
            (base_date + timedelta(days=1)).replace(hour=9, minute=0).isoformat(),
            (base_date + timedelta(days=2)).replace(hour=10, minute=0).isoformat(),
            (base_date + timedelta(days=3)).replace(hour=14, minute=0).isoformat()
        ]
        recommendations.append({
            "id": str(uuid.uuid4()),
            "reason": f"Urgent follow-up for {chief_complaint or 'acute symptoms'}",
            "priority": "urgent",
            "timeframe": "1-3 days",
            "suggestedDates": dates,
            "duration": 30,
            "notes": "Close monitoring recommended due to symptom severity"
        })

    # Moderate severity
    elif severity >= 4:
        # Routine follow-up in 1-2 weeks
        dates = [
            (base_date + timedelta(weeks=1)).replace(hour=10, minute=0).isoformat(),
            (base_date + timedelta(days=10)).replace(hour=14, minute=0).isoformat(),
            (base_date + timedelta(weeks=2)).replace(hour=11, minute=0).isoformat()
        ]
        recommendations.append({
            "id": str(uuid.uuid4()),
            "reason": f"Follow-up to assess treatment response",
            "priority": "routine",
            "timeframe": "1-2 weeks",
            "suggestedDates": dates,
            "duration": 30,
            "notes": "Evaluate symptom progression and treatment efficacy"
        })

    # Low severity or preventive
    else:
        # Optional follow-up in 4-6 weeks
        dates = [
            (base_date + timedelta(weeks=4)).replace(hour=9, minute=0).isoformat(),
            (base_date + timedelta(weeks=5)).replace(hour=11, minute=0).isoformat(),
            (base_date + timedelta(weeks=6)).replace(hour=14, minute=0).isoformat()
        ]
        recommendations.append({
            "id": str(uuid.uuid4()),
            "reason": "Routine wellness check",
            "priority": "optional",
            "timeframe": "4-6 weeks",
            "suggestedDates": dates,
            "duration": 15,
            "notes": "Standard follow-up for ongoing monitoring"
        })

    # Add lab results follow-up if tests recommended
    if analysis.get("recommendedTests") and len(analysis.get("recommendedTests", [])) > 0:
        dates = [
            (base_date + timedelta(days=5)).replace(hour=10, minute=0).isoformat(),
            (base_date + timedelta(days=7)).replace(hour=14, minute=0).isoformat(),
            (base_date + timedelta(days=10)).replace(hour=9, minute=0).isoformat()
        ]
        recommendations.append({
            "id": str(uuid.uuid4()),
            "reason": "Lab results review",
            "priority": "routine",
            "timeframe": "5-10 days",
            "suggestedDates": dates,
            "duration": 15,
            "notes": f"Review results of: {', '.join(analysis.get('recommendedTests', []))}"
        })

    return recommendations
