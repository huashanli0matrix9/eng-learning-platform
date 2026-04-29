"""
Management command to seed IELTS vocabulary data into the database.
Run: python manage.py seed_vocabulary
"""
from django.core.management.base import BaseCommand
from vocabulary.models import Category, Word
from django.db import transaction
from .seed_data import CATEGORIES, WORDS_BY_CATEGORY


class Command(BaseCommand):
    help = 'Seed the database with IELTS vocabulary data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing vocabulary data before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Word.objects.all().delete()
            Category.objects.all().delete()

        # Create categories
        cat_map = {}
        for cat_data in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'order': cat_data['order'],
                }
            )
            cat_map[cat_data['slug']] = cat
            if created:
                self.stdout.write(f'  Created category: {cat.name}')

        # Create words
        total_words = 0
        for cat_slug, words in WORDS_BY_CATEGORY.items():
            category = cat_map.get(cat_slug)
            for word_data in words:
                word, created = Word.objects.get_or_create(
                    word=word_data[0],
                    definition=word_data[2],
                    defaults={
                        'part_of_speech': word_data[1],
                        'synonym': word_data[3],
                        'example_sentence': word_data[4],
                        'difficulty': word_data[5],
                        'category': category,
                    }
                )
                if created:
                    total_words += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded {total_words} words across {len(CATEGORIES)} categories!'
        ))
