# Generated by Django 5.1.1 on 2024-09-12 20:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_profile_card_cvv_profile_card_expiration_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transactionhistory',
            name='transaction_type',
            field=models.CharField(choices=[('credit', 'Credit'), ('payment', 'Payment')], max_length=20),
        ),
    ]
