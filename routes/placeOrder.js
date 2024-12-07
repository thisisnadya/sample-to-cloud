const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const router = express.Router();
const connectMySQL = require("../config/db");

const connection = connectMySQL();

console.log("is this printed");

// place user order
router.post("/place-order", (req, res) => {
  const { customer_id, service_id, quantity } = req.body;

  const sql = `INSERT INTO customer_order(customer_id, service_id, quantity) VALUES (?,?,?)`;

  if (customer_id && service_id && quantity) {
    connection.query(
      sql,
      [customer_id, service_id, quantity],
      (err, result) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: "Error occured while placing order" });
        }
        // res.json({ data: result });
        // generate pdf invoice
        const sqlJoin = `SELECT customer_order.order_id, customers.name, services.service_name, customer_order.total_price, customer_order.placed_at
                        FROM customer_order
                        INNER JOIN customers ON customers.customer_id = customer_order.customer_id
                        INNER JOIN services ON services.service_id = customer_order.service_id
                        WHERE customer_order.order_id = ?`;
        connection.query(sqlJoin, result.insertId, (error, queryResult) => {
          if (err) {
            console.error(error);
            return res
              .status(500)
              .json({ error: "Error while creating invoice" });
          }
          if (queryResult.length !== 0) {
            // // generate pdf invoice
            const doc = new PDFDocument();
            const pdfPath = `./invoices/invoice_${result.insertId}.pdf`;
            doc.pipe(fs.createWriteStream(pdfPath));

            doc.text(`Invoice No.${result.insertId}`);
            doc.text(`Customer name: ${queryResult[0].name}`);
            doc.text(`Service: ${queryResult[0].service_name}`);
            doc.text(`Total price: ${queryResult[0].total_price}`);

            doc.end();
            return res.status(200).json({
              success: true,
              data: queryResult,
              message: "Invoice generated",
              pdfPath,
            });
          }
        });
      }
    );
  }
});

// get order by customer name
router.get("/my-orders/:username", (req, res) => {
  const { username } = req.params;

  const sql = `select customer_order.order_id, customers.name, services.service_name, customer_order.quantity, customer_order.total_price, customer_order.placed_at 
                from customer_order
                inner join customers on customers.customer_id = customer_order.customer_id
                inner join services on services.service_id = customer_order.service_id
                where customers.name = ?`;
  connection.query(sql, username, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error occured" });
    }
    if (result.length == 0) {
      return res
        .status(200)
        .json({ message: "You haven't made any orders yet" });
    }
    return res.status(200).json({ success: true, data: result });
  });
});

module.exports = router;
