from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
import uuid
from app.models.auth_schemas import UserRegister, UserLogin, TokenResponse, UserProfile, UserSensitivityProfile
from app.services.security import (
    USERS_DB, hash_password, verify_password, create_access_token,
    get_current_user, record_audit_log
)
from app.services.email import (
    send_welcome_and_verification,
    send_password_reset,
    verify_email_token,
    verify_password_reset_token,
    get_or_create_preferences
)

router = APIRouter(prefix="/api/auth", tags=["User Authentication & Security"])

class VerifyEmailRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=50)

@router.post("/register", response_model=TokenResponse)
async def register_user(payload: UserRegister, background_tasks: BackgroundTasks):
    email = payload.email.lower()
    if email in USERS_DB:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    new_user = {
        "id": user_id,
        "name": payload.name,
        "email": email,
        "hashed_password": hash_password(payload.password),
        "role": "admin" if "admin" in email else "user",
        "is_verified": False,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "sensitivity_profile": {
            "has_asthma": False,
            "has_elderly_in_home": False,
            "has_infants": False,
            "commute_mode": "Public Transit / Bus",
            "daily_outdoor_exercise_mins": 45,
            "preferred_city": "Mangaluru, Karnataka, India"
        }
    }
    USERS_DB[email] = new_user
    record_audit_log("USER_REGISTER", email, "SUCCESS", f"New account registered with role '{new_user['role']}'")

    # Initialize notification preferences & dispatch welcome/verification email
    get_or_create_preferences(user_id, email)
    background_tasks.add_task(
        send_welcome_and_verification,
        user_id=user_id,
        user_name=payload.name,
        recipient_email=email
    )

    token = create_access_token({"sub": email, "role": new_user["role"], "name": new_user["name"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=new_user["role"],
        user={
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "role": new_user["role"],
            "is_verified": new_user["is_verified"],
            "sensitivity_profile": new_user["sensitivity_profile"]
        }
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(payload: UserLogin):
    email = payload.email.lower()
    user = USERS_DB.get(email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        record_audit_log("LOGIN_FAILED", email, "DENIED", "Invalid password or email mismatch.")
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    record_audit_log("LOGIN_SUCCESS", email, "SUCCESS", f"User logged in successfully with role '{user['role']}'")
    token = create_access_token({"sub": email, "role": user["role"], "name": user["name"]})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user["role"],
        user={
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_verified": user.get("is_verified", True),
            "sensitivity_profile": user["sensitivity_profile"]
        }
    )

@router.post("/verify-email")
async def verify_email_endpoint(payload: VerifyEmailRequest):
    """Verifies user email using security token."""
    try:
        record = verify_email_token(payload.token)
        email = record["email"]
        if email in USERS_DB:
            USERS_DB[email]["is_verified"] = True
            record_audit_log("EMAIL_VERIFIED", email, "SUCCESS", "User successfully confirmed email address.")
        return {
            "status": "success",
            "message": "Email address verified successfully. Full notifications active.",
            "email": email
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/forgot-password")
async def forgot_password_endpoint(payload: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    """Initiates single-use password reset flow."""
    email = payload.email.lower()
    user = USERS_DB.get(email)
    if user:
        background_tasks.add_task(
            send_password_reset,
            user_id=user["id"],
            user_name=user["name"],
            recipient_email=email
        )
        record_audit_log("FORGOT_PASSWORD_REQUESTED", email, "SUCCESS", "Password reset token generated and dispatched.")
    
    # Return 200 even if email not found to prevent user enumeration attacks
    return {
        "status": "success",
        "message": "If an account exists with this email, a secure password reset link has been dispatched."
    }

@router.post("/reset-password")
async def reset_password_endpoint(payload: ResetPasswordRequest):
    """Consumes password reset token and sets new password."""
    try:
        record = verify_password_reset_token(payload.token)
        email = record["email"]
        user = USERS_DB.get(email)
        if not user:
            raise HTTPException(status_code=404, detail="Associated user account not found.")

        user["hashed_password"] = hash_password(payload.new_password)
        record_audit_log("PASSWORD_RESET_SUCCESS", email, "SUCCESS", "User successfully reset account password.")
        return {
            "status": "success",
            "message": "Password reset successfully. You may now log in with your new credentials."
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return UserProfile(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"],
        sensitivity_profile=UserSensitivityProfile(**current_user["sensitivity_profile"])
    )

@router.post("/profile", response_model=UserProfile)
async def update_my_profile(profile_update: UserSensitivityProfile, current_user: dict = Depends(get_current_user)):
    current_user["sensitivity_profile"] = profile_update.dict()
    record_audit_log("PROFILE_UPDATE", current_user["email"], "SUCCESS", "User updated health sensitivity profile.")
    return UserProfile(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"],
        sensitivity_profile=profile_update
    )
