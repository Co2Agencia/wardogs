from django.contrib.auth.models import AbstractUser, Group
from django.core.files import storage
from django.db import models
from django.db.models.fields import CharField
from .utils import OverwriteStorage
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


# Create your models here.

class Usuario(AbstractUser):
  email = models.EmailField(verbose_name="email", max_length=60, unique=True)


  def imgUsuario(self, *args, **kwargs):
    if self.usuario_img:
      data = {}
      for elemento in self.usuario_img.all():
        if elemento.img:
          data["url"] = elemento.img.url
          data["id"] = elemento.id

        else:
          data["url"] = ""


      return data
    
    else:
      return ""


class imgUsuario(models.Model):
  img = models.ImageField(upload_to="usuarios", storage=OverwriteStorage() ,null=False, default="usuarios/default.jpg")
  usuario = models.ForeignKey(Usuario, related_name="usuario_img", on_delete=models.CASCADE, null=False)

  def deleteImg(self):
    self.img.delete()

class Noticia(models.Model):
  titulo = models.CharField(max_length=200)
  subtitulo = models.CharField(max_length=200)
  descripcion = models.TextField()
  img = models.ImageField(upload_to="noticias", storage=OverwriteStorage(), default="noticias/tanque_arma3.jpg")
  usuario = models.ForeignKey(Usuario, related_name="noticias", on_delete=models.SET_DEFAULT, default=None, null=False)
  fecha = models.DateTimeField(auto_now_add=True)

  def __str__(self):
    return self.titulo

  def autor(self, *args, **kwargs):
    data = {}
    try:
      img = self.usuario.imgUsuario()
      data["img"] = img
      data["username"] = self.usuario.username
      data["id"] = self.usuario.pk

    except:
      data["username"] = self.usuario.username
      data["id"] = self.usuario.pk

    return data

  def fechaString(self, *args, **kwargs):
    string = f"Publicado {self.fecha.day} de {self.fecha.month}, {self.fecha.year}"

    return string

  def megustaData(self, *args, **kwargs):
    data = {}
    data["total"] = 0
    data["megustas"] = {}
    try:
      for attr in self.megusta.all():
        if attr.megusta:
          data["total"] += 1
          data["megustas"][attr.id] = {}
          data["megustas"][attr.id]["usuario"] = attr.usuario.username
          data["megustas"][attr.id]["usuario_id"] = attr.usuario.id
    
    except:
      data["status"] = "No hay megusta"
    
    return data

  def deleteImg(self):
    self.img.delete()

class meGusta(models.Model):
  megusta = models.BooleanField(null=True, blank=True)
  noticia = models.ForeignKey(Noticia, related_name="megusta", on_delete=models.CASCADE, default=None, blank=False)
  usuario = models.ForeignKey(Usuario, related_name="megusta", on_delete=models.SET_DEFAULT, default=None, blank=False)


SECTORES_NOMBRES = (
  ("noticia", "noticia"),
  ("mision", "mision"),
)

class Banner(models.Model):
  sector = models.CharField(choices=SECTORES_NOMBRES, blank=False, max_length=15, unique=True)
  img = models.ImageField(upload_to="banners", storage=OverwriteStorage(), default="noticias/tanque_arma3.jpg")
  usuario = models.ForeignKey(Usuario, related_name="banner", default=None, blank=False, on_delete=models.SET_DEFAULT)
  fecha = models.DateTimeField(auto_now_add=True)

  def __str__(self):
      return f"{self.id} {self.sector}"


class Mision(models.Model):
  img = models.ImageField(upload_to="misiones", storage=OverwriteStorage(), default="noticias/tanque_arma3.jpg")
  usuario = models.ForeignKey(Usuario, related_name="mision", default=None, blank=False, on_delete=models.SET_DEFAULT)
  fecha = models.DateTimeField(auto_now_add=True)
  titulo = models.CharField(max_length=200, null=False, blank=False)
  subtitulo = models.CharField(max_length=200, blank=True)
  url = models.URLField(max_length=200, blank=True)

  def deleteImg(self):
    self.img.delete()

  def get_img(self):
    imgs = self.mision_img.all()
    return imgs
  
  def delete_imgs(self):
    imgs = self.get_img()
    imgs.delete()


class ImgMision(models.Model):
  img = models.ImageField(upload_to="misiones", storage=OverwriteStorage())
  mision = models.ManyToManyField(Mision, related_name="mision_img", blank=False)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)