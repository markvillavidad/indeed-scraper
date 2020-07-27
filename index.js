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
    title: "nurse",     // Programmer
    location: "Toronto",  // Vancouver
    country: "Canada",   // Canada
    radius: "100",    // 25 kilometer radius
    count: "50"      // 50 job postings
};

const fileName = `${options.title}_${options.location}_${options.country}_${addTimeStamp}`;
let jobList = {};

IndeedService.query(options)
.then(async function (data) {


    jobList = data.jobList;
   

    await jobList.forEach(async element => {
        element.key = await uuidv4();

        await https.get("https://" + element.href, async (resp) => {
            let data2 = '';
            let description  ="";
          
            resp.on('data', (chunk) => {
                data2 += chunk;
            });
        
            resp.on('end', () => {
              const dom = new JSDOM(data2);
              const jobDescription =  dom.window.document.getElementById("jobDescriptionText");
              if(jobDescription) {
                description = jobDescription.innerHTML;
              }
              element.description = description;
              
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    })

})
.then(async function () {
    await fs.writeFile(fileName, JSON.stringify(jobList, null, 2), function (err) {
        if (err) throw err;
        // console.log('Saved!');
    });
} )
.catch(function(err) {
    console.log('Error: ' + err);
});