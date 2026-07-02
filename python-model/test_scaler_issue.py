import requests
import traceback

try:
    response = requests.post('http://127.0.0.1:5000/forecast', json={'ticker': 'AAPL', 'days': 7})
    print(response.json())
except Exception as e:
    print(traceback.format_exc())
