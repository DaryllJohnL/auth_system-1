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