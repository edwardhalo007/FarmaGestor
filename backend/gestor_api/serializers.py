from rest_framework import serializers
from .models import Medicamento, Usuario, Movimentacao, Localidade, Lote
from django.utils import timezone
from rest_framework.validators import UniqueTogetherValidator
from django.db import transaction

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nivel_acesso', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': True},
        }

    def validate_email(self, value):
        queryset = Usuario.objects.filter(email=value)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("Este email já está em uso.")
            
        return value

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password is not None:
            instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class LocalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidade
        fields = '__all__'

class LoteSerializer(serializers.ModelSerializer):
    vencimento_validade = serializers.ReadOnlyField()

    class Meta:
        model = Lote
        fields = [
            'id',
            'medicamento',
            'lote',
            'validade',
            'vencimento_validade',
            'fabricante',
            'quantidade',
        ]
        extra_kwargs = {'medicamento': {'write_only': True}}

    def validate_validade(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("A data de validade não pode ser no passado.")
        return value

class MedicamentoSerializer(serializers.ModelSerializer):
    localizacao_detalhe = LocalidadeSerializer(source='localizacao', read_only=True)
    lotes_detalhe = LoteSerializer(source='lotes', many=True, read_only=True)

    class Meta:
        model = Medicamento
        fields = [
            'id',
            'nome',
            'dosagem',
            'forma_farmaceutica',
            'unidade_medida',
            'localizacao',
            'localizacao_detalhe',
            'tipo_de_localidade',
            'lotes_detalhe',
        ]

        extra_kwargs = {
            'localizacao': {'write_only': True},
            'lote': {'write_only': True}
        }

        validators = [
            UniqueTogetherValidator(
                queryset=Medicamento.objects.all(),
                fields=['nome', 'dosagem', 'forma_farmaceutica', 
                        'unidade_medida', 'localizacao', 'tipo_de_localidade'],
                message="Um medicamento com essas características já existe"
            )
        ]

class MovimentacaoSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.ReadOnlyField(source='lote.medicamento.nome')
    tipo_de_localidade = serializers.ReadOnlyField(source='lote.medicamento.tipo_de_localidade')
    responsavel_username = serializers.ReadOnlyField(source='responsavel.username')
    localidade_nome = serializers.ReadOnlyField(source='localidade.nome')
    
    numero_lote_exibicao = serializers.ReadOnlyField(source='lote.lote')
    data_validade_exibicao = serializers.ReadOnlyField(source='lote.validade')
    fabricante_exibicao = serializers.ReadOnlyField(source='lote.fabricante')

    medicamento = serializers.PrimaryKeyRelatedField(
        queryset=Medicamento.objects.all(), write_only=True
    )
    criacao_lote = serializers.BooleanField(write_only=True, default=False)
    lote_id = serializers.PrimaryKeyRelatedField(
        queryset=Lote.objects.all(), write_only=True, required=False, allow_null=True
    )

    numero_lote = serializers.CharField(write_only=True, required=False, allow_blank=True)
    data_validade = serializers.DateField(write_only=True, required=False, allow_null=True)
    fabricante = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Movimentacao
        fields = [
            'id', 'tipo', 'quantidade', 'justificativa', 'data', 'localidade', 'responsavel',
            'medicamento_nome', 'tipo_de_localidade', 'responsavel_username', 'localidade_nome',
            'numero_lote_exibicao', 'data_validade_exibicao', 'fabricante_exibicao',
            'medicamento', 'criacao_lote', 'lote_id', 'numero_lote', 'data_validade', 'fabricante',
            'lote', 'medicamento_nome_snapshot', 'responsavel_nome_snapshot'
        ]
        read_only_fields = ['lote', 'data', 'responsavel']

    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser um valor estritamente positivo.")
        return value

    def validate(self, data):
        tipo = data.get('tipo')
        quantidade = data.get('quantidade')
        localidade_registro = data.get('localidade')

        if data.get('criacao_lote'):
            if not data.get('numero_lote') or not data.get('data_validade') or not data.get('fabricante'):
                raise serializers.ValidationError("Para criar um novo lote, número, validade e fabricante são obrigatórios.")
            
            medicamento = data.get('medicamento')
            numero_lote = data.get('numero_lote')
            data_validade = data.get('data_validade')
            
            lote_existente = Lote.objects.filter(medicamento=medicamento, lote=numero_lote).first()
            
            if lote_existente:
                if lote_existente.validade != data_validade:
                    data_formatada = lote_existente.validade.strftime('%d/%m/%Y')
                    raise serializers.ValidationError(
                        f"Bloqueado: O Lote '{numero_lote}' já existe no sistema com vencimento para {data_formatada}. "
                        "Não é permitido cadastrar o mesmo lote com validades diferentes por razões de segurança."
                    )
        else:
            lote_selecionado = data.get('lote_id')
            if not lote_selecionado:
                raise serializers.ValidationError("Para movimentar um lote existente, o lote_id é obrigatório.")
            
            if tipo == 'SAIDA':
                if lote_selecionado.medicamento.localizacao and lote_selecionado.medicamento.localizacao != localidade_registro:
                    raise serializers.ValidationError(
                        f"Ação negada: O lote '{lote_selecionado.lote}' do medicamento '{lote_selecionado.medicamento.nome}' não está na localidade em questão."
                    )
                
                if quantidade > lote_selecionado.quantidade:
                    raise serializers.ValidationError(
                        f"Estoque insuficiente! Você tentou retirar {quantidade}, mas o lote '{lote_selecionado.lote}' "
                        f"possui apenas {lote_selecionado.quantidade} itens disponíveis."
                    )

        return data

    def create(self, validated_data):
        medicamento = validated_data.pop('medicamento')
        criacao_lote = validated_data.pop('criacao_lote')
        lote_existente = validated_data.pop('lote_id', None)
        numero_lote_val = validated_data.pop('numero_lote', None)
        data_validade_val = validated_data.pop('data_validade', None)
        fabricante_val = validated_data.pop('fabricante', None)

        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['responsavel'] = request.user

        with transaction.atomic():
            if criacao_lote:
                lote_obj, created = Lote.objects.get_or_create(
                    medicamento=medicamento,
                    lote=numero_lote_val,
                    defaults={
                        'validade': data_validade_val,
                        'fabricante': fabricante_val,
                        'quantidade': 0
                    }
                )
            else:
                lote_obj = lote_existente

            movimentacao = Movimentacao.objects.create(lote=lote_obj, **validated_data)
            
            if movimentacao.tipo == 'ENTRADA':
                lote_obj.quantidade += movimentacao.quantidade
            elif movimentacao.tipo == 'SAIDA':
                lote_obj.quantidade -= movimentacao.quantidade
            lote_obj.save()

            return movimentacao