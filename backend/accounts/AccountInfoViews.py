# views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Profile

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_account_info(request):
    try:
        user = request.user
        profile = Profile.objects.get(user=user)
        data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'balance': str(profile.balance)  # Convert balance to string for JSON serialization
        }
        return Response(data, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        return Response({"error": "Profile not found for user"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
