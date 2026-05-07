# Generated manually - add PhrasalVerbCategory and PhrasalVerb models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('vocabulary', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PhrasalVerbCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'verbose_name_plural': 'phrasal verb categories',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='PhrasalVerb',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phrase', models.CharField(db_index=True, max_length=200)),
                ('meaning_zh', models.CharField(help_text='Chinese meaning', max_length=200)),
                ('context_en', models.TextField(blank=True, help_text='Full English context paragraph')),
                ('target_sentence', models.TextField(help_text='Key sentence demonstrating the phrase')),
                ('context_zh', models.TextField(blank=True, help_text='Chinese translation of context')),
                ('usage_note', models.TextField(blank=True, help_text='Usage explanation in Chinese')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('category', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='phrasal_verbs',
                    to='vocabulary.phrasalverbcategory',
                )),
            ],
            options={
                'verbose_name': 'phrasal verb',
                'verbose_name_plural': 'phrasal verbs',
                'ordering': ['phrase'],
            },
        ),
    ]
