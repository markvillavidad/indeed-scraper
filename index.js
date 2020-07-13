// Require our module.
const IndeedService = require('scrape-indeed')();

// Test with: node test.js 'Programmer' 'Vancouver' 25 50
let options = {
    title: process.argv[2],     // Programmer
    location: process.argv[3],  // Vancouver
    country: process.argv[4],   // Canada
    radius: process.argv[5],    // 25 kilometer radius
    count: process.argv[6]      // 50 job postings
};

console.log("Search options: ", options);

IndeedService.query(options)
.then(function(data) {
    // Do something with data ...
    console.log("count", data.jobList.count);
    console.log(data.jobList);
})
.catch(function(err) {
    console.log('Error: ' + err);
});