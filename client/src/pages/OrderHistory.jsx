
import { useState } from "react";
import AccountSidebar from "../components/AccountSidebar";
import "../assets/styles/order-history.css";

export default function OrderHistory() {
    const [filter, setFilter] = useState("One month");

    const orders = [
        {
            id: "#ORD0008",
            date: "25/07/2026",
            price: "$85.50",
            status: "Delivered",
        },
        {
            id: "#ORD0007",
            date: "20/07/2026",
            price: "$42.00",
            status: "Processing",
        },
        {
            id: "#ORD0006",
            date: "15/07/2026",
            price: "$126.80",
            status: "Cancelled",
        },
        {
            id: "#ORD0005",
            date: "12/07/2026",
            price: "$63.20",
            status: "Delivered",
        },
    ];


    // Convert DD/MM/YYYY into a JavaScript Date object
    const parseOrderDate = (dateString) => {
        const [day, month, year] = dateString.split("/");

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );
    };

    // Filter orders based on selected period
    const filteredOrders = orders.filter((order) => {
        const orderDate = parseOrderDate(order.date);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const startDate = new Date(today);

        const months = {
            "One month": 1,
            "Three months": 3,
            "Six months": 6,
            "One year": 12,
        };

        startDate.setMonth(
            startDate.getMonth() - months[filter]
        );

        return orderDate >= startDate && orderDate <= today;
    });


    return (
        <div className="order-history-page">

            {/* Account Sidebar */}
            <AccountSidebar />

            {/* Right Content Area */}
            <div className="order-content-area">

                {/* Breadcrumb */}
                <div className="order-breadcrumb">
                    Home &gt; Profile &gt; Order History
                </div>

                <section className="order-main-content">

                    <h1>Your Orders</h1>

                    {/* Filter */}
                    <div className="order-filter">
                        <label htmlFor="order-filter">
                            Search Order In:
                        </label>

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

                    {/* Order Table */}
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
                                                <span
                                                    className={'order-status ${order.status.toLowerCase()}'}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="order-view-button"
                                                    type="button"
                                                    onClick={() => alert('Viewing order ${order.id}')}
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
        </div>
    );
}
