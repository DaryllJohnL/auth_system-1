# Generated by Django 5.1.1 on 2024-09-11 00:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_profile_date_created'),
    ]

    operations = [
        migrations.AddField(
            model_name='credittransaction',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]
