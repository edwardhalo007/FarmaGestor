from datetime import date, timedelta
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db.models import Sum, F, query
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.authtoken.views import ObtainAuthToken

#Novos imports
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from .models import Medicamento, Usuario, Movimentacao, NivelAcesso, Localidade
from .serializers import MedicamentoSerializer, UsuarioSerializer, MovimentacaoSerializer, LocalidadeSerializer
from django.db import models, transaction
from django.http import HttpResponse
import csv


class NivelAcessoPermission(BasePermission):
    message = "Você não tem permissão para realizar esta ação com seu nível de acesso."

    def __init__(self, allowed_levels=None):
        self.allowed_levels = allowed_levels if allowed_levels is not None else []

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            if not self.allowed_levels:
                return True
            return request.user.nivel_acesso in self.allowed_levels
        return False

@method_decorator(csrf_exempt, name='dispatch')
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'nivel_acesso': user.nivel_acesso
        }) 
"""
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'nivel_acesso': user.nivel_acesso
        })
"""

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_atividade(request):
    localidade_id = request.query_params.get('localidade')
    
    hoje = timezone.now().date()
    data_inicio = hoje - timedelta(days=4)

    movimentacoes = Movimentacao.objects.filter(data__range=[data_inicio, hoje])

    if localidade_id:
        movimentacoes = movimentacoes.filter(localidade_id=localidade_id)

    dias_semana = {0: 'Seg', 1: 'Ter', 2: 'Qua', 3: 'Qui', 4: 'Sex', 5: 'Sáb', 6: 'Dom'}
    dados_agrupados = {}

    for i in range(4, -1, -1):
        data_loop = hoje - timedelta(days=i)
        key = data_loop.strftime('%Y-%m-%d')
        dia_label = dias_semana[data_loop.weekday()]
        dados_agrupados[key] = {'dia': dia_label, 'entradas': 0, 'saidas': 0}

    total_entradas = 0
    total_saidas = 0

    for mov in movimentacoes:
        key = mov.data.strftime('%Y-%m-%d')
        
        if key in dados_agrupados:
            if mov.tipo == 'ENTRADA':
                dados_agrupados[key]['entradas'] += mov.quantidade
                total_entradas += mov.quantidade
            elif mov.tipo == 'SAIDA':
                dados_agrupados[key]['saidas'] += mov.quantidade
                total_saidas += mov.quantidade

    chart_data = []
    for key in sorted(dados_agrupados.keys()):
        info = dados_agrupados[key]
        chart_data.append({'dia': info['dia'], 'tipo': 'Entrada', 'valor': info['entradas']})
        chart_data.append({'dia': info['dia'], 'tipo': 'Saída', 'valor': info['saidas']})

    return Response({
        'entradas': total_entradas,
        'saidas': total_saidas,
        'daily_activity': chart_data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_medicamentos(request):
    top_meds = Movimentacao.objects.values('medicamento__nome') \
        .annotate(nome=F('medicamento__nome'), total_movimentado=Sum('quantidade')) \
        .order_by('-total_movimentado')[:5]

    return Response(top_meds)

class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer

    def get_queryset(self):

        queryset = Medicamento.objects.all()
        search_term = self.request.query_params.get('search', None)

        if search_term:
            queryset = queryset.filter(
                models.Q(nome__icontains=search_term) |
                models.Q(dosagem__icontains=search_term)
            )

        return queryset.order_by('nome')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [
                IsAuthenticated(),
                NivelAcessoPermission(
                    allowed_levels=[NivelAcesso.OPERACIONAL, NivelAcesso.GESTOR, NivelAcesso.ADMINISTRADOR]
                )
            ]
        return [IsAuthenticated()]

class LocalidadeViewSet(viewsets.ModelViewSet):
    queryset = Localidade.objects.all()
    serializer_class = LocalidadeSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [
                IsAuthenticated(),
                NivelAcessoPermission(
                    allowed_levels=[NivelAcesso.ADMINISTRADOR]
                )
            ]
        return [IsAuthenticated()]

class MovimentacaoViewSet(viewsets.ModelViewSet):
    serializer_class = MovimentacaoSerializer

    def get_queryset(self):
        queryset = Movimentacao.objects.all().order_by("-data")

        search_medicamento = self.request.query_params.get('medicamento_id') 
        localidade_id = self.request.query_params.get('localidade_id')
        tipo = self.request.query_params.get('tipo')
        data_inicio = self.request.query_params.get('data_inicio')
        search_responsavel = self.request.query_params.get('responsavel')

        if search_medicamento:
            queryset = queryset.filter(medicamento__nome__icontains=search_medicamento)

        if localidade_id:
            queryset = queryset.filter(localidade__id=localidade_id)

        if tipo:
            queryset = queryset.filter(tipo=tipo)
            
        if search_responsavel:
            queryset = queryset.filter(responsavel__username__icontains=search_responsavel)
        
        if data_inicio:
             d_inicio = parse_date(data_inicio)
             if d_inicio:
                 queryset = queryset.filter(data__gte=d_inicio)

        return queryset

    def perform_create(self, serializer):
        serializer.save(responsavel=self.request.user)

        medicamento = serializer.validated_data['medicamento']
        quantidade_movimentada = serializer.validated_data['quantidade']
        tipo_movimentacao = serializer.validated_data['tipo']

        if tipo_movimentacao == 'ENTRADA':
            medicamento.quantidade += quantidade_movimentada
        elif tipo_movimentacao == 'SAIDA':
            if medicamento.quantidade < quantidade_movimentada:
                raise ValidationError("Quantidade em estoque insuficiente.")
            medicamento.quantidade -= quantidade_movimentada
        medicamento.save()


    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [
                IsAuthenticated(),
                NivelAcessoPermission(
                    allowed_levels=[
                        NivelAcesso.OPERACIONAL,
                        NivelAcesso.GESTOR,
                        NivelAcesso.ADMINISTRADOR
                    ]
                )
            ]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [
                IsAuthenticated(),
                NivelAcessoPermission(
                    allowed_levels=[
                        NivelAcesso.GESTOR,
                        NivelAcesso.ADMINISTRADOR
                    ]
                )
            ]
        return [IsAuthenticated()]
    
    @transaction.atomic
    def perform_destroy(self, instance):
        medicamento = instance.medicamento
        if medicamento:
            if instance.tipo == 'ENTRADA':
                medicamento.quantidade -= instance.quantidade
            elif instance.tipo == 'SAIDA':
                medicamento.quantidade += instance.quantidade

            medicamento.save()
        instance.delete()

    @transaction.atomic
    def perform_update(self, serializer):
        movimentacao_antiga = self.get_object()
        medicamento = movimentacao_antiga.medicamento
        
        if movimentacao_antiga.tipo == 'ENTRADA':
            medicamento.quantidade -= movimentacao_antiga.quantidade
        else: 
            medicamento.quantidade += movimentacao_antiga.quantidade
        
        tipo_novo = serializer.validated_data.get('tipo', movimentacao_antiga.tipo)
        quantidade_nova = serializer.validated_data.get('quantidade', movimentacao_antiga.quantidade)

        if tipo_novo == 'ENTRADA':
            medicamento.quantidade += quantidade_nova
        else:
            if medicamento.quantidade < quantidade_nova:
                raise serializers.ValidationError({"detail": "Estoque insuficiente para a nova quantidade de saída."})
            medicamento.quantidade -= quantidade_nova
        medicamento.save()
        serializer.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alertas_validade(request):
    data_hoje = date.today()
    data_limite = data_hoje + timedelta(days=30)
    medicamentos_alertas = Medicamento.objects.filter(
        validade__lte=data_limite
    ).order_by('validade')

    serializer = MedicamentoSerializer(medicamentos_alertas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def relatorios_movimentacao(request):
    if not request.user.is_authenticated:
        return Response({"detail": "Não autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

    if request.user.nivel_acesso not in [
        NivelAcesso.OPERACIONAL,
        NivelAcesso.GESTOR,
        NivelAcesso.ADMINISTRADOR
    ]:
        return Response({"detail": "Você não tem permissão para acessar este recurso."},
                        status=status.HTTP_403_FORBIDDEN)

    medicamento_nome = request.query_params.get('medicamento_nome')
    mov_local = request.query_params.get('localidade')
    data_inicio_str = request.query_params.get('data_inicio')
    data_fim_str = request.query_params.get('data_fim')
    export_format = request.query_params.get('export')

    movimentacoes = Movimentacao.objects.select_related('medicamento','responsavel','localidade').all()

    if medicamento_nome:
        movimentacoes = movimentacoes.filter(
            models.Q(medicamento__nome__icontains=medicamento_nome) |
            models.Q(medicamento_nome_snapshot__icontains=medicamento_nome)
        )
     
    if data_inicio_str:
        try:
            data_inicio = date.fromisoformat(data_inicio_str)
            movimentacoes = movimentacoes.filter(data__gte=data_inicio) 
        except ValueError:
            return Response({"detail": "Formato de data_inicio inválido."}, status=status.HTTP_400_BAD_REQUEST)

    if data_fim_str:
        try:
            data_fim = date.fromisoformat(data_fim_str)
            movimentacoes = movimentacoes.filter(data__lte=data_fim) 
        except ValueError:
            return Response({"detail": "Formato de data_fim inválido."}, status=status.HTTP_400_BAD_REQUEST)

    if mov_local:
        movimentacoes = movimentacoes.filter(localidade__pk=mov_local)

    if export_format == "csv":
        response = HttpResponse(
            content_type='text/csv',
            headers={'Content-Disposition': 'attachment; filename="relatorio-movimentacoes.csv"'}
        )

        writer = csv.writer(response, delimiter=";")
        
        writer.writerow(['ID', 'Data', 'Tipo Mov.', 'Medicamento', 'Tipo Loc.', 'Qtd', 'Local', 'Responsável'])

        for mov in movimentacoes:
            nome_med = mov.medicamento_nome_snapshot
            if not nome_med:
                nome_med = mov.medicamento.nome if mov.medicamento else "Medicamento Excluído"
            
            tipo_loc = mov.medicamento.get_tipo_de_localidade_display() if mov.medicamento else "-"

            writer.writerow([
                mov.id,
                mov.data.strftime('%d/%m/%Y'),
                mov.tipo,
                nome_med,      
                tipo_loc,      
                mov.quantidade,
                mov.localidade.nome,
                mov.responsavel_nome_snapshot or mov.responsavel.username
            ])

        return response

    movimentacoes = movimentacoes.order_by('-data') # Ordenação decrescente é melhor para relatórios
    serializer = MovimentacaoSerializer(movimentacoes, many=True)
    return Response(serializer.data)
class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Usuario.objects.all()

        if user.nivel_acesso == NivelAcesso.ADMINISTRADOR:
            return queryset

        if user.nivel_acesso == NivelAcesso.GESTOR:
            return queryset.filter(
                models.Q(nivel_acesso__in=[NivelAcesso.OPERACIONAL, NivelAcesso.VISUALIZACAO]) | 
                models.Q(pk=user.pk)
            )
        
        return queryset.filter(pk=user.pk)

    def get_permissions(self):
        if self.action == 'create':
            return [
                IsAuthenticated(),
                NivelAcessoPermission(allowed_levels=[NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR])
            ]
        elif self.action in ['list', 'retrieve']:
            return [
                IsAuthenticated(),
                NivelAcessoPermission(allowed_levels=[NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR])
            ]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [
                IsAuthenticated(),
                NivelAcessoPermission(allowed_levels=[NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR])
            ]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        request_user_nivel = self.request.user.nivel_acesso
        target_nivel_acesso = serializer.validated_data.get('nivel_acesso')

        if request_user_nivel == NivelAcesso.GESTOR:
            if target_nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR]:
                raise ValidationError({"detail": "Gestores não podem criar usuários com nível de Administrador ou Gestor."})
        serializer.save()

    def perform_update(self, serializer):
        request_user_nivel = self.request.user.nivel_acesso
        target_user = self.get_object()
        new_target_nivel_acesso = serializer.validated_data.get('nivel_acesso', target_user.nivel_acesso)

        if request_user_nivel == NivelAcesso.GESTOR:
            if target_user.nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR] and target_user.pk != self.request.user.pk:
                raise ValidationError({"detail": "Gestores não podem modificar usuários Administradores ou outros Gestores."})
            if target_user.pk == self.request.user.pk and new_target_nivel_acesso != request_user_nivel:
                raise ValidationError({"detail": "Gestores não podem modificar o próprio nível de acesso."})
            if new_target_nivel_acesso in [NivelAcesso.ADMINISTRADOR, NivelAcesso.GESTOR] and target_user.pk != self.request.user.pk:
                raise ValidationError({"detail": "Gestores não podem atribuir níveis de Administrador ou Gestor."})

        serializer.save()