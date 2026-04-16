from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    groups = models.ManyToManyField('auth.Group', blank=True, related_name="custom_user_set")
    user_permissions = models.ManyToManyField('auth.Permission', blank=True, related_name="custom_user_set")

    class Meta:
        db_table = 'custom_user'

class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50)
    table_name = models.CharField(max_length=50)
    record_id = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.action} on {self.table_name} by {self.user}"
