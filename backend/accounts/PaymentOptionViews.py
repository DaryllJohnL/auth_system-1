import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response
import numpy_financial as npf

@api_view(['POST'])
def calculate_payment(request):
    amount = request.data.get('amount', 0)
    option = request.data.get('option', '')
    # Financing: calculate amortization for 6 months at 5% interest
    monthly_rate = 0.03  
    n_months = 12  # Total duration in months
    # Calculate monthly payment using np.pmt
    monthly_payment = npf.pmt(monthly_rate, n_months, -amount)
    total_payment = monthly_payment * n_months

    # Sample logic for calculating payments
    if option == 'full-payment':
        final_amount = total_payment * 0.95  # 5% discount
    elif option == '30-day-interest-free':
        final_amount = amount  # No interest
    elif option == 'after-30-days':
        final_amount = monthly_payment * 1.1  # 10% penalty after 30 days
    elif option == 'financing':
        final_amount = monthly_payment
    else:
        final_amount = amount

    return Response({"final_amount": round(final_amount, 2)})
