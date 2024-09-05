import numpy as np
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def calculate_payment(request):
    amount = request.data.get('amount', 0)
    option = request.data.get('option', '')

    # Sample logic for calculating payments
    if option == 'full-payment':
        final_amount = amount * 0.95  # 5% discount
    elif option == '30-day-interest-free':
        final_amount = amount  # No interest
    elif option == 'after-30-days':
        final_amount = amount * 1.1  # 10% penalty after 30 days
    elif option == 'financing':
        # Financing: calculate amortization for 6 months at 5% interest
        monthly_rate = 0.05 / 12
        n_months = 12
        final_amount = np.pmt(monthly_rate, n_months, -amount)
    else:
        final_amount = amount

    return Response({"final_amount": round(final_amount, 2)})
