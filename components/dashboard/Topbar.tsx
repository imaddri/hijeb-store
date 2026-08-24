"use client";

import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Search,
  LogOut,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ======================================================
// TYPES
// ======================================================

type NotificationOrder = {
  id: string;
  orderNumber: number | string;
  customerName: string;
  total: number;
  createdAt: string;
};

const STORAGE_KEY = "attar-store-read-order-notifications";

// ======================================================
// FORMAT PRICE
// ======================================================

function formatPrice(value: number) {
  return value.toLocaleString("ar-DZ");
}

// ======================================================
// FORMAT DATE
// ======================================================

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "الآن";
  }

  if (diffMinutes < 60) {
    return `منذ ${diffMinutes} دقيقة`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `منذ ${diffHours} ساعة`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "منذ يوم";
  }

  return `منذ ${diffDays} أيام`;
}

// ======================================================
// COMPONENT
// ======================================================

export default function Topbar() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    NotificationOrder[]
  >([]);

  const [isOpen, setIsOpen] = useState(false);

  const [readIds, setReadIds] = useState<string[]>([]);

  const [loggingOut, setLoggingOut] = useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  // ====================================================
  // LOAD READ NOTIFICATIONS
  // ====================================================

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setReadIds(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // ====================================================
  // FETCH NEW ORDERS
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          "/api/admin/notifications",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!mounted) {
          return;
        }

        setNotifications(
          Array.isArray(data.orders)
            ? data.orders
            : []
        );
      } catch {
        // Ignore temporary network errors
      }
    };

    fetchNotifications();

    // تحديث كل 10 ثوانٍ
    const interval = setInterval(
      fetchNotifications,
      10000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // ====================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ====================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ====================================================
  // UNREAD NOTIFICATIONS
  // ====================================================

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !readIds.includes(notification.id)
    );

  // ====================================================
  // MARK ONE AS READ
  // ====================================================

  const markAsRead = (id: string) => {
    const updated = Array.from(
      new Set([...readIds, id])
    );

    setReadIds(updated);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore localStorage errors
    }
  };

  // ====================================================
  // MARK ALL AS READ
  // ====================================================

  const markAllAsRead = () => {
    const allIds = notifications.map(
      (notification) => notification.id
    );

    setReadIds(allIds);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(allIds)
      );
    } catch {
      // Ignore localStorage errors
    }
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      const response = await fetch(
        "/api/admin/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(
          "ADMIN LOGOUT FAILED"
        );

        setLoggingOut(false);

        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(
        "ADMIN LOGOUT ERROR:",
        error
      );

      setLoggingOut(false);
    }
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-2 px-3 sm:min-h-20 sm:gap-4 sm:px-6 md:px-8">

        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div>
          <h2 className="text-lg font-bold text-zinc-900 sm:text-2xl">
            لوحة الإدارة
          </h2>
        </div>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div className="flex items-center gap-3">

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <div className="relative hidden sm:block">

            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="text"
              placeholder="بحث..."
              suppressHydrationWarning
              className="
                h-11
                w-56
                rounded-xl
                border
                border-zinc-200
                bg-zinc-50
                pr-10
                pl-4
                text-sm
                outline-none
                transition
                focus:border-emerald-500
              "
            />

          </div>

          {/* ================================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================================= */}

          <div
            ref={notificationRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setIsOpen((value) => !value)
              }
              aria-label="الإشعارات"
              className="
                relative
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-zinc-200
                bg-white
                text-zinc-600
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
              "
            >

              <Bell size={20} />

              {/* UNREAD BADGE */}

              {unreadNotifications.length > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    min-h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                    ring-2
                    ring-white
                  "
                >
                  {unreadNotifications.length > 99
                    ? "99+"
                    : unreadNotifications.length}
                </span>
              )}

            </button>

            {/* ================================================= */}
            {/* NOTIFICATION PANEL */}
            {/* ================================================= */}

            {isOpen && (
              <div
                className="
                  absolute
                  left-0
                  top-14
                  z-50
                  w-[350px]
                  max-w-[calc(100vw-2rem)]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  shadow-2xl
                "
              >

                {/* PANEL HEADER */}

                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">

                  <div>
                    <h3 className="font-bold text-zinc-900">
                      الإشعارات
                    </h3>

                    <p className="mt-1 text-xs text-zinc-400">
                      {unreadNotifications.length > 0
                        ? `${unreadNotifications.length} طلب جديد`
                        : "لا توجد إشعارات جديدة"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">

                    {unreadNotifications.length >
                      0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        title="تمييز الكل كمقروء"
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          text-zinc-400
                          transition
                          hover:bg-emerald-50
                          hover:text-emerald-600
                        "
                      >
                        <CheckCheck size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setIsOpen(false)
                      }
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        text-zinc-400
                        transition
                        hover:bg-zinc-100
                        hover:text-zinc-700
                      "
                    >
                      <X size={18} />
                    </button>

                  </div>

                </div>

                {/* ================================================= */}
                {/* NOTIFICATIONS LIST */}
                {/* ================================================= */}

                <div className="max-h-[420px] overflow-y-auto">

                  {notifications.length === 0 ? (

                    <div className="px-5 py-10 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                        <Bell size={25} />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-zinc-700">
                        لا توجد طلبات جديدة
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        ستظهر هنا عند وصول طلب جديد.
                      </p>

                    </div>

                  ) : (

                    notifications.map(
                      (notification) => {

                        const isUnread =
                          !readIds.includes(
                            notification.id
                          );

                        return (
                          <Link
                            key={notification.id}
                            href={`/admin/orders/${notification.id}`}
                            onClick={() => {
                              markAsRead(
                                notification.id
                              );

                              setIsOpen(false);
                            }}
                            className={`
                              block
                              border-b
                              border-zinc-100
                              px-4
                              py-4
                              transition
                              hover:bg-zinc-50
                              ${
                                isUnread
                                  ? "bg-emerald-50/50"
                                  : "bg-white"
                              }
                            `}
                          >

                            <div className="flex gap-3">

                              {/* ICON */}

                              <div
                                className={`
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  ${
                                    isUnread
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-zinc-100 text-zinc-500"
                                  }
                                `}
                              >
                                <ShoppingBag
                                  size={18}
                                />
                              </div>

                              {/* CONTENT */}

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <p className="text-sm font-bold text-zinc-900">
                                    طلب جديد
                                  </p>

                                  {isUnread && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                  )}

                                </div>

                                <p
                                  dir="ltr"
                                  className="mt-1 text-right text-xs font-semibold text-emerald-700"
                                >
                                  ORD-
                                  {
                                    notification.orderNumber
                                  }
                                </p>

                                <p className="mt-1 truncate text-sm text-zinc-600">
                                  {
                                    notification.customerName
                                  }
                                </p>

                                <div className="mt-2 flex items-center justify-between gap-2">

                                  <span className="text-xs text-zinc-400">
                                    {formatRelativeDate(
                                      notification.createdAt
                                    )}
                                  </span>

                                  <span className="text-xs font-bold text-zinc-800">
                                    {formatPrice(
                                      notification.total
                                    )}{" "}
                                    دج
                                  </span>

                                </div>

                              </div>

                            </div>

                          </Link>
                        );
                      }
                    )

                  )}

                </div>

                {/* ================================================= */}
                {/* FOOTER */}
                {/* ================================================= */}

                <div className="border-t border-zinc-100 bg-zinc-50 p-3">

                  <Link
                    href="/admin/orders"
                    onClick={() =>
                      setIsOpen(false)
                    }
                    className="
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      py-2.5
                      text-sm
                      font-semibold
                      text-emerald-700
                      transition
                      hover:bg-emerald-100
                    "
                  >
                    عرض جميع الطلبات
                  </Link>

                </div>

              </div>
            )}

          </div>

          {/* ================================================= */}
          {/* LOGOUT */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-red-200
              px-4
              py-2.5
              text-sm
              text-red-600
              transition
              hover:bg-red-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            {loggingOut ? (
              <span
                className="
                  h-[18px]
                  w-[18px]
                  animate-spin
                  rounded-full
                  border-2
                  border-red-200
                  border-t-red-600
                "
              />
            ) : (
              <LogOut size={18} />
            )}

            <span className="hidden sm:inline">
              {loggingOut
                ? "جاري الخروج..."
                : "خروج"}
            </span>

          </button>

        </div>

      </div>
    </header>
  );
}