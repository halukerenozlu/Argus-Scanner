from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import scan_website


@api_view(['POST'])
def analyze_url(request):
    url = request.data.get('url')
    if not url:
        return Response({"error": "URL gerekli"}, status=400)

    # Selenium motorunu çalıştır
    result = scan_website(url)

    return Response(result)
