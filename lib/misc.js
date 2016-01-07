function routeTable() {
    return {
        "root": "/",
        "admin_root": "/admin",
        "admin": {
            "database_setup": "/make-db-config",
            "database_init": "/make-db-init",
            "theme_setup": "/theme-config",
            "theme_init": "/theme-init"
        }
    };
}

function showRouteTable(routeTable) {
    console.log("\x1B[32m=== load default route table ===\033[0m");

    console.log(JSON.stringify(routeTable, null, 4));
/*
    var margin = 30;

    for (var item in routeTable) {
        if (routeTable.hasOwnProperty(item)) {      // for lint
            var pad = (new Array(margin - item.toString().length)).join(' ');
            var tempString = item.toString() + pad;

            console.log(' - ' + tempString + routeTable[item]);
        }
    }
*/
}

module.exports = {
    routeTable: routeTable,
    showRouteTable: showRouteTable
};