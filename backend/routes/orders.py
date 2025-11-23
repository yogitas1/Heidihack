"""
Clinical Orders API Routes

Provides endpoints for creating, retrieving, and managing clinical orders.
Includes complete validation, audit trail, and HIPAA-compliant data handling.
"""

import logging
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from models import (
    OrderCreateRequest,
    OrderResponse,
    OrderListResponse,
    ClinicalOrder,
    OrderMetadata,
    AuditEntry,
)

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/orders", tags=["orders"])

# In-memory storage for orders (replace with database in production)
orders_db: List[dict] = []


def validate_order(order_request: OrderCreateRequest) -> List[str]:
    """
    Validate order data and return list of validation errors.

    Checks:
    - Required fields are present
    - Safety checks are confirmed
    - Authentication is provided
    - Clinical justification has ICD-10 codes
    """
    errors = []

    # Patient info validation
    if not order_request.patientInfo.patientName:
        errors.append("Patient name is required")
    if not order_request.patientInfo.mrn:
        errors.append("Patient MRN is required")

    # Provider info validation
    if not order_request.providerInfo.orderingProvider:
        errors.append("Ordering provider name is required")

    # Order details validation
    if not order_request.orderDetails.orderName:
        errors.append("Order name is required")
    if not order_request.orderDetails.orderType:
        errors.append("Order type is required")
    if order_request.orderDetails.orderType not in ['lab', 'imaging', 'referral', 'medication', 'procedure']:
        errors.append(f"Invalid order type: {order_request.orderDetails.orderType}")

    # Clinical justification validation
    if not order_request.clinicalJustification.indication:
        errors.append("Clinical indication is required")
    if not order_request.clinicalJustification.icd10Codes:
        errors.append("At least one ICD-10 code is required")

    # Priority validation
    if order_request.priorityTiming.priority not in ['stat', 'urgent', 'routine', 'scheduled']:
        errors.append(f"Invalid priority: {order_request.priorityTiming.priority}")

    # Safety checks validation
    if not order_request.safetyChecks.safetyConfirmed:
        errors.append("Safety check confirmation is required")

    # Authentication validation
    if not order_request.authentication.authenticationId:
        errors.append("Authentication ID is required")
    if not order_request.authentication.attestation:
        errors.append("Provider attestation is required")

    return errors


def create_audit_entry(action: str, user_id: str = "", user_name: str = "", details: str = "") -> AuditEntry:
    """Create an audit trail entry with timestamp."""
    return AuditEntry(
        timestamp=datetime.utcnow().isoformat() + "Z",
        action=action,
        userId=user_id,
        userName=user_name,
        details=details
    )


@router.post("", response_model=OrderResponse)
async def create_order(order_request: OrderCreateRequest):
    """
    Create a new clinical order.

    Validates all required fields, creates audit trail, and stores the order.
    Returns the created order with assigned ID.
    """
    logger.info(f"Creating new order for patient: {order_request.patientInfo.patientName}")

    # Validate order
    validation_errors = validate_order(order_request)
    if validation_errors:
        logger.warning(f"Order validation failed: {validation_errors}")
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Order validation failed",
                "errors": validation_errors
            }
        )

    # Generate order ID
    order_id = str(uuid.uuid4())

    # Create metadata if not provided
    now = datetime.utcnow().isoformat() + "Z"
    metadata = order_request.metadata or OrderMetadata(
        createdAt=now,
        status="pending",
        version=1
    )

    # Ensure createdAt is set
    if not metadata.createdAt:
        metadata.createdAt = now

    # Create initial audit trail
    audit_trail = [
        create_audit_entry(
            action="ORDER_CREATED",
            user_id=order_request.providerInfo.providerId,
            user_name=order_request.providerInfo.orderingProvider,
            details=f"Order created: {order_request.orderDetails.orderName}"
        )
    ]

    # Add safety review audit entry
    if order_request.safetyChecks.allergies:
        audit_trail.append(
            create_audit_entry(
                action="SAFETY_REVIEW",
                user_id=order_request.providerInfo.providerId,
                user_name=order_request.providerInfo.orderingProvider,
                details=f"Allergies reviewed: {', '.join(order_request.safetyChecks.allergies)}"
            )
        )

    # Create clinical order
    clinical_order = ClinicalOrder(
        id=order_id,
        patientInfo=order_request.patientInfo,
        providerInfo=order_request.providerInfo,
        orderDetails=order_request.orderDetails,
        clinicalJustification=order_request.clinicalJustification,
        priorityTiming=order_request.priorityTiming,
        collectionInstructions=order_request.collectionInstructions,
        safetyChecks=order_request.safetyChecks,
        attachments=order_request.attachments,
        authentication=order_request.authentication,
        metadata=metadata,
        auditTrail=audit_trail
    )

    # Store order
    orders_db.append(clinical_order.model_dump())

    logger.info(f"Order created successfully: {order_id}")

    return OrderResponse(
        id=order_id,
        status="success",
        message=f"Order created successfully. Priority: {order_request.priorityTiming.priority.upper()}",
        order=clinical_order
    )


@router.get("/{patient_id}", response_model=OrderListResponse)
async def get_patient_orders(
    patient_id: str,
    status: Optional[str] = Query(None, description="Filter by order status"),
    order_type: Optional[str] = Query(None, description="Filter by order type"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of orders to return"),
    offset: int = Query(0, ge=0, description="Number of orders to skip")
):
    """
    Retrieve all orders for a specific patient.

    Supports filtering by status and order type, with pagination.
    """
    logger.info(f"Retrieving orders for patient: {patient_id}")

    # Filter orders by patient
    patient_orders = [
        order for order in orders_db
        if order.get('patientInfo', {}).get('patientId') == patient_id or
           order.get('patientInfo', {}).get('mrn') == patient_id
    ]

    # Apply status filter
    if status:
        patient_orders = [
            order for order in patient_orders
            if order.get('metadata', {}).get('status') == status
        ]

    # Apply order type filter
    if order_type:
        patient_orders = [
            order for order in patient_orders
            if order.get('orderDetails', {}).get('orderType') == order_type
        ]

    # Sort by creation date (newest first)
    patient_orders.sort(
        key=lambda x: x.get('metadata', {}).get('createdAt', ''),
        reverse=True
    )

    # Apply pagination
    total = len(patient_orders)
    paginated_orders = patient_orders[offset:offset + limit]

    # Convert to ClinicalOrder objects
    orders = [ClinicalOrder(**order) for order in paginated_orders]

    logger.info(f"Found {total} orders for patient {patient_id}")

    return OrderListResponse(
        orders=orders,
        total=total
    )


@router.get("", response_model=OrderListResponse)
async def get_all_orders(
    status: Optional[str] = Query(None, description="Filter by order status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    order_type: Optional[str] = Query(None, description="Filter by order type"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of orders to return"),
    offset: int = Query(0, ge=0, description="Number of orders to skip")
):
    """
    Retrieve all orders with optional filters.

    Supports filtering by status, priority, and order type.
    """
    logger.info("Retrieving all orders")

    filtered_orders = orders_db.copy()

    # Apply filters
    if status:
        filtered_orders = [
            order for order in filtered_orders
            if order.get('metadata', {}).get('status') == status
        ]

    if priority:
        filtered_orders = [
            order for order in filtered_orders
            if order.get('priorityTiming', {}).get('priority') == priority
        ]

    if order_type:
        filtered_orders = [
            order for order in filtered_orders
            if order.get('orderDetails', {}).get('orderType') == order_type
        ]

    # Sort by creation date (newest first)
    filtered_orders.sort(
        key=lambda x: x.get('metadata', {}).get('createdAt', ''),
        reverse=True
    )

    # Apply pagination
    total = len(filtered_orders)
    paginated_orders = filtered_orders[offset:offset + limit]

    # Convert to ClinicalOrder objects
    orders = [ClinicalOrder(**order) for order in paginated_orders]

    logger.info(f"Retrieved {len(orders)} orders")

    return OrderListResponse(
        orders=orders,
        total=total
    )


@router.get("/detail/{order_id}")
async def get_order_by_id(order_id: str):
    """
    Retrieve a specific order by ID.
    """
    logger.info(f"Retrieving order: {order_id}")

    for order in orders_db:
        if order.get('id') == order_id:
            return ClinicalOrder(**order)

    raise HTTPException(
        status_code=404,
        detail=f"Order not found: {order_id}"
    )


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    new_status: str = Query(..., description="New status for the order"),
    user_id: str = Query("", description="User making the update"),
    user_name: str = Query("", description="Name of user making the update"),
    notes: str = Query("", description="Notes about the status change")
):
    """
    Update the status of an order.

    Creates audit trail entry for the status change.
    Valid statuses: pending, approved, in_progress, completed, cancelled
    """
    logger.info(f"Updating order {order_id} status to {new_status}")

    valid_statuses = ['pending', 'approved', 'in_progress', 'completed', 'cancelled']
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status: {new_status}. Valid statuses: {', '.join(valid_statuses)}"
        )

    for order in orders_db:
        if order.get('id') == order_id:
            old_status = order.get('metadata', {}).get('status', 'unknown')

            # Update status
            if 'metadata' not in order:
                order['metadata'] = {}
            order['metadata']['status'] = new_status
            order['metadata']['updatedAt'] = datetime.utcnow().isoformat() + "Z"

            # Add audit entry
            audit_entry = create_audit_entry(
                action="STATUS_CHANGED",
                user_id=user_id,
                user_name=user_name,
                details=f"Status changed from {old_status} to {new_status}. {notes}"
            )

            if 'auditTrail' not in order:
                order['auditTrail'] = []
            order['auditTrail'].append(audit_entry.model_dump())

            logger.info(f"Order {order_id} status updated to {new_status}")

            return {
                "id": order_id,
                "status": new_status,
                "message": f"Order status updated to {new_status}",
                "previousStatus": old_status
            }

    raise HTTPException(
        status_code=404,
        detail=f"Order not found: {order_id}"
    )


@router.delete("/{order_id}")
async def cancel_order(
    order_id: str,
    user_id: str = Query("", description="User cancelling the order"),
    user_name: str = Query("", description="Name of user cancelling the order"),
    reason: str = Query("", description="Reason for cancellation")
):
    """
    Cancel an order (soft delete).

    Sets status to 'cancelled' and adds cancellation to audit trail.
    """
    logger.info(f"Cancelling order: {order_id}")

    for order in orders_db:
        if order.get('id') == order_id:
            current_status = order.get('metadata', {}).get('status', 'unknown')

            if current_status == 'completed':
                raise HTTPException(
                    status_code=400,
                    detail="Cannot cancel a completed order"
                )

            if current_status == 'cancelled':
                raise HTTPException(
                    status_code=400,
                    detail="Order is already cancelled"
                )

            # Update status
            if 'metadata' not in order:
                order['metadata'] = {}
            order['metadata']['status'] = 'cancelled'
            order['metadata']['updatedAt'] = datetime.utcnow().isoformat() + "Z"

            # Add audit entry
            audit_entry = create_audit_entry(
                action="ORDER_CANCELLED",
                user_id=user_id,
                user_name=user_name,
                details=f"Order cancelled. Reason: {reason or 'Not specified'}"
            )

            if 'auditTrail' not in order:
                order['auditTrail'] = []
            order['auditTrail'].append(audit_entry.model_dump())

            logger.info(f"Order {order_id} cancelled")

            return {
                "id": order_id,
                "status": "cancelled",
                "message": "Order cancelled successfully"
            }

    raise HTTPException(
        status_code=404,
        detail=f"Order not found: {order_id}"
    )


@router.get("/{order_id}/audit")
async def get_order_audit_trail(order_id: str):
    """
    Retrieve the complete audit trail for an order.

    Returns all actions taken on the order with timestamps and user information.
    """
    logger.info(f"Retrieving audit trail for order: {order_id}")

    for order in orders_db:
        if order.get('id') == order_id:
            audit_trail = order.get('auditTrail', [])
            return {
                "orderId": order_id,
                "auditTrail": audit_trail,
                "totalEntries": len(audit_trail)
            }

    raise HTTPException(
        status_code=404,
        detail=f"Order not found: {order_id}"
    )
