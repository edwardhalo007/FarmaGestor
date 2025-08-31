from rest_framework import serializers
from .models import Medicamento, Usuario, Movimentacao, Localidade

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nivel_acesso']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nivel_acesso=validated_data.get('nivel_acesso', 'VISUALIZACAO')
        )
        return user
    
class LocalidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidade
        fields = '__all__'

class MedicamentoSerializer(serializers.ModelSerializer):
    localizacao_detalhe = LocalidadeSerializer(source='localizacao', read_only=True)

    class Meta:
        model = Medicamento
        fields = [
            'id',
            'nome',
            'dosagem',
            'forma_farmaceutica',
            'unidade_medida',
            'validade',
            'vencimento_validade',
            'quantidade',
            'lote',
            'fabricante',
            'localizacao',
            'localizacao_detalhe' 
        ]
        extra_kwargs = {'localizacao': {'write_only': True}}

class MovimentacaoSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.ReadOnlyField(source='medicamento.nome')
    responsavel_username = serializers.ReadOnlyField(source='responsavel.username')

    class Meta:
        model = Movimentacao
        fields = '__all__'