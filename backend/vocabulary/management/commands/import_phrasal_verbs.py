import csv
import os
from django.core.management.base import BaseCommand, CommandError
from vocabulary.models import PhrasalVerb


class Command(BaseCommand):
    help = 'Import phrasal verbs from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_path', type=str, help='Path to the CSV file')
        parser.add_argument(
            '--replace',
            action='store_true',
            help='Replace all existing work phrases before importing',
        )

    def handle(self, *args, **options):
        csv_path = options['csv_path']
        replace = options['replace']

        if not os.path.exists(csv_path):
            raise CommandError(f'File not found: {csv_path}')

        if replace:
            deleted, _ = PhrasalVerb.objects.all().delete()
            self.stdout.write(f'Deleted {deleted} existing phrasal verbs')

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            required_fields = {'phrase', 'meaning_zh', 'target_sentence'}
            if not required_fields.issubset(reader.fieldnames or []):
                raise CommandError(
                    f'CSV must contain at least these columns: {", ".join(sorted(required_fields))}. '
                    f'Found: {reader.fieldnames}'
                )

            created = 0
            errors = 0
            for row_num, row in enumerate(reader, start=2):
                phrase_text = row.get('phrase', '').strip()
                if not phrase_text:
                    self.stdout.write(f'  ⚠ Row {row_num}: empty phrase, skipping')
                    errors += 1
                    continue

                try:
                    PhrasalVerb.objects.create(
                        phrase=phrase_text,
                        meaning_zh=row.get('meaning_zh', '').strip(),
                        scene=row.get('scene', '').strip(),
                        context_en=row.get('context_en', '').strip(),
                        target_sentence=row.get('target_sentence', '').strip(),
                        context_zh=row.get('context_zh', '').strip(),
                        usage_note=row.get('usage_note', '').strip(),
                    )
                    created += 1
                except Exception as e:
                    self.stdout.write(f'  ✗ Row {row_num}: error importing "{phrase_text}": {e}')
                    errors += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done! Created {created} phrasal verbs, {errors} errors'
        ))
