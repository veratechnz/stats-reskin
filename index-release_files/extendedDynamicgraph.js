var templateInfo=null;
var templateInfoList=null;
var chart;
var exportURL='/layouts/statistics/DynamicChartExport.aspx';
var dynamicOptions = null;
var dynamicChartConfigURL="";
var commonConfigURL="HighChartCommonConfig.JSON";
// var baseOptions = null;
//Disable async call for ajax request. this is implemented because more than one chart was not loading dynamically in same page
$.ajaxSetup({
    async: false
});

    //Method to overridde the chart attributes based on selected chart
     function updateChartAttributes(dynamicOptions, baseOptions) {
                  $.each(dynamicOptions, function (i, item) {
                    if (baseOptions[i] != 'undefined' && baseOptions[i] != null) {
                        baseOptions[i] = dynamicOptions[i];
                    }
                     else {
                         baseOptions[i] =  dynamicOptions[i];
                   }
                });

    }

    //Method to set sitcore template field vlaues for chart attributes
    function setTemplateValues(baseOptions, templateInfo) {
             baseOptions.chart.renderTo = templateInfo.ScId;
             baseOptions.chart.height=templateInfo.Height;
             baseOptions.chart.width=templateInfo.Width;
             baseOptions.title.text = templateInfo.Title;
             baseOptions.subtitle.text = templateInfo.SubTitle;
             baseOptions.xAxis.title.text = templateInfo.XAxisTitle;
             baseOptions.xAxis.allowDecimals = templateInfo.AllowDecimals;
             baseOptions.xAxis.startOnTick = templateInfo.StartOnTick;
             baseOptions.xAxis.labels.step = templateInfo.Step;
             baseOptions.yAxis.allowDecimals = templateInfo.AllowDecimals;
             baseOptions.credits.text = (templateInfo.SourceText == '' ) ? 'Source: Statistics New Zealand' : templateInfo.SourceText;
             baseOptions.credits.href = (templateInfo.SourceLink == '') ? 'http://www.stats.govt.nz' : templateInfo.SourceLink;
             baseOptions.credits.style.cursor = (templateInfo.SourceLink == '') ? 'default' : 'pointer';
             baseOptions.legend.reversed = (templateInfo.SeriesType == 'bar') ? true : false;
             baseOptions.legend.enabled = (templateInfo.EnableLegend == 'true')? true : false;
             baseOptions.labels.items[0].html = templateInfo.YAxisTitle;

             if(templateInfo.BoxplotThreshold == '' || templateInfo.BoxplotThresholdTitle == '')
             {
              //delete plotlines attribute from options, if threshold value and title is empty
                 delete baseOptions.yAxis.plotLines;                 
              }
              else if(templateInfo.SeriesTypeText.toLowerCase() != "line dualaxes")
              {
                 baseOptions.yAxis.plotLines[0].value = templateInfo.BoxplotThreshold;  
                 baseOptions.yAxis.plotLines[0].label.text = templateInfo.BoxplotThresholdTitle;
             }
             //set colors and export functionality     
             var clrs = templateInfo.Colors.split('|');
             baseOptions.colors = clrs;
             baseOptions.lang.exportButtonTitle = 'Export Graph';
             baseOptions.exporting.url = exportURL;
             baseOptions.exporting.filename = templateInfo.ExportId;
             baseOptions.exporting.width = templateInfo.Width;           
           
    }
    
    //method to get data from CSV file and create chart
    function getDataAndCreateChart(templateInfo, baseOptions)
    {
        $.get(templateInfo.DataUrl)
         .done(function (data) {
             setTemplateValues(baseOptions, templateInfo);
             if (templateInfo.SeriesType == "drilldown") {
                 loadDrilldownGraph(data, templateInfo, baseOptions);
             }
             else {
                 //Ignore setting yaxis min value for area type chart, since it has to be pushed to array
                 if (templateInfo.YAxisStart && templateInfo.SeriesType != "area") {
                     //adding the yaxis min value here
                     baseOptions.yAxis.min = parseFloat(templateInfo.YAxisStart);
                 }
                 if (templateInfo.YAxisEnd) {
                     //adding the yaxis max value here
                     baseOptions.yAxis.max = parseFloat(templateInfo.YAxisEnd);
                 }
                 //if chart type is area, set only the zoom type and change the tooltip format
                 if (templateInfo.SeriesType == "area") {
                     if (templateInfo.YAxisStart) {
                         //adding the yaxis min value here
                         baseOptions.yAxis.min.push(parseFloat(templateInfo.YAxisStart));
                     }
                     baseOptions.chart.zoomType = "x";
                     baseOptions.tooltip.shared = true;
                     var timeSeriesToolTipFormatter = {
                         formatter: function () {
                             var d = new Date(this.x);
                             var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                             var s = '<b>' + monthNames[d.getMonth()] + ' ' + d.getFullYear() + '</b>';
                             jQuery.each(this.points, function (i, point) {
                                 s += '<br/>' + point.series.name + ': ' + point.y;
                             });

                             return s;
                         }
                     }
                     baseOptions.tooltip.formatter = timeSeriesToolTipFormatter.formatter;
                 }
                 else if (templateInfo.SeriesType == "boxplot") {
                     var boxOptions = {
                         series: [{
                             name: templateInfo.XAxisTitle,
                             tooltip: {
                                 headerFormat: '<em>' + templateInfo.XAxisTitle + ' {point.key}</em><br/>'
                             }
                         }]

                     }
                     baseOptions.series = boxOptions.series;
                     baseOptions.chart.type = templateInfo.SeriesType;
                 }
                 else if (templateInfo.SeriesType == "columnwitherrorbars") {
                     createSeriesForColumnErrorBar(data);
                 }
                 else if (templateInfo.SeriesType == "bar") {
                     baseOptions.chart.type = templateInfo.SeriesType;
                     baseOptions.yAxis.title.text = templateInfo.XAxisTitle;
                     baseOptions.xAxis.title.text = '';
                     if (templateInfo.SeriesTypeText.toLowerCase() == "stacked bar") {
                         var stackedBarTooltips = {
                             tooltip: {
                                 headerFormat: '<b>{point.key}</b><br/>',
                                 pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                             }
                         }
                         baseOptions.tooltip = stackedBarTooltips.tooltip;
                     }
                     if (templateInfo.SeriesTypeText.toLowerCase() == "bar") {
                         var barTooltips = {
                             tooltip: {
                                 headerFormat: '<b>{point.key}</b><br/>',
                                 pointFormat: '{series.name}: {point.y}'
                             }
                         }
                         baseOptions.tooltip = barTooltips.tooltip;
                     }
                 }
                 else if (templateInfo.SeriesType == "column") {
                     baseOptions.chart.type = templateInfo.SeriesType;
                     if (templateInfo.SeriesTypeText.toLowerCase() == "stacked column") {
                         var stackedColumnTooltips = {
                             tooltip: {
                                 headerFormat: '<b>{point.key}</b><br/>',
                                 pointFormat: '{series.name}: {point.y:.1f}<br/>Total: {point.stackTotal}'
                             }
                         }
                         baseOptions.tooltip.headerFormat = stackedColumnTooltips.tooltip.headerFormat;
                         baseOptions.tooltip.pointFormat = stackedColumnTooltips.tooltip.pointFormat;
                     }
                     else {
                         var columnTooltips = {
                             tooltip: {
                                 headerFormat: '<b>{point.key}</b><br/>',
                                 pointFormat: '{series.name}: {point.y:.1f}<br/>'
                             }
                         }
                         baseOptions.tooltip.headerFormat = columnTooltips.tooltip.headerFormat;
                         baseOptions.tooltip.pointFormat = columnTooltips.tooltip.pointFormat;                       
                     }
                 }
                 else if (templateInfo.SeriesTypeText.toLowerCase() == "line dualaxes") {
                     baseOptions.chart.type = templateInfo.SeriesType;
                     //set secondary yAxis and its text and label color
                     baseOptions.yAxis[1].title.text = templateInfo.SecondaryYAxisTitle;
                     baseOptions.yAxis[0].title.style.color = Highcharts.getOptions().colors[1];
                     baseOptions.yAxis[0].labels.style.color = Highcharts.getOptions().colors[0];
                     baseOptions.yAxis[1].title.style.color = Highcharts.getOptions().colors[0];
                     baseOptions.yAxis[1].labels.style.color = Highcharts.getOptions().colors[1];
                 }
                 else if (templateInfo.SeriesType == "spline") {
                     baseOptions.chart.type = templateInfo.SeriesType;
                 }
                 else if (templateInfo.SeriesType == "columnline") {
                     baseOptions.chart.type = "";
                 }
                 else if (templateInfo.SeriesType == "line") {
                     baseOptions.chart.type = templateInfo.SeriesType;
                 }
                 else {
                     baseOptions.chart.type = templateInfo.SeriesType;
                     Highcharts.setOptions({
                         tooltip: {
                             style: {
                                 font: '8pt Arial'
                             },
                             formatter: function () {
                                 return (this.x + '<br/><span style="color: ' + this.series.color + '">' + this.series.name + '</span>: <b>' + this.y + '</b>');
                             }
                         }
                     });
                 }
                 if (templateInfo.SeriesType != "columnwitherrorbars") {
                     baseOptions.data.csv = data;
                 }
             }

             // delaying 1 sec, since 3 ajax call has to happen before graph gets generated.
             setTimeout(function () {
                 var chart = new Highcharts.Chart(baseOptions);
                 //disable marker and set dual y-axis
                 if (templateInfo.SeriesTypeText.toLowerCase() == "line dualaxes") {
                     disablemarkerForDualAxis(chart);
                 }
                 else if (templateInfo.SeriesType == "columnline") {
                     setDifferentChartTypeForEachSeries(chart);
                 }
             }, 1000); //1000ms = 1s
         })
         .fail(function (xhr, status) {
             console.log(xhr.responseText);
             console.log("Error in loading selected chart config file.");
         });
    }

    //cloumn line chart
    function setDifferentChartTypeForEachSeries(chart)
    {
    // Set yaxis and disable marker
       if(chart.series.length == 2) 
       {
            chart.series[0].update({
                type: 'column',
                zIndex: 1,
                marker: {
                    enabled: false
                }
            });
            chart.series[1].update({
                type: 'line',
                zIndex: 2,
                marker: {
                    enabled: false,
                    lineWidth: 2
                }
            });
        }   
    }

   function disablemarkerForDualAxis(chart)
   {
      // Set yaxis and disable marker
       $.each(chart.series, function(index, value ) {
            chart.series[index].update({
                yAxis:index,
                marker: {
                    enabled: false
                }
            });
        });       

   }
   function createSeriesForColumnErrorBar(data)
   {
                     //delete data attribute, which is not required for this chart type
                      delete baseOptions.data;
                      //Clone the base config of column and error series from config file to generate dynamic series of data
                      var columnSeries = baseOptions.series[0];
                      var errorSeries =  baseOptions.series[1];
                      //delete existing series from base options
                      if (baseOptions.series.length > 0) {                            
                            baseOptions.series.length = 0;
                      }
                          // Split the lines
                          var lines = data.split('\n');
                              
                        // Iterate over the lines and generate the series
                        $.each(lines, function(lineNo, line) {
                            var series;                     
                            var items = line.split(',');
                            if(items.length >1){                            
                            // header line containes categories
                            if (lineNo == 0) {
                                $.each(items, function(itemNo, item) {
                                    if (itemNo > 0) { 
                                    baseOptions.xAxis.categories.push(item);
                                    }
                                });
                            }        
                            // the rest of the lines contain data with their name in the first position
                            else {
                                    var series;
                                    //assign the cloned series to make use of basic configuration settings from config file
                                    if(items[0] == 'error') {
                                     // Deep copy 
                                      series = $.extend(true, {}, errorSeries);
                                      series.tooltip.pointFormat='Error range: {point.low}-{point.high}<br/>';
                                    }
                                    else{
                                    // Deep copy 
                                     series = $.extend(true, {}, columnSeries);
                                     series.tooltip.pointFormat='<span style="font-weight: bold; color: {series.color}">{series.name}</span>: <b>{point.y:.1f}</b><br/>';
                                    }
                                    series.id = lineNo;
                                   $.each(items, function(itemNo, item) {
                                       //add error series                             
                                        if(items[0] == 'error') {
                                            if (itemNo > 0) { 
                                                var errorRange = item.split(';');
                                                 series.data.push([parseFloat(errorRange[0]),parseFloat(errorRange[1])]); 
                                            }
                                        }
                                        else {                                       
                                           if (itemNo == 0) {  
                                             series.name = item;                                                                              
                                           }
                                           else {
                                            series.data.push(parseFloat(item)); 
                                           }
                                        }
                                });
                                baseOptions.series.push(series);   
                            }
                         }
                   });
   }

   function loadDrilldownGraph(data, templateInfo, baseOptions) {
     var mainData = [];
     var drilldownSeries = [];
     Highcharts.data({
        csv: data,
        itemDelimiter: '\t',
        parsed: function (columns) {
                $.each(columns[0], function (i, value) {
                    var elem = value.split(',');
                    if(elem.length > 0) {
                        mainData.push({ 
                            name: elem[0], 
                            y: parseFloat(elem[1]),
                            drilldown: elem[0]
                           });
                     }
                });
                $.each(templateInfo.SubData, function (key, value) {
                     var id='';
                     //parse the value as number to populate in chart and map it to the same array object
                        value = value.map(function(elem) {
                                    if(elem.length > 0){ 
                                        elem[1] = parseFloat(elem[1]);
                                        }
                                 return elem;
                        });
                        if(mainData.length > key)
                        {
                          id = mainData[key].name;
                        }
                        drilldownSeries.push({
                            name: id,
                            id: id,
                            data: value
                        });
                });
        }
    });

    baseOptions.series[0].data = mainData;
    baseOptions.series[0].name = templateInfo.Title;
    baseOptions.drilldown.series = drilldownSeries; 
    //delete data attribute from options, since highchart should not contain data attribute for drilldown 
    delete baseOptions.data;

    var drilldownToolTipFormatter = {
                                formatter: function () {
                                    var point = this.point, s;
                                    if (point.drilldown) {
                                        s = templateInfo.Title + '<br/><span style="color: ' + this.point.color + '">' + this.key + '</span>: <b>' + this.y + '</b><br/>';
                                        s += 'Click to view ' + this.key;
                                    }
                                    else {
                                        s = this.series.name + '<br/><span style="color: ' + this.series.color + '">' + this.key + '</span>: <b>' + this.y + '</b><br/>';
                                        s += 'Click back button to return to ' + templateInfo.Title;
                                    }
                                    return s;
                                }
                              }
      baseOptions.tooltip.formatter = drilldownToolTipFormatter.formatter;

    }

function embedGraph($this) {
      var embedId = $this.options.chart.renderTo;
       embedId = embedId.substring(10);
       window.open('/layouts/statistics/DynamicChartShare.aspx?guid=' + embedId, '_blank', 'toolbar=no, menubar=no, scrollbars=no,resizable=no,width=500,height=150,left=600,top=400,directories=no,status=no,location=no');
}

function initializeExtendedGraph() {
 //Add embedded options under export menu options
    Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push(
           { separator: true },
           { text: 'Embed this graph',
             onclick: function () {
                          embedGraph(this);  
             }
        });

   //if the graph is used in a content page then set the default of the export so that an image isn't created into sitecore media library
    $.each(templateInfoList, function(index, value ) {
       templateInfo = value;

        if (!templateInfo.ExportToMediaLibrary) {
            exportURL = 'http://export.highcharts.com';
        }    

      //get base configuration for chart
        //commonConfigURL = templateInfo.ChartConfigPath + "HighChartCommonConfig.JSON";
		commonConfigURL = "/DataFiles/HighchartConfig/HighChartCommonConfig.JSON";
		
        $.getJSON(commonConfigURL, {
            tagmode: "any",
            format: "json",
            contentType: "application/json; charset=utf-8"
        })
        .done(function (baseConfig) {
            baseOptions = baseConfig;
             //get dynamic configuration based on chart selection
               if(templateInfo.SeriesType != null)
               {
                    dynamicChartConfigURL = "/DataFiles/HighchartConfig/"; //templateInfo.ChartConfigPath;
                    dynamicChartConfigURL += templateInfo.SeriesTypeText + ".JSON"; 
                    $.getJSON(dynamicChartConfigURL, {
                        tagmode: "any",
                        format: "json"
                    })
                    .done(function (dynamicAttributes) {
                        // update the attributes dynamically based on selected chart
                        updateChartAttributes(dynamicAttributes, baseOptions);
                        //create chart and load the data
                        getDataAndCreateChart(templateInfo, baseOptions);
                    })
                    .fail(function  (xhr, status) {
                        console.log(xhr.responseText);
                        if(xhr.status == '404')
                        {
                        console.log("File not found.");
                        //Though the dynamic attribute file is not created for selected chart type, create chart based on base configuration and load the data
                        getDataAndCreateChart(templateInfo, baseOptions);
                        }
                        else
                        {
                         console.log("Error in loading selected chart config file.");
                        }
                    });
                }
        })
        .fail(function (xhr, status) {
            console.log(xhr.responseText);
                if(xhr.status == '404')
                {
                console.log("File not found.");
                }
                else
                {
                  console.log("Error in loading base chart config file.");
                }
        });
      });
//Enable async call for ajax request
    $.ajaxSetup({
        async: true
    });
}

 