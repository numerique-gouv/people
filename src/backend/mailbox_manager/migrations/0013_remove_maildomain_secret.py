# Generated by Django 5.1 on 2024-08-30 12:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('mailbox_manager', '0012_alter_mailbox_local_part'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='maildomain',
            name='secret',
        ),
    ]
