from django.db import models
from api.utils import OverwriteStorage

# Create your models here.
class banners(models.Model):
  noticia = models.ImageField(upload_to="banners", storage=OverwriteStorage(), default="noticias/tanque_arma3.jpg")
  inicio = models.ImageField(upload_to="banners", storage=OverwriteStorage(), default="noticias/tanque_arma3.jpg")
  misiones = models.ImageField(upload_to="banners", storage=OverwriteStorage(), default="noticias/tanque_arma3.jpg")