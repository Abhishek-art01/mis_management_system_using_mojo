from django.contrib import admin
from django.urls import path
from api import views
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/login/', views.login_view, name='login'),
]

