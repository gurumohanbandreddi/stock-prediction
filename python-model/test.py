import requests
import traceback

try:
    response = requests.post('http://127.0.0.1:3001/api/current-price', json={'ticker': 'TCS.NS'})
    print(response.json())
except Exception as e:
    print(traceback.format_exc())
