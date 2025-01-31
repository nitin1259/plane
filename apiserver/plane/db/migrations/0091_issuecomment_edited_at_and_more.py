# Generated by Django 4.2.17 on 2025-01-30 16:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0090_rename_dashboard_deprecateddashboard_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='issuecomment',
            name='edited_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='is_smooth_cursor_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='userrecentvisit',
            name='entity_name',
            field=models.CharField(max_length=30),
        ),
        migrations.AlterField(
            model_name='webhooklog',
            name='webhook',
            field=models.UUIDField(),
        )
    ]
