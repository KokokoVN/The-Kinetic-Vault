import urllib.request, json, sys
identity = 'nguyendinhkiet12092005@gmail.com'
otp = '42555357'
url = f'http://localhost:8811/registration/verify?identity={urllib.request.quote(identity)}&otp={urllib.request.quote(otp)}'
try:
    with urllib.request.urlopen(url, timeout=10) as r:
        print(r.status)
        print(r.read().decode('utf-8'))
except Exception as e:
    print('ERROR', e)
