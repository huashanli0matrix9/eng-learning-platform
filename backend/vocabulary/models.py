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
