from flask import Flask, request
import sqlite3
import os
import pickle

app = Flask(__name__)

# Hardcoded secret (bad practice)
SECRET_KEY = "supersecret123"

# Insecure database connection
def get_db():
    return sqlite3.connect("users.db")

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    conn = get_db()
    cursor = conn.cursor()

    # ❌ SQL Injection vulnerability
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)

    user = cursor.fetchone()
    conn.close()

    if user:
        return "Login successful!"
    return "Invalid credentials"


@app.route('/run')
def run_command():
    cmd = request.args.get('cmd')

    # ❌ Command Injection vulnerability
    result = os.popen(cmd).read()
    return result


@app.route('/load', methods=['POST'])
def load_data():
    data = request.files['file'].read()

    # ❌ Insecure Deserialization
    obj = pickle.loads(data)
    return f"Loaded object: {obj}"


@app.route('/read')
def read_file():
    filename = request.args.get('file')

    # ❌ Path Traversal vulnerability
    with open(f"./files/{filename}", "r") as f:
        return f.read()


@app.route('/debug')
def debug_info():
    # ❌ Information disclosure
    return f"Secret key is {SECRET_KEY}"


if __name__ == "__main__":
    # ❌ Debug mode enabled in production
    app.run(debug=True)