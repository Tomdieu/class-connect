from django.dispatch import receiver
from django.db.models.signals import post_delete,post_save
from django.core.cache import cache
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver([post_save,post_delete],sender=User)
def invalidate_cache(sender,instance,**kwargs):
    
    if instance.id:
        # invalidate user_info cache
        cache.delete_pattern(f'*user_info*')
    
    # TODO
    cache.delete_pattern('*user_list*')