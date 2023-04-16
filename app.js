function final(){
    var filePath1 = "dimension.csv";
    var filePath2 = "constituent.csv";
    var filePath3 = "object.csv";
    var filePath4 = "country.csv";
    var filePath5 = "assocaitions.csv";

    scatter_dimension(filePath1);
    bar_constitunent(filePath2);
    stackbar_country(filePath3);
    choropleth_country(filePath4);
    node_association(filePath5);
}


var scatter_dimension=function(filePath){
    var rowConverter = function(d){
        return {
            classification: d.classification,
            width : parseFloat(d.width),
            height : parseFloat(d.height),
            title: d.title,
            year: parseInt(d.beginyear)
        };
    }

    var margin = {top: 30, right: 30, bottom: 60, left: 60};
    var svgwidth = 1000 - margin.left - margin.right;
    var svgheight = 600 - margin.top - margin.right;
     
    let svg = d3.select("#scatter").append("svg")
                .attr("width", svgwidth + margin.left + margin.right)
                .attr("height", svgheight + margin.top + margin.bottom)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(filePath, rowConverter).then(function(data){
        var print = d3.filter(data, d=> d.classification == "Print");
        var groups = Array.from(d3.rollup(data, v => d3.count(v, d => d.width), d => d.classification).keys());
        groups.sort(function(a,b){return a.length - b.length})

        var xScale = d3.scaleLinear()
						.domain([0, d3.max(print, d=>d.width)])
						.range([margin.left, svgwidth]);

        var yScale = d3.scaleLinear()
						.domain([0, d3.max(print, d=>d.height)])
						.range([svgheight, margin.top]);

        // Tooltip
        var tooltip = d3.select("#scatter")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltip");

        // Dropdown Button
        d3.select("#selectButton")
            .selectAll('myOptions')
            .data(groups)
            .enter()
            .append('option')
            .text(function (d) { return d; })
            .attr("value", function (d) { return d; })

        // Axis
        svg.append("g")
            .attr("class", "xAxis1")
            .attr("transform", "translate(0," + svgheight + ")")
            .call(d3.axisBottom(xScale).tickSizeOuter(0));

        svg.append("g")
            .attr("class", "yAxis1")
            .attr("transform", "translate(" + margin.left + ", 0)")
            .call(d3.axisLeft(yScale));

        // Titles
        svg.append("text")
            .attr("class", "x_label")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 2)
            .attr("y", svgheight + margin.bottom)
            .text("Width (cm)");

        svg.append("text")
            .attr("class", "y_label")
            .attr("text-anchor", "end")
            .attr("x", (- svgheight + margin.top)/ 2)
            .attr("y", margin.left / 6)
            .attr("transform", "rotate(-90)")
            .text("Height (cm)");

        svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 1.6)
            .attr("y", margin.top / 2 )
            .text("Dimension of Art Pieces (Width and Height)");

        // Circles
        var dot = svg.selectAll("dot")
                    .data(print) 
                    .enter()
                    .append("circle")
                        .attr("cx", function (d) { return xScale(d.width); } )
                        .attr("cy", function (d) { return yScale(d.height); } )
                        .attr("r", 7)
                        .style("fill", "purple")
                        .style("opacity", 0.5)
                        .style("stroke", "white")
                    .on("mouseover", function(e, d) {
                        tooltip.transition().duration(50).style("opacity", 0.9);
                        tooltip.html( "Name: " + d.title 
                                    + "<br> Width: " + d.width 
                                    + "<br> Height: " + d.height
                                    + "<br> Year: " + d.year)
                                .style("left", (d3.pointers(e)[0][0]) + "px")
                                .style("top", (d3.pointers(e)[0][1]) + "px");
                    })
                    .on("mousemove", function(e) {
                        tooltip.style("top", (e.pageY)+"px")
                                .style("left",(e.pageX)+"px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition() 
                                .duration(500) 
                                .style("opacity", 0);
                    });

        function update(currData) {

            xScale = d3.scaleLinear()
						.domain([0, d3.max(currData, d=>d.width)])
						.range([margin.left, svgwidth]);

            yScale = d3.scaleLinear()
                        .domain([0, d3.max(currData, d=>d.height)])
                        .range([svgheight, margin.top]);

            d3.select(".xAxis1")
                .transition()
                .duration(3000)
                .call(d3.axisBottom(xScale));

            d3.select(".yAxis1")
                .transition()
                .duration(3000)
                .call(d3.axisLeft(yScale));

            let temp = dot.data(currData);

            temp.transition()
                .duration(3000)
                .style('opacity', 0.5)
                .attr("cx", function(d) { return xScale(d.width) })
                .attr("cy", function(d) { return yScale(d.height) });

            temp.exit()
                .transition()
                .duration(3000)
                .style('opacity', 0);
        };

        d3.select("#selectButton").on("change", function(d) {
            var selectedOption = d3.select(this).property("value");
            var dataFilter = d3.filter(data, d=>d.classification == selectedOption);
            update(dataFilter);
        })

    });
}

var bar_constitunent=function(filePath){

    var margin = {top: 30, right: 30, bottom: 60, left: 60};
    var svgwidth = 1000 - margin.left - margin.right;
    var svgheight = 600 - margin.top - margin.right;
    var axis_padding = 15;
     
    let svg = d3.select("#bar").append("svg")
                .attr("width", svgwidth + margin.left + margin.right)
                .attr("height", svgheight + margin.top + margin.bottom)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(filePath).then(function(data){

        var groups = d3.rollup(data, v => v.length, d=> d.classification, d => d.constituenttype);
        var categories = Array.from(groups.keys());
        var values = Array.from(groups.values());
        var con_type = Array.from(values[8].keys());
        var con_max = {"individual":0, "anonymous":0, "corporate":0, "couple":0};

        var fill_cat = [];
        for (let i = 0; i < values.length; i++){
            let temp = {};
            temp['category'] = categories[i];

            for(const type of con_type){
                if(values[i].get(type) == undefined){
                    temp[type] = 0;
                }else{
                    temp[type] = values[i].get(type);
                    if(temp[type] > con_max[type]){con_max[type] = temp[type];}
                }
            }
            fill_cat.push(temp);
        }

        var xScale = d3.scaleBand()
                        .range([ margin.left, svgwidth ])
                        .domain(categories)
                        .padding(0.2);

        var yScale = d3.scaleLinear()
						.domain([0, con_max['individual']])
						.range([svgheight, margin.top]);

        // Axis
        svg.append("g")
            .attr("transform", "translate(0," + (svgheight) + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "translate(0, "+axis_padding+"), rotate(-20)")
            .attr("font-size", "11px");

        svg.append("g")
            .attr("class", "yAxis2")
            .attr("transform", "translate("+margin.left+", 0)")
            .call(d3.axisLeft(yScale));

        // Titles
        svg.append("text")
            .attr("class", "x_label")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 2)
            .attr("y", svgheight + margin.bottom)
            .text("Category");

        svg.append("text")
            .attr("class", "y_label")
            .attr("text-anchor", "end")
            .attr("x", (- svgheight + margin.top)/ 2)
            .attr("y", margin.left / 6)
            .attr("transform", "rotate(-90)")
            .text("Count");

        svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 1.6)
            .attr("y", margin.top / 2 )
            .text("Art Pieces Distribution Over Category");

        // Rect
        var bar = svg.selectAll("mybar")
                    .data(fill_cat)
                    .enter()
                    .append("rect")
                        .attr("x", function(d) { return xScale(d.category); })
                        .attr("width", xScale.bandwidth())
                        .attr("fill", "maroon")
                        // no bar at the beginning thus:
                        .attr("height", function(d) { return svgheight - yScale(0); })
                        .attr("y", function(d) { return yScale(0); });

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(3000)
            .attr("y", function(d) { return yScale(d.individual); })
            .attr("height", function(d) { return svgheight - yScale(d.individual); })
            .delay(function(d,i){return(i*100); });

        function update(type) {
            yScale = d3.scaleLinear()
						.domain([0, con_max[type]])
						.range([svgheight, margin.top]);

            d3.select(".yAxis2")
                .transition()
                .duration(1000)
                .call(d3.axisLeft(yScale));

            bar.enter()
            .append("rect")
            .merge(bar)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return xScale(d.category); })
            .attr("y", function(d) { return yScale(d[type]); })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) { return svgheight - yScale(d[type]); })
        };

        var radio = d3.select('#con_button')
                        .on("change", function (d) {
                            var curr_type = d.target.value;
                            update(curr_type);
                        });
        
        });

}

var stackbar_country=function(filePath){
    var rowConverter = function(d){
        return {
            classification: d.classification,
            objectid: d.objectid,
            year: parseInt(d.beginyear)
        };
    }

    var margin = {top: 30, right: 30, bottom: 60, left: 60};
    var svgwidth = 1000 - margin.left - margin.right;
    var svgheight = 600 - margin.top - margin.right;
     
    let svg = d3.select("#stack_bar").append("svg")
                .attr("width", svgwidth + margin.left + margin.right)
                .attr("height", svgheight + margin.top + margin.bottom)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(filePath, rowConverter).then(function(data){

        var cat_1950 = d3.filter(data, function(d){
            let selected_cat =  d.classification == "Painting" || d.classification == "Sculpture" 
            || d.classification == "Drawing" || d.classification == "Photograph";
            return selected_cat & d.year >= 1950 & d.year <= 1980;
        })

        cat_1950.sort(function(a,b){
            return a.year - b.year;
        })
        
        var groups = d3.rollup(cat_1950, v => v.length, d=> d.year, d => d.classification);
        var years = Array.from(groups.keys());
        var values = Array.from(groups.values());
        var categories = Array.from(values[5].keys());
        var maxY = d3.sum(Array.from(values[5].values()));
        
        var fill_cat = [];
        for (let i = 0; i < values.length; i++){
            let temp = {};
            temp['year'] = years[i];
            
            for(const cat of categories){
                if(values[i].get(cat) == undefined){
                    temp[cat] = 0;
                }else{
                    temp[cat] = values[i].get(cat);
                }
            }
            fill_cat.push(temp);
        }

        var stackedData = d3.stack().keys(categories)(fill_cat);

        var xScale = d3.scaleBand()
                        .range([ margin.left, svgwidth ])
                        .domain(years)
                        .padding(0.2);

        var yScale = d3.scaleLinear()
						.domain([0, maxY])
						.range([svgheight, margin.top]);

        var color = d3.scaleOrdinal()
                    .domain(categories)
                    .range(["maroon", "green", "cornflowerblue", "gold"]);

         // Axis
        svg.append("g")
            .attr("transform", "translate(0," + (svgheight) + ")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .attr("class", "yAxis")
            .attr("transform", "translate("+margin.left+", 0)")
            .call(d3.axisLeft(yScale));

        // Titles
        svg.append("text")
            .attr("class", "x_label")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 2)
            .attr("y", svgheight + margin.bottom)
            .text("Year");

        svg.append("text")
            .attr("class", "y_label")
            .attr("text-anchor", "end")
            .attr("x", (- svgheight + margin.top)/ 2)
            .attr("y", margin.left / 4)
            .attr("transform", "rotate(-90)")
            .text("Count");

        svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 1.6)
            .attr("y", margin.top / 2 )
            .text("Trend of Art Creation in Painting/Sculpture/Drawing/Photograph");

        // Bar
        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
                .attr("x", function(d) { return xScale(d.data.year); })
                .attr("y", function(d) { return yScale(0); })
                .attr("height", function(d) { return svgheight - yScale(0); })
                .attr("width",xScale.bandwidth())
                .attr("stroke", "grey");

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(2000)
            .attr("y", function(d) { return yScale(d[1]); })
            .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
            .delay(function(d,i){return(i*100); });

        // Legend
        var size = 20
        svg.selectAll("mydots")
            .data(categories)
            .enter()
            .append("rect")
            .attr("x", svgwidth - 3 * margin.right)
            .attr("y", function(d,i){ return 30 + i*(size+5); }) 
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d){ return color(d); });

        svg.selectAll("mylabels")
            .data(categories)
            .enter()
            .append("text")
            .attr("x", svgwidth - 2 * margin.right)
            .attr("y", function(d,i){ return 30 + i*(size+5) + (size/2); })
            .style("fill", function(d, i){ return color(d); })
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

    });
}

var choropleth_country=function(filePath){
    var rowConverter = function(d){
        return {
            country : d.country,
            objectid : d.objectid,
            latitude: parseFloat(d.latitude),
            longitude: parseFloat(d.longitude)
        };
    }

    var margin = {top: 30, right: 30, bottom: 60, left: 60};
    var svgwidth = 1000 - margin.left - margin.right;
    var svgheight = 600 - margin.top - margin.right;
    let padding = 10;

    var svg = d3.select("#choropleth").append("svg")
                .attr("width", svgwidth + margin.left + margin.right)
                .attr("height", svgheight + margin.top + margin.bottom);

    var projection = d3.geoRobinson()
                        .scale(svgwidth / (padding / 2))
                        .translate([svgwidth / 2, svgheight / 2]);

    // Define color scale
    const colorScale = d3.scaleThreshold()
                        .domain([10, 50, 150, 300, 600, 1200, 120000])
                        .range(d3.schemeOrRd[7]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
                        .attr("class", "choro_tooltip")
                        .style("opacity", 0);

    d3.csv(filePath, rowConverter).then(function(data){

        var groups = d3.rollup(data, function(v){
            return {count : v.length,
                    latitude: d3.mean(v, d => d.latitude),
                    longitude: d3.mean(v, d => d.longitude)};
        }, d => d.country);

        d3.json("world.json").then(function(map){
            // Draw the map

            world = svg.append("g").attr("class", "world");
            world.selectAll("path")
                .data(map.features)
                .enter().append("path")
                    .attr("fill", function(d) {
                            d.total = 0;
                            if(groups.get(d.properties.name) != undefined){ 
                                d.total = groups.get(d.properties.name).count;
                            }
                            return colorScale(d.total);
                    })
                    .attr("d", d3.geoPath()
                        .projection(projection)
                    )
                    .style("stroke", "transparent")
                    .attr("class", function(d) {
                        return "Country"
                    })
                    .style("opacity", 1)
                    .on("mouseover", function(e, d) {
                        d3.selectAll(".Country")
                            .transition()
                            .duration(200)
                            .style("opacity", .5)
                            .style("stroke", "transparent");

                        d3.select(this)
                            .transition()
                            .duration(200)
                            .style("opacity", 1)
                            .style("stroke", "black");

                        tooltip.style("left", (e.pageX + 15) + "px")
                                .style("top", (e.pageY - 28) + "px")
                                .transition().duration(400)
                                .style("opacity", 1)
                                .text(d.properties.name + ': ' + d.total);
                    })
                    .on("mouseout", function(d){
                        d3.selectAll(".Country")
                            .transition()
                            .duration(200)
                            .style("opacity", 1)
                            .style("stroke", "transparent");

                        tooltip.transition().duration(300)
                            .style("opacity", 0);
                    });
                    
            // Add Title
            svg.append("text")
                .attr("class", "title")
                .attr("text-anchor", "end")
                .attr("x", (svgwidth + margin.left + margin.right) / 2)
                .attr("y", margin.top / 2 )
                .text("World Art Collections Map");

        })

        // Legend
        const x = d3.scaleLinear()
                    .domain([2.6, 75.1])
                    .rangeRound([600, 860]);

        const legend = svg.append("g")
                            .attr("id", "legend");

        const legend_entry = legend.selectAll("g.legend")
            .data(colorScale.range().map(function(d) {
                d = colorScale.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("g")
            .attr("class", "legend_entry");

        const ls_w = 20,
            ls_h = 20;

        legend_entry.append("rect")
                    .attr("x", 20)
                    .attr("y", function(d, i) {
                        return svgheight - (i * ls_h) - 2 * ls_h;
                    })
                    .attr("width", ls_w)
                    .attr("height", ls_h)
                    .style("fill", function(d) {
                        return colorScale(d[0]);
                    })
                    .style("opacity", 0.8);

        legend_entry.append("text")
                    .attr("x", 50)
                    .attr("y", function(d, i) {
                        return svgheight - (i * ls_h) - ls_h - 6;
                    })
                    .text(function(d, i) {
                        if (i === 0) return "< " + d[1];
                        if (d[1] < d[0]) return d[0] ;
                        return d[0] + " - " + d[1];
                    });

        legend.append("text").attr("x", 15).attr("y", 370).text("Collection Count");
        
    });
}

var node_association=function(filePath){
    var rowConverter = function(d){
        return {
            parentTitle: d.parenttitle,
            childTitle : d.childtitle,
            relation : d.relationship
        };
    }

    var margin = {top: 30, right: 30, bottom: 60, left: 60};
    var svgwidth = 1000 - margin.left - margin.right;
    var svgheight = 800 - margin.top - margin.right;
    let axis_padding = 15;

    var svg = d3.select("#network_graph").append("svg")
                .attr("width", svgwidth + margin.left + margin.right)
                .attr("height", svgheight + margin.top + margin.bottom);

    d3.csv(filePath, rowConverter).then(function(data){

        var parentGroup = d3.rollup(data, v=>v.length, d=>d.parentTitle);
        var childGroup = d3.rollup(data, v=>v.length, d=>d.childTitle);
        var parentKeys = Array.from(parentGroup.keys());
        var childKeys = Array.from(childGroup.keys());
        var allKeys = parentKeys.concat(childKeys);

        var lst = []
        for(const p1 of parentKeys){
            for(const p2 of parentKeys){
                let temp = {}
                temp["objectX"] = p1;
                temp["objectY"] = p2;
                if(p1 == p2){temp["relation"] = 0;} // objectX is identical to ObjectY
                else{temp["relation"] = 1;} // ObjectX and ObjectY are both parent of others.
                lst.push(temp);
            }

            let parentFilter = d3.filter(data, d=> d.parentTitle == p1);
            let childSubset = Array.from(d3.rollup(parentFilter, v=>v.length, d=>d.childTitle).keys());

            for(const child of childKeys){
                let temp1 = {};
                let temp2 = {};

                temp1["objectX"] = p1;
                temp1["objectY"] = child;

                temp2["objectX"] = child;
                temp2["objectY"] = p1;

                if(childSubset.includes(child)){
                    temp1["relation"] = 3; // objectX is parent of ObjectY
                    temp2["relation"] = 4 // objectX is child of ObjectY
                }
                else{
                    temp1["relation"] = -1; // ObjectX has no relationship with ObjectY.
                    temp2["relation"] = -1;
                }
                lst.push(temp1);
                lst.push(temp2);
            }
        }

        for(const c1 of childKeys){
            for(const c2 of childKeys){
                let temp = {}
                temp["objectX"] = c1;
                temp["objectY"] = c2;
                if(c1 == c2){temp["relation"] = 0;} // objectX is identical to ObjectY
                else{temp["relation"] = 2;} // ObjectX and ObjectY are both child of others.
                lst.push(temp);
            }
        }

        var xScale = d3.scaleBand()
                        .range([margin.left, svgwidth])
                        .domain(allKeys)
                        .padding(0.05);

         var yScale = d3.scaleBand()
                        .range([svgheight, margin.top])
                        .domain(allKeys)
                        .padding(0.05);

        var colorScale = d3.scaleOrdinal()
                            .domain([-1, 0, 1, 2, 3, 4])
                            .range(d3.schemeCategory10 .slice(0,6));

        var relationships = ["No Relation", "Self", "Both Parent",
                            "Both Child", "Parent Of", "Child Of" ];

        // Axis
        var xAxis= svg.append("g")
                        .attr("transform", "translate(0," + (svgheight) + ")")
                        .call(d3.axisBottom(xScale).tickSize(0));
        xAxis.selectAll("text")
                .attr("fill", "none");
        xAxis.select(".domain").remove();
        

        var yAxis = svg.append("g")
                        .attr("transform", "translate("+margin.left+", 0)")
                        .call(d3.axisLeft(yScale).tickSize(0));
        yAxis.selectAll("text")
                .attr("fill", "none");
        yAxis.select(".domain").remove();

        // Titles
        svg.append("text")
            .attr("class", "x_label")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 2)
            .attr("y", svgheight + margin.bottom / 2)
            .text("Object 1");

        svg.append("text")
            .attr("class", "y_label")
            .attr("text-anchor", "end")
            .attr("x", (- svgheight + margin.top)/ 2)
            .attr("y", margin.left / 2)
            .attr("transform", "rotate(-90)")
            .text("Object 2");

        svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "end")
            .attr("x", (svgwidth + margin.left + margin.right) / 1.6)
            .attr("y", margin.top / 2.5 )
            .text("Separable Association of Painting Collections");

        // Legend
        var size = 20
        svg.selectAll("mydots")
            .data(relationships)
            .enter()
            .append("rect")
            .attr("x", function(d,i){return margin.right + 130 * (i+1)})
            .attr("y", svgheight + margin.bottom) 
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d,i){ return colorScale(i-1); });

        svg.selectAll("mylabels")
            .data(relationships)
            .enter()
            .append("text")
            .attr("x", function(d,i){return margin.right + 130 * (i+1) + 25})
            .attr("y", svgheight + margin.bottom*1.2)
            .style("fill", function(d, i){ return colorScale(i-1); })
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

        var tooltip = d3.select("#network_graph")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltip");

        svg.selectAll()
            .data(lst)
            .enter()
            .append("rect")
            .attr("x", function(d) { return xScale(d.objectX) })
            .attr("y", function(d) { return yScale(d.objectY) })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", xScale.bandwidth() )
            .attr("height", yScale.bandwidth() )
            .style("fill", function(d) { return colorScale(d.relation)} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", function(e, d){
                tooltip.style("opacity", 1);
                d3.select(this)
                    .style("stroke", "black")
                    .style("opacity", 1);

                tooltip.html( "Object 1: " + d.objectX 
                            + "<br> Object 2: " + d.objectY)
                        .style("left", (d3.pointers(e)[0][0]) + "px")
                        .style("top", (d3.pointers(e)[0][1]) + "px");
            })
            .on("mousemove", function(e,d){
                tooltip.style("top", (e.pageY)+"px")
                        .style("left",(e.pageX)+"px");
            })
            .on("mouseout", function(d){
                tooltip.style("opacity", 0);
                d3.select(this)
                    .style("stroke", "none")
                    .style("opacity", 0.8);
            })


    });

}