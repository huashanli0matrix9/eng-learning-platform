from django.db import models


class Category(models.Model):
    """IELTS vocabulary categories (e.g. Environment, Education, Technology)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Word(models.Model):
    """An IELTS vocabulary word with definition, synonym, and example."""
    word = models.CharField(max_length=100, db_index=True)
    phonetic = models.CharField(max_length=200, blank=True)
    part_of_speech = models.CharField(max_length=50, blank=True, help_text="e.g. noun, verb, adjective")
    definition = models.TextField()
    synonym = models.CharField(max_length=200, blank=True, help_text="Common synonym for this word")
    example_sentence = models.TextField(blank=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='words'
    )
    difficulty = models.CharField(
        max_length=20,
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
        default='intermediate'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['word']
        indexes = [
            models.Index(fields=['word', 'difficulty']),
        ]

    def __str__(self):
        return f"{self.word} ({self.part_of_speech})"


class WordList(models.Model):
    """A curated list of words for study sessions."""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    words = models.ManyToManyField(Word, related_name='word_lists')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Phrase(models.Model):
    """Common phrases/collocations for a word."""
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='phrases')
    phrase = models.CharField(max_length=300)
    translation = models.TextField(blank=True, help_text="Chinese translation")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.phrase} ({self.word.word})"


class ListeningSentence(models.Model):
    """Listening practice sentences with audio."""
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='listening_sentences')
    sentence = models.TextField()
    translation = models.TextField(blank=True, help_text="Chinese translation")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.sentence[:50]}... ({self.word.word})"


class ReadingSentence(models.Model):
    """Complex sentences for reading comprehension."""
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='reading_sentences')
    sentence = models.TextField()
    translation = models.TextField(blank=True, help_text="Chinese translation")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.sentence[:50]}... ({self.word.word})"


class WritingExercise(models.Model):
    """Writing practice: translate Chinese to English using the target word."""
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='writing_exercises')
    chinese_sentence = models.TextField(help_text="Chinese sentence to translate")
    reference_answer = models.TextField(blank=True, help_text="Reference English answer")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Writing: {self.chinese_sentence[:40]}... ({self.word.word})"


class PhrasalVerb(models.Model):
    """Phrasal verbs with context and usage notes. Independent of Word model.
    Covers work, daily life, and mixed-scenario phrasal verbs."""
    phrase = models.CharField(max_length=200, db_index=True)
    meaning_zh = models.CharField(max_length=200, help_text="Chinese meaning")
    category = models.ForeignKey(
        PhrasalVerbCategory, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='phrasal_verbs'
    )
    context_en = models.TextField(blank=True, help_text="Full English context paragraph")
    target_sentence = models.TextField(help_text="Key sentence demonstrating the phrase")
    context_zh = models.TextField(blank=True, help_text="Chinese translation of context")
    usage_note = models.TextField(blank=True, help_text="Usage explanation in Chinese")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['phrase']
        verbose_name = 'phrasal verb'
        verbose_name_plural = 'phrasal verbs'

    def __str__(self):
        return self.phrase


class PhrasalVerbCategory(models.Model):
    """Categories for phrasal verbs (e.g. Work, Daily Life, Travel)."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'phrasal verb categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Bookmark(models.Model):
    """User's bookmarked/favorite words."""
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='word_bookmarks')
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'word']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ❤️ {self.word.word}"


class WordLearningProgress(models.Model):
    """Per-module learning progress for a word."""
    class ModuleChoices(models.TextChoices):
        PHRASES = 'phrases', 'Phrases'
        LISTENING = 'listening', 'Listening'
        SPEAKING = 'speaking', 'Speaking'
        READING = 'reading', 'Reading'
        WRITING = 'writing', 'Writing'

    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='word_learning_progress')
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='learning_progress')
    module = models.CharField(max_length=20, choices=ModuleChoices.choices)
    completed = models.BooleanField(default=False)
    score = models.FloatField(null=True, blank=True, help_text="Score for this module (e.g. dictation accuracy, writing score)")
    details = models.JSONField(default=dict, blank=True, help_text="Extra module-specific data")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'word', 'module']
        verbose_name_plural = 'word learning progress'

    def __str__(self):
        return f"{self.user.username} - {self.word.word} ({self.module}: {'✅' if self.completed else '⬜'})"


class UserProgress(models.Model):
    """Tracks a user's mastery of individual words."""
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='vocabulary_progress')
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='user_progress')
    mastery_level = models.PositiveSmallIntegerField(
        default=0,
        help_text="0=new, 1=learning, 2=familiar, 3=mastered"
    )
    times_reviewed = models.PositiveIntegerField(default=0)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    next_review = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'word']
        verbose_name_plural = "user progress"

    def __str__(self):
        return f"{self.user.username} - {self.word.word} ({self.mastery_level})"
