from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group

User = get_user_model()

# Remove Group Model from admin.
admin.site.unregister(Group)


class UserAdmin(BaseUserAdmin):
    # override the default UserAdmin display
    list_display = ["email", "admin"]
    list_filter = ["admin"]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "password",
                )
            },
        ),
        ("Personal info", {"fields": ("name",)}),
        ("Permissions", {"fields": ("admin",)}),
    )

    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),
    )
    search_fields = ["email"]
    ordering = ["email"]
    filter_horizontal = ()


admin.site.register(User, UserAdmin)
