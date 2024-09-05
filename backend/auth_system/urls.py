from django.urls import path, include, re_path
from django.views.generic import TemplateView
from accounts.PaymentOptionViews import calculate_payment


urlpatterns = [
    path('api/calculate_payment/', calculate_payment, name='calculate_payment'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/', include('djoser.social.urls')),
]

# This catches all other routes and serves the React frontend (assuming index.html is your React app's entry point)
urlpatterns += [re_path(r'^.*$', TemplateView.as_view(template_name='index.html'))]
