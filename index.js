// Require our module.
const IndeedService = require('scrape-indeed')();
const https = require('follow-redirects').https;
const jsdom = require("jsdom");
const { v4: uuidv4 } = require('uuid');
const timestamp = require('time-stamp');
const { JSDOM } = jsdom;
const fs = require('fs');

const addTimeStamp = timestamp('YYYYMMDDHHmmssms');

// console.log('addTimeStamp', addTimeStamp);

// Test with: node test.js 'Programmer' 'Vancouver' 25 50
let options = {
    title: "health",     // Programmer
    location: "alberta",  // Vancouver
    country: "Canada",   // Canada
    radius: "50",    // 25 kilometer radius
    count: "10"      // 50 job postings
};

const fileName = `${options.title}_${options.location}_${options.country}_${addTimeStamp}`;
let jobList = {};
let objectToWrite = [];


IndeedService.query(options)
.then(async function (data) {
    jobList = data.jobList;
   
    // await jobList.forEach(async element => {
    //     element.key = await uuidv4();

    //     await https.get("https://" + element.href, async (resp) => {
    //         let data2 = '';
    //         let description  ="";
          
    //         resp.on('data', (chunk) => {
    //             data2 += chunk;
    //         });
        
    //         resp.on('end', () => {
    //           const dom = new JSDOM(data2);
    //           const jobDescription =  dom.window.document.getElementById("jobDescriptionText");
    //           if(jobDescription) {
    //             description = jobDescription.innerHTML;
    //           }
    //           element.description = description;
              
    //         });

    //     }).on("error", (err) => {
    //         console.log("Error: " + err.message);
    //     });
    // })


    const waitFor = (ms) => new Promise(r => setTimeout(r, ms))
    const asyncForEach = async (array, callback) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    }

    const getDescription = async (url) => {
        return new Promise((resolve, reject) => {
            https.get("https://" + url, resp => {
                let data2 = '';
            //     let description  ="";
            
                resp.on('data', (chunk) => {
                    data2 += chunk;
                });

                resp.on('end', () => {
                    try {
                        const dom = new JSDOM(data2);
                        const jobDescription =  dom.window.document.getElementById("jobDescriptionText");
                        if(jobDescription) {
                            resolve(jobDescription.innerHTML);
                        }
                  
                    } catch (e) {
                    reject(e.message);
                    }
                });
            });
        });
        
        //     resp.on('end', () => {
        //       const dom = new JSDOM(data2);
        //       const jobDescription =  dom.window.document.getElementById("jobDescriptionText");
        //       if(jobDescription) {
        //         description = jobDescription.innerHTML;
        //       }
        //       element.description = description;
              
        //     });

        // }).on("error", (err) => {
        //     console.log("Error: " + err.message);
        // });
    }


    
    const start = async () => {
      await asyncForEach(jobList, async (num) => {
        num.description = await getDescription(num.href);
        await waitFor(5000);
        console.log(JSON.stringify(num));
        objectToWrite.push(num);
        // console.log(objectToWrite);
        await fs.writeFile(fileName, JSON.stringify(jobList, null, 2), function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
      
      })
    //   console.log('Done')
    }
    
    start();
        

    





})
.then(async function () {
    // await fs.writeFile(fileName, JSON.stringify(jobList, null, 2), function (err) {
    //     if (err) throw err;
    //     // console.log('Saved!');
    // });
} )
.catch(function(err) {
    // console.log('Error: ' + err);
});