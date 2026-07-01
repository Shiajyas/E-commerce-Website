
function buildAnalyticsQuery(filters){

    const query = {
        isBlocked:false
    };

    if(filters.category){

        query.category={
            $regex:filters.category,
            $options:"i"
        };

    }

    if(filters.brand){

        query.brand={
            $regex:filters.brand,
            $options:"i"
        };

    }

    if(filters.feature){

        query.feature={
            $regex:filters.feature,
            $options:"i"
        };

    }

    if(filters.model){

        query.model={
            $regex:filters.model,
            $options:"i"
        };

    }

    return query;

}

module.exports = buildAnalyticsQuery;