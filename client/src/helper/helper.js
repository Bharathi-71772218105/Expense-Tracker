import _ from 'lodash';

export function getSum(transaction, type) {
    let grouped = _(transaction)
        .groupBy("type")
        .map((objs, key) => ({
            'type': key,
            'color': objs[0].color,
            'total': _.sumBy(objs, "amount")
        }))
        .value();
    
    // If type is specified, return only that type's total
    if (type) {
        const filtered = grouped.find(item => item.type === type);
        return filtered ? filtered.total : 0;
    }
    
    // If no type specified, return the grouped data
    return grouped;
}

export function getLabels(transaction) {
    let amountSum = getSum(transaction);
    let Total = _.sum(_.map(amountSum, 'total'));

    let percent = _(amountSum)
        .map(objs => _.assign(objs, { percent: (100 * objs.total) / Total }))
        .value()

    return percent;
}

export function chartData(transaction, custom) {
    let dataValue = _.map(getSum(transaction), 'total');
    let bg = _.map(transaction, a => a.color)
    bg = _.uniq(bg);

    const config = {
        data: {
            datasets: [{
                data: dataValue,
                backgroundColor: bg,
                hoverOffset: 4,
                borderRadius: 30,
                spacing: 10
            }]
        },
        options: {
            cutout: 115
        }
    }
    return custom ?? config;
}

export function getTotal(transaction) {
    let temp = _.sum(_.map(getSum(transaction), 'total'));
    return temp;
}