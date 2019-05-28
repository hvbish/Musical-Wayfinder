#!/usr/bin/env python3
# import sys
# import os
# 
# PUBLIC_HTML_PATH="/nfs/bronfs/uwfs/dw00/d95/stevengs"
# FLASK_PATH = "flask/flaskenv/lib/python3.6/site-packages"
# 
# sys.path.append(os.path.join(PUBLIC_HTML_PATH, FLASK_PATH))



# exit()

#import sys

#from myapp import app
import os

def print_e(e):
    print("Content-type:text/html\r\n\r\n")
    print('<html>')
    print('<head>')
    print('</head>')
    print('<body>')
    
    print(f"<p> {e} </p>")
    
    print('</body>')
    print('</html>')
    print('</html>')
    exit()
try:
    from main import app
except Exception as e:
    print_e(e)

from wsgiref.handlers import CGIHandler

#try:
#    print_e(os.environ["SERVER_NAME"])
#except Exception as e:
#    print_e(e)

#print_e(os.environ["SERVER_PORT"])
#print_e(os.environ["REQUEST_METHOD"])

# 
# print("Content-type:text/html\r\n\r\n")
# print('<html>')
# print('<head>')
# print('<title>Hello Word - First CGI Program</title>')
# print('</head>')
# print('<body>')
# print('<h2>Hello Word! This is my first CGI program</h2>')
# 
# try:
#     import flask
# except Exception as e:
#    print_e(e)
# 
# try:
#    from myapp import app
# except Exception as e:
#    print_e(e)
# 
# print('</body>')
# print('</html>')
# print('</html>')

CGIHandler().run(app)
