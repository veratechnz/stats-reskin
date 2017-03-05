var scid;
var chart;
var charts = new Array();
var chartcount = 0;

function callback($this) {
    var embedId = $this.options.chart.renderTo;
    embedId = embedId.substring(10);
    var img = $this.renderer.image('/statistics/statsMain/Images/embedbuttonstatic.png', $this.chartWidth - 86, 10, 24, 20);
    img.css({ 'cursor': 'pointer' });
    img.attr({ 'title': 'copy and paste this HTML to embed graph on your website. ' });
    img.attr({ 'id': 'embedImage' });
    img.on('click', function () {
        window.open('/layouts/statistics/DynamicChartShare.aspx?guid=' + embedId, '_blank', 'toolbar=no, menubar=no, scrollbars=no,resizable=no,width=500,height=150,left=600,top=400,directories=no,status=no,location=no');
    });
    img.on('mouseover', function () {
        img.attr({ 'src': '/statistics/statsMain/Images/rolloverembedbutton.png' });
    });
    img.on('mouseout', function () {
        img.attr({ 'src': '/statistics/statsMain/Images/embedbuttonstatic.png' });
    });
    img.add();
}

function setChart(name, categories, data, color, chartId) {

    charts[chartId].xAxis[0].setCategories(categories, false);
    charts[chartId].series[0].remove(false);
    charts[chartId].addSeries({
        name: name,
        data: data,
        color: color || 'white'
    }, false);
    charts[chartId].redraw();

}

function dynamicGraphJS(colours, width, startOnTick, dataUrl, displayName, seriesType, subTitle, yAxisTitle, xAxisTitle, scId, exportId, step, allowDecimals, sdmxQuery, sourceText, sourceLink, legendDisplay) {

    if (exportId != null)
        scid = exportId;
    else if (scId != null && scId.length >= 10)
        scid = scId.substring(10);

    var clrs = colours.split('|');

    var crsr = 'pointer';
    if (sourceLink == '')
        crsr = 'default';

    var reverselegend = false;
    if (seriesType == 'bar')
        reverselegend = true;

    if (sourceText == null || sourceText == '')
	sourceText = 'Source: Statistics New Zealand';

    if (sourceLink == null)
	sourceLink = 'http://www.stats.govt.nz';


    var options = {
        colors: [],
        credits: {
            text: sourceText,
            href: sourceLink,
            style: {
                cursor: crsr
            }
        },
        tooltip: {
            style: {
                font: '8pt Arial'
            },
            formatter: function () {
                return (this.x + '</br><span style="color: ' + this.series.color + '">' + this.series.name + '</span>: <b>' + this.y + '</b>');
            }
        },
        chart: {
            renderTo: scId,
	        borderColor: 'white',
            defaultSeriesType: seriesType
        },
        lang: {
            exportButtonTitle: 'Export Graph'
        },
        title: {
            text: displayName,
            style: {
                color: '#000',
                fontFamily: 'Arial',
                fontSize: '9pt',
                fontWeight: 'bold'
            },
            margin: 30
        },
        subtitle: {
            style: {
                color: '#000',
                fontFamily: 'Arial',
                fontSize: '9pt'
            },
            text: subTitle
        },
        legend: {
            enabled: legendDisplay,
            align: 'center',
            y: -10,
            borderWidth: 0,
            itemHiddenStyle: {
                color: '#707070'
            },
            reversed: reverselegend
        },
        labels: {
            items: [
                {
                    html: yAxisTitle,
                    style: {
                        color: '#000',
                        fontSize: '8pt',
                        fontFamily: 'Arial',
                        left: '2px',
                        top: '-18px'
                    }
                }]
        },
        exporting: {
            url: '/layouts/statistics/DynamicChartExport.aspx',
            filename: exportId,
            width: width
        },
        xAxis: {
            allowDecimals: allowDecimals,
            startOnTick: startOnTick,
            tickmarkPlacement: 'on',
            categories: [],
            lineColor: '#000',
            tickColor: '#000',
            labels: {
                style: {
                    color: '#000',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                },
                align: 'right',
                x: 0,
                step: step
            },
            title: {
                style: {
                    color: '#000',
                    fontWeight: 'normal',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                },
                text: xAxisTitle
            }
        },
        yAxis: {
            allowDecimals: allowDecimals,
            plotLines: [{
                color: '#000',
                width: 1,
                value: 0,
                zIndex: 3
            }],
            lineColor: '#000',
            lineWidth: 1,
            labels: {
                style: {
                    color: '#000',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                }
            },
            title: {
                style: {
                    color: '#000',
                    fontWeight: 'normal',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                },
                text: ''
            },
            maxPadding: 0.01,
            minPadding: 0.01
        },
        plotOptions: {
            line: {
                lineWidth: 2,
                dashStyle: 'Solid',
                borderWidth: 0,
                shadow: false,
                marker: {
                    enabled: false,
                    states: {
                        hover: {
                            enabled: true
                        }
                    },
                    radius: 4
                }
            },
            column: {
                pointPadding: 0,
				borderWidth: 0,
				shadow: false,
                groupPadding: 0.1
            },
			bar: {
                pointPadding: 0,
				borderWidth: 0,
				shadow: false,
                groupPadding: 0.1
            }
        },
        series: []
    };

    //adding the colors here
    jQuery.each(clrs, function (itemNo, clr) {
        options.colors.push(clr);
    });

    //if graph-type is bar then we need to adjust the x-axis labels slightly
    if (seriesType.toLowerCase() == 'bar') {
        options.xAxis.labels.x = -8;
        options.xAxis.title.text = '';
        options.yAxis.title.text = xAxisTitle;
    }
    else if (seriesType.toLowerCase() == 'column') {
        options.xAxis.labels.align = 'center';
    } //else if a line graph then adjust accordingly
    else if (seriesType.toLowerCase() == 'line') {
        options.xAxis.labels.x = 10;
    }

    //if the graph is used in a content page then set the default of the export so that an image isn't created into sitecore media library
    if (exportId == null) {
        options.exporting.url = 'http://export.highcharts.com';
    }

    //******************************************V
    //     $.getJSON("data.json", function(json)) {
    //    options.series = json;
    //    var chart = new Highcharts.chart(options);
    //    }
    if (sdmxQuery) {
        jQuery.support.cors = true; //force cross-site scripting
        jQuery.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "http://wdevsds03/SDMX.Service/Service1.svc/GetData",
            data: '{"sdmxQueryUrl": "' + sdmxQuery + '"}',
            dataType: "json",
            success: function (data) {
                jQuery.each(data, function (i, item) {
                    var srs = {
                        data: []
                    };

                    jQuery.each(item.xCoordinates, function (x, xCoord) {
                        options.xAxis.categories.push(xCoord);
                    });

                    srs.name = item.categoryName;

                    jQuery.each(item.yCoordinates, function (y, yCoord) {
                        srs.data.push(parseInt(yCoord));
                    });

                    options.series.push(srs);
                });

                var chart = new Highcharts.Chart(options, callback);
            },
            error: function (x, s, e) {
                alert("error: x=" + x + "s=" + s + "e=" + e);
            }
        });
        //*******************************************T
    } else { //code below if the sdmx query is not required

        //adding the data here
    jQuery.get(dataUrl, function (data) {
        // Split the lines
        var lines = data.split('\n');
        jQuery.each(lines, function (lineNo, line) {

            //code here to replace any commas within quotes with html ascii
            //this is so that when we split the data then it splits properly
            var lineTemp = line;
            var matches = lineTemp.match(/".+?"/g);

            if (matches != null) {
                jQuery.each(matches, function (matchNo, match) {
                    var lineReplace = match.replace(/,/g, '&#44;'); //&#44;
                    //replace quotes at start and end of string.
                    lineReplace = lineReplace.replace(/"/g, "");
                    line = line.replace(match, lineReplace);
                });
            }

            //split the line into data segments
            var items = line.split(',');

            // header line containes categories
            if (lineNo == 0) {
                jQuery.each(items, function (itemNo, item) {
                    if (itemNo > 0) {
                        //code here to replace &#44; back to commas
                        item = item.replace(/&#44;?/g, ',');
                        //push the data
                        options.xAxis.categories.push(item);
                    }
                });
            }
            // the rest of the lines contain data with their name in the first position
            else if (line.length > 0) {
                var series = {
                    data: []
                };
                jQuery.each(items, function (itemNo, item) {
                    if (itemNo == 0) {
                        item = item.replace(/&#44;?/g, ',');
                        series.name = item;
                    } else {
                        if (item != '')
                            series.data.push(parseFloat(item));
                        else
                            series.data.push(null);

                    }
                });

                options.series.push(series);
            }
        });

        var chart = new Highcharts.Chart(options, callback);
    });
    }
}


function drilldownGraphJS(colours, width, startOnTick, dataUrl, displayName, seriesType, subTitle, yAxisTitle, xAxisTitle, scId, exportId, step, allowDecimals, drillData, sourceText, sourceLink, legendDisplay) {
    if (exportId != null)
        scid = exportId;
    else if (scId != null && scId.length >= 10)
        scid = scId.substring(10);

    var clrs = colours.split('|');

    var crsr = 'pointer';
    if (sourceLink == '')
        crsr = 'default';
    
    var options = {
        colors: [],
        credits: {
            text: sourceText,
            href: sourceLink,
            style: {
                cursor: crsr
            }
        },
        tooltip: {
            style: {
                font: '8pt Arial'
            },
            formatter: function () {
                var point = this.point, s;
                if (point.drilldown) {
                    s = displayName + '</br><span style="color: ' + this.point.color + '">' + this.x + '</span>: <b>' + this.y + '</b><br/>';
                    s += 'Click to view ' + point.category;
                }
                else {
                    s = this.series.name + '</br><span style="color: ' + this.series.color + '">' + this.x + '</span>: <b>' + this.y + '</b><br/>';
                    s += 'Click to return to ' + displayName;
                }
                return s;
            }
        },
        chart: {
            renderTo: scId,
	        borderColor: 'white',
            defaultSeriesType: seriesType
        },
        lang: {
            exportButtonTitle: 'Export Graph'
        },
        title: {
            text: displayName,
            style: {
                color: '#000',
                fontFamily: 'Arial',
                fontSize: '9pt',
                fontWeight: 'bold'
            },
            margin: 30
        },
        subtitle: {
            style: {
                color: '#000',
                fontFamily: 'Arial',
                fontSize: '9pt'
            },
            text: subTitle
        },
        legend: {
            enabled: legendDisplay,
            align: 'center',
            y: -10,
            itemHiddenStyle: {
                color: '#707070'
            },
            borderWidth: 0
        },
        labels: {
            items: [
                {
                    html: yAxisTitle,
                    style: {
                        color: '#000',
                        fontSize: '8pt',
                        fontFamily: 'Arial',
                        left: '2px',
                        top: '-18px'
                    }
                }]
        },
        exporting: {
            url: '/layouts/statistics/DynamicChartExport.aspx',
            filename: exportId,
            width: width
        },
        xAxis: {
            allowDecimals: allowDecimals,
            startOnTick: startOnTick,
            tickmarkPlacement: 'on',
            categories: [],
            lineColor: '#000',
            tickColor: '#000',
            labels: {
                style: {
                    color: '#000',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                },
                align: 'right',
                x: 0,
                step: step
            },
            title: {
                style: {
                    color: '#000',
                    fontWeight: 'normal',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                },
                text: xAxisTitle
            }
        },
        yAxis: {
            allowDecimals: allowDecimals,
            plotLines: [{
                color: '#000',
                width: 1,
                value: 0,
                zIndex: 3
            }],
            lineColor: '#000',
            lineWidth: 1,
            labels: {
                style: {
                    color: '#000',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                }
            },
            title: {
                style: {
                    color: '#000',
                    fontWeight: 'normal',
                    fontSize: '8pt',
                    fontFamily: 'Arial'
                },
                text: ''
            },
            maxPadding: 0.01,
            minPadding: 0.01
        },
        plotOptions: {
            line: {
                lineWidth: 2,
                borderWidth: 0,
                shadow: false,
                dashStyle: 'Solid'
            },
            column: {
                pointPadding: 0,
				shadow: false,
				borderWidth: 0,
                groupPadding: 0.1,
                point: {
                    events: {
                        click: function () {
                            var drilldown = this.drilldown;
                            var chartId = this.id;
                            if (drilldown) { // drill down
                                setChart(drilldown.name, drilldown.categories, drilldown.data, drilldown.color, chartId);
                            } else { // restore to default view
                                drilldownGraphJS(colours, width, startOnTick, dataUrl, displayName, seriesType, subTitle, yAxisTitle, xAxisTitle, scId, exportId, step, allowDecimals, drillData, sourceText, sourceLink, legendDisplay);
                            }
                        }
                    }
                }
            }
        },
        series: []
    };

    //adding the colors here
    jQuery.each(clrs, function (itemNo, clr) {
        options.colors.push(clr);
    });

    //adding the data here
    jQuery.get(dataUrl, function (data) {
        // Split the lines
        var lines = data.split('\n');
        var series = {
            data: []

        };

        series.name = displayName;
        series.color = 'white'; //white so that the series name doesn't show the first data color

        jQuery.each(lines, function (lineNo, line) {
            var dataItem = {
                y: 0,
                drilldown: {
                    name: [],
                    categories: [],
                    data: [],
                    color: []
                },
                id: chartcount,
                color: clrs[lineNo]
            };

            var items = line.split(',');
            jQuery.each(items, function (itemNo, item) {
                if (itemNo > 0) {
                    dataItem.y = parseFloat(item); //read from data
                }
                else {
                    dataItem.drilldown.name.push(item);
                    options.xAxis.categories.push(item);
                }
            });

            //iterate through all the drill-down data
            var dataset = drillData[lineNo];
            if (dataset) {
                for (var i = 0; i < dataset.length; i++) {
                    var datapair = dataset[i];
                    dataItem.drilldown.categories.push(datapair[0]);
                    dataItem.drilldown.data.push(datapair[1]);
                }

                dataItem.drilldown.color.push(clrs[lineNo]);
                series.data.push(dataItem);
            }
            else {
                dataItem.drilldown.categories.push('error! data file not found!');
                dataItem.drilldown.data.push(0);
                dataItem.drilldown.color.push('white');
                series.data.push(dataItem);
            }

        });

        options.series.push(series);

        //if graph-type is bar then we need to adjust the x-axis labels slightly
        if (seriesType.toLowerCase() == 'bar') {
            options.xAxis.labels.x = -8;
            options.xAxis.title.text = '';
            options.yAxis.title.text = xAxisTitle;
        }
        else if (seriesType.toLowerCase() == 'column') {
            options.xAxis.labels.align = 'center';
        } //else if a line graph then adjust accordingly
        else if (seriesType.toLowerCase() == 'line') {
            options.xAxis.labels.x = 10;
        }

        //if the graph is used in a content page then set the default of the export so that an image isn't created into sitecore media library
        if (exportId == null) {
            options.exporting.url = 'http://export.highcharts.com';
        }

        var ddchart = new Highcharts.Chart(options, callback);
        charts[chartcount] = ddchart;
        chartcount = chartcount + 1;
    });
}


function timeSeriesGraphJS(colours, width, startOnTick, dataUrl, displayName, seriesType, subTitle, yAxisTitle, xAxisTitle, scId, exportId, step, allowDecimals, seriesData, sourceText, sourceLink, legendDisplay, yAxisStartValue) {

    if (exportId != null)
        scid = exportId;
    else if (scId != null && scId.length >= 10)
        scid = scId.substring(10);

    var clrs = colours.split('|');

    var crsr = 'pointer';
    if (sourceLink == '')
        crsr = 'default';

    if (sourceText == null || sourceText == '')
	sourceText = 'Source: Statistics New Zealand';

    if (sourceLink == null)
	sourceLink = 'http://www.stats.govt.nz';

var options = {
    colors: [],
    credits: {
        text: sourceText,
        href: sourceLink,
        style: {
            cursor: crsr
        }
    },
    tooltip: {
        style: {
            font: '8pt Arial'
        },
        shared: true,
        formatter: function () {
            var d = new Date(this.x);
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var s = '<b>' + monthNames[d.getMonth()] + ' ' + d.getFullYear() + '</b>';
            jQuery.each(this.points, function (i, point) {
                s += '<br/>' + point.series.name + ': ' + point.y;
            });

            return s;
        }
    },
    chart: {
        renderTo: scId,
        borderColor: 'white',
        zoomType: 'x',
        spacingRight: 20
    },
    lang: {
        exportButtonTitle: 'Export Graph'
    },
    title: {
        text: displayName,
        style: {
            color: '#000',
            fontFamily: 'Arial',
            fontSize: '9pt',
            fontWeight: 'bold'
        },
        margin: 30
    },
    subtitle: {
        style: {
            color: '#000',
            fontFamily: 'Arial',
            fontSize: '9pt'
        },
        text: subTitle
    },
    legend: {
        enabled: legendDisplay,
        itemHiddenStyle: {
            color: '#707070'
        }
    },
    labels: {
        items: [
                    {
                        html: yAxisTitle,
                        style: {
                            color: '#000',
                            fontSize: '8pt',
                            fontFamily: 'Arial',
                            left: '2px',
                            top: '-18px'
                        }
                    }]
    },
    exporting: {
        url: '/layouts/statistics/DynamicChartExport.aspx',
        filename: exportId,
        width: width
    },
    xAxis: {
        type: 'datetime',
        title: {
            text: null
        }
    },
    yAxis: {
        min: [], //parseFloat(yAxisStartValue),
        allowDecimals: allowDecimals,
        plotLines: [{
            width: 1,
            value: 0,
            zIndex: 3
        }],
        title: {
            text: ''
        }
    },
    plotOptions: {
        area: {
            fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                            [0, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
            },
            lineWidth: 1,
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true,
                        lineWidth: 1
                    }
                }
            },
            shadow: false,
            threshold: null
        }
    },
    series: []
};

    //adding the yaxis min value here
    if (yAxisStartValue)
        options.yAxis.min.push(parseFloat(yAxisStartValue));


    //adding the colors here
    jQuery.each(clrs, function (itemNo, clr) {
        options.colors.push(clr);
    });

    //if the graph is used in a content page then set the default of the export so that an image isn't created into sitecore media library
    if (exportId == null) {
        options.exporting.url = 'http://export.highcharts.com';
    }

    for (var i = 0; i < seriesData.length; i++) {
        var dataset = seriesData[i];
        var seriestmp = {
            type: 'area',
            name: [],
            data: []
        };
        for (var j = 0; j < dataset.length; j++) {
            if (j == 0) {
                var nameData = dataset[0];
                var nameValue = nameData[1];
                seriestmp.name.push(nameValue);
            }
            else {
                var datapair = dataset[j];
                var dt = datapair[0].split('/');
                var value;
                if (datapair[1] != '')
                    value = parseFloat(datapair[1]);
                else
                    value = null;
                    
                seriestmp.data.push([Date.UTC(dt[2], (dt[1] - 1), dt[0]), value]);     
            }
        }
        options.series.push(seriestmp);
    }

    var chart = new Highcharts.Chart(options, callback);

}
        
    