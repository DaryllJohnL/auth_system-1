from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CreditTransaction
from .serializers import CreditTransactionSerializer

@api_view(['POST'])
def record_credit_transaction(request):
    serializer = CreditTransactionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def credit_transactions(request):
    # Fetch transactions for the authenticated user and order them by transaction_date descending
    transactions = CreditTransaction.objects.filter(user=request.user).order_by('-transaction_date')
    serializer = CreditTransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_transaction(request, transaction_id):
    try:
        transaction = CreditTransaction.objects.get(id=transaction_id, user=request.user)
        transaction.delete()
        return Response({"message": "Transaction deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except CreditTransaction.DoesNotExist:
        return Response({"error": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
@api_view(['POST'])
def update_paid_months(request):
    transaction_id = request.data.get('transaction_id')
    paid_month = request.data.get('paid_month')
    pay_in_full = request.data.get('pay_in_full', False)  # New flag for paying in full

    # Check if transaction_id is provided
    if not transaction_id:
        return Response({"error": "Transaction ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Check if paid_month is provided if not paying in full
    if not pay_in_full and not paid_month:
        return Response({"error": "Paid month is required unless paying in full."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Ensure the transaction is related to the authenticated user
        transaction = CreditTransaction.objects.get(id=transaction_id, user=request.user)

        # Check if paying in full
        if pay_in_full:
            # Pay all months up to the transaction's term
            transaction.paid_months = list(range(1, transaction.months_term + 1))  # Example: [1, 2, 3, ..., months_term]
        else:
            # Pay for a specific month if it's not already paid
            if paid_month in transaction.paid_months:
                return Response({"error": "Month already paid."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                transaction.paid_months.append(paid_month)

        # Save the transaction after updating the paid months
        transaction.save()

        # Return the updated transaction data
        serializer = CreditTransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except CreditTransaction.DoesNotExist:
        return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Catch any unexpected exceptions and return an error response
        return Response({"error": f"Failed to process payment: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def update_payment(request):
    transaction_id = request.data.get('transaction_id')
    payment_amount = float(request.data.get('payment_amount', 0))

    if not transaction_id or payment_amount <= 0:
        return Response({"error": "Transaction ID and payment amount are required and must be positive."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        transaction = CreditTransaction.objects.get(id=transaction_id, user=request.user)
        new_amount_borrowed = float(transaction.amount_borrowed) 

        if new_amount_borrowed < 0:
            return Response({"error": "Payment amount exceeds the borrowed amount."}, status=status.HTTP_400_BAD_REQUEST)

        transaction.amount_borrowed = new_amount_borrowed
        transaction.save()

        serializer = CreditTransactionSerializer(transaction)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except CreditTransaction.DoesNotExist:
        return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)
