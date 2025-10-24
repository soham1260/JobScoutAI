from flask import Flask
from routes.companies import companies_bp
from flask_cors import CORS
from flask import Flask
from dotenv import load_dotenv
load_dotenv()



app = Flask(__name__)
CORS(app)
app.register_blueprint(companies_bp, url_prefix="/companies")


@app.route("/")
def home():
    return {"message": "JobScout AI Backend Running"}

if __name__ == "__main__":
    app.run(debug=True)
