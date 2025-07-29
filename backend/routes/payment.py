from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Define a request model for the payment payload
class OrderPayload(BaseModel):
    amount: int

razorpay_client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

@router.post("/create-order")
def create_order(payload: OrderPayload):
    try:
        order = razorpay_client.order.create({
            "amount": payload.amount * 100,  # Amount in paise
            "currency": "INR",
            "payment_capture": "1"
        })
        return {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
