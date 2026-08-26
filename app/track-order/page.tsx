"use client"; 
 
import { 
  FormEvent, 
  useState, 
} from "react"; 
 
import Link from "next/link"; 

import Navbar from "@/components/layout/Navbar";
 
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock3, 
  Package, 
  PackageSearch, 
  Search, 
  ShieldCheck, 
  Truck, 
  XCircle, 
} from "lucide-react"; 
 
import { 
  trackOrder, 
  type TrackOrderItem, 
  type TrackOrderResult, 
} from "@/actions/track-order.actions"; 
 
// ====================================================== 
// STATUS STEPS 
// ====================================================== 
 
const statusSteps = [ 
  { 
    key: "PENDING", 
    label: "قيد المراجعة", 
    description: 
      "تم استلام طلبك ونحن نقوم بمراجعته.", 
    icon: Clock3, 
  }, 
 
  { 
    key: "PROCESSING", 
    label: "قيد المعالجة", 
    description: 
      "تم تأكيد طلبك وتجهيزه.", 
    icon: Package, 
  }, 
 
  { 
    key: "SHIPPED", 
    label: "تم الشحن", 
    description: 
      "طلبك خرج للتوصيل.", 
    icon: Truck, 
  }, 
 
  { 
    key: "DELIVERED", 
    label: "تم التسليم", 
    description: 
      "تم تسليم طلبك بنجاح.", 
    icon: CheckCircle2, 
  }, 
]; 
 
// ====================================================== 
// STATUS INDEX 
// ====================================================== 
 
function getStatusIndex( 
  status: TrackOrderItem["status"] 
) { 
  switch (status) { 
    case "PENDING": 
      return 0; 
 
    case "CONFIRMED": 
      return 1; 
 
    case "PROCESSING": 
      return 1; 
 
    case "SHIPPED": 
      return 2; 
 
    case "DELIVERED": 
      return 3; 
 
    default: 
      return -1; 
  } 
} 
 
// ====================================================== 
// STATUS LABEL 
// ====================================================== 
 
function getStatusLabel( 
  status: TrackOrderItem["status"] 
) { 
  switch (status) { 
    case "PENDING": 
      return "قيد المراجعة"; 
 
    case "CONFIRMED": 
      return "تم التأكيد"; 
 
    case "PROCESSING": 
      return "قيد المعالجة"; 
 
    case "SHIPPED": 
      return "تم الشحن"; 
 
    case "DELIVERED": 
      return "تم التسليم"; 
 
    case "CANCELLED": 
      return "تم الإلغاء"; 
 
    default: 
      return "غير معروف"; 
  } 
} 
 
// ====================================================== 
// FORMAT PRICE 
// ====================================================== 
 
function formatPrice( 
  value: number 
) { 
  return new Intl.NumberFormat( 
    "fr-DZ" 
  ).format(value); 
} 
 
// ====================================================== 
// FORMAT DATE 
// ====================================================== 
 
function formatDate( 
  date: Date 
) { 
  return new Intl.DateTimeFormat( 
    "ar-DZ", 
    { 
      year: "numeric", 
      month: "long", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit", 
    } 
  ).format(new Date(date)); 
} 
 
// ====================================================== 
// STATUS BADGE 
// ====================================================== 
 
function StatusBadge({ 
  status, 
}: { 
  status: TrackOrderItem["status"]; 
}) { 
  if ( 
    status === "CANCELLED" 
  ) { 
    return ( 
      <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600"> 
        <XCircle size={17} /> 
        تم إلغاء الطلب 
      </div> 
    ); 
  } 
 
  const index = 
    Math.max( 
      0, 
      getStatusIndex(status) 
    ); 
 
  const step = 
    statusSteps[index]; 
 
  const Icon = step.icon; 
 
  return ( 
    <div className="inline-flex items-center gap-2 rounded-full bg-[#f8f5ef] px-4 py-2 text-sm font-bold text-[#a3834d]"> 
      <Icon size={17} /> 
      {getStatusLabel(status)} 
    </div> 
  ); 
} 
 
// ====================================================== 
// ORDER CARD 
// ====================================================== 
 
function OrderCard({ 
  order, 
  selected, 
  onClick, 
}: { 
  order: TrackOrderItem; 
  selected: boolean; 
  onClick: () => void; 
}) { 
  return ( 
    <button 
      type="button" 
      onClick={onClick} 
      className={` 
        w-full 
        rounded-2xl 
        border 
        p-5 
        text-right 
        transition 
        ${ 
          selected 
            ? "border-[#a3834d] bg-[#faf8f3] shadow-sm" 
            : "border-black/5 bg-white hover:border-[#a3834d]/40 hover:bg-[#faf9f6]" 
        } 
      `} 
    > 
      <div className="flex items-start justify-between gap-4"> 
 
        <div> 
          <p className="text-xs text-gray-400"> 
            رقم الطلب 
          </p> 
 
          <p 
            dir="ltr" 
            className="mt-1 text-lg font-bold text-[#1f1f1f]" 
          > 
            ORD-{order.orderNumber} 
          </p> 
        </div> 
 
        <StatusBadge 
          status={order.status}
        /> 
 
      </div> 
 
      <div className="mt-5 grid gap-4 sm:grid-cols-2"> 
 
        <div> 
          <p className="text-xs text-gray-400"> 
            التاريخ 
          </p> 
 
          <p className="mt-1 text-sm font-semibold text-[#1f1f1f]"> 
            {formatDate( 
              order.createdAt 
            )} 
          </p> 
        </div> 
 
        <div> 
          <p className="text-xs text-gray-400"> 
            الإجمالي 
          </p> 
 
          <p className="mt-1 font-bold text-[#a3834d]"> 
            {formatPrice( 
              order.total 
            )}{" "} 
            دج 
          </p> 
        </div> 
 
      </div> 
 
      <div className="mt-4 flex items-center justify-end gap-1 text-xs font-bold text-[#a3834d]"> 
        {selected 
          ? "الطلب المحدد" 
          : "عرض تفاصيل الطلب"} 
 
        <ArrowRight 
          size={14} 
        /> 
      </div> 
    </button> 
  ); 
} 
 
// ====================================================== 
// ORDER DETAILS 
// ====================================================== 
 
function OrderDetails({ 
  order, 
}: { 
  order: TrackOrderItem; 
}) { 
  const currentIndex = 
    getStatusIndex( 
      order.status 
    ); 
 
  return ( 
    <div className="mt-8 space-y-6"> 
 
      {/* ================================================== 
          SUMMARY 
      ================================================== */} 
 
      <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-8"> 
 
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"> 
 
          <div> 
            <p className="text-sm text-gray-500"> 
              رقم الطلب 
            </p> 
 
            <h2 
              dir="ltr" 
              className="mt-1 text-2xl font-bold text-[#1f1f1f] sm:text-3xl" 
            > 
              ORD-{order.orderNumber} 
            </h2> 
          </div> 
 
          <StatusBadge 
            status={order.status} 
          /> 
 
        </div> 
 
        <div className="my-6 h-px bg-black/5" /> 
 
        <div className="grid gap-5 sm:grid-cols-3"> 
 
          <div> 
            <p className="text-xs text-gray-400"> 
              العميل 
            </p> 
 
            <p className="mt-1 font-bold text-[#1f1f1f]"> 
              {order.customerName} 
            </p> 
          </div> 
 
          <div> 
            <p className="text-xs text-gray-400"> 
              تاريخ الطلب 
            </p> 
 
            <p className="mt-1 text-sm font-semibold text-[#1f1f1f]"> 
              {formatDate( 
                order.createdAt 
              )} 
            </p> 
          </div> 
 
          <div> 
            <p className="text-xs text-gray-400"> 
              إجمالي الطلب 
            </p> 
 
            <p className="mt-1 font-bold text-[#a3834d]"> 
              {formatPrice( 
                order.total 
              )}{" "} 
              دج 
            </p> 
          </div> 
 
        </div> 
 
      </div> 
 
      {/* ================================================== 
          CANCELLED 
      ================================================== */} 
 
      {order.status === 
        "CANCELLED" && ( 
        <div className="rounded-3xl border border-red-100 bg-red-50 p-7 text-center"> 
 
          <XCircle 
            size={42} 
            className="mx-auto text-red-500" 
          /> 
 
          <h3 className="mt-4 text-xl font-bold text-red-700"> 
            تم إلغاء الطلب 
          </h3> 
 
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-red-600"> 
            نأسف، هذا الطلب لم يعد قيد 
            المعالجة. 
          </p> 
 
        </div> 
      )} 
 
      {/* ================================================== 
          TIMELINE 
      ================================================== */} 
 
      {order.status !== 
        "CANCELLED" && ( 
        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-8"> 
 
          <div className="mb-8 flex items-center gap-3"> 
 
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f1f] text-[#d4b574]"> 
              <Truck size={20} /> 
            </div> 
 
            <div> 
              <h3 className="text-xl font-bold text-[#1f1f1f]"> 
                تتبع حالة الطلب 
              </h3> 
 
              <p className="mt-1 text-xs text-gray-400"> 
                حالة طلبك الحالية 
              </p> 
            </div> 
 
          </div> 
 
          <div className="relative"> 
 
            {/* BACKGROUND LINE */} 
 
            <div className="absolute right-[19px] top-5 h-[calc(100%-40px)] w-px bg-black/10 sm:right-[23px]" /> 
 
            {/* PROGRESS LINE */} 
 
            {currentIndex > 0 && ( 
              <div 
                className="absolute right-[19px] top-5 w-px bg-[#a3834d] transition-all duration-700 sm:right-[23px]" 
                style={{ 
                  height: `${ 
                    (currentIndex / 
                      (statusSteps.length - 
                        1)) * 
                    100 
                  }%`, 
                }} 
              /> 
            )} 
 
            <div className="space-y-9"> 
 
              {statusSteps.map( 
                ( 
                  step, 
                  index 
                ) => { 
                  const completed = 
                    index <= 
                    currentIndex; 
 
                  const active = 
                    index === 
                    currentIndex; 
 
                  const Icon = 
                    step.icon; 
 
                  return ( 
                    <div 
                      key={ 
                        step.key 
                      } 
                      className="relative flex items-start gap-4" 
                    > 
 
                      {/* ICON */} 
 
                      <div 
                        className={` 
                          relative 
                          z-10 
                          flex 
                          h-10 
                          w-10 
                          shrink-0 
                          items-center 
                          justify-center 
                          rounded-full 
                          border-4 
                          border-white 
                          transition-all 
                          duration-500 
                          sm:h-12 
                          sm:w-12 
                          ${ 
                            completed 
                              ? "bg-[#a3834d] text-white" 
                              : "bg-gray-100 text-gray-400" 
                          } 
                          ${ 
                            active 
                              ? "ring-4 ring-[#a3834d]/10" 
                              : "" 
                          } 
                        `} 
                      > 
                        <Icon 
                          size={19} 
                        /> 
                      </div> 
 
                      {/* TEXT */} 
 
                      <div className="pt-1"> 
 
                        <h4 
                          className={` 
                            font-bold 
                            ${ 
                              completed 
                                ? "text-[#1f1f1f]" 
                                : "text-gray-400" 
                            } 
                          `} 
                        > 
                          { 
                            step.label 
                          } 
 
                          {active && ( 
                            <span className="mr-2 inline-block rounded-full bg-[#a3834d]/10 px-2 py-0.5 text-[10px] font-bold text-[#a3834d]"> 
                              الحالة الحالية 
                            </span> 
                          )} 
                        </h4> 
 
                        <p 
                          className={` 
                            mt-1 
                            text-xs 
                            leading-6 
                            ${ 
                              completed 
                                ? "text-gray-500" 
                                : "text-gray-400" 
                            } 
                          `} 
                        > 
                          { 
                            step.description 
                          } 
                        </p> 
 
                      </div> 
 
                    </div> 
                  ); 
                } 
              )} 
 
            </div> 
 
          </div> 
 
        </div> 
      )} 
 
    </div> 
  ); 
} 
 
// ====================================================== 
// PAGE 
// ====================================================== 
 
export default function TrackOrderPage() { 
  const [ 
    orderNumber, 
    setOrderNumber, 
  ] = useState(""); 
 
  const [phone, setPhone] = 
    useState(""); 
 
  const [ 
    forgotOrderNumber, 
    setForgotOrderNumber, 
  ] = useState(false); 
 
  const [loading, setLoading] = 
    useState(false); 
 
  const [error, setError] = 
    useState(""); 
 
  const [orders, setOrders] = 
    useState<TrackOrderItem[]>( 
      [] 
    ); 
 
  const [ 
    selectedOrderNumber, 
    setSelectedOrderNumber, 
  ] = useState< 
    number | null 
  >(null); 
 
  // ==================================================== 
  // SELECTED ORDER 
  // ==================================================== 
 
  const selectedOrder = 
    orders.find( 
      (order) => 
        order.orderNumber === 
        selectedOrderNumber 
    ) ?? null; 
 
  // ==================================================== 
  // SUBMIT 
  // ==================================================== 
 
  async function handleSubmit( 
    event: FormEvent<HTMLFormElement> 
  ) { 
    event.preventDefault(); 
 
    setError(""); 
    setOrders([]); 
    setSelectedOrderNumber(null); 
    setLoading(true); 
 
    try { 
      const searchOrderNumber = 
        forgotOrderNumber 
          ? "" 
          : orderNumber; 
 
      const result = 
        await trackOrder( 
          searchOrderNumber, 
          phone 
        ); 
 
      if (!result.success) { 
        setError(result.error); 
        return; 
      } 
 
      setOrders( 
        result.orders 
      ); 
 
      // إذا كان هناك طلب واحد فقط 
      // نعرضه مباشرة. 
 
      if ( 
        result.orders.length === 
        1 
      ) { 
        setSelectedOrderNumber( 
          result.orders[0] 
            .orderNumber 
        ); 
      } 
    } catch { 
      setError( 
        "حدث خطأ أثناء البحث عن الطلب. حاول مرة أخرى." 
      ); 
    } finally { 
      setLoading(false); 
    } 
  } 
 
  // ==================================================== 
  // RESET 
  // ==================================================== 
 
  function handleNewSearch() { 
    setOrders([]); 
    setSelectedOrderNumber( 
      null 
    ); 
    setError(""); 
  } 
 
  // ==================================================== 
  // RENDER 
  // ==================================================== 
 
  return ( 
    <> 
      <Navbar />

      <main 
        dir="rtl" 
        className=" 
          min-h-screen 
          bg-[#f3eadc]
          px-4 
          pt-2 
          pb-12 
          sm:px-6 
          sm:pt-2 
          lg:pb-16 
          [scrollbar-width:none] 
          [&::-webkit-scrollbar]:hidden 
        " 
      > 
        <div className="mx-auto max-w-4xl"> 
 
          {/* ================================================== 
              HEADER 
          ================================================== */} 
 
          <div className="mb-3 text-center"> 
 
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1f1f1f] text-[#d4b574] shadow-sm"> 
              <PackageSearch 
                size={30} 
              /> 
            </div> 
 
            <h1 className="text-3xl font-bold text-[#1f1f1f] sm:text-4xl"> 
              تتبع طلبك 
            </h1> 
 
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-500 sm:text-base"> 
              أدخل رقم الطلب ورقم الهاتف 
              لمعرفة حالة طلبك، أو استخدم رقم 
              الهاتف فقط إذا كنت لا تتذكر رقم 
              الطلب. 
            </p> 
 
          </div> 
 
          {/* ================================================== 
              SEARCH FORM 
          ================================================== */} 
 
          <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-8"> 
 
            <form 
              onSubmit={handleSubmit} 
              className="space-y-5" 
            > 
 
              {/* ORDER NUMBER */} 
 
              <div 
                className={ 
                  forgotOrderNumber 
                    ? "opacity-50" 
                    : "" 
                } 
              > 
 
                <div className="mb-2 flex items-center justify-between"> 
 
                  <label 
                    htmlFor="orderNumber" 
                    className="block text-sm font-bold text-[#1f1f1f]" 
                  > 
                    رقم الطلب 
                  </label> 
 
                  <span className="text-xs text-gray-400"> 
                    اختياري 
                  </span> 
 
                </div> 
 
                <input 
                  id="orderNumber" 
                  type="text" 
                  inputMode="text" 
                  dir="ltr" 
                  disabled={ 
                    forgotOrderNumber 
                  } 
                  value={ 
                    orderNumber 
                  } 
                  onChange={(event) => 
                    setOrderNumber( 
                      event.target 
                        .value 
                    ) 
                  } 
                  placeholder="مثال: ORD-8 أو 8" 
                  className=" 
                    w-full 
                    rounded-xl 
                    border 
                    border-black/10 
                    bg-white 
                    px-4 
                    py-3.5 
                    text-left 
                    text-sm 
                    outline-none 
                    transition 
                    placeholder:text-gray-400 
                    focus:border-[#a3834d] 
                    focus:ring-2 
                    focus:ring-[#a3834d]/10 
                    disabled:cursor-not-allowed 
                    disabled:bg-gray-50 
                  " 
                /> 
 
                <p className="mt-2 text-xs text-gray-400"> 
                  يمكنك كتابة الرقم كما ظهر لك، 
                  مثل ORD-8، أو كتابة 8 فقط. 
                </p> 
 
              </div> 
 
              {/* FORGOT ORDER NUMBER */} 
 
              <label 
                className=" 
                  flex 
                  cursor-pointer 
                  items-center 
                  gap-3 
                  rounded-xl 
                  border 
                  border-black/5 
                  bg-[#faf9f6] 
                  px-4 
                  py-3 
                " 
              > 
 
                <input 
                  type="checkbox" 
                  checked={ 
                    forgotOrderNumber 
                  } 
                  onChange={(event) => { 
                    const checked = 
                      event.target 
                        .checked; 
 
                    setForgotOrderNumber( 
                      checked 
                    ); 
 
                    if (checked) { 
                      setOrderNumber( 
                        "" 
                      ); 
                    } 
                  }} 
                  className=" 
                    h-4 
                    w-4 
                    accent-[#a3834d] 
                  " 
                /> 
 
                <span className="text-sm font-semibold text-[#1f1f1f]"> 
                  لا أتذكر رقم الطلب 
                </span> 
 
              </label> 
 
              {/* PHONE */} 
 
              <div> 
 
                <div className="mb-2 flex items-center justify-between"> 
 
                  <label 
                    htmlFor="phone" 
                    className="block text-sm font-bold text-[#1f1f1f]" 
                  > 
                    رقم الهاتف 
                  </label> 
 
                  <span className="text-xs text-red-400"> 
                    مطلوب 
                  </span> 
 
                </div> 
 
                <input 
                  id="phone" 
                  type="tel" 
                  inputMode="tel" 
                  dir="ltr" 
                  value={phone} 
                  onChange={(event) => 
                    setPhone( 
                      event.target 
                        .value 
                    ) 
                  } 
                  placeholder="0550123456" 
                  className=" 
                    w-full 
                    rounded-xl 
                    border 
                    border-black/10 
                    bg-white 
                    px-4 
                    py-3.5 
                    text-left 
                    text-sm 
                    outline-none 
                    transition 
                    placeholder:text-gray-400 
                    focus:border-[#a3834d] 
                    focus:ring-2 
                    focus:ring-[#a3834d]/10 
                  " 
                /> 
 
              </div> 
 
              {/* ERROR */} 
 
              {error && ( 
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-600"> 
                  {error} 
                </div> 
              )} 
 
              {/* SUBMIT */} 
 
              <button 
                type="submit" 
                disabled={loading} 
                className=" 
                  flex 
                  w-full 
                  items-center 
                  justify-center 
                  gap-2 
                  rounded-xl 
                  bg-[#1f1f1f] 
                  px-5 
                  py-3.5 
                  text-sm 
                  font-bold 
                  text-white 
                  transition 
                  hover:bg-[#a3834d] 
                  disabled:cursor-not-allowed 
                  disabled:opacity-60 
                " 
              > 
 
                {loading ? ( 
                  <> 
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> 
                    جاري البحث... 
                  </> 
                ) : ( 
                  <> 
                    <Search 
                      size={18} 
                    /> 
                    تتبع الطلب 
                  </> 
                )} 
 
              </button> 
 
            </form> 
 
            {/* SECURITY */} 
 
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#faf9f6] p-4 text-xs leading-6 text-gray-500"> 
 
              <ShieldCheck 
                size={18} 
                className="mt-0.5 shrink-0 text-[#a3834d]" 
              /> 
 
              <p> 
                نستخدم رقم الهاتف للتحقق من 
                طلباتك وحماية معلومات الطلب من 
                الوصول غير المصرح به. 
              </p> 
 
            </div> 
 
          </section> 
 
          {/* ================================================== 
              MULTIPLE ORDERS 
          ================================================== */} 
 
          {orders.length > 1 && ( 
            <section className="mt-8"> 
 
              <div className="mb-5"> 
 
                <h2 className="text-xl font-bold text-[#1f1f1f]"> 
                  طلباتك 
                </h2> 
 
                <p className="mt-1 text-sm text-gray-500"> 
                  وجدنا {orders.length}{" "} 
                  طلبات مرتبطة بهذا الرقم. 
                  اختر الطلب الذي تريد تتبعه. 
                </p> 
 
              </div> 
 
              <div className="space-y-4"> 
 
                {orders.map( 
                  (order) => ( 
                    <OrderCard 
                      key={ 
                        order.orderNumber 
                      } 
                      order={order} 
                      selected={ 
                        selectedOrderNumber === 
                        order.orderNumber 
                      } 
                      onClick={() => 
                        setSelectedOrderNumber( 
                          order.orderNumber 
                        ) 
                      } 
                    /> 
                  ) 
                )} 
 
              </div> 
 
            </section> 
          )} 
 
          {/* ================================================== 
              SELECTED ORDER DETAILS 
          ================================================== */} 
 
          {selectedOrder && ( 
            <OrderDetails 
              order={ 
                selectedOrder 
              } 
            /> 
          )} 
 
          {/* ================================================== 
              NEW SEARCH 
          ================================================== */} 
 
          {orders.length > 0 && ( 
            <div className="mt-8 text-center"> 
 
              <button 
                type="button" 
                onClick={ 
                  handleNewSearch 
                } 
                className=" 
                  inline-flex 
                  items-center 
                  gap-2 
                  rounded-xl 
                  border 
                  border-black/10 
                  bg-white 
                  px-5 
                  py-3 
                  text-sm 
                  font-bold 
                  text-[#1f1f1f] 
                  transition 
                  hover:border-[#a3834d] 
                  hover:text-[#a3834d] 
                " 
              > 
                <Search 
                  size={16} 
                /> 
 
                بحث عن طلب آخر 
              </button> 
 
            </div> 
          )} 
 
          {/* ================================================== 
              HOME 
          ================================================== */} 
 
          <div className="mt-8 text-center"> 
 
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm font-bold text-[#a3834d] transition hover:text-[#1f1f1f]" 
            > 
              العودة إلى المتجر 
 
              <ArrowRight 
                size={16} 
              /> 
            </Link> 
 
          </div> 
 
        </div> 
      </main> 
    </> 
  ); 
}