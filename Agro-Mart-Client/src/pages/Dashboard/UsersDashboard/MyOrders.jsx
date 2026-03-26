import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../../provider/ThemeProvider";
import { FaPrint } from "react-icons/fa";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const statusColors = {
  Pending: "badge-warning",
  Delivered: "badge-success",
  Processing: "badge-info",
};

const MyOrders = () => {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [orderData, setOrderData] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const axiosSecure = useAxiosSecure();
  const user = useAuth();

  useEffect(() => {
    if (user?.email) {
      axiosSecure
        .get(`/orders/${user?.email}`)
        .then((res) => {
          setOrderData(res.data);
        })
        .catch((err) => {
          console.error("Error fetching orders:", err);
        });
    }
  }, [user?.email, axiosSecure]);

  const handleDownloadOrder = async (orderId, invoiceNo) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/download`);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `order_${invoiceNo}.csv`;
      link.click();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="py-10">
      <h2 className="text-center text-3xl font-bold mb-10">
        {t("dashboard.my_orders.title")}
      </h2>

      {orderData.length > 0 ? (
        <div className="space-y-4">
          {orderData.map((order) => (
            <div
              key={order._id}
              className={`border rounded-lg p-4 ${
                theme === "dark"
                  ? "border-gray-600 bg-base-800"
                  : "border-gray-300 bg-white"
              }`}
            >
              {/* Order Header */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrderDetails(order._id)}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {t("dashboard.my_orders.table_headers.invoice_no")}
                    </p>
                    <p className="font-bold">{order.invoiceNo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {t("dashboard.my_orders.table_headers.order_time")}
                    </p>
                    <p>{new Date(order.date).toISOString().split("T")[0]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {t("dashboard.my_orders.table_headers.amount")}
                    </p>
                    <p className="font-bold">৳ {order.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {t("dashboard.my_orders.table_headers.method")}
                    </p>
                    <p>{order.method}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {t("dashboard.my_orders.table_headers.status")}
                    </p>
                    <span
                      className={`badge ${
                        statusColors[order.status] || "badge-ghost"
                      }`}
                    >
                      {t(`dashboard.my_orders.status.${order.status}`, {
                        defaultValue: order.status,
                      })}
                    </span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm ml-4">
                  <FaPrint size={16} />
                </button>
              </div>

              {/* Order Items - Expandable */}
              {expandedOrderId === order._id && order.cartItems && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-bold mb-3">
                    {t("dashboard.my_orders.items") || "Items"}
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {order.cartItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between items-center p-2 rounded ${
                          theme === "dark"
                            ? "bg-gray-700"
                            : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {t("dashboard.my_orders.quantity")}: {item.orderedQuantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">৳ {item.price}</p>
                          <p className="text-sm text-gray-500">
                            {t("dashboard.my_orders.subtotal")}: ৳ {(item.price * item.orderedQuantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">
            {t("dashboard.my_orders.no_orders")}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
