from flask import Blueprint, request, abort, jsonify
from .config import RequestHeaders as rh
from playhouse.shortcuts import model_to_dict
from .defaults import DefaultRestMethods

from database.project.data_cuaca import WeatherDailyData, StationLocations 


bp = Blueprint('vizdata', __name__, url_prefix='/vizdata')

@bp.route('/stations', methods=['GET'])
def stations_data():
    
    print("DEBUG: Request Args:", request.args)
    project_db = request.headers.get(rh.PROJECT_DB)
    has_db, error = rh.init(project_db)
    if not has_db: 
        abort(400, error)

    table = StationLocations
    total_count = table.select().count()
    
    valid_count = table.select().where(
        (table.lat.is_null(False)) & (table.lat != '') &
        (table.long.is_null(False)) & (table.long != '')
    ).count()
    
    mismatch_count = table.select().where(
        (table.lat.is_null(True)) | (table.lat == '') |
        (table.long.is_null(True)) | (table.long == '') |
        (table.lat == 0) | (table.long == 0)
    ).count()
    
    incomplete_count = total_count - valid_count - mismatch_count
   
    if request.args.get('sort') == 'name':

        args_dict = request.args.to_dict()
        args_dict['sort'] = 'station_name'

    filter_cols = [table.station_name, table.lat, table.long, table.elev]
    
    items_data = DefaultRestMethods.get_paged_items_rev(
        table,
        filter_cols, 
        default_sort='station_name'
    )
   
    rh.close()
    
    items_list = [model_to_dict(m) for m in items_data['model']]

      
    return jsonify({
        'items': items_list,
        'total': total_count,         # Total keseluruhan
        'matches': items_data['matches'],
        'stats': {                    # Statistik akurat hasil perhitungan Backend
            'total': total_count,
            'valid': valid_count,
            'incomplete': incomplete_count,
            'mismatch': mismatch_count
        }
    })
    
@bp.route('/weather-data', methods=['GET'])
def get_weather_by_station():
    # 1. Inisialisasi Database
    project_db = request.headers.get(rh.PROJECT_DB)
    has_db, error = rh.init(project_db)
    if not has_db: 
        abort(400, error)

    # 2. Ambil parameter station_id dari request
    station_id = request.args.get('station_id')
    
    if not station_id:
        rh.close()
        abort(400, "Parameter 'station_id' diperlukan.")

    # 3. Query data cuaca berdasarkan station_id
    try:
        # Mengambil data dari tabel WeatherDailyData yang punya station_id tersebut
        weather_query = WeatherDailyData.select().where(WeatherDailyData.station == station_id)
        
        # Konversi ke list of dict
        items_list = [model_to_dict(m, recurse=False) for m in weather_query]
        
        rh.close()
        return jsonify({
            'items': items_list,
            'count': len(items_list)
        })
    except Exception as e:
        rh.close()
        abort(500, str(e))