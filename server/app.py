from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from db import get_db_connection
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return {'status': 'ok'}

@app.route('/db-test')
def db_test():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM courses')
    conn.close()
    return {'status': 'database connected'}

if __name__ == '__main__':
    app.run(debug=True)