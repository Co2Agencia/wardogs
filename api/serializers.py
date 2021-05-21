from django.contrib.auth import models
from rest_framework import serializers
from .models import (Usuario, Noticia, imgUsuario, meGusta, Banner, Mision)


class UsuarioSerializer(serializers.ModelSerializer):
	class Meta:
		model = Usuario
		fields =("id", "password","last_login", "is_superuser", "username", "first_name", "last_name", "is_staff", "is_active", "date_joined", "email", "groups", "user_permissions")
		extra_kwargs = {
			'password': {'write_only': True},
		}
	
	def create(self, validated_data):
		usuario = Usuario(
			email=validated_data['email'],
			username=validated_data['username'],
		)
		password = validated_data['password']

		usuario.set_password(password)
		usuario.save()

		return usuario


class NoticiaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Noticia
		fields = ("id", "img", "titulo","subtitulo", "descripcion","fechaString", "fecha","autor", "megustaData")


class CrearNoticiaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Noticia
		fields = '__all__'


class MeGustaSerializer(serializers.ModelSerializer):
	class Meta:
		model = meGusta
		fields = '__all__'


class ImgUsuarioSerializer(serializers.ModelSerializer):
	class Meta:
		model = imgUsuario
		fields ='__all__'


class BannerSerializer(serializers.ModelSerializer):
	class Meta:
		model = Banner
		fields = '__all__'

class MisionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Mision
		fields = '__all__'