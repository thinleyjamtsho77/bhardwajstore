import pool from "../config/db.js";


const COUNTED = "o.payment_status = 'paid' AND o.order_status NOT IN ('cancelled', 'refunded')";

// Dashboard groups -> order_status values from the orders table
const STATUS_GROUPS = [
  { key: "waiting", label: "Waiting", statuses: ["pending", "confirmed"] },
  { key: "preparing", label: "Preparing Order", statuses: ["preparing", "ready_for_pickup"] },
  { key: "pickedUp", label: "Picked up", statuses: ["collected"] },
];

export async function getDashboard(req, res) {
  const year = new Date().getFullYear();

  try {
    const [[totalsResult], [monthlyResult], [statusResult], [bestResult]] = await Promise.all([
      pool.execute(
        `SELECT
           (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE ${COUNTED}) AS totalSales,
           (SELECT COUNT(*) FROM users WHERE role = 'customer') AS totalCustomers,
           (SELECT COUNT(*) FROM products WHERE is_active = 1) AS totalProducts,
           (SELECT COUNT(*) FROM orders o WHERE ${COUNTED}) AS totalOrders`
      ),
      pool.execute(
        `SELECT MONTH(o.placed_at) AS month, SUM(o.total_amount) AS sales
         FROM orders o
         WHERE ${COUNTED} AND YEAR(o.placed_at) = ?
         GROUP BY MONTH(o.placed_at)`,
        [year]
      ),
      pool.execute(
        `SELECT o.order_status AS status, COUNT(*) AS count
         FROM orders o
         WHERE ${COUNTED}
         GROUP BY o.order_status`
      ),
      pool.execute(
        `SELECT
           oi.product_name AS name,
           c.category_name AS category,
           p.price,
           SUM(oi.quantity) AS unitsSold,
           SUM(oi.line_total) AS revenue
         FROM order_items oi
         JOIN orders o ON o.order_id = oi.order_id
         LEFT JOIN products p ON p.product_id = oi.product_id
         LEFT JOIN categories c ON c.category_id = p.category_id
         WHERE ${COUNTED}
         GROUP BY oi.product_id, oi.product_name, p.price, c.category_name
         ORDER BY unitsSold DESC, revenue DESC
         LIMIT 5`
      ),
    ]);

    const totals = totalsResult[0];

    // 12 numbers, January to December, zero where there were no sales
    const monthly = Array(12).fill(0);
    for (const row of monthlyResult) monthly[row.month - 1] = Number(row.sales);

    const countByStatus = Object.fromEntries(statusResult.map((r) => [r.status, Number(r.count)]));
    const statuses = STATUS_GROUPS.map((g) => ({
      key: g.key,
      label: g.label,
      count: g.statuses.reduce((sum, s) => sum + (countByStatus[s] ?? 0), 0),
    }));

    res.json({
      totals: {
        sales: Number(totals.totalSales),
        customers: Number(totals.totalCustomers),
        products: Number(totals.totalProducts),
        orders: Number(totals.totalOrders),
      },
      year,
      monthlySales: monthly,
      orderStatus: statuses,
      bestSellers: bestResult.map((r) => ({
        name: r.name,
        category: r.category,
        price: r.price == null ? null : Number(r.price),
        unitsSold: Number(r.unitsSold),
        revenue: Number(r.revenue),
      })),
    });
  } catch (error) {
    console.error("Load dashboard failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to load dashboard" });
  }
}
