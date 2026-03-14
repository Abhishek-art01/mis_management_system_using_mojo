from django.contrib.auth import authenticate, login   # ← added login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import date


# ── Login ─────────────────────────────────────────────────────────────────────
@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid request body'}, status=400)

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return JsonResponse({'success': False, 'message': 'Username and password required'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)            # ← THIS was missing — creates the session
        return JsonResponse({'success': True, 'message': 'Login successful', 'username': user.username})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)



# helper function
def build_month_data(year, month):
    return {
        "year": year,
        "month": month
    }

# ── Dashboard Data ─────────────────────────────────────────
@csrf_exempt
def dashboard_data_view(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    today = date.today()
    year  = int(request.GET.get('year', today.year))
    month = int(request.GET.get('month', today.month))

    # Calculate previous month
    if month == 1:
        prev_year, prev_month = year - 1, 12
    else:
        prev_year, prev_month = year, month - 1

    return JsonResponse({
        "current": build_month_data(year, month),
        "previous": build_month_data(prev_year, prev_month),
    })



