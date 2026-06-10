from flask import Flask, make_response, jsonify
from flask_cors import CORS
from helpers.executable_api import Unbuffered
import sys
import argparse
import platform
import os
import traceback
from werkzeug import exceptions


# from rest import setup, aquifer, auto_complete, basin, change, channel, climate, decision_table, definitions, gwflow, hru, hru_lte, hru_parm_db, hydrology, init, lum, ops, recall, regions, reservoir, routing_unit, salts, soils, structural, water_rights
from rest.index import all_blueprints


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.debug = False
app.json.sort_keys = False #type: ignore
exiting = False

for bp in all_blueprints:
    app.register_blueprint(bp)

@app.route('/', methods=['GET'])
def default():
	return jsonify({
		'editor': 'API call working',
		'pythonVersion': platform.python_version()
	})

@app.route('/shutdown', methods=['GET'])
def shutdown():
	global exiting
	exiting = True
	return jsonify({'SWATPlusEditor': 'Server shutting down...'})

@app.teardown_request
def teardown(exception):
	if exiting:
		os._exit(0)

@app.errorhandler(exceptions.HTTPException)
def handle_exception(e):
    return make_response(jsonify(message=e.description, stacktrace=traceback.format_exc()), e.code)


if __name__ == '__main__':
	sys.stdout = Unbuffered(sys.stdout)
	parser = argparse.ArgumentParser(description='SWAT+ Editor REST API')
	parser.add_argument('port', type=str, help='port number to run API', default=5000, nargs='?')
	args = parser.parse_args()
	app.run(port=int(args.port), debug=True, use_reloader=False)
