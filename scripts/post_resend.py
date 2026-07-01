import sys, json, urllib.request
url = 'http://localhost:8811/registration/resend-otp'
data = json.dumps({'identity':'nguyendinhkiet12092005@gmail.com'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json','Accept':'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        print(r.status)
        print(r.read().decode('utf-8'))
except Exception as e:
    print('ERROR', e)
    try:
        import http.client
        raise
    except:
        pass
