import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
import numpy_financial as npf
from datetime import datetime

@api_view(['POST'])
def calculate_payment(request):
    originalAmount = request.data.get('originalAmount', 0)
    totalAmount = request.data.get('totalAmount', 0)
    option = request.data.get('option', '')
    due_date_str = request.data.get('due_date', '')
    due_date = datetime.strptime(due_date_str, '%Y-%m-%d') if due_date_str else None
    current_date = datetime.now()


    if option == 'full-payment':
        if due_date and current_date <= due_date:
            final_amount = originalAmount  # Interest-free if paid before due date
        else:
            final_amount = totalAmount * 0.95  # 5% discount
    else:
        final_amount = totalAmount

    return Response({"final_amount": round(final_amount, 2)})
