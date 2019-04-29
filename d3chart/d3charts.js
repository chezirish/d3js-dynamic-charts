

//////////////////////////////////////////////////////////
function d3Chart (param, data, chartIndexSelected){

    // Проверка наличия данных для линейных графиков
    var lineValues = false;
    for(var lineValue = 0; lineValue < data.length; lineValue++){
        if(data[lineValue][1].length){
            lineValues = true;
        }
    }

    // gridlines in x axis function
    function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(5)
    }

    // gridlines in y axis function
    function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(5)
    }


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
    var x = (param.xColumnDate && false) ?  d3.scaleTime().range([0, width]) : d3.scaleLinear().range([0, width]);

    x = d3.scaleBand()
    .range([0, width])
    // .padding(0)

    // if(param.xColumnDate && false){
    //     var x = d3.scaleTime().range([0, width]);
    // } else {
    //     var xLinear = d3.scaleLinear().range([0, width]);
    // }
    var y = d3.scaleLinear().range([height, 0]);
    var yScaleRight = d3.scaleLinear().range([height, 0]);

    // definition of data range for conversion coord at scales
    var xMin=d3.min(data, function(d) {     
            return d[param.xColumn];
        }), xMax=d3.max(data, function(d) {
            return d[param.xColumn];
        }),
        yLeftMax=0, yRightMax=0;

    if(param.lines && lineValues){
        for (var j = 0, len1 = param.lines.length; j < len1; j += 1) {
            tmpVal = d3.max(data, function(d) { 
                var curDataVal = d[1][param.lines[j].yColumn];
                if(curDataVal){
                    return curDataVal;
                }
            });
            if (param.lines[j].yAxis == "left"){
                if (tmpVal>yLeftMax) {yLeftMax = tmpVal};
            };
            if (param.lines[j].yAxis == "right"){
                if (tmpVal>yRightMax) {yRightMax = tmpVal};
            };
        };
    }
    if(param.bars){
        for (var j = 0, len1 = param.bars.barsItems.length; j < len1; j += 1) {
            tmpVal = d3.max(data, function(d) { 
                var curDataVal = d[2][param.bars.barsItems[j].yColumn];
                if(curDataVal){
                    return curDataVal;
                }
            });
            

            
            // console.log(data[j][2][param.bars.barsItems[j].yColumn]);
            if (tmpVal>yLeftMax) {yLeftMax = tmpVal};
            // for (var dataVal = 0; dataVal < data.length; dataVal++) {
            //     console.log(data[dataVal], "data[dataVal]")
            //     console.log(data[dataVal][2], 'data[dataVal][2]')
            //     console.log(data[dataVal][2][param.bars.barsItems[j]], 'data[dataVal][2][param.bars.barsItems[j]]')
            //     console.log(param.bars.barsItems[j].yColumn, 'param.bars.barsItems[j].yColumn')
            //     console.log(data[dataVal][2][param.bars.barsItems[j].yColumn], 'data[dataVal][2][param.bars.barsItems[j].ycolmn')
            //     tmpVal = data[dataVal][2][param.bars.barsItems[j].yColumn];
            //     if (tmpVal>yLeftMax) {yLeftMax = tmpVal};
            // }

        
        };
    }



    
    // если дата одна, то смещаем ее по центру оси X
    var dateMinOffset = new Date(xMin);
    dateMinOffset.setDate( dateMinOffset.getDate() - 1  );
    var dateMaxOffset = new Date(xMax);
    dateMaxOffset.setDate( dateMaxOffset.getDate() + 1  );

    if(x){
        if(data.length === 1 && param.xColumnDate){
            x.domain([dateMinOffset,dateMaxOffset]);
        } else {
            x.domain([xMin,xMax]);
        }
    }


    x.domain(data.map(function(d){
        console.log(d[0]);
        return d[0];
        // for(var curDate = 0; curDate < d.length){
            
        // }
        // d.date
    }));

    y.domain([0,yLeftMax]);
    yScaleRight.domain([0,yRightMax]);


    // set axis
    if (param.xColumnDate) {
        var xAxis = d3.axisBottom(x)
            .ticks(5)
            .tickFormat(d3.timeFormat("%d.%m.%Y"))
            .tickSize(10)
            .tickSizeOuter(0);
        //calculate count month in year on axis
        var xqViewMonth=Math.round(((xMax-xMin)/1000/60/60/24/30)/(width/23));
        if (xqViewMonth<1) {xqViewMonth=1};

        var monthNameFormat = d3.timeFormat("%m");
        /*var xAxis2 = d3.axisBottom(x)
         .ticks(d3.timeMonth,xqViewMonth).tickFormat(function(d) {
         var a = monthNameFormat(d);
         if (a == "01") {
         a = ""
         };
         return a;
         })
         .tickSize(2);*/
    } else {
        var xAxis = d3.axisBottom(x);
        if (width<300) xAxis.ticks(5);
    };

    var yAxisLeft = d3.axisLeft(y)
        .tickSizeOuter(0);
    //var yAxisRight = d3.axisRight(yScaleRight); // правая ось y отключена

    // var chartWrapper = selectedObj.append("div")
    //     .style('position', 'relative')
    //     .attr("width", param.width)
    //     .attr("height", param.height)
    //     .attr("id", param.parentSelector.substr(1)+"-wrapper");



    d3.select(param.parentSelector)
        .style('width', param.width + 'px')
        .style('position', 'relative')




    // create svg for chart drawing
    var svg = selectedObj.append("svg")
        .attr("width", param.width)
        .attr("height", param.height)
        .attr("id", param.parentSelector.substr(1)+"_d3_chart");


        if(param.verticalGrid){    
            // add the X gridlines
            svg.append("g")			
            .attr("class", "grid")
            .attr("transform", "translate(" + margin.left +  "," + margin.top + ")")
            .call(make_x_gridlines()
                .tickSize(height)
                .tickFormat("")
            )
        }

        if(param.horizontalGrid){            
            // add the Y gridlines
            svg.append("g")			
            .attr("class", "grid")
            .attr("transform", "translate(" + margin.left +  "," + margin.top + ")")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            )
        }

  d3.selectAll(".grid .tick line")
  .style("stroke", "#d3d3d3")


    svg.append('defs')
        .append('pattern')
            .attr("id", 'hashPattern')    
            .attr("width", '4px')    
            .attr("height", '8px')    
            .attr("patternUnits", 'userSpaceOnUse')    
            .attr("patternTransform", 'rotate(90)')    
        .append("rect")
            .attr("width", '1px')    
            .attr("height", '8px') 
            .attr("transform", 'translate(0,0)') 
            .attr("fill", 'orange');
        


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
        .attr("class", "line-chart-title")
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
        .attr("y", -23)
        .attr("dy", 40)
        .attr("text-anchor", "end")
        .style("fill", "#767676")
        .text(param.yLeftAxisName);

    // add axis
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    g.append("g")
        .attr("class", "y axis")
        .call(yAxisLeft)



    // add legend for lines
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("height", 40)
        .attr("width", 200)
        .attr("transform","translate("+(margin.left)+","+(param.height)+")"); // это легенда цветовых линий, расположение по высоте зависит от заданного в параметрах

if(param.lines && lineValues){
    legend.selectAll('rect')
        .data(param.lines)
        .enter()
        .append("line")
        .attr('id', function (d, i) {return 'legend-line-' + i;}) // установка id, чтобы ниже показать подчеркивание
        .attr("y2", 0 - (margin.top / 2))
        .attr("y1", '-5')
        .attr("x1", function(d, i){ return i *  90 + 10;})
        .attr("x2", function(d, i){ return i *  90;})
        .attr("width", 10).attr("height", 10)
        .style("stroke", function(d) {return d.color; });
}

    ///////////////////////////////////

    var ySelectedIndex = chartIndexSelected;
if(param.lines && lineValues){
    legend.selectAll('text')
        .data(param.lines)
        .enter()
        .append("text")
        .attr('class', 'legend-text')
        .attr('id', function (d, i) {return 'legend-text-' + i;}) // установка id, чтобы ниже показать подчеркивание
        .attr("y", 0 - (margin.top / 2)+10)
        .attr("x", function(d, i){
            //  var previousTextWidth = d3.select('#legend-text-' + (i-1) ).style('width');

            // if(i > 0){
            //     console.log(d3.select('#legend-text-' + (i-1))._groups[0][0].getBBox())
            // }
           
            return i *  10 + 15;
        })
        .text(function(d) { return d.title; })
        .style("cursor", "pointer") // покажем, что элементы легенды кликабельны

        // переключаем активные ховеры на выбранный график (перерисовка с учетом индекса chartIndexSelected)
        .on ('click', function (d, i) {     
            if (i != chartIndexSelected) {
                d3Chart(param, data, i)
            }
        });
}



// Добавление отступов для текста легенд
var legendTextArr = d3.selectAll('.legend-text')._groups[0]
var LegendElmPrevWidth = 0;

for(var LegendElmIndex = 0; LegendElmIndex < legendTextArr.length; LegendElmIndex++){
    
    if (LegendElmIndex < 1){
        LegendElmPrevWidth += legendTextArr[LegendElmIndex].getBBox().width;
        LegendElmPrevWidth += 35;
        continue;
    } else {
        d3.select( legendTextArr[LegendElmIndex]).attr('x', LegendElmPrevWidth)
        d3.select('#legend-line-' + LegendElmIndex)
            .attr('x1', LegendElmPrevWidth - 5)
            .attr('x2', (LegendElmPrevWidth - 10) - 5)
        
        LegendElmPrevWidth += legendTextArr[LegendElmIndex].getBBox().width;
        LegendElmPrevWidth += 35;
    }
    
}



// d3.select('#legend-text-1').attr('x', 300)

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

    ////////////////////////
    var xColumnName = param.xColumn;                // имя колонки в массиве данных (по оси Х)
    var yColumnName = param.lines ? param.lines[ySelectedIndex]['yColumn'] : undefined;   // по оси Y
    var yColumnNameBar = param.bars ? param.bars.barsItems[ySelectedIndex]['yColumn'] : undefined;   // по оси Y
    var yValueName  = param.lines ? param.lines[ySelectedIndex]['titleShort'] : undefined;
    var yValueNameBar  = param.bars ? param.bars.barsItems[ySelectedIndex]['titleShort'] : undefined;

    // получает индекс текущего графика, где произошло наведение
    function getChartId(chart) {
        var parentId = chart['_groups'][0][0].parentNode['id']; // chart2_d3_chart
        return parentId.substr(5).replace("_d3_chart","");
    }

    var barWidth            = chartWidth / data.length; //- ширина столбца для ховера - в зависимости от плотности данных
    var initialTooltipWidth = 80;

    
    ////////////////////////////////////////////////////////////////
    // прорисовка штриховок графика
    if(param.lines && lineValues){
        for (var j = 0, len1 = param.lines.length; j < len1; j += 1) {
        if(param.lines[j].hasDashing){
            var dashParams = param.lines[j].dashParams;
            if( j !== chartIndexSelected && dashParams.switchOnHover){
                continue;
            }

            // data.push({range: dashParams.range});
            // data.push({range: dashParams.range});
            // console.log(data);

            var leftRangeDash = x(new Date("Nov 1 2018"));
            var rightRangeDash = x(new Date("Nov 15 2018")); 
            var rangeDash = [leftRangeDash, rightRangeDash];
            var areaCallCount = 0; 

            var curLineExist = true;
            // define the area
            var area = d3.area()
                .x(function(data) {
                    // if(areaCallCount > 1){
                    //     return;
                    // }
                    // areaCallCount++;
                    // return x(rangeDash[areaCallCount]);
                    return x(data[param.xColumn]); 
                })
                .y0(height)
                .y1(function(data) { 
                    var curLineVal = data[1][param.lines[j].yColumn];
                    if(curLineVal){
                        return (param.lines[j].yAxis == "left") ? y(curLineVal) : yScaleRight(curLineVal); 
                    } else {
                        curLineExist = false;
                    }
                });
        
            var dashFill = dashParams.color;
            if(dashParams.type === 'hatching'){
                d3.select('#hashPattern rect').attr("fill", dashParams.color);
                dashFill = 'url(#hashPattern)';
            } else if(dashParams.type === 'area'){
                dashFill = dashParams.color;
            }


            if(curLineExist){
                // add the area
                g.append("path")
                .datum(data)
                .attr("class", "area")
                .attr("d", area)
                .style("fill", dashFill)
                .style("stroke-width", "0");
            
            }
                
        }
        };
    }

    // rects for hover reference
    // chart.selectAll('rect.hover-line')
    //     .data(data)
    //     .enter()
    //     .append('rect')
    //     .style('opacity', 0)
    //     .attr('width', 1)
    //     .attr('class', 'line-chart hover-line')
    //     .attr('id', function (d, i) {return 'line-' + i;})
    //     .attr('height', function (d) { 
    //         var curLineVal = d[1][yColumnName];
    //         if(curLineVal){
    //             return chartHeight - y(curLineVal) - margin.top - margin.bottom;
    //         }
    //     })
    //     .attr('x', function (d, i) { 
    //         return x(new Date(d[xColumnName])) - 2 / 2;})

    //     .attr('y', function (d, i) {
    //         var curLineVal = d[1][yColumnName];
    //         if(curLineVal){
    //             return y(d[1][yColumnName]) + 4;  // add height of dot to prevent overlap
    //         }
    //     });


    // // прорисовка hover-box графика
    // chart.selectAll('rect.hover-box')
    // .data(data)
    // .enter()
    // .append('rect')
    // .style('opacity', 0)
    // .attr('class', 'line-chart hover-box')
    // .attr('width', barWidth)
    // .attr('height', function (d) {
    //     var curLineVal = d[1][yColumnName];
    //     if(curLineVal){
    //         return chartHeight - y(curLineVal) - margin.top - margin.bottom;
    //     }
    // })
    // .attr('x', function (d, i) {return x(new Date(d[xColumnName]));})
    // .attr('y', function (d, i) {
    //     var curLineVal = d[1][yColumnName]; 
    //     if(curLineVal){
    //         return y(curLineVal);
    //     }
    // });


    
    // прорисовка bars графика
    if(param.bars){    
        // for(var bar = 0; bar < param.bars.length; bar++){
        //     var currentBar = param.bars[bar];
        //     var leftPoint = x(currentBar.positionX);
        //     // var rightRangeDash = x(new Date("Nov 15 2018")); 
        //     // var rangeDash = rightRangeDash - leftPoint;
        //     // y(data[param.lines[j].yColumn])
            
        //     // console.log(y(data["urlsCount"]));
        //     svg.append("rect")
        //     .attr("x", leftPoint + margin.left)
        //     .attr("width", 20)
        //     // .attr("height", param.height - margin.bottom )
        //     .attr("height", function(data){ console.log(data)  } )
        //     .style('fill', currentBar.color)
        // }

        var barGroups = chart.selectAll()
            .data(data)
            .enter()
            .append('g')
        
        var barOpacity = 1; 
        if(param.bars.barsType === "inner"){
            barOpacity = 0.5;
        }

        barGroups
            .append('rect')
            .attr('class', 'bar')
            .attr('x', function(g,i) { return x(g[param.xColumn]) })
            .attr('y', function(g,i) { 
                var curBarVal = g[2][param.bars.barsItems[i].yColumn];
                if(curBarVal){
                    return y(curBarVal)
                }   
            })
            .attr('height', function(g,i) { 
                var curBarVal = g[2][param.bars.barsItems[i].yColumn];
                if(curBarVal){
                    return height - y(curBarVal); 
                }
            })
            .attr("width", function(g,i) { return param.bars.barsItems[i].width; })
            // .attr("width", function(g) { console.log(g); return x(g.x1) - x(g.x0) -1 ; })
            .style('fill', function(g,i) { return param.bars.color })
            .style('opacity', barOpacity)
    }


    // прорисовка графов графика
if(param.lines && lineValues){
    for (var j = 0, len1 = param.lines.length; j < len1; j += 1) {

        var curLineExist = data[j][1][param.lines[j].yColumn]; 
        if(!curLineExist){
            // console.log(1);
            continue;
        }

        // console.log(data[j][1][param.lines[j].yColumn]);


        // init line for axis
        var line = d3.line()
            .x(function(data) { return x(data[param.xColumn]); })
            .y(function(data) { return (param.lines[j].yAxis == "left") ? y(data[1][param.lines[j].yColumn]) : yScaleRight(data[1][param.lines[j].yColumn]); });



        // draw line
        g.append("path").datum(data)
        .attr("d", line)
        .attr("class", "line-graph")
        .style("fill", "none")
        .style("stroke", param.lines[j].color)
        .style("stroke-width", "2px");
                
        
    };
}

    // hover dot
    // if(param.lines){
    chart.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('id', function (d, i) {return 'dot-' + i;})
        .attr('cx', function (d, i) {
            return x(new Date(d[xColumnName]));})

        .attr('cy', function (d, i) {
            var curLineVal = d[1][yColumnName];
            if(curLineVal){
                return y(curLineVal);
            }
        })
        .attr('r', 6)
        .style('fill', '#bbbbbb') // делать невидимыми точки нужно только если плотность данных высокая
        .style('opacity', 1);
    // }

    // chart.selectAll('.bar')
    // .on('mouseover', function(d,i) {
    //     if(!param.bars){
    //         return false;
    //     }
        
    //     var tooltipWidth = parseInt(tooltip.style('width'));
    //     var tooltipHeight = parseInt(tooltip.style('height'));

    //     // var currentBar = '#chart'+chartId+' #dot-' + i;

    //     tooltip
    //         .style('opacity', 1)
    //         .style('left', parseInt(d3.select(this).attr('cx')) + (tooltipWidth / 2) + 12 + 'px')
    //         .style('top',  parseInt(d3.select(this).attr('cy')) + tooltipHeight / 2 + 'px')
    //         .style('width', initialTooltipWidth + yValueNameBar.length*5 + 'px') // ширина подсказки зависит от длины текста (param['titleShort)

    //         .html("<br>"+(d[2][yColumnNameBar]) + ' ' + yValueNameBar) // вывод текста со значением на оси Y (br вместо форматирования)
    //         .style('border-color', "#bbbbbb");
    // })


    chart.selectAll('rect.hover-box')

    .on('mouseover', function (d, i) {
        if(!param.lines){
            return false;
        }
        var xtranslate = x(new Date(d[xColumnName]));
        var chartId    = getChartId(chart);

        // hover - круг/точка
        if(param.lines){
        var currentDot = '#chart'+chartId+' #dot-' + i;
        d3.select(currentDot)
            .style('opacity', 1)
            .style('stroke', param.lines[chartIndexSelected]['color']) // цвет границы кружка = цвету графика
            .style('stroke-width', '2px')
            .style('fill', '#ffffff')
            .style('r', '7')
        }


        tooltip
            .style('width', initialTooltipWidth + yValueName.length*5 + 'px') // ширина подсказки зависит от длины текста (param['titleShort)
            .html((d[1][yColumnName]) + ' ' + yValueName) // вывод текста со значением на оси Y (br вместо форматирования)
            .style('border-color', "#bbbbbb");


        var tooltipWidth = parseInt(tooltip.style('width'));
        var tooltipHeight = parseInt(tooltip.style('height'));

        tooltip  
            .style('left', parseInt(d3.select(currentDot).attr('cx')) + (tooltipWidth / 2) + 12 + 'px')
            .style('top',  parseInt(d3.select(currentDot).attr('cy')) + tooltipHeight / 2 + 'px')
            .style('display',  'flex')
            .style('justify-content',  'center')
            .style('align-items',  'center')
            .style('opacity', 1);
            
     
        // hover - линии
        if(param.lines){
        var currentLine = '#chart'+chartId+' #line-' + i;
        d3.select(currentLine)
            .style('opacity', 1)
            .style('fill', param.lines[chartIndexSelected]['color'])
            .style('stroke', param.lines[chartIndexSelected]['color']); // цвет линии = цвету графика

        // hover - дата - пока не отображается (нет данных на графике ?)
        d3.selectAll('g[transform = "translate(' + xtranslate + ',0)"]')
            .select('text')
            .transition() // задержка для случаев малого количества столбцов (мало данных по оси Х)
            .duration(200)
            .style('opacity', 1);
        //.html (d[xColumnName]);
        }
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

        var currentDot = '#chart'+chartId+' #dot-' + i;
        d3.select(currentDot)
            .style('opacity', 1)
            .style('stroke', 'none') 
            .style('stroke-width', '1px')
            .style('fill', '#bbbbbb')
            .style('r', '6')

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
    

    svg.selectAll('.line-graph').on('mousemove', function (d, i, c) {

        // if(param.lines[ySelectedIndex]['yColumn'] === undefined){
        //     return;
        // }

        if(i != chartIndexSelected) {
            d3Chart(param, data, i);
        }

    });

};

// parse date and numeric data
function ParseData(dateColumn,dateFormat,data){
    var parse = d3.timeParse(dateFormat);
    data.forEach(function(d) {
        d[dateColumn] = parse(d[dateColumn]);
        // for (var i = 0, len = usedNumColumns.length; i < len; i += 1) {
        //     d[usedNumColumns[i]] = +d[usedNumColumns[i]];
        // }
    });
};

