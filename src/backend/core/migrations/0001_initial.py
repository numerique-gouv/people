# Generated by Django 5.0.3 on 2024-06-08 09:25

import django.contrib.auth.models
import django.core.validators
import django.db.models.deletion
import timezone_field.fields
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunSQL('CREATE EXTENSION IF NOT EXISTS pg_trgm;', 'DROP EXTENSION IF EXISTS pg_trgm;'),
        migrations.RunSQL('CREATE EXTENSION IF NOT EXISTS unaccent;', 'DROP EXTENSION IF EXISTS unaccent;'),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated at')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(editable=False, max_length=100, unique=True)),
            ],
            options={
                'verbose_name': 'Team',
                'verbose_name_plural': 'Teams',
                'db_table': 'people_team',
                'ordering': ('name',),
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated at')),
                ('sub', models.CharField(help_text='Required. 255 characters or fewer. Letters, numbers, and @/./+/-/_ characters only.', max_length=255, unique=True, validators=[django.core.validators.RegexValidator(message='Enter a valid sub. This value may contain only letters, numbers, and @/./+/-/_ characters.', regex='^[\\w.@+-]+\\Z')], verbose_name='sub')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, verbose_name='email address')),
                ('name', models.CharField(blank=True, max_length=100, null=True, verbose_name='name')),
                ('language', models.CharField(choices=settings.LANGUAGES, default='en-us', help_text='The language in which the user wants to see the interface.', max_length=10, verbose_name='language')),
                ('timezone', timezone_field.fields.TimeZoneField(choices_display='WITH_GMT_OFFSET', default='UTC', help_text='The timezone in which the user wants to see times.', use_pytz=False)),
                ('is_device', models.BooleanField(default=False, help_text='Whether the user is a device or a real user.', verbose_name='device')),
                ('is_staff', models.BooleanField(default=False, help_text='Whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'db_table': 'people_user',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated at')),
                ('full_name', models.CharField(blank=True, max_length=150, null=True, verbose_name='full name')),
                ('short_name', models.CharField(blank=True, max_length=30, null=True, verbose_name='short name')),
                ('data', models.JSONField(blank=True, help_text='A JSON object containing the contact information', verbose_name='contact information')),
                ('base', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='overriding_contacts', to='core.contact')),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='contacts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'contact',
                'verbose_name_plural': 'contacts',
                'db_table': 'people_contact',
                'ordering': ('full_name', 'short_name'),
            },
        ),
        migrations.AddField(
            model_name='user',
            name='profile_contact',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='user', to='core.contact'),
        ),
        migrations.CreateModel(
            name='Invitation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated at')),
                ('email', models.EmailField(max_length=254, verbose_name='email address')),
                ('role', models.CharField(choices=[('member', 'Member'), ('administrator', 'Administrator'), ('owner', 'Owner')], default='member', max_length=20)),
                ('issuer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to=settings.AUTH_USER_MODEL)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to='core.team')),
            ],
            options={
                'verbose_name': 'Team invitation',
                'verbose_name_plural': 'Team invitations',
                'db_table': 'people_invitation',
            },
        ),
        migrations.CreateModel(
            name='TeamAccess',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated at')),
                ('role', models.CharField(choices=[('member', 'Member'), ('administrator', 'Administrator'), ('owner', 'Owner')], default='member', max_length=20)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accesses', to='core.team')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accesses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Team/user relation',
                'verbose_name_plural': 'Team/user relations',
                'db_table': 'people_team_access',
            },
        ),
        migrations.AddField(
            model_name='team',
            name='users',
            field=models.ManyToManyField(related_name='teams', through='core.TeamAccess', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='TeamWebhook',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created at')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated at')),
                ('url', models.URLField(verbose_name='url')),
                ('secret', models.CharField(blank=True, max_length=255, null=True, verbose_name='secret')),
                ('status', models.CharField(choices=[('failure', 'Failure'), ('pending', 'Pending'), ('success', 'Success')], default='pending', max_length=10)),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='webhooks', to='core.team')),
            ],
            options={
                'verbose_name': 'Team webhook',
                'verbose_name_plural': 'Team webhooks',
                'db_table': 'people_team_webhook',
            },
        ),
        migrations.AddConstraint(
            model_name='contact',
            constraint=models.CheckConstraint(condition=models.Q(('base__isnull', False), ('owner__isnull', True), _negated=True), name='base_owner_constraint', violation_error_message='A contact overriding a base contact must be owned.'),
        ),
        migrations.AddConstraint(
            model_name='contact',
            constraint=models.CheckConstraint(condition=models.Q(('base', models.F('id')), _negated=True), name='base_not_self', violation_error_message='A contact cannot be based on itself.'),
        ),
        migrations.AlterUniqueTogether(
            name='contact',
            unique_together={('owner', 'base')},
        ),
        migrations.AddConstraint(
            model_name='invitation',
            constraint=models.UniqueConstraint(fields=('email', 'team'), name='email_and_team_unique_together'),
        ),
        migrations.AddConstraint(
            model_name='teamaccess',
            constraint=models.UniqueConstraint(fields=('user', 'team'), name='unique_team_user', violation_error_message='This user is already in this team.'),
        ),
    ]
