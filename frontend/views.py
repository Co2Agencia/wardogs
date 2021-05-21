from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.authtoken.models import Token
from api.models import meGusta, Noticia
from .models import banners
import json

# Create your views here.
def index(request):
    noticias = Noticia.objects.all().order_by("-id")[0:9]
    try:
        token = Token.objects.get(user=request.user)
    except:
        token = ""
    return render(request, 'wardogs/noticias.html', {
        "token" : f"{token}",
        "noticias":noticias
    })
