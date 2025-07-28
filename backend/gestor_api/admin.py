# FarmaGestor/backend/gestor_api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm as DjangoUserChangeForm, UserCreationForm as DjangoUserCreationForm # Renomeie para evitar conflitos
from .models import Medicamento, Usuario, Movimentacao # Importe todos os seus modelos

# 1. Crie um Formulário Personalizado para CRIAÇÃO de Usuário no Admin
class CustomUserCreationForm(DjangoUserCreationForm): # Use o DjangoUserCreationForm renomeado
    class Meta(DjangoUserCreationForm.Meta): # Herda da Meta do DjangoUserCreationForm
        model = Usuario
        # LISTE explicitamente todos os campos para CRIAÇÃO, incluindo 'nivel_acesso'
        fields = (
            'username',
            'first_name',
            'last_name',
            'email',
            'nivel_acesso', # Seu campo personalizado
        )


# 2. Crie um Formulário Personalizado para EDIÇÃO de Usuário no Admin
class CustomUserChangeForm(DjangoUserChangeForm): # Use o DjangoUserChangeForm renomeado
    class Meta(DjangoUserChangeForm.Meta): # Herda da Meta do DjangoUserChangeForm
        model = Usuario
        # LISTE explicitamente todos os campos para EDIÇÃO, incluindo 'nivel_acesso'
        # e os campos de permissão/staff/superuser etc.
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
            'nivel_acesso', # Seu campo personalizado
        )


# 3. Crie a Classe Admin Personalizada para o seu Modelo de Usuário
class CustomUserAdmin(BaseUserAdmin): # Use BaseUserAdmin
    # Use os formulários personalizados para criação e edição
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    # Campos que aparecerão na LISTA de usuários no admin
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'nivel_acesso')

    # Definindo os fieldsets (organização dos campos no formulário de EDIÇÃO)
    # Copie o fieldsets padrão de BaseUserAdmin e adicione o seu campo
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (('Informações Pessoais'), {'fields': ('first_name', 'last_name', 'email')}),
        (('Permissões'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (('Datas Importantes'), {'fields': ('last_login', 'date_joined')}),
        (('Nível de Acesso Customizado'), {'fields': ('nivel_acesso',)}), # Seu fieldset personalizado
    )

    # Definindo os add_fieldsets (organização dos campos no formulário de CRIAÇÃO)
    # Copie o add_fieldsets padrão de BaseUserAdmin e adicione o seu campo
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password', 'password2'), # Password2 é para confirmação de senha
        }),
        (('Nível de Acesso Customizado'), {'fields': ('nivel_acesso',)}), # Seu fieldset personalizado
        (('Informações Pessoais'), {'fields': ('first_name', 'last_name', 'email')}),
        (('Permissões'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
    )

# Registre seus modelos no site de administração
admin.site.register(Medicamento)
admin.site.register(Movimentacao)
admin.site.register(Usuario, CustomUserAdmin)