from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any

from ..core.database import get_db
from ..models import Notification, NotificationPreference
from .auth import get_current_user_id

router = APIRouter()

@router.get("/notifications")
async def get_notifications(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(Notification)
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    notifications = result.scalars().all()
    
    return {
        "success": True,
        "message": "Notifications retrieved successfully",
        "data": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "isRead": n.is_read,
                "createdAt": n.created_at
            }
            for n in notifications
        ]
    }

@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(Notification).filter_by(id=notification_id, user_id=user_id)
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    await db.commit()
    
    return {"success": True, "message": "Notification marked as read"}

@router.get("/preferences")
async def get_preferences(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(
        select(NotificationPreference).filter_by(user_id=user_id)
    )
    pref = result.scalar_one_or_none()
    
    if not pref:
        return {"success": True, "message": "", "data": {"emailEnabled": True}}
        
    return {
        "success": True,
        "message": "",
        "data": {
            "emailEnabled": pref.email_enabled,
            "email": pref.email
        }
    }

@router.put("/preferences")
async def update_preferences(
    payload: dict,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    email_enabled = payload.get("emailEnabled")
    if email_enabled is None:
        raise HTTPException(status_code=400, detail="emailEnabled is required")
        
    result = await db.execute(
        select(NotificationPreference).filter_by(user_id=user_id)
    )
    pref = result.scalar_one_or_none()
    
    if not pref:
        pref = NotificationPreference(user_id=user_id, email_enabled=email_enabled)
        db.add(pref)
    else:
        pref.email_enabled = email_enabled
        
    await db.commit()
    return {"success": True, "message": "Preferences updated"}
