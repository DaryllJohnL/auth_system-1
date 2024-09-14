from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import TransactionHistory
from .serializers import TransactionHistorySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta  # Import timedelta
import logging
from rest_framework import generics
from django.utils.dateparse import parse_datetime
from .serializers import TransactionHistorySerializer

logger = logging.getLogger(__name__)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_transaction(request):
    serializer = TransactionHistorySerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_history(request):
    user = request.user
    transactions = TransactionHistory.objects.filter(user=user)
    serializer = TransactionHistorySerializer(transactions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

class TransactionHistoryListView(generics.ListAPIView):
    serializer_class = TransactionHistorySerializer

    def get_queryset(self):
        queryset = TransactionHistory.objects.all()
        transaction_type = self.request.query_params.get('transaction_type', None)
        month = self.request.query_params.get('month', None)

        try:
            if transaction_type:
                queryset = queryset.filter(transaction_type=transaction_type)

            if month:
                month_date = datetime.strptime(month, '%B %Y')
                start_date = month_date.replace(day=1)
                end_date = (start_date.replace(month=(start_date.month % 12) + 1, day=1) - timedelta(days=1))
                queryset = queryset.filter(date__date__range=[start_date.date(), end_date.date()])

        except Exception as e:
            print(f"Error occurred: {e}")
            raise e

        return queryset