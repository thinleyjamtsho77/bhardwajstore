import { useState } from "react";
import { Link } from "react-router";
import ProfileSidebar from "../components/ProfileSidebar";
import "../assets/styles/order-history.css";


const orders = [
    {
        id: "#ORD0008",
        date: "25/07/2026",
        price: "$85.50",
        status: "Delivered",
        items: [
            { name: "Fresh Apples", quantity: 2, price: 6.00 },
            { name: "Full Cream Milk", quantity: 1, price: 3.50 },
            { name: "Wholemeal Bread", quantity: 2, price: 5.00 },
        ],
    },
    {
        id: "#ORD0007",
        date: "20/07/2026",
        price: "$42.00",
        status: "Processing",
        items: [
            { name: "Bananas", quantity: 1, price: 4.00 },
            { name: "Orange Juice", quantity: 2, price: 5.50 },
            { name: "Eggs", quantity: 1, price: 7.00 },
        ],
    },
    {
        id: "#ORD0006",
        date: "15/07/2026",
        price: "$126.80",
        status: "Cancelled",
        items: [
            { name: "Rice", quantity: 2, price: 15.00 },
            { name: "Cooking Oil", quantity: 1, price: 12.80 },
            { name: "Chicken", quantity: 3, price: 28.00 },
        ],
    },
    {
        id: "#ORD0005",
        date: "12/07/2026",
        price: "$63.20",
        status: "Delivered",
        items: [
            { name: "Potatoes", quantity: 2, price: 8.00 },
            { name: "Tomatoes", quantity: 3, price: 5.00 },
            { name: "Cheese", quantity: 1, price: 12.20 },
        ],
    },
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

    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter orders based on selected period
    const filteredOrders = orders.filter((order) => {
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
                                                        onClick={() => setSelectedOrder(order)}
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

                    {/* Order Details Modal */}
                    {selectedOrder && (
                        <div
                            className="order-modal-overlay"
                            onClick={() => setSelectedOrder(null)}
                        >
                            <div
                                className="order-modal"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="order-modal-header">
                                    <h2>Order Details</h2>

                                    <button
                                        type="button"
                                        className="order-modal-close"
                                        onClick={() => setSelectedOrder(null)}
                                        aria-label="Close order details"
                                    >
                                        &times;
                                    </button>
                                </div>

                                {/* Order Information */}
                                <div className="order-modal-info">
                                    <div>
                                        <span>Order Number</span>
                                        <strong>{selectedOrder.id}</strong>
                                    </div>

                                    <div>
                                        <span>Order Date</span>
                                        <strong>{selectedOrder.date}</strong>
                                    </div>

                                    <div>
                                        <span>Order Status</span>
                                        <span
                                            className={`order-status ${selectedOrder.status.toLowerCase()}`}
                                        >
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="order-modal-products">
                                    <h3>Ordered Products</h3>

                                    <table className="order-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {selectedOrder.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.name}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>${item.price.toFixed(2)}</td>
                                                    <td>
                                                        ${(item.quantity * item.price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Total */}
                                <div className="order-modal-total">
                                    <span>Total Price</span>
                                    <strong>{selectedOrder.price}</strong>
                                </div>

                                {/* Footer */}
                                <div className="order-modal-footer">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrder(null)}
                                    >
                                        Close
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </section>
        </>
    );
}