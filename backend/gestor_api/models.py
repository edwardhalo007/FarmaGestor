from django.db import models
from django.contrib.auth.models import AbstractUser

class NivelAcesso(models.TextChoices):
    VISUALIZACAO = 'VISUALIZACAO', 'Visualização'
    OPERACIONAL = 'OPERACIONAL', 'Operacional'
    GESTOR = 'GESTOR', 'Gestor'
    ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador'

class Usuario(AbstractUser):
    nivel_acesso = models.CharField(
        max_length=20,
        choices=NivelAcesso.choices,
        default=NivelAcesso.VISUALIZACAO,
    )
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='gestor_api_usuarios_groups', # <--- Mude aqui
        related_query_name='gestor_api_usuario',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='gestor_api_usuarios_permissions', # <--- Mude aqui
        related_query_name='gestor_api_usuario',
    )

    def __str__(self):
        return self.username
    
class Localidade(models.Model):
    nome = models.CharField(max_length=255)
    class TipoChoices(models.TextChoices):
        ATT_BASICA = 'ATT_BASICA', 'Atenção Básica'
        ANTIBIOTICO = 'ANTIBIOTICO', 'Antibiótico'
        CONTROLADO = 'CONTROLADO', 'Armário Controlado'
        HOSPITALAR = 'HOSPITALAR', 'Hospitalar'
    tipo = models.CharField(max_length=20, choices=TipoChoices.choices)

    def __str__(self):
        return self.nome
    
class Medicamento(models.Model):
    nome = models.CharField(max_length=255)
    validade = models.DateField()
    quantidade = models.IntegerField(default=0)
    lote = models.CharField(max_length=100)
    fabricante = models.CharField(max_length=255)
    localizacao = models.ForeignKey(Localidade, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nome

class Movimentacao(models.Model):
    TIPO_MOVIMENTACAO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]
    tipo = models.CharField(max_length=10, choices=TIPO_MOVIMENTACAO_CHOICES)
    medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE, related_name='movimentacoes')
    quantidade = models.IntegerField()
    data = models.DateTimeField(auto_now_add=True)
    responsavel = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.tipo} de {self.quantidade} {self.medicamento.nome}"