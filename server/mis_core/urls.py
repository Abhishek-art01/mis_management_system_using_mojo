from django.contrib import admin
from django.urls import path
from api import views
from django.views.generic import RedirectView
from django.http import JsonResponse

def ping(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/ping/',           ping,                      name='ping'),
    path('api/login/',          views.login_view,          name='login'),
    path('api/dashboard-data/', views.dashboard_data_view, name='dashboard-data'),
]