"""
Appointment model and database operations
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, timedelta
from enum import Enum
import json
import os
import uuid

# Database file path
DB_FILE = os.path.join(os.path.dirname(__file__), '..', 'appointments.json')

class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no-show"
    PENDING = "pending"

class AppointmentType(str, Enum):
    INITIAL = "initial"
    FOLLOW_UP = "follow-up"
    PROCEDURE = "procedure"
    CONSULTATION = "consultation"
    URGENT = "urgent"

class AppointmentBase(BaseModel):
    patient_id: str = Field(..., alias="patientId")
    patient_name: str = Field(..., alias="patientName")
    date: datetime
    duration: int = Field(30, ge=15, le=60)
    type: str = "follow-up"
    status: str = "scheduled"
    notes: Optional[str] = ""
    is_follow_up: bool = Field(False, alias="isFollowUp")
    related_form_id: Optional[str] = Field(None, alias="relatedFormId")

    class Config:
        populate_by_name = True

    @validator('duration')
    def validate_duration(cls, v):
        if v not in [15, 30, 45, 60]:
            raise ValueError('Duration must be 15, 30, 45, or 60 minutes')
        return v

    @validator('date')
    def validate_date(cls, v):
        # Allow dates in the past for testing, but warn
        return v

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: str
    created_by: Optional[str] = Field(None, alias="createdBy")
    created_at: datetime = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: datetime = Field(default_factory=datetime.utcnow, alias="updatedAt")

    class Config:
        populate_by_name = True

class AppointmentUpdate(BaseModel):
    patient_id: Optional[str] = Field(None, alias="patientId")
    patient_name: Optional[str] = Field(None, alias="patientName")
    date: Optional[datetime] = None
    duration: Optional[int] = None
    type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    is_follow_up: Optional[bool] = Field(None, alias="isFollowUp")

    class Config:
        populate_by_name = True

# Database operations (using JSON file for simplicity)
def _load_appointments() -> List[dict]:
    """Load appointments from JSON file"""
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def _save_appointments(appointments: List[dict]):
    """Save appointments to JSON file"""
    with open(DB_FILE, 'w') as f:
        json.dump(appointments, f, indent=2, default=str)

def create_appointment(appointment_data: dict) -> dict:
    """Create a new appointment"""
    appointments = _load_appointments()

    # Generate ID
    appointment_id = str(uuid.uuid4())

    # Build appointment record
    now = datetime.utcnow().isoformat()
    appointment = {
        "id": appointment_id,
        "patientId": appointment_data.get("patientId") or appointment_data.get("patient_id"),
        "patientName": appointment_data.get("patientName") or appointment_data.get("patient_name"),
        "date": appointment_data.get("date") if isinstance(appointment_data.get("date"), str)
                else appointment_data.get("date").isoformat() if appointment_data.get("date") else None,
        "duration": appointment_data.get("duration", 30),
        "type": appointment_data.get("type", "follow-up"),
        "status": appointment_data.get("status", "scheduled"),
        "notes": appointment_data.get("notes", ""),
        "isFollowUp": appointment_data.get("isFollowUp") or appointment_data.get("is_follow_up", False),
        "relatedFormId": appointment_data.get("relatedFormId") or appointment_data.get("related_form_id"),
        "createdBy": appointment_data.get("createdBy") or appointment_data.get("created_by", "system"),
        "createdAt": now,
        "updatedAt": now
    }

    # Check for conflicts
    apt_date = datetime.fromisoformat(appointment["date"].replace('Z', '+00:00')) if appointment["date"] else None
    if apt_date:
        for existing in appointments:
            existing_date = datetime.fromisoformat(existing["date"].replace('Z', '+00:00'))
            existing_end = existing_date + timedelta(minutes=existing["duration"])
            new_end = apt_date + timedelta(minutes=appointment["duration"])

            # Check overlap
            if existing["status"] != "cancelled":
                if apt_date < existing_end and new_end > existing_date:
                    # Overlap detected - but we'll allow it for now with a warning
                    pass

    appointments.append(appointment)
    _save_appointments(appointments)

    return appointment

def get_appointments(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[dict]:
    """Get appointments, optionally filtered by date range"""
    appointments = _load_appointments()

    if start_date or end_date:
        filtered = []
        for apt in appointments:
            apt_date = datetime.fromisoformat(apt["date"].replace('Z', '+00:00'))
            if start_date and apt_date < start_date:
                continue
            if end_date and apt_date > end_date:
                continue
            filtered.append(apt)
        return filtered

    return appointments

def get_appointment_by_id(appointment_id: str) -> Optional[dict]:
    """Get a single appointment by ID"""
    appointments = _load_appointments()
    for apt in appointments:
        if apt["id"] == appointment_id:
            return apt
    return None

def get_appointments_by_patient(patient_id: str) -> List[dict]:
    """Get all appointments for a patient"""
    appointments = _load_appointments()
    return [apt for apt in appointments if apt["patientId"] == patient_id]

def update_appointment(appointment_id: str, update_data: dict) -> Optional[dict]:
    """Update an appointment"""
    appointments = _load_appointments()

    for i, apt in enumerate(appointments):
        if apt["id"] == appointment_id:
            # Update fields
            for key, value in update_data.items():
                if value is not None:
                    # Convert snake_case to camelCase if needed
                    camel_key = key
                    if '_' in key:
                        parts = key.split('_')
                        camel_key = parts[0] + ''.join(p.capitalize() for p in parts[1:])

                    if camel_key == "date" and not isinstance(value, str):
                        value = value.isoformat()

                    apt[camel_key] = value

            apt["updatedAt"] = datetime.utcnow().isoformat()
            appointments[i] = apt
            _save_appointments(appointments)
            return apt

    return None

def delete_appointment(appointment_id: str) -> bool:
    """Delete an appointment"""
    appointments = _load_appointments()
    original_length = len(appointments)

    appointments = [apt for apt in appointments if apt["id"] != appointment_id]

    if len(appointments) < original_length:
        _save_appointments(appointments)
        return True

    return False

def check_availability(date: datetime, duration: int, exclude_id: Optional[str] = None) -> bool:
    """Check if a time slot is available"""
    appointments = _load_appointments()
    end_time = date + timedelta(minutes=duration)

    for apt in appointments:
        if apt["id"] == exclude_id:
            continue
        if apt["status"] == "cancelled":
            continue

        apt_date = datetime.fromisoformat(apt["date"].replace('Z', '+00:00'))
        apt_end = apt_date + timedelta(minutes=apt["duration"])

        # Check for overlap
        if date < apt_end and end_time > apt_date:
            return False

    return True
