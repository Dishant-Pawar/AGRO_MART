import React from "react";
import { FaShoppingCart, FaUsers } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import { IoSettingsSharp } from "react-icons/io5";
import { MdAddBox } from "react-icons/md";
import { RiSettings2Fill } from "react-icons/ri";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminMenu = () => {
  const { t } = useTranslation();

  return (
    <div>
      <ul className="menu font-semibold text-base text-base-content">
        <li className="py-3">
          <NavLink
            to="/dashboard/overview"
            className={({ isActive }) =>
              isActive ? "text-green-600 border-l-4 border-green-600" : ""
            }
            style={{ color: "", backgroundColor: "transparent" }}
          >
            <MdDashboardCustomize className="text-xl ml-2" />{" "}
            {t("dashboard.admin_menu.overview")}
          </NavLink>
        </li>
        <li className="py-3">
          <NavLink
            to="/dashboard/all-users"
            className={({ isActive }) =>
              isActive ? "text-green-600 border-l-4 border-green-600" : ""
            }
            style={{ color: "", backgroundColor: "transparent" }}
          >
            <FaUsers className="text-xl ml-2" />{" "}
            {t("dashboard.admin_menu.customers")}
          </NavLink>
        </li>
        <li className="py-3">
          <NavLink
            to="/dashboard/all-orders"
            className={({ isActive }) =>
              isActive ? "text-green-600 border-l-4 border-green-600" : ""
            }
            style={{ color: "", backgroundColor: "transparent" }}
          >
            <FaShoppingCart className="text-xl ml-2" />{" "}
            {t("dashboard.admin_menu.orders")}
          </NavLink>
        </li>
        <li className="py-3">
          <NavLink
            to="/dashboard/addProduct"
            className={({ isActive }) =>
              isActive ? "text-green-600 border-l-4 border-green-600" : ""
            }
            style={{ color: "", backgroundColor: "transparent" }}
          >
            <MdAddBox className="text-xl ml-2" />{" "}
            {t("dashboard.admin_menu.add_product", {
              defaultValue: "Add Product",
            })}
          </NavLink>
        </li>
        <li className="py-3">
          <NavLink
            to="/dashboard/manageProduct"
            className={({ isActive }) =>
              isActive ? "text-green-600 border-l-4 border-green-600" : ""
            }
            style={{ color: "", backgroundColor: "transparent" }}
          >
            <RiSettings2Fill className="text-xl ml-2" />{" "}
            {t("dashboard.admin_menu.manage_product", {
              defaultValue: "Manage Product",
            })}
          </NavLink>
        </li>
        <li className="py-3">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              isActive ? "text-green-600 border-l-4 border-green-600" : ""
            }
            style={{ color: "", backgroundColor: "transparent" }}
          >
            <IoSettingsSharp className="text-xl ml-2" />{" "}
            {t("dashboard.admin_menu.settings")}
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AdminMenu;
