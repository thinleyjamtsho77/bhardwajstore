import { useEffect, useMemo, useRef, useState } from "react";
import "../../assets/styles/admin/admin-orderManagement.css";

const INITIAL_ORDERS = [
    { id: 4, orderNumber: "#0004", customer: "John", price: 13.60, status: "Preparing" },
    { id: 3, orderNumber: "#0003", customer: "Alice", price: 20.50, status: "Delivering" },
    { id: 2, orderNumber: "#0002", customer: "Emma", price: 16.00, status: "Delivered" },
    { id: 1, orderNumber: "#0001", customer: "John", price: 21.30, status: "Delivered" },
];

const ORDER_STATUSES = ["Preparing", "Delivering", "Delivered"];

export default function OrderManagement() {
    // savedOrders represents the currently saved data; pendingOrders holds unsaved edits.
    const [savedOrders, setSavedOrders] = useState(INITIAL_ORDERS);
    const [pendingOrders, setPendingOrders] = useState(INITIAL_ORDERS);
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const filterRef = useRef(null);

    // Close the Filter menu when the user clicks or taps outside it.
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setFilterOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setFilterOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const displayedOrders = useMemo(() => {
        const filtered = pendingOrders.filter(
            (order) => statusFilter === "All" || order.status === statusFilter
        );

        return [...filtered].sort((a, b) => {
            if (sortBy === "oldest") return a.id - b.id;
            if (sortBy === "price-low") return a.price - b.price;
            if (sortBy === "price-high") return b.price - a.price;
            return b.id - a.id;
        });
    }, [pendingOrders, statusFilter, sortBy]);

    const updateOrderStatus = (orderId, newStatus) => {
        setPendingOrders((current) =>
            current.map((order) =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const discardChanges = () => {
        setPendingOrders(savedOrders);
    };

    const saveChanges = () => {
        // UI-only for now: this updates local state, not the MySQL database.
        setSavedOrders(pendingOrders);
    };

    const hasUnsavedChanges = pendingOrders.some((order) => {
        const savedOrder = savedOrders.find((item) => item.id === order.id);
        return savedOrder && savedOrder.status !== order.status;
    });

    return (
        <main className="order-management">
            <div className="order-management__heading-row">
                <h1 className="order-management__title">Orders</h1>

                <div className="order-management__toolbar">
                    <div className="order-management__filter-control">
                        <select
                            id="order-status-filter"
                            className="order-management__filter-select"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            aria-label="Filter orders by status"
                        >
                            <option value="All">All statuses</option>
                            {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="order-management__sort-control" htmlFor="order-sort">
                        <span className="visually-hidden">Sort orders</span>
                        <select
                            id="order-sort"
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="price-low">Price: low to high</option>
                            <option value="price-high">Price: high to low</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="order-management__table-wrapper">
                <table className="order-management__table">
                    <thead>
                        <tr>
                            <th scope="col">Order number</th>
                            <th scope="col">Customer</th>
                            <th scope="col">Price</th>
                            <th scope="col">Status</th>
                            <th scope="col">Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedOrders.length > 0 ? (
                            displayedOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.orderNumber}</td>
                                    <td>{order.customer}</td>
                                    <td>${order.price.toFixed(2)}</td>
                                    <td>
                                        <select
                                            className={`order-management__status-select order-management__status-select--${order.status.toLowerCase()}`}
                                            value={order.status}
                                            aria-label={`Status for order ${order.orderNumber}`}
                                            onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                    className={`order-management__status-option order-management__status-option--${status.toLowerCase()}`}
                                                >
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="order-management__view-button"
                                            onClick={() => {
                                                // Detail view can be connected in a later implementation step.
                                            }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="order-management__empty" colSpan="5">
                                    No orders match this filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="order-management__actions">
                <button
                    type="button"
                    className="order-management__action-button order-management__action-button--discard"
                    onClick={discardChanges}
                    disabled={!hasUnsavedChanges}
                >
                    Discard Change
                </button>
                <button
                    type="button"
                    className="order-management__action-button order-management__action-button--save"
                    onClick={saveChanges}
                    disabled={!hasUnsavedChanges}
                >
                    Save Update
                </button>
            </div>
        </main>
    );
}
