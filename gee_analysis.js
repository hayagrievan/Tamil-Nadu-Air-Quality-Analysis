/*******************************
 Tamil Nadu Air Quality Analysis (Optimized, No Dominant Pollutant, O3 Fixed)
*******************************/

// 1. Load Tamil Nadu districts (simplified for speed)
var districts = ee.FeatureCollection('FAO/GAUL/2015/level2')
                  .filter(ee.Filter.eq('ADM1_NAME', 'Tamil Nadu'))
                  .map(function(f){ return f.simplify(500); });
Map.setCenter(78.6569, 11.1271, 7);

// 2. District centroids for sampling
var districtPoints = districts.map(function(f){
  return ee.Feature(f.geometry().centroid())
           .set('District', f.get('ADM2_NAME'));
});

// 3. Time periods
var periods = {
  'Pre-COVID': ['2019-01-01', '2019-12-31'],
  'During-COVID': ['2020-01-01', '2020-12-31'],
  'Post-COVID': ['2021-01-01', '2022-12-31']
};

// 4. Gases (O3 min/max adjusted for visibility)
var gases = {
  'NO2': {collection:'COPERNICUS/S5P/OFFL/L3_NO2', band:'NO2_column_number_density', min:0.0, max:0.0002},
  'CO':  {collection:'COPERNICUS/S5P/OFFL/L3_CO', band:'CO_column_number_density', min:0.0, max:0.05},
  'SO2': {collection:'COPERNICUS/S5P/OFFL/L3_SO2', band:'SO2_column_number_density', min:0.0, max:0.0002},
  'O3':  {collection:'COPERNICUS/S5P/OFFL/L3_O3', band:'O3_column_number_density', min:0.10, max:0.18}, // adjusted
  'CH4': {collection:'COPERNICUS/S5P/OFFL/L3_CH4', band:'CH4_column_volume_mixing_ratio_dry_air', min:1750, max:1950}
};

// 5. AQI palette
var aqiPalette = ['#00e400','#ffff00','#ff7e00','#ff0000','#8f3f97'];

// 6. Master FeatureCollection
var masterFC = ee.FeatureCollection([]);

// 7. Function to get scaled AQI image
function getScaledAQI(gasName, startDate, endDate){
  var gas = gases[gasName];
  return ee.ImageCollection(gas.collection)
            .select(gas.band)
            .filterDate(startDate, endDate)
            .mean()
            .unmask()
            .clip(districts)
            .unitScale(gas.min, gas.max)
            .multiply(500)
            .rename('AQI');
}

// 8. Sample AQI at district centroids
function sampleDistrictAQI(img, periodName, gasName){
  var sampled = img.sampleRegions({
    collection: districtPoints,
    scale: 10000,
    geometries: true
  });
  return sampled.map(function(f){
    return ee.Feature(f.geometry(), {
      'District': f.get('District'),
      'Period': periodName,
      'Gas': gasName,
      'AQI': f.get('AQI')
    });
  });
}

// 9. Main loop: calculate mean AQI per gas per period
Object.keys(periods).forEach(function(periodName){
  var dates = periods[periodName];
  var gasImgs = [];
  
  Object.keys(gases).forEach(function(gasName){
    var img = getScaledAQI(gasName, dates[0], dates[1]);
    Map.addLayer(img, {min:0,max:500,palette:aqiPalette}, gasName + ' ' + periodName);
    gasImgs.push(img);
    
    var fc = sampleDistrictAQI(img, periodName, gasName);
    masterFC = masterFC.merge(fc);
  });
  
  // Combined max AQI image per period
  var combined = ee.ImageCollection(gasImgs).max().clip(districts);
  Map.addLayer(combined, {min:0,max:500,palette:aqiPalette}, 'Max AQI '+periodName);
});

// 10. Print master FeatureCollection
print('Master AQI FeatureCollection:', masterFC);

// 11. Charts
Object.keys(gases).forEach(function(gasName){
  var gasFC = masterFC.filter(ee.Filter.eq('Gas', gasName));
  var chart = ui.Chart.feature.groups({
    features: gasFC,
    xProperty: 'District',
    yProperty: 'AQI',
    seriesProperty: 'Period'
  }).setChartType('ColumnChart')
    .setOptions({
      title: gasName + ' AQI by District (Grouped by Period)',
      hAxis:{title:'District'},
      vAxis:{title:'AQI'},
      legend:{position:'top'},
      bar:{groupWidth:'80%'}
    });
  print(chart);
});

// By District example (Chennai)
var chennaiFC = masterFC.filter(ee.Filter.eq('District','Chennai'));
if(chennaiFC.size().gt(0)){
  var chennaiChart = ui.Chart.feature.groups({
    features: chennaiFC,
    xProperty:'Period',
    yProperty:'AQI',
    seriesProperty:'Gas'
  }).setChartType('ColumnChart')
    .setOptions({
      title:'AQI by Gas in Chennai (Grouped by Period)',
      hAxis:{title:'Period'},
      vAxis:{title:'AQI'},
      legend:{position:'top'},
      bar:{groupWidth:'80%'}
    });
  print(chennaiChart);
}

// 12. Export CSV
Export.table.toDrive({
  collection: masterFC,
  description:'TN_AirQuality_Analysis',
  fileFormat:'CSV'
});

// 13. Add AQI Legend
var legend = ui.Panel({style: {position: 'bottom-right', padding: '8px 15px'}});
legend.add(ui.Label({value:'AQI Scale', style:{fontWeight:'bold', fontSize:'16px', margin:'0 0 6px 0'}}));

var names = ['Good','Moderate','Unhealthy for SG','Unhealthy','Very Unhealthy'];
for (var i = 0; i < aqiPalette.length; i++){
  var colorBox = ui.Label({style:{backgroundColor: aqiPalette[i], padding:'8px', margin:'0 0 4px 0'}});
  var description = ui.Label({value:names[i], style:{margin:'0 0 4px 6px'}});
  var entry = ui.Panel({widgets:[colorBox, description], layout:ui.Panel.Layout.Flow('horizontal')});
  legend.add(entry);
}
Map.add(legend);