from django.db import models

# Create your models here.

class SiteConfiguration(models.Model):
    site_name = models.CharField(max_length=255,blank=True,null=True)
    email = models.EmailField(max_length=255,blank=True,null=True)
    currency = models.CharField(max_length=255,null=True,blank=True)
    tax_rate = models.FloatField(blank=True,null=True)
    
    class Meta:
        verbose_name="Site Configuration"
        verbose_name_plural="Site Configuration"
        
    def save(self,*args,**kwargs):
        if not self.pk and SiteConfiguration.objects.exists():
            # Prevent create a new object
            return super().save(*args,**kwargs)
        
    @classmethod
    def get_solo(cls):
        """"Always return a single instance"""
        obj,created = cls.objects.get_or_create(pk=1)
        return obj
    
    def __str__(self):
        return "Setting"
    