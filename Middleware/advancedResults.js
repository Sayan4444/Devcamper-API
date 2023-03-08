const advancedResults = (model, populate) => {
    return async (req, res, next) => {
        //Copy req.query
        const reqQuery = { ...req.query };

        //Fields to exclude to be matched for filtering
        const removeFields = ['select', 'sort', 'page', 'limit']

        //Looping over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        //Create a query string
        let queryStr = JSON.stringify(reqQuery);

        //Creating operators like $gt,$gte
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        //Changing the query string to a JS object
        const queryObj = JSON.parse(queryStr);

        //Creating a Query Promise
        let query = model.find(queryObj)
        if (populate) {
            query = query.populate(populate);
        }

        //Select FIELD
        if (req.query.select) {
            const selectedFields = req.query.select.split(",").join(" ");
            query = query.select(selectedFields);
        }

        //Sort FIELD
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        //Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await model.countDocuments();

        query = query.skip(startIndex).limit(limit);

        //Pagination result
        let pagination = {}

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if (startIndex >= limit) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }



        //Executing a Query Promise
        const results = await query;

        res.advancedResults = {
            success: true,
            count: results.length,
            pagination,
            data: results
        }
        next();
    }
}

module.exports = advancedResults;