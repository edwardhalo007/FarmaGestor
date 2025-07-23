# FarmaGestor/backend/gestor_api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import Medicamento, Usuario, Movimentacao

# 1. Crie um Formulário Personalizado para CRIAÇÃO de Usuário no Admin
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = Usuario
        # LISTE TODOS OS CAMPOS AQUI, incluindo os padrões + seu campo
        fields = ('username', 'first_name', 'last_name', 'email', 'nivel_acesso',) # Adapte conforme os campos que você quer no formulário de criação

# 2. Crie um Formulário Personalizado para EDIÇÃO de Usuário no Admin
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = Usuario
        # LISTE TODOS OS CAMPOS AQUI, incluindo os padrões + seu campo
        fields = ('username', 'first_name', 'last_name', 'email', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions', 'nivel_acesso',) # Adapte conforme os campos que você quer no formulário de edição

# 3. Crie a Classe Admin Personalizada para o seu Modelo de Usuário
class CustomUserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'nivel_acesso')

    # Os fieldsets podem continuar os mesmos, pois eles referenciam os campos definidos nos formulários
    fieldsets = BaseUserAdmin.fieldsets + (
        (('Nível de Acesso Customizado'), {'fields': ('nivel_acesso',)}),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (('Nível de Acesso Customizado'), {'fields': ('nivel_acesso',)}),
    )

# Registre seus modelos no site de administração
admin.site.register(Medicamento)
admin.site.register(Movimentacao)
admin.site.register(Usuario, CustomUserAdmin)