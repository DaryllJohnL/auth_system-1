import numpy as np
from rest_framework.response import Response
from rest_framework.decorators import api_view
from datetime import datetime
from dateutil.relativedelta import relativedelta
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def payment_schedule(request):
    # Extract and validate transaction details from the request
    try:
        amount_borrowed = float(request.data.get('amount_borrowed'))
        months_term = int(request.data.get('months_term'))
        transaction_date_str = request.data.get('transaction_date')
    except (TypeError, ValueError) as e:
        logger.error(f"Error extracting data from request: {e}")
        return Response({"error": "Invalid input data"}, status=400)

    if not amount_borrowed or not months_term or not transaction_date_str:
        return Response({"error": "Missing required data"}, status=400)

    # Define monthly interest rate
    monthly_interest_rate = 0.03

    # Calculate total interest, total amount, and monthly payment
    total_interest = amount_borrowed * monthly_interest_rate * months_term
    total_amount = amount_borrowed + total_interest
    monthly_payment = total_amount / months_term

    # Parse the transaction date
    try:
        transaction_date = datetime.strptime(transaction_date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
    except ValueError as e:
        logger.error(f"Error parsing transaction date: {e}")
        return Response({"error": "Invalid transaction date format"}, status=400)

    # Calculate due dates
    due_dates = [transaction_date + relativedelta(months=i) for i in range(1, months_term + 1)]

    # Set payment amounts
    payments = np.full(months_term, monthly_payment)
    penalty_rate = 0.01
    penalty_amount = total_amount * penalty_rate

    # Create payment schedule
    payment_schedule = [{
        'month': i + 1,
        'payment': round(payments[i], 2),
        'due_date': due_dates[i].strftime('%Y-%m-%d')
    } for i in range(months_term)]

    # Return the response
    return Response({
        'schedule': payment_schedule,
        'total_amount': round(total_amount, 2),
        'penalty_amount': round(penalty_amount, 2)
    })
