from flask import Blueprint, request, abort, jsonify
from .config import RequestHeaders as rh
from playhouse.shortcuts import model_to_dict
from .defaults import DefaultRestMethods
import math
from peewee import (
    fn
)
from datetime import date, datetime
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
    
def calculate_stats(s, prefix):
    # s = stats_query (dict), prefix = 'pcp', 'wnd', 'hmd', 'tmp_max', atau 'tmp_min'
    avg = s.get(f'avg_{prefix}') or 0
    mx = s.get(f'max_{prefix}') or 0
    mn = s.get(f'min_{prefix}') or 0
    sum_sq = s.get(f'sum_sq_{prefix}') or 0
    count = s.get(f'count_{prefix}') or 0
    
    # Standar Deviasi (Populasi)
    variance = max(0, (sum_sq / count) - (avg ** 2)) if count > 0 else 0
    std = math.sqrt(variance)
    
    # Koefisien Variasi (CV)
    cv = (std / avg * 100) if avg != 0 else 0
    
    # Skewness (Sederhana: (Mean - Min) / Std)
    skew = (avg - mn) / std if std != 0 else 0
    
    return {
        "avg": round(avg, 3),
        "max": mx,
        "min": mn,
        "std": round(std, 4),
        "cv": round(cv, 4),
        "skew": round(skew, 4)
    }
    
@bp.route('/weather-data/station/<int:station_id>', methods=['GET'])
def get_weather_list(station_id):
    # 1. INIT DATABASE
    project_db = request.headers.get(rh.PROJECT_DB)
    has_db, error = rh.init(project_db)
    if not has_db: 
        abort(400, error)

    # 2. TANGKAP KEYWORD FILTER DARI FRONTEND
    # Asumsinya parameter yang dikirim bernama 'filter' (standar Vue/Vuetify)
    search_keyword = request.args.get('filter', '') 

    # 3. BUAT KONDISI SINKRONISASI
    # Base kondisi: Harus di stasiun yang sama
    condition = (WeatherDailyData.station == station_id)

    # Jika user memilih Tahun/Bulan/Tanggal, tambahkan ke kondisi agregat
    if search_keyword:
        # Replikasi logika pencarian di get_data_list (OR condition)
        condition = condition & (
            WeatherDailyData.date.contains(search_keyword) 
        )

    # 4. EKSEKUSI AGREGAT DENGAN KONDISI YANG SUDAH TER-FILTER
    stats_query = WeatherDailyData.select(
        # --- PCP ---
        fn.AVG(WeatherDailyData.pcp).alias('avg_pcp'), 
        fn.MAX(WeatherDailyData.pcp).alias('max_pcp'), 
        fn.MIN(WeatherDailyData.pcp).alias('min_pcp'), 
        fn.SUM(WeatherDailyData.pcp * WeatherDailyData.pcp).alias('sum_sq_pcp'), 
        fn.COUNT(WeatherDailyData.pcp).alias('count_pcp'),
        
        # --- WND ---
        fn.AVG(WeatherDailyData.wnd).alias('avg_wnd'), 
        fn.MAX(WeatherDailyData.wnd).alias('max_wnd'), 
        fn.MIN(WeatherDailyData.wnd).alias('min_wnd'), 
        fn.SUM(WeatherDailyData.wnd * WeatherDailyData.wnd).alias('sum_sq_wnd'), 
        fn.COUNT(WeatherDailyData.wnd).alias('count_wnd'),
        
        # --- HMD ---
        fn.AVG(WeatherDailyData.hmd).alias('avg_hmd'), 
        fn.MAX(WeatherDailyData.hmd).alias('max_hmd'), 
        fn.MIN(WeatherDailyData.hmd).alias('min_hmd'), 
        fn.SUM(WeatherDailyData.hmd * WeatherDailyData.hmd).alias('sum_sq_hmd'), 
        fn.COUNT(WeatherDailyData.hmd).alias('count_hmd'),
        
        # --- TMP MAX ---
        fn.AVG(WeatherDailyData.tmp_max).alias('avg_tmp_max'), 
        fn.MAX(WeatherDailyData.tmp_max).alias('max_tmp_max'), 
        fn.MIN(WeatherDailyData.tmp_max).alias('min_tmp_max'), 
        fn.SUM(WeatherDailyData.tmp_max * WeatherDailyData.tmp_max).alias('sum_sq_tmp_max'), 
        fn.COUNT(WeatherDailyData.tmp_max).alias('count_tmp_max'),
        
        # --- TMP MIN (Sudah diperbaiki mapping-nya) ---
        fn.AVG(WeatherDailyData.tmp_min).alias('avg_tmp_min'), 
        fn.MAX(WeatherDailyData.tmp_min).alias('max_tmp_min'), 
        fn.MIN(WeatherDailyData.tmp_min).alias('min_tmp_min'), 
        fn.SUM(WeatherDailyData.tmp_min * WeatherDailyData.tmp_min).alias('sum_sq_tmp_min'), 
        fn.COUNT(WeatherDailyData.tmp_min).alias('count_tmp_min'),
        
        # --- SLR (Sudah diperbaiki mapping-nya) ---
        fn.AVG(WeatherDailyData.slr).alias('avg_slr'), 
        fn.MAX(WeatherDailyData.slr).alias('max_slr'), 
        fn.MIN(WeatherDailyData.slr).alias('min_slr'), 
        fn.SUM(WeatherDailyData.slr * WeatherDailyData.slr).alias('sum_sq_slr'), 
        fn.COUNT(WeatherDailyData.slr).alias('count_slr')
    ).where(condition).dicts().first()

    # 5. Tentukan kolom mana yang bisa dicari via search box (Helper)
    cols_to_search = [WeatherDailyData.date, WeatherDailyData.pcp, WeatherDailyData.tmp_max]

    # 6. PANGGIL HELPER (Helper otomatis akan membaca request.args.get('filter'))
    data = DefaultRestMethods.get_data_list(
        WeatherDailyData, 
        # filter_expr=(WeatherDailyData.station == station_id), # Biarkan helper memproses search_cols secara internal
        filter_expr=condition,
        search_cols=cols_to_search,
        default_sort='date'
    )
    
    # 7. Format Date
    for row in data['items']:
        if isinstance(row.get('date'), (date, datetime)):
            row['date'] = row['date'].strftime('%Y-%m-%d')

    # 8. Gabungkan dan kirim (Pastikan 'tmp' dimasukkan agar sinkron dengan UI)
    return jsonify({
        **data,
        'aggregates': {
            "pcp": calculate_stats(stats_query, 'pcp'),
            "wnd": calculate_stats(stats_query, 'wnd'),
            "hmd": calculate_stats(stats_query, 'hmd'),
            "tmp_max": calculate_stats(stats_query, 'tmp_max'),
            "tmp_min": calculate_stats(stats_query, 'tmp_min'),
            "slr": calculate_stats(stats_query, 'slr')
        }
    })
    
@bp.route('/weather-data/station/<int:station_id>/filtered-chart', methods=['GET'])
def get_filtered_chart_data(station_id):
    project_db = request.headers.get(rh.PROJECT_DB)
    rh.init(project_db)
    
    # Ambil filter yang sama dengan yang dipakai tabel
    search_keyword = request.args.get('filter', '') 
    
    # Filter base
    condition = (WeatherDailyData.station == station_id)
    if search_keyword:
        condition = condition & (WeatherDailyData.date.contains(search_keyword))
    
    # Ambil SEMUA data (tanpa .paginate())
    query = WeatherDailyData.select().where(condition).order_by(WeatherDailyData.date)
    
    items = [model_to_dict(m) for m in query]
    for row in items:
        if isinstance(row.get('date'), (date, datetime)):
            row['date'] = row['date'].strftime('%Y-%m-%d')
            
    rh.close()
    return jsonify(items)
    