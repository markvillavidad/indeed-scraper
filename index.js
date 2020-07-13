// Require our module.
const IndeedService = require('scrape-indeed')();
const https = require('follow-redirects').https;
const jsdom = require("jsdom");
const { v4: uuidv4 } = require('uuid');
const timestamp = require('time-stamp');
const { JSDOM } = jsdom;
const fs = require('fs');

const addTimeStamp = timestamp('YYYYMMDDHHmmssms');

console.log('addTimeStamp', addTimeStamp);

// Test with: node test.js 'Programmer' 'Vancouver' 25 50
let options = {
    title: process.argv[2],     // Programmer
    location: process.argv[3],  // Vancouver
    country: process.argv[4],   // Canada
    radius: process.argv[5],    // 25 kilometer radius
    count: process.argv[6]      // 50 job postings
};

const fileName = `${options.title}_${options.location}_${options.country}_${addTimeStamp}`;

IndeedService.query(options)
.then(async function (data) {

    let jobList = {};
    jobList = data.jobList;
   

    await jobList.forEach(async element => {
        element.key = await uuidv4();

        await https.get("https://" + element.href, async (resp) => {
            let data2 = '';
          
            resp.on('data', (chunk) => {
                data2 += chunk;
            });
        
            resp.on('end', () => {
              const dom = new JSDOM(data2);
              if(dom.window.document.getElementById("jobDescriptionText")) {
                let description = dom.window.document.getElementById("jobDescriptionText").innerHTML;
                element.description = description;
              }
              
            });
        
        fs.writeFile(fileName, JSON.stringify(jobList, null, 2), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
        // console.log("jobList: ", jobList);

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    })

})
.catch(function(err) {
    console.log('Error: ' + err);
});