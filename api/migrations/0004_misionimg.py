# Generated by Django 3.2.3 on 2021-06-16 20:37

import api.utils
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_mision_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='MisionImg',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('img', models.ImageField(default='noticias/tanque_arma3.jpg', storage=api.utils.OverwriteStorage(), upload_to='misiones')),
                ('mision', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mision_img', to='api.mision')),
            ],
        ),
    ]
