// content.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage level activities (e.g. manipulating page data, etc.)
// License: MIT
console.log("Running!");

//Amazon Scraper
let orders = document.querySelectorAll("div.order-card");
let allOrders = [];
let dates = [];
orders.forEach((item) => {
      thisOrder = {};
      datarow = item.querySelector("div.a-row");
      thisOrder["date"] = datarow
            .closest(".a-fixed-right-grid-col")
            .querySelectorAll("span")[1].innerText;

      dates.push(thisOrder["date"]);

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
      allOrders.push(thisOrder);
});
allOrders.sort((a, b) => (a.total > b.total ? 1 : b.total > a.total ? -1 : 0));

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
allOrders.forEach((item) => {
      orderText +=
            item.total + "\t" + item.date + "\t" + item.products + "\n\n";
});
console.log(allOrders);

async function getAccounts() {
      const baseUrl = `https://dev.lunchmoney.app/v1/plaid_accounts`;
      return await auth(baseUrl);
}
function reformatDate(string, delta = 0) {
      date = new Date(string);
      date.setDate(date.getDate() + delta);
      return new Date(date).toISOString().split("T")[0];
}

async function getTransactions(start_date = "", end_date = "") {
      let queryParams = {
            tag_id: 106008,
            transaction_id: 2237814325,
      };
      // start_date
      //       ? (queryParams["start_date"] = reformatDate(start_date, -1))
      //       : null;
      // end_date
      //       ? (queryParams["end_date"] = reformatDate(end_date, 1))
      //       : start_date
      //       ? (end_date = reformatDate(start_date, 2))
      //       : null;
      start_date
            ? (queryParams["start_date"] = reformatDate("2024-10-31", -1))
            : null;
      end_date
            ? (queryParams["end_date"] = reformatDate("2024-11-01", 1))
            : start_date
            ? (end_date = reformatDate(start_date, 2))
            : null;

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
      } else if (act == "put") {
            const response = await fetch(
                  url,

                  {
                        method: "PUT",
                        headers: headers,
                        body: JSON.stringify(queryParams),
                  }
            )
                  .then((response) => console.log(response))

                  .catch((error) => {
                        console.error("Error fetching data:", error);
                  });
            return response;
      }
}

async function matchTransactions() {
      let lm_transactions = await getTransactions(minDate, maxDate);
      for (let order in allOrders) {
            let orderTotal = parseFloat(allOrders[order]["total"]);
            try {
                  const foundOrder = Object.keys(lm_transactions).find(
                        (key) => lm_transactions[key].to_base === orderTotal
                  );
                  lm_transactions[foundOrder]["notes"] =
                        allOrders[order]["productsText"];
            } catch (error) {}
      }
      console.log("lm_transactions");
      console.log(lm_transactions);
      return lm_transactions;
}

let updates = [];
matchTransactions().then((res) => {
      allOrders.forEach((item) => {
            let orderTotal = parseFloat(item.total);
            console.log(item);
            for (var trans in res) {
                  if (res[trans]["to_base"] == orderTotal) {
                        res[trans]["notes"] = item.products;
                        console.log(
                              "https://dev.lunchmoney.app/v1/transactions/:" +
                                    res[trans]["id"]
                        );
                        auth(
                              "https://dev.lunchmoney.app/v1/transactions/:" +
                                    res[trans]["id"],
                              {
                                    transaction: {
                                          transaction_id: res[trans]["id"],
                                          notes: item.products.join(", "),
                                    },
                              },
                              "PUT"
                        );
                  }
            }
      });
});

//             .then(console.log(transactions))
// );

// // .then(
//       orders.forEach((item) => {
//             let orderTotal = parseFloat(item.total);
//             for (var trans in transactions) {
//                   if (trans[to_base] == orderTotal) {
//                         trans["notes"] = item.products;
//                   }
//             }
//       }).then(
//             console.log(transactions)
// ))

// TODO post transactions to LM
