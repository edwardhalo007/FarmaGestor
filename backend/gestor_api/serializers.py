from rest_framework import serializers
from .models import Medicamento, Usuario, Movimentacao, Localidade, Lote
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework.validators import UniqueTogetherValidator

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

    def validate_validade(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("A data de validade não pode ser no passado.")
        return value

class MovimentacaoSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.ReadOnlyField(source='medicamento.nome')
    responsavel_username = serializers.ReadOnlyField(source='responsavel.username')
    localidade_nome = serializers.ReadOnlyField(source='localidade.nome')
    tipo_de_localidade = serializers.ReadOnlyField(source='medicamento.tipo_de_localidade')

    class Meta:
        model = Movimentacao
        fields = '__all__'