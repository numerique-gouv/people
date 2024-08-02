# Generated by Django 5.0.6 on 2024-08-02 15:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mailbox_manager', '0006_maildomain_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='maildomainaccess',
            name='role',
            field=models.CharField(choices=[('viewer', 'Viewer'), ('administrator', 'Administrator'), ('owner', 'Owner')], default='viewer', max_length=20),
        ),
    ]
