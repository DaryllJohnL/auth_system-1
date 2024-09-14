from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal
from .models import Profile
from decimal import Decimal, InvalidOperation

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cash_out(request):
    amount = request.data.get('amount')

    # Validate the amount
    if not amount:
        return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        amount_decimal = Decimal(amount)
        if amount_decimal <= 0:
            raise ValueError("Amount must be greater than zero")
    except (ValueError, InvalidOperation):
        return Response({"error": "Invalid cash-in amount"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user

    try:
        # Try to get the user's profile
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        # Create a new profile if it does not exist
        profile = Profile(user=user)
        profile.save()

    # Update the balance
    profile.balance -= amount_decimal
    profile.save()

    return Response({"message": "withdraw successful", "new_balance": str(profile.balance)}, status=status.HTTP_200_OK)
