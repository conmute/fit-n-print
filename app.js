import './app.scss';
const Highcharts = require('highcharts');
const $ = require('jquery')

function uniq(a) {
    var seen = {};
    const toStr = ({ top, bottom }) => JSON.stringify({ top, bottom })
    return a.filter(
        item => seen.hasOwnProperty(toStr(item)) ?
            false : (seen[toStr(item)] = true)
    );
}
const options = {
    title: {
        text: 'Robots Produced Per Month'
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
        title: {
            text: 'Funtional Units'
        }
    },
    plotOptions: {
        series: {
            animation: false,
            enableMouseTracking: false
        }
    },
    exporting: {
        enabled: false
    },
    series: [{
        name: 'Tokyo',
        data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
    }, {
        name: 'London',
        data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
    }]
};
$("[chart]").each((_, el) => {
    Highcharts.chart(el,
        $.extend(options, { chart: { type: 'column' }})
    );
})
const ranges = $("[auto-height]").toArray().map($)
    .map(x => ({
        el: x,
        top: x.offset().top,
        bottom: x.offset().top + x.outerHeight(true),
        overlap: []
    }));
const inBetween = (x, r) => x >= r.top && x <= r.bottom
const rangesAndEls = ranges.reduce((re, record) => {
    const { el, top, bottom, overlap } = record
    const needle = re.filter(x => inBetween(top, x) || inBetween(bottom, x))
    if (needle.length) {
        needle
            .filter(x => inBetween(top, x) && bottom >= x.bottom)
            .forEach(x => {
                x.bottom = bottom
                x.overlap = [...record.overlap, el];
            });
        needle
            .filter(x => inBetween(bottom, x) && top <= x.top)
            .forEach(x => {
                x.top = top;
                x.overlap = [...record.overlap, el];
            });
    } else {
        re.push(record)
    }
    return re
}, []);
const actualAutoHeight = rangesAndEls
    .reduce((re, { el }) => re + el.outerHeight(true), 0);
const contentHeight = $('#content').outerHeight();
const allowedHeight = $("#limitter").height();
const allowedAutoHeight = allowedHeight - ( contentHeight - actualAutoHeight );
const reduceHeightRatio = allowedAutoHeight / actualAutoHeight;
function adjustHeight(ratio, $el, edges) {
    const chart = Highcharts.charts[$el.data('highchartsChart')];
    const h = $el.height();
    const edgeHeight = edges.bottom - edges.top;
    const fixedHeight = $el.offset().top - edges.top;

    // Version 2 good!
    const adjustRatio = h / edgeHeight
    const newHeight = edgeHeight * (ratio * adjustRatio)
    $el.height( newHeight );
    chart.setSize($el.width(), newHeight, false);

    // // Version 3 pending
    // smallerContentRatio / ratio = adjustRatio / smallerContentRatio
    // // const newHeight = Math.pow(h + fixedHeight, 2) / (edgeHeight * ratio);
    // // const adjustRatio = h / (edgeHeight + fixedHeight)
    // // const newHeight = edgeHeight * (ratio * adjustRatio)
    // $el.height( newHeight );
    // chart.setSize($el.width(), newHeight, false);
}
if (reduceHeightRatio < 1) {
    rangesAndEls.forEach((record) => {
        const edges = {
            top: record.top,
            bottom: record.bottom
        };
        adjustHeight(reduceHeightRatio, record.el, edges);
        record.overlap.forEach((el) => adjustHeight(reduceHeightRatio, el, edges));
    });
}

if (window.location.pathname.includes("preview")) {
    $(document.body).addClass("preview");
}
