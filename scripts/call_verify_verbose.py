import urllib.request, urllib.error, urllib.parse
identity='nguyendinhkiet12092005@gmail.com'
otp='42555357'
url=f'http://localhost:8811/registration/verify?identity={urllib.parse.quote(identity)}&otp={urllib.parse.quote(otp)}'
try:
    r=urllib.request.urlopen(url, timeout=10)
    print(r.status)
    print(r.read().decode())
except urllib.error.HTTPError as e:
    print('STATUS', e.code)
    try:
        print(e.read().decode())
    except Exception as e2:
        print('NO BODY', e2)
except Exception as e:
    print('ERR', e)
