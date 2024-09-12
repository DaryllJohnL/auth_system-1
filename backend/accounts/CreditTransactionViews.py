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
    transactions = CreditTransaction.objects.filter(user=request.user)
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

    if not transaction_id or not paid_month:
        return Response({"error": "Transaction ID and paid month are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        transaction = CreditTransaction.objects.get(id=transaction_id, user=request.user)
    except CreditTransaction.DoesNotExist:
        return Response({"error": "Transaction not found."}, status=status.HTTP_404_NOT_FOUND)

    if paid_month not in transaction.paid_months:
        transaction.paid_months.append(paid_month)
        transaction.save()

    serializer = CreditTransactionSerializer(transaction)
    return Response(serializer.data, status=status.HTTP_200_OK)

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
