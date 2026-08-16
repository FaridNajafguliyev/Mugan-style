import React from "react";
import { ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/types";
import "./OrderTimeline.scss";

const PIPELINE: OrderStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_DISPATCH",
  "DISPATCHED_FROM_WAREHOUSE",
  "HANDED_TO_DELIVERY",
  "IN_TRANSIT",
  "DELIVERED",
];

interface OrderTimelineProps {
  status: OrderStatus;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  if (status === "CANCELLED" || status === "RETURNED") {
    return (
      <div className="ms-order-timeline ms-order-timeline--terminal">
        <span className="ms-order-timeline__terminal-mark">✕</span>
        {ORDER_STATUS_LABELS[status]}
      </div>
    );
  }

  const currentIndex = status === "PENDING_PAYMENT" ? -1 : PIPELINE.indexOf(status);

  return (
    <ul className="ms-order-timeline">
      {PIPELINE.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step} className={done ? "is-done" : ""}>
            <span className="ms-order-timeline__mark">{done ? "✓" : "○"}</span>
            {ORDER_STATUS_LABELS[step]}
          </li>
        );
      })}
    </ul>
  );
};

export default OrderTimeline;
