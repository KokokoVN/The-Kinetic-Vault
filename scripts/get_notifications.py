import sys, urllib.request, json
url = 'http://localhost:8815/lookup?email=nguyendinhkiet12092005@gmail.com'
try:
    with urllib.request.urlopen(url, timeout=10) as r:
        text = r.read().decode('utf-8')
        print(text)
except Exception as e:
    print('ERROR', e)
