import { useState } from "react";
import { Link } from "react-router";
import ProfileSidebar from "../components/ProfileSidebar";
import "../assets/styles/order-history.css";

const ORDERS = [
    { id: "#ORD0008", date: "25/07/2026", price: "$85.50", status: "Delivered" },
    { id: "#ORD0007", date: "20/07/2026", price: "$42.00", status: "Processing" },
    { id: "#ORD0006", date: "15/07/2026", price: "$126.80", status: "Cancelled" },
    { id: "#ORD0005", date: "12/07/2026", price: "$63.20", status: "Delivered" },
];

const MONTHS = {
    "One month": 1,
    "Three months": 3,
    "Six months": 6,
    "One year": 12,
};

// Convert DD/MM/YYYY into a JavaScript Date object
const parseOrderDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
};

export default function OrderHistory() {
    const [filter, setFilter] = useState("One month");

    // Filter orders based on selected period
    const filteredOrders = ORDERS.filter((order) => {
        const orderDate = parseOrderDate(order.date);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - MONTHS[filter]);

        return orderDate >= startDate && orderDate <= today;
    });

    const breadcrumb = (
        <nav className="order-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">›</span>
            <Link to="/profile">Profile</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Order History</span>
        </nav>
    );

    return (
        <>
            {breadcrumb}

            <section className="user-profile order-history-page" aria-labelledby="orders-heading">
                <ProfileSidebar />

                <div className="user-profile__main order-content-area">
                    <section className="order-main-content">
                        <h1 id="orders-heading">Your Orders</h1>

                        <div className="order-filter">
                            <label htmlFor="order-filter">Search Order In:</label>

                            <select
                                id="order-filter"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="One month">One month</option>
                                <option value="Three months">Three months</option>
                                <option value="Six months">Six months</option>
                                <option value="One year">One year</option>
                            </select>
                        </div>

                        <div className="order-table-wrapper">
                            <table className="order-table">
                                <thead>
                                    <tr>
                                        <th>Order Number</th>
                                        <th>Order time</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Detail</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.id}</td>
                                                <td>{order.date}</td>
                                                <td>{order.price}</td>
                                                <td>
                                                    <span className={`order-status ${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="order-view-button"
                                                        type="button"
                                                        onClick={() => alert(`Viewing order ${order.id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-orders">
                                                No orders found for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </section>
        </>
    );
}