from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import UniqueConstraint, constraints
from django.utils import timezone

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
        related_name='gestor_api_usuarios_groups', 
        related_query_name='gestor_api_usuario',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='gestor_api_usuarios_permissions', 
        related_query_name='gestor_api_usuario',
    )

    def __str__(self):
        return self.username

class Localidade(models.Model):
    nome = models.CharField(max_length=255)
    class TipoLocalidades(models.TextChoices):
        ATT_BASICA = 'ATT_BASICA', 'Atenção Básica'
        ANTIBIOTICO = 'ANTIBIOTICO', 'Antibiótico'
        CONTROLADO = 'CONTROLADO', 'Armário Controlado'
        HOSPITALAR = 'HOSPITALAR', 'Hospitalar'
    tipo = models.CharField(max_length=20, choices=TipoLocalidades.choices)

    def __str__(self):
        return self.nome

class Medicamento(models.Model):

    class FormaFarmaceuticaChoices(models.TextChoices):
        COMPRIMIDO = 'COMPRIMIDO', 'Comprimido'
        CAPSULA = 'CAPSULA', 'Cápsula'
        INJETAVEL = 'INJETAVEL', 'Injetável'
        SOLUCAO = 'SOLUCAO', 'Solução'
        SUSPENSAO = 'SUSPENSAO', 'Suspensão'
        XAROPE = 'XAROPE', 'Xarope'
        POMADA = 'POMADA', 'Pomada'
        CREME = 'CREME', 'Creme'
        SUPOSITORIO = 'SUPOSITORIO', 'Supositório'
        PO = 'PO', 'Pó'
        OUTRO = 'OUTRO', 'Outro'

    class UnidadeMedidaChoices(models.TextChoices):
        MG = 'MG', 'mg'
        G = 'G', 'g'
        ML = 'ML', 'ml'
        L = 'L', 'l'
        UNI = 'UNI', 'uni'
        UI = 'UI', 'UI'
        MCG = 'MCG', 'mcg'
        MEQ = 'MEQ', 'mEq'

    nome = models.CharField(max_length=255)
    dosagem = models.IntegerField(default=0)
    forma_farmaceutica = models.CharField(max_length=20, choices=FormaFarmaceuticaChoices.choices, default=FormaFarmaceuticaChoices.COMPRIMIDO, )
    unidade_medida = models.CharField(max_length=10, choices=UnidadeMedidaChoices.choices, default=UnidadeMedidaChoices.MG,)
    validade = models.DateField()
    quantidade = models.IntegerField(default=0)
    lote = models.CharField(max_length=100)
    fabricante = models.CharField(max_length=255)
    localizacao = models.ForeignKey(Localidade, on_delete=models.SET_NULL, null=True, blank=True)

    @property
    def vencimento_validade(self):
        hoje = timezone.now().date()
        vencimento = (self.validade - hoje).days

        if vencimento > 30:
            return 'OK'
        elif 15 < vencimento <= 30:
            return 'Atenção'
        elif 0 < vencimento <= 15:
            return 'Critico'
        elif vencimento <= 0:
            return 'Vencido'

    def __str__(self):
        return self.nome


    class Meta:
        constraints = [
            UniqueConstraint(
                fields= ['nome','dosagem','forma_farmaceutica','unidade_medida','validade','lote','fabricante','localizacao'],
                name="lote_medicamento",
            )
        ]

class Movimentacao(models.Model):
    TIPO_MOVIMENTACAO_CHOICES = [
        ('ENTRADA', 'Entrada'),
        ('SAIDA', 'Saída'),
    ]
    
    tipo = models.CharField(max_length=10, choices=TIPO_MOVIMENTACAO_CHOICES)
    
    medicamento = models.ForeignKey('Medicamento',  on_delete=models.SET_NULL, related_name='movimentacoes', null=True, blank=True)
    medicamento_nome_snapshot = models.CharField(max_length=255, blank=True)
    
    quantidade = models.IntegerField()
    data = models.DateField(auto_now_add=True)

    responsavel = models.ForeignKey('Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    responsavel_nome_snapshot = models.CharField(max_length=255, blank=True)
    
    localidade = models.ForeignKey('Localidade', on_delete=models.PROTECT, related_name='movimentacoes')

    def save(self, *args, **kwargs):
        if self.medicamento:
            self.medicamento_nome_snapshot = self.medicamento.nome
            
        if self.responsavel:
            self.responsavel_nome_snapshot = self.responsavel.username 
            
        super().save(*args, **kwargs)

    def __str__(self):
        nome_med = self.medicamento_nome_snapshot or "Medicamento Desconhecido"
        return f"{self.tipo} de {self.quantidade} {nome_med}"