from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import TransactionHistory
from .serializers import TransactionHistorySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    serializer = TransactionHistorySerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
