const margin = {top: 0, right: 20, bottom: 0, left: 20},
width = 600 - margin.left - margin.right, 
height = 600 - margin.top - margin.bottom;

const svg = d3.select("#countryVariantChart")
            .append("svg")
                .attr("width", width)
                .attr("height", height);

d3.json("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/internal/megafile--variants.json")
.then((data) => {
    
    function plotVariants(countryName) {
         // set up constants and vars
        const variantNames = []
        const criticalFields = ["location", "date"]
        const allDates = data.date
        let countryIndexes = []
        let cleanedVariantData = {}
        let variantColors = ["#88CCEE", "#CC6677", "#DDCC77", "#117733", "#332288", 
                            "#AA4499", "#44AA99", "#999933", "#661100", "#6699CC", "#888888"]
        let omicronColors = ["#03071e","#370617","#6a040f","#9d0208","#d00000",
                            "#dc2f02","#e85d04","#f48c06","#faa307","#ffba08"]



        // get indexes the target country to extract data from each array object
        for(let i=0; i<data.location.length; i++) {
            if (data.location[i] == countryName) {
                countryIndexes.push(i);
            }
        }

        // get variants of interest
        for(let key in data) {
            if (!criticalFields.includes(key) && !key.includes("_") 
            && !key.includes("Omicron") && !key.includes("Recombinant")) {
                variantNames.push(key)
            }
        }

        // add omicron separately b/c of all the subvariants
        for (let key in data) {
            if (key.includes("Omicron_")){
                variantNames.push(key);
            }
        }

        // populate country's relevant dates for variant data
        let variantDates = countryIndexes.map(x=>allDates[x])
        cleanedVariantData["dates"] = variantDates

        // populate return object with plotable for each variant
        for(let i=0; i<variantNames.length; i++){
            let currName = variantNames[i]
            let currVarData = data[currName]
            cleanedVariantData[currName] = countryIndexes.map(x=>currVarData[x])
        }

        // create the traces based on the variantData object created
        let plotData = []
        let temp
        let tempColor
        let j = 0
        let k = 0
        for(let i=0; i<variantNames.length; i++) {
            if (j>i) {j = 0}
            tempColor = variantColors[j]
            if (variantNames[i].includes("Omicron")){
                tempColor = omicronColors[k]
                if (k>omicronColors.length-1) {k = 0}
                k++;
            }
            plotData[i] = {
                type: "scatter",
                mode: "lines",
                name: variantNames[i],
                stackgroup: 'tonexty',
                groupnorm: 'percent',
                x: cleanedVariantData.dates,
                y: cleanedVariantData[variantNames[i]],
                line: {color: tempColor}
            }
            j++;
        }

        // layout and configs for plot
        let layout = {
            title: countryName + ' COVID-19 Variant Timeline',
            showlegend: true,
            legend: {orientation: "h", 
                    y:"-.45",
                    title: {text: "Variant Names", side: "top", 
                            font:{size: 12}},
                    tracegroupgap: 1,
                    traceorder: "normal",
                    valign: "top"
            },
            xaxis: {
                autorange: true,
                range: [variantDates[0], variantDates[variantDates.length-1]],
                rangeselector: {buttons: [
                    {count: 1, label: '1m', step: 'month', stepmode: 'backward'},
                    {count: 6, label: '6m', step: 'month', stepmode: 'backward'},
                    {count: 12, label: '12m', step: 'month', stepmode: 'backward'},
                    {count: 24, label: '24m', step: 'month', stepmode: 'backward'},
                    {step: 'all'}
                ]},
                rangeslider: {range: [variantDates[0], variantDates.length-1]},
                type: 'date'
            },
            yaxis: {
                title: {
                    text: "% of Cases",
                    font: {size: 12}
                }
            },
            hovermode: "x unified",
        };
        let configs = {responsive: true}

        // plot the data
        console.log(plotData)
        Plotly.newPlot('countryVariantChart', plotData, layout, configs);
    }

    // default plot
    plotVariants("United States");

    let countryName = document.getElementById("countryDropdown");
    countryName.addEventListener("change", (event) => {
        countryName = event.target.value;
        console.log(countryName);
        plotVariants(countryName);
    });

   let select = document.getElementById("countryDropdown");
   let uniqueCountries = data.location.filter((item, i, ar) => ar.indexOf(item) === i);

    for(var i = 0; i < uniqueCountries.length; i++) {
        var opt = uniqueCountries[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
});