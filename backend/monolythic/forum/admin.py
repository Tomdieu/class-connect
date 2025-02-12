from django.contrib import admin
from .models import Forum, Messages, Seen

# Register your models here.
admin.site.register(Forum)
admin.site.register(Messages)
admin.site.register(Seen)
