# Generated manually - add PhrasalVerb model
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vocabulary', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PhrasalVerb',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phrase', models.CharField(db_index=True, max_length=200)),
                ('meaning_zh', models.CharField(help_text='Chinese meaning', max_length=200)),
                ('scene', models.CharField(blank=True, help_text='Usage scenario (e.g. client communication, daily life)', max_length=200)),
                ('context_en', models.TextField(blank=True, help_text='Full English context paragraph')),
                ('target_sentence', models.TextField(help_text='Key sentence demonstrating the phrase')),
                ('context_zh', models.TextField(blank=True, help_text='Chinese translation of context')),
                ('usage_note', models.TextField(blank=True, help_text='Usage explanation in Chinese')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'phrasal verb',
                'verbose_name_plural': 'phrasal verbs',
                'ordering': ['phrase'],
            },
        ),
    ]
