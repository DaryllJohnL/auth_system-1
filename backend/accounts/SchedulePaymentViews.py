import numpy as np
from rest_framework.response import Response
from rest_framework.decorators import api_view
from datetime import datetime
from dateutil.relativedelta import relativedelta

@api_view(['POST'])
def payment_schedule(request):
    # Extract transaction details from the request
    amount_borrowed = float(request.data.get('amount_borrowed', 532.00))
    months_term = int(request.data.get('months_term', 6))
    transaction_date_str = request.data.get('transaction_date', "2024-09-08T20:19:31.364754Z")
    monthly_interest_rate = 0.03

    # Calculate total interest, total amount, and monthly payment
    total_interest = amount_borrowed * monthly_interest_rate * months_term
    total_amount = amount_borrowed + total_interest
    monthly_payment = total_amount / months_term

    # Parse the transaction date
    transaction_date = datetime.strptime(transaction_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")

    # Calculate due dates as one month after each subsequent month from the transaction date
    due_dates = [transaction_date + relativedelta(months=i) for i in range(1, months_term + 1)]

    payments = np.full(months_term, monthly_payment)
    penalty_rate = 0.03
    penalty_amount = total_amount * penalty_rate

    payment_schedule = [{
        'month': i + 1,
        'payment': round(payments[i], 2),
        'due_date': due_dates[i].strftime('%Y-%m-%d')  # Format date as a string
    } for i in range(months_term)]

    return Response({
        'schedule': payment_schedule,
        'total_amount': round(total_amount, 2),
        'penalty_amount': round(penalty_amount, 2)
    })
