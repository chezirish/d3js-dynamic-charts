

//////////////////////////////////////////////////////////
function d3Chart (param, data, chartIndexSelected){

    // проверка parentSelector
    var selectedObj = null;
    if (param.parentSelector === null || param.parentSelector === undefined) {
        param.parentSelector = "body";
    };

    selectedObj = d3.select(param.parentSelector);
    if (selectedObj.empty()) {
        throw "Empty parent selector to append chart!";
    };

    //remove previous chart
    d3.select(param.parentSelector+"_d3_chart").remove();
    d3.select('.line-chart.tooltip').remove();

    var buildCategory = true;
    if (param.categories === undefined) {
        buildCategory = false;
    };

    if (param.width == 0) {param.width = parseInt(selectedObj.style('width'), 10);};
    if (param.height == 0) {param.height = parseInt(selectedObj.style('height'), 10);};

    var margin = param.margin || {top: 50, right: 40, bottom: 65, left: 50},
        width = param.width - margin.left - margin.right,
        height = param.height - margin.top - margin.bottom;

    // set the scale for the transfer of real values
    var xScale = (param.xColumnDate) ? d3.scaleTime().range([0, width]) : d3.scaleLinear().range([0, width]);
    var yScaleLeft = d3.scaleLinear().range([height, 0]);
    var yScaleRight = d3.scaleLinear().range([height, 0]);

    // definition of data range for conversion coord at scales
    var xMin=d3.min(data, function(d) {     
            return d[param.xColumn];
        }), xMax=d3.max(data, function(d) {
            return d[param.xColumn];
        }),
        yLeftMax=0, yRightMax=0;

    for (var j = 0, len1 = param.series.length; j < len1; j += 1) {
        tmpVal = d3.max(data, function(d) { return d[param.series[j].yColumn]; });
        if (param.series[j].yAxis == "left"){
            if (tmpVal>yLeftMax) {yLeftMax = tmpVal};
        };
        if (param.series[j].yAxis == "right"){
            if (tmpVal>yRightMax) {yRightMax = tmpVal};
        };
    };

    // если дата одна, то смещаем ее по центру оси X
    var dateMinOffset = new Date(xMin);
    dateMinOffset.setDate( dateMinOffset.getDate() - 1  );
    var dateMaxOffset = new Date(xMax);
    dateMaxOffset.setDate( dateMaxOffset.getDate() + 1  );

    if(data.length === 1 && param.xColumnDate){
        xScale.domain([dateMinOffset,dateMaxOffset]);
    } else {
        xScale.domain([xMin,xMax]);
    }
    
    yScaleLeft.domain([0,yLeftMax]);
    yScaleRight.domain([0,yRightMax]);


    // set axis
    if (param.xColumnDate) {
        var xAxis = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.timeFormat("%m.%Y"))
            .tickSize(10);
        //calculate count month in year on axis
        var xqViewMonth=Math.round(((xMax-xMin)/1000/60/60/24/30)/(width/23));
        if (xqViewMonth<1) {xqViewMonth=1};

        var monthNameFormat = d3.timeFormat("%m");
        /*var xAxis2 = d3.axisBottom(xScale)
         .ticks(d3.timeMonth,xqViewMonth).tickFormat(function(d) {
         var a = monthNameFormat(d);
         if (a == "01") {
         a = ""
         };
         return a;
         })
         .tickSize(2);*/
    } else {
        var xAxis = d3.axisBottom(xScale);
        if (width<300) xAxis.ticks(5);
    };

    var yAxisLeft = d3.axisLeft(yScaleLeft);
    //var yAxisRight = d3.axisRight(yScaleRight); // правая ось y отключена

    // var chartWrapper = selectedObj.append("div")
    //     .style('position', 'relative')
    //     .attr("width", param.width)
    //     .attr("height", param.height)
    //     .attr("id", param.parentSelector.substr(1)+"-wrapper");


    d3.select(param.parentSelector)
        .style('width', param.width + 'px')
        .style('position', 'relative');


    // create svg for chart drawing
    var svg = selectedObj.append("svg")
        .attr("width", param.width)
        .attr("height", param.height)
        .attr("id", param.parentSelector.substr(1)+"_d3_chart");

    // outer border
    svg.append("rect")
        .attr("width", param.width)
        .attr("height", param.height)
        .style("fill", "none")
        .style("stroke", "#ccc");

    /////////////////////////////////////////
    // create group in svg for generate graph
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left +  "," + margin.top + ")")
        //.attr("class", "legend");
        .attr('class', 'line-chart');


    /////////////////////////////////////////
    // add title and axis names
    g.append("text")
        .attr("x", param.width/2)
        .attr("y", -20)
        //.attr("transform","translate(0,"+(param.height-30)+")") // это заголовок легенды
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text(param.title);

    g.append("text")
        .attr("x", width-43)
        .attr("dx", 40)
        .attr("y", height-4 )
        .attr("text-anchor", "end")
        .text(param.xAxisName);

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -28)
        .attr("dy", 40)
        .attr("text-anchor", "end")
        .text(param.yLeftAxisName);

    // add axis
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    g.append("g")
        .attr("class", "y axis")
        .call(yAxisLeft)

    ////////////////////////////////////////////////////////////////
    // прорисовка графика
    for (var j = 0, len1 = param.series.length; j < len1; j += 1) {
        // init line for axis
        var line = d3.line()
            .x(function(data) { return xScale(data[param.xColumn]); })
            .y(function(data) { return (param.series[j].yAxis == "left") ? yScaleLeft(data[param.series[j].yColumn]) : yScaleRight(data[param.series[j].yColumn]); });

        // draw line
        g.append("path").datum(data)
            .attr("d", line)
            .style("fill", "none")
            .style("stroke", param.series[j].color)
            .style("stroke-width", "1px");
    };
    console.log(d3.select('.line-chart > path').style('bottom'))

    // add legend for series
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("height", 40)
        .attr("width", 200)
        .attr("transform","translate("+(margin.left)+","+(param.height)+")"); // это легенда цветовых линий, расположение по высоте зависит от заданного в параметрах

    legend.selectAll('rect')
        .data(param.series)
        .enter()
        .append("rect")
        .attr("y", 0 - (margin.top / 2))
        .attr("x", function(d, i){ return i *  90;})
        .attr("width", 10).attr("height", 10)
        .style("fill", function(d) {return d.color; });

    ///////////////////////////////////

    var ySelectedIndex = chartIndexSelected;

    legend.selectAll('text')
        .data(param.series)
        .enter()
        .append("text")
        .attr('id', function (d, i) {return 'legend-text-' + i;}) // установка id, чтобы ниже показать подчеркивание
        .attr("y", 0 - (margin.top / 2)+10)
        .attr("x", function(d, i){ return i *  90 + 15;})
        .text(function(d) { return d.title; })
        .style("cursor", "pointer") // покажем, что элементы легенды кликабельны

        // переключаем активные ховеры на выбранный график (перерисовка с учетом индекса chartIndexSelected)
        .on ('click', function (d, i) {
            console.log(param.series[ySelectedIndex])
            
            if (i != chartIndexSelected) {
                d3Chart(param, data, i)
            }
        });

        svg.selectAll('path').on('mousemove', function (d, i, c) {
            // i != chartIndexSelected

            if(param.series[ySelectedIndex]['yColumn'] === undefined){
                return;
            }

            // param.series[ySelectedIndex]['yColumn'] = 'keysCount';
            console.log( i );
            if (i === 3) {
                d3Chart(param, data, 1);
            }
            if (i === 2) {
                d3Chart(param, data, 0);
            }
    
    console.log("d: ", d);
    console.log("i: ", i);
    console.log("c: ", c);
    console.log("c.target: ", c.target);
    console.log(d3.mouse(this));
    console.log(d3.select(this));
    
    });


    legend.select('#legend-text-'+chartIndexSelected)
    // подчеркивание на том объекте, который активен для ховера
        .style("text-decoration", "underline");



    ////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ховеры
    var chartHeight = param.height;
    var chartWidth  = param.width;
    var chart       = g;
    var chartId     = getChartId(chart);
    var tooltip     = d3.select('#chart'+chartId) // прикрепляем подсказку к текущему графику, т.к. свернутый уровень дерева с графиком не даст показать подсказку
        .append('div')
        .attr('class', 'line-chart tooltip')
        .style('opacity', 0);

    var x = xScale;
    var y = yScaleLeft;

    ////////////////////////
    var xColumnName = param.xColumn;                // имя колонки в массиве данных (по оси Х)
    var yColumnName = param.series[ySelectedIndex]['yColumn'];   // по оси Y
    var yValueName  = param.series[ySelectedIndex]['titleShort'];

    // получает индекс текущего графика, где произошло наведение
    function getChartId(chart) {
        var parentId = chart['_groups'][0][0].parentNode['id']; // chart2_d3_chart
        return parentId.substr(5).replace("_d3_chart","");
    }

    // hover dot
    chart.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('id', function (d, i) {return 'dot-' + i;})
        .attr('cx', function (d, i) {
            return x(new Date(d[xColumnName]));})

        .attr('cy', function (d, i) {
            return y(d[yColumnName]);})

        .attr('r', 4)
        .style('fill', '#bbbbbb') // делать невидимыми точки нужно только если плотность данных высокая
        .style('opacity', 1);

    var barWidth            = chartWidth / data.length; //- ширина столбца для ховера - в зависимости от плотности данных
    var initialTooltipWidth = 80;

    
    // rects for hover reference
    chart.selectAll('rect.hover-line')
        .data(data)
        .enter()
        .append('rect')
        .style('opacity', 0)
        .attr('width', 1)
        .attr('class', 'line-chart hover-line')
        .attr('id', function (d, i) {return 'line-' + i;})
        .attr('height', function (d) {return chartHeight - y(d[yColumnName]) - margin.top - margin.bottom;})
        .attr('x', function (d, i) { 
            return x(new Date(d[xColumnName])) - 2 / 2;})

        .attr('y', function (d, i) {
            return y(d[yColumnName]) + 4;}); // add height of dot to prevent overlap

    chart.selectAll('rect.hover-box')
        .data(data)
        .enter()
        .append('rect')
        .style('opacity', 0)
        .attr('class', 'line-chart hover-box')
        .attr('width', barWidth)
        .attr('height', function (d) {return chartHeight - y(d[yColumnName]) - margin.top - margin.bottom;})
        .attr('x', function (d, i) {return x(new Date(d[xColumnName]));})
        .attr('y', function (d, i) {return y(d[yColumnName]);})

        .on('mouseover', function (d, i) {

            var xtranslate = x(new Date(d[xColumnName]));
            var chartId    = getChartId(chart);

            // hover - круг/точка
            var currentDot = '#chart'+chartId+' #dot-' + i;
            d3.select(currentDot)
                .style('opacity', 1)
                .style('stroke', param.series[chartIndexSelected]['color']); // цвет границы кружка = цвету графика

            var tooltipWidth = parseInt(tooltip.style('width'));
            var tooltipHeight = parseInt(tooltip.style('height'));

            tooltip
                .style('opacity', 1)
                .style('left', parseInt(d3.select(currentDot).attr('cx')) + (tooltipWidth / 2) + 12 + 'px')
                .style('top',  parseInt(d3.select(currentDot).attr('cy')) + tooltipHeight / 2 + 'px')
                .style('min-width', initialTooltipWidth + yValueName.length*5 + 'px') // ширина подсказки зависит от длины текста (param['titleShort)

                .html("<br>"+(d[yColumnName]) + ' ' + yValueName) // вывод текста со значением на оси Y (br вместо форматирования)
                .style('border-color', "#bbbbbb");
         
            // hover - линии
            var currentLine = '#chart'+chartId+' #line-' + i;
            d3.select(currentLine)
                .style('opacity', 1)
                .style('fill', param.series[chartIndexSelected]['color'])
                .style('stroke', param.series[chartIndexSelected]['color']); // цвет линии = цвету графика

            // hover - дата - пока не отображается (нет данных на графике ?)
            d3.selectAll('g[transform = "translate(' + xtranslate + ',0)"]')
                .select('text')
                .transition() // задержка для случаев малого количества столбцов (мало данных по оси Х)
                .duration(200)
                .style('opacity', 1);
            //.html (d[xColumnName]);
        })

        .on('mouseout', function (d, i) {

            var xtranslate = x(new Date(d[xColumnName]));
            var chartId    = getChartId(chart);

            tooltip.style('opacity', 0);

            // hover line
            var currentLine = '#chart'+chartId+' #line-' + i;
            d3.select(currentLine)
                .transition()
                .duration(200)
                .style('opacity', 0);

            // hover точки - делать невидимыми точки нужно только если плотность данных высокая
            /*var currentDot = '#dot-' + i;
             d3.select(currentDot)
             .transition()
             .duration(200)
             .style('fill', '#bbbbbb') 
             .style('opacity', 1);*/

            // hover date
            d3.selectAll('g[transform = "translate(' + xtranslate + ',0)"]')
                .select('text[style = "text-anchor: middle; opacity: 1;"]')
                .transition()
                .duration(200)
                .style('opacity', '0');
        });

};

// parse date and numeric data
function ParseData(dateColumn,dateFormat,usedNumColumns,data){
    var parse = d3.timeParse(dateFormat);
    data.forEach(function(d) {
        d[dateColumn] = parse(d[dateColumn]);
        for (var i = 0, len = usedNumColumns.length; i < len; i += 1) {
            d[usedNumColumns[i]] = +d[usedNumColumns[i]];
        }
    });
};

