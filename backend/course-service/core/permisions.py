from rest_framework.permissions import BasePermission

class IsProfessional(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.education_level == 'PROFESSIONAL'