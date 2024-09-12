from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal, InvalidOperation
from .models import Profile

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deduct_balance(request):
    # Retrieve the amount from the request
    amount = request.data.get('amount')

    # Validate the amount
    if not amount:
        return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        amount_decimal = Decimal(amount)
        if amount_decimal <= 0:
            return Response({"error": "Amount must be greater than zero"}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, InvalidOperation):
        return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve the user
    user = request.user

    try:
        # Fetch the user's profile
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user has sufficient balance for the deduction
    if profile.balance >= amount_decimal:
        profile.balance -= amount_decimal
        profile.save()
        return Response({"message": "Balance deducted successfully", "new_balance": str(profile.balance)}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)
