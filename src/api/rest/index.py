from . import (setup, aquifer, auto_complete, basin, change,  channel, climate, 
               decision_table, definitions, gwflow, hru, hru_lte, 
               hru_parm_db, hydrology, init, lum, ops, recall, regions, 
               reservoir, routing_unit, salts, soils, structural, 
               water_rights, vizdata)

# Masukkan ke dalam list
all_blueprints = [
    setup.bp, aquifer.bp, auto_complete.bp, basin.bp, change.bp,  channel.bp, climate.bp,
    decision_table.bp, definitions.bp, gwflow.bp, hru.bp, hru_lte.bp, 
    hru_parm_db.bp, hydrology.bp, init.bp, lum.bp, ops.bp, recall.bp, 
    regions.bp, reservoir.bp, routing_unit.bp, salts.bp, soils.bp, 
    structural.bp, water_rights.bp, vizdata.bp
]