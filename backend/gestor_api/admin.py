from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm as DjangoUserChangeForm, UserCreationForm as DjangoUserCreationForm
from .models import Medicamento, Usuario, Movimentacao

class CustomUserCreationForm(DjangoUserCreationForm):
    class Meta(DjangoUserCreationForm.Meta):
        model = Usuario
        fields = (
            'username',
            'first_name',
            'last_name',
            'email',
            'nivel_acesso',
        )


class CustomUserChangeForm(DjangoUserChangeForm):
    class Meta(DjangoUserChangeForm.Meta):
        model = Usuario
        fields = (
            'username',
            'first_name',
            'last_name',
            'email',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
            'nivel_acesso',
        )


class CustomUserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'nivel_acesso')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (('Informações Pessoais'), {'fields': ('first_name', 'last_name', 'email')}),
        (('Permissões'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (('Datas Importantes'), {'fields': ('last_login', 'date_joined')}),
        (('Nível de Acesso Customizado'), {'fields': ('nivel_acesso',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        (('Nível de Acesso Customizado'), {'fields': ('nivel_acesso',)}),
        (('Informações Pessoais'), {'fields': ('first_name', 'last_name', 'email')}),
        (('Permissões'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
    )

admin.site.register(Medicamento)
admin.site.register(Movimentacao)
admin.site.register(Usuario, CustomUserAdmin)