# Generated by Django 5.0.6 on 2024-07-06 23:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mailbox_manager', '0005_alter_maildomain_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='maildomain',
            name='status',
            field=models.CharField(choices=[('pending', 'Pending'), ('enabled', 'Enabled'), ('failed', 'Failed'), ('disabled', 'Disabled')], default='pending', max_length=10),
        ),
    ]