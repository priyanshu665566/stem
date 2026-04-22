# Generated migration for ThumbnailAsset model

import cloudinary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_alter_city_flyin_graphic_alter_city_loop_graphic_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ThumbnailAsset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', cloudinary.models.CloudinaryField(max_length=255, verbose_name='image', folder='stemcity/thumbnail_assets')),
                ('title', models.CharField(blank=True, max_length=255, null=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('sort_order', models.PositiveIntegerField(default=0)),
                ('usage_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['sort_order', '-created_at'],
            },
        ),
    ]
