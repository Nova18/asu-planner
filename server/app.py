from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(debug=True)