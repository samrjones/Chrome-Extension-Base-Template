// content.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage level activities (e.g. manipulating page data, etc.)
// License: MIT
console.log("Running!");


// let categorizer = {
//       "Groceries" : ["Soylent", "RXBars", "GoMacro", "Toilet Paper"],
//       "Kink Items" : ["Uberlube"],
//       "Clothes" : ["Underwear"],
// };



let tag_id = 106008;

//Amazon Scraper
let orders = document.querySelectorAll("div.order-card");
let scraped_orders = [];
let dates = [];
orders.forEach((item) => {
      thisOrder = {};
      datarow = item.querySelector("div.a-row");
      thisOrder["date"] = datarow
            .closest(".a-fixed-right-grid-col")
            .querySelectorAll("span")[1].innerText;

      dates.push(thisOrder["date"]);
      deliveryStatuses = item.querySelectorAll("[class*='shipment-status']")
      deliveryStatuses.forEach((status) => { 
            status = status.innerText
            if (status.includes("Delivered")) { 
                  year = new Date().getFullYear()
                  dates.push(`${status}, ${year}`)
            }
       })
      thisOrder["date"] = datarow
            .closest(".a-fixed-right-grid-col")
            .querySelectorAll("span")[1].innerText;
      total = datarow
            .closest(".a-fixed-right-grid-col")
            .querySelectorAll("span")[3]
            .innerText.trim();
      thisOrder["total"] = Number(total.replace("$", ""));
      thisOrder["products"] = [];
      products = item.querySelectorAll("div[class*='product-title']");
      products.forEach((item) => thisOrder["products"].push(item.innerText));
      thisOrder["productsText"] = thisOrder["products"].join("; ");
      thisOrder["productsText"] = thisOrder["productsText"].substring(0,200);
      scraped_orders.push(thisOrder);
});
scraped_orders.sort((a, b) => (a.total > b.total ? 1 : b.total > a.total ? -1 : 0));

const maxDate = new Date(
      Math.max(
            ...dates.map((element) => {
                  return new Date(element);
            })
      )
);
const minDate = new Date(
      Math.min(
            ...dates.map((element) => {
                  return new Date(element);
            })
      )
);

orderText = "";
scraped_orders.forEach((item) => {
      orderText +=
            item.total + "\t" + item.date + "\t" + item.products + "\n\n";
});
// console.log(scraped_orders);

async function getAccounts() {
      const baseUrl = `https://dev.lunchmoney.app/v1/plaid_accounts`;
      return await auth(baseUrl);
}



async function getUserCategories() {
      const extensionId = chrome.runtime.id; // Get your extension's ID
      const url = chrome.runtime.getURL('/user_entered/categories.json')
      const userCategories = await fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        return data
      });

return userCategories;
}

async function getCategories() { 
      const baseUrl = `https://dev.lunchmoney.app/v1/categories`;
            await auth(baseUrl)
      .then( categories => {
            categories = categories["categories"]
            for (let cat in categories) {
                  catName = categories[cat]["name"]
                  let catId = categories[cat]["id"]
                  
                  if (Object.keys(categorizer).includes(catName)) {

                        categorizer[catId] = categorizer[catName]
                        delete categorizer[catName]
                  }
            } }
      )
}
function reformatDate(string, delta = 0) {
      date = new Date(string);
      date.setDate(date.getDate() + delta);
      return new Date(date).toISOString().split("T")[0];
}

async function getTransactions(start_date = "", end_date = "") {
      let queryParams = {
            tag_id: tag_id,
            //transaction_id: 2237814325,
      };
      start_date
            ? (queryParams["start_date"] = reformatDate(start_date, -1))
            : null;
      end_date
            ? (queryParams["end_date"] = reformatDate(end_date, 1))
            : start_date
            ? (end_date = reformatDate(start_date, 2))
            : null;
      // start_date
      //       ? (queryParams["start_date"] = reformatDate("2024-11-11", -1))
      //       : null;
      // end_date
      //       ? (queryParams["end_date"] = reformatDate("2024-11-15", 1))
      //       : start_date
      //       ? (end_date = reformatDate(start_date, 2))
      //       : null;
      console.log(`this is running with  ${queryParams["start_date"]} and ${queryParams["end_date"]}`)
      // limit: 10,
      // sort: "desc",
      console.log("queryParams");
      console.log(queryParams);
      const baseUrl = `https://dev.lunchmoney.app/v1/transactions`;
      let trans = await auth(baseUrl, queryParams);
      return trans["transactions"];
}

async function auth(baseUrl, queryParams = {}, act = "GET") {
      // Create the URL

      const url = new URL(baseUrl);
      let body = null;
      let headers = {
            "Content-Type": "application/json",
            Authorization:
                  "Bearer a5a2903f36ffed9b4b9c2f3fe6b3a6b9d132b8f28c721cae8f",
      };
      if (act == "GET") {
            // Add query parameters to the URL
            queryParams
                  ? Object.keys(queryParams).forEach((key) =>
                          url.searchParams.append(key, queryParams[key])
                    )
                  : null;
            // Send the POST request

            const response = await fetch(
                  url,

                  {
                        method: "GET",
                        headers: headers,
                  }
            )
                  .then((response) => response.json())
                  .then((data) => {
                        // Access the data here
                        // console.log (data);
                        // You can now use the data object to access specific values
                        return data;
                  })
                  .catch((error) => {
                        console.error("Error fetching data:", error);
                  });

            return response;
      } else if (act.toLowerCase() == "put") {
            const response = await fetch(
                  url,

                  {
                        method: "PUT",
                        headers: headers,
                        body: JSON.stringify(queryParams),
                  }
            )
                  .then((response) => {console.log(response.json())})

                  .catch((error) => {
                        console.error("Error fetching data:", error);
                  });
            return response;
      }
}
let updates = [];

async function matchTransactions() {
      categorizer = await getUserCategories()
      await getCategories()
      
      let lm_transactions = await getTransactions(minDate, maxDate);
      for (let order in scraped_orders) {
            let orderTotal = parseFloat(scraped_orders[order]["total"]);
            try {
                  const foundOrder = Object.keys(lm_transactions).find(
                        (key) => lm_transactions[key].to_base === orderTotal
                  );
                  lm_transactions[foundOrder]["notes"] =
                        scraped_orders[order]["productsText"];
                        lm_transactions[foundOrder]["needs_update"] = true
                  for (let cat in categorizer) {
                        console.log("cat" + cat)
                        if(categorizer[cat].some(v => lm_transactions[foundOrder]["notes"].includes(v))){
                              lm_transactions[foundOrder]["category_id"] = cat
                        }      
                        }
            } catch (error) {}
      }


     console.log("lm_transactions");
     console.log(lm_transactions);
      return lm_transactions;
}



matchTransactions().then((lm_transactions) => {
      // lm_transactions is transactions pulled from LM, with notes and categories set
      let updated_lm_transactions = []

      Object.keys(lm_transactions).forEach((entry) => {
            
            try{ 
                  if (lm_transactions[entry]["needs_update"]){
                  updated_lm_transactions.push( lm_transactions[entry])
            }}
            catch {
                  
            }
      });
      updated_lm_transactions.forEach((item) => {
            console.log(item);
                        
                        auth(
                              "https://dev.lunchmoney.app/v1/transactions/" + item["id"],
                              {
                                    "transaction": {
                                          "notes": item.notes,
                                          "category_id" : Number(item.category_id)
                                          
                                    },
                              },
                              "PUT"
                        ).then( console.log("Matched: " + item.notes));
                  })
            }
)


/* If you ever want to parse individual invoices:
let invoice2 = await fetch("https://www.amazon.com/gp/css/summary/print.html?orderID=112-8374292-1498603&ref=ppx_yo2ov_dt_b_fed_ppx_yo2ov_dt_b_invoice")  .then(response => {
    // When the page is loaded convert it to text
    return response.text()
  }).then(html => {
    // Initialize the DOM parser
    const parser = new DOMParser()

    // Parse the text
    const doc = parser.parseFromString(html, "text/html")

    // You can now even select part of that html as you would in the regular DOM
    // Example:
    // const docArticle = doc.querySelector('article').innerHTML

    return doc
  })
  .catch(error => {
     console.error('Failed to fetch page: ', error)
  })

invoice2.querySelectorAll("tbody:not(:has(tbody))").forEach(node => {let contents = node.innerText; if (contents.includes("Items Ordered")){ console.log(contents.match(/(?<=\d\s+of:\s+)([^\n]+)|\$(\d+\.\d\d)$/gmi,""))}})
*/