from django.urls import path, include, re_path
from django.views.generic import TemplateView
from accounts.PaymentOptionViews import calculate_payment
from accounts.SchedulePaymentViews import payment_schedule
from accounts.CashInViews import cash_in
from accounts.CashOutViews import cash_out
from accounts.AccountInfoViews import get_account_info
from accounts.CreditTransactionViews import delete_transaction,update_paid_months,credit_transactions,record_credit_transaction,update_payment 
from accounts.DeductBalanceViews import deduct_balance 
from accounts.TransactionViews import create_transaction ,get_transaction_history,TransactionHistoryListView   
urlpatterns = [
    path('auth/cash-in/', cash_in, name='cash_in'),
    path('auth/cash-out/', cash_out, name='cash_out'),
    path('auth/calculate_payment/', calculate_payment, name='calculate_payment'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/', include('djoser.social.urls')),
    path('api/user-info/', get_account_info, name='user_info'),
    path('api/record-credit-transaction/', record_credit_transaction, name='record_credit_transaction'),
    path('api/credit-transactions/', credit_transactions, name='credit_transactions'), 
    path('api/payment-schedule/', payment_schedule, name='payment_schedule'),
    path('api/deduct-balance/', deduct_balance, name='deduct_balance'),
    path('api/delete-transaction/<int:transaction_id>/', delete_transaction, name='delete-transaction'),
    path('api/update-paid-months/', update_paid_months, name='update_paid_months'),
    path('api/update-payment/', update_payment, name='update-payment'),
    path('api/transaction/', create_transaction, name='create_transaction'),
    path('api/transaction-history/', get_transaction_history, name='get_transaction_history'),
    path('api/filter-transactions/', TransactionHistoryListView.as_view(), name='filter-transactions'),
]

# This catches all other routes and serves the React frontend (assuming index.html is your React app's entry point)
urlpatterns += [re_path(r'^.*$', TemplateView.as_view(template_name='index.html'))]
