from django.db import models

class DemoRequest(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('CONTACTED', 'Contacted'),
        ('SCHEDULED', 'Scheduled'),
        ('CONVERTED', 'Converted'),
        ('CLOSED', 'Closed'),
    ]

    business_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    business_type = models.CharField(max_length=100)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        app_label = 'leads'

    def __str__(self):
        return f"{self.business_name} - {self.contact_person}"
