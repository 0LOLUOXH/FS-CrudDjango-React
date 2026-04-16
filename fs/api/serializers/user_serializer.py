from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'is_staff', 'is_active', 'email', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'is_active': {'read_only': True},  # Opcional: para que no se pueda modificar desde la API
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_staff=validated_data.get('is_staff', False)
        )
        return user

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
        
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            raise AuthenticationFailed("Se requiere nombre de usuario y contraseña.")
        
        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )
        
        if not user:
            raise AuthenticationFailed("Credenciales inválidas.")
        
        if not user.is_active:
            raise AuthenticationFailed("La cuenta de usuario está desactivada.")
        
        data['user'] = user
        return data

