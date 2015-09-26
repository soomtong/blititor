function routeTable() {
    return {
        "root": "/",
        "admin_root": "/admin",
        "database_setup": "/admin/make-db-config",
        "database_init": "/admin/make-db-init"
    };
}

function showRouteTable(routeTable) {
    var margin = 30;

    console.log("\x1B[32m=== load default route table ===\033[0m");

    for (var item in routeTable) {
        if (routeTable.hasOwnProperty(item)) {      // for lint
            var pad = (new Array(margin - item.toString().length)).join(' ');
            var tempString = item.toString() + pad;

            console.log(' - ' + tempString + routeTable[item]);
        }
    }
}


module.exports = {
    routeTable: routeTable,
    showRouteTable: showRouteTable
};