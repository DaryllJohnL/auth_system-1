import random
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.conf import settings
from django.utils import timezone

def generate_card_number():
    return ''.join([str(random.randint(0, 9)) for _ in range(16)])

def generate_expiration_date():
    month = random.randint(1, 12)
    year = random.randint(2024, 2030)
    return f"{month:02d}/{year % 100}"

def generate_cvv():
    return ''.join([str(random.randint(0, 9)) for _ in range(3)])

class UserAccountManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        user.set_password(password)
        user.save()

        # Create a Profile instance with default balance (0.00) upon user creation
        Profile.objects.create(user=user, balance=0.00)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class UserAccount(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def get_full_name(self):
        return self.first_name

    def get_short_name(self):
        return self.first_name
    
    def __str__(self):
        return self.email

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date_created = models.DateTimeField(default=timezone.now)
    card_number = models.CharField(max_length=16, blank=True, null=True, default=generate_card_number)
    card_expiration_date = models.CharField(max_length=5, blank=True, null=True, default=generate_expiration_date)  # Corrected
    card_cvv = models.CharField(max_length=3, blank=True, null=True, default=generate_cvv)

    def __str__(self):
        return f'{self.user.get_full_name()} Profile'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    card_number = models.CharField(max_length=16, default=generate_card_number)
    expiration_date = models.CharField(max_length=5, default=generate_expiration_date)
    cvv = models.CharField(max_length=3, default=generate_cvv)

    def __str__(self):
        return f"Card ending in {self.card_number[-4:]} for {self.user.email}"

class CreditTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount_borrowed = models.DecimalField(max_digits=10, decimal_places=2)
    months_term = models.PositiveIntegerField()
    transaction_date = models.DateTimeField(auto_now_add=True)
    paid_months = models.JSONField(default=list)  # Store a list of paid months
    description = models.TextField(blank=True, null=True)  # New field for description

    def __str__(self):
        return f"Transaction {self.id} for {self.user.email}"

class TransactionHistory(models.Model):
    TRANSACTION_TYPES = [
        ('credit', 'Credit'),
        ('payment', 'Payment'),
        ('deposit', 'Deposit'),   # Added 'deposit'
        ('withdrawal', 'Withdrawal'),  # Added 'withdrawal'
        ('credit_payment', 'Credit Payment'),  # New transaction type
    ]


    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
            on_delete=models.CASCADE, 
        related_name='transaction_history'
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_transaction_type_display()} for {self.user.email} on {self.date}"
