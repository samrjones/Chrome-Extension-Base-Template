// content.js
// Author:
// Author URI: https://
// Author Github URI: https://www.github.com/
// Project Repository URI: https://github.com/
// Description: Handles all the webpage level activities (e.g. manipulating page data, etc.)
// License: MIT

console.log("Running!")

//Amazon Scraper
orders = document.querySelectorAll("div.order-card")
allOrders = []

orders.forEach(item => {
    thisOrder = {};
    datarow = item.querySelector("div.a-row");
    thisOrder["date"] = datarow.closest(".a-fixed-right-grid-col").querySelectorAll("span")[1].innerText;
            thisOrder["date"] = datarow.closest(".a-fixed-right-grid-col").querySelectorAll("span")[1].innerText
            total = datarow.closest(".a-fixed-right-grid-col").querySelectorAll("span")[3].innerText.trim()
            thisOrder["total"] = Number(total.replace("$",""))
            thisOrder["products"] =[]
            products = item.querySelectorAll("div[class*='product-title']")
            products.forEach(item => thisOrder["products"].push(item.innerText))

      allOrders.push(thisOrder)
})
allOrders.sort((a,b) => (a.total > b.total) ? 1 : ((b.total > a.total) ? -1 : 0))

orderText = ""
allOrders.forEach( item => {
	orderText += item.total + "\t" + item.date + "\t" + item.products + "\n\n"
})
console.log(orderText)
// /scraper
// This is the old one [down arrow]
document.querySelectorAll(".a-text-caps")
    .forEach( item => 

		thisOrder["total"] = item.closest(".a-fixed-right-grid-col").querySelector("span [class*='order-total']").innerText)


document.querySelectorAll(".a-text-caps")
      .forEach( item => item.innerText == "ORDER PLACED" ? orders.push(item.closest(".a-fixed-right-grid-col").innerText) 
      : "")


//product name
document.querySelectorAll("div[class$='-product-title']")
      .forEach( item => console.log(item.innerText) )

document.querySelectorAll(".a-text-caps")
      .forEach( item => {item.innerText == "ORDER PLACED" ? orders.push(item.closest(".a-fixed-right-grid-col").innerText) 
      : "", console.log(item.innerText) } )

document.querySelectorAll(".order-card")
      .forEach( card => card.getElementsByClassName("a-text-caps"))
      .forEach(item => {item.innerText == "ORDER PLACED" ? orders.push(item.closest(".a-fixed-right-grid-col").innerText) 
      : "", console.log(item.innerText) })



//works through each order card, returns order placed & total
document.querySelectorAll(".order-card").forEach( card => card.getElementsByClassName("a-text-caps").forEach(item => {item.innerText == "ORDER PLACED" ? orders.push(item.closest(".a-fixed-right-grid-col").innerText) : "", 
//todo querySelectorAll("div[class$='-product-title']") to store item title with order data
console.log(item.closest(".a-fixed-right-grid-col").innerText) }) )

document.querySelectorAll(".order-card")
      .forEach( card => {card.getElementsByClassName("a-text-caps")})
    .forEach( item => console.log(item.innerText) )
      .forEach(item => {item.innerText == "ORDER PLACED" ? orders.push(item.closest(".a-fixed-right-grid-col").innerText) : ""})


            