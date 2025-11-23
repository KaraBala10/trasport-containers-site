"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { apiService } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface FCLQuote {
  id: number;
  quote_number?: string;
  // Route Details
  origin_country: string;
  origin_city: string;
  origin_zip?: string;
  port_of_loading: string;
  destination_country: string;
  destination_city: string;
  port_of_discharge: string;
  // Container Details
  container_type: string;
  number_of_containers: number;
  cargo_ready_date: string;
  // Cargo Details
  commodity_type: string;
  usage_type: string;
  total_weight: string | number;
  total_volume: string | number;
  cargo_value: string | number;
  is_dangerous: boolean;
  un_number?: string;
  dangerous_class?: string;
  // Additional Services
  pickup_required: boolean;
  pickup_address?: string;
  forklift_available: boolean;
  eu_export_clearance: boolean;
  cargo_insurance: boolean;
  on_carriage: boolean;
  // Customer Details
  full_name: string;
  company_name?: string;
  country: string;
  phone: string;
  email: string;
  preferred_contact: string;
  // Files
  packing_list?: string;
  photos?: string;
  // Status
  total_price: number | null;
  price_per_container: number | null;
  amount_paid?: number | null;
  status: string;
  offer_message?: string;
  offer_sent_at?: string;
  user_response?: string;
  edit_request_message?: string;
  created_at: string;
  // User info (for admin view)
  user?: {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, isRTL, mounted } = useLanguage();
  const router = useRouter();
  const [fclQuotes, setFclQuotes] = useState<FCLQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());
  const [editingQuote, setEditingQuote] = useState<FCLQuote | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [editRequestMessage, setEditRequestMessage] = useState("");
  const [showEditRequest, setShowEditRequest] = useState<number | null>(null);

  const translations = useMemo(
    () => ({
      ar: {
        dashboard: "لوحة التحكم",
        welcome: "مرحباً",
        welcomeBack: "مرحباً بعودتك",
        loading: "جاري التحميل...",
        logout: "تسجيل الخروج",
        goToHome: "الذهاب إلى الصفحة الرئيسية",
        quickActions: "إجراءات سريعة",
        createLCLShipment: "إنشاء شحنة LCL إلى سوريا",
        createLCLShipmentDesc: "إنشاء طلب شحنة LCL جديد إلى سوريا",
        trackShipment: "تتبع الشحنة",
        trackShipmentDesc: "تتبع شحناتك الحالية",
        fclQuote: "طلب عرض سعر FCL",
        fclQuoteDesc: "طلب عرض سعر لحاوية كاملة (FCL)",
        getQuote: "الحصول على عرض سعر",
        getQuoteDesc: "طلب عرض سعر للشحن",
        profile: "الملف الشخصي",
        profileDesc: "إدارة إعدادات حسابك",
        accountInfo: "معلومات الحساب",
        email: "البريد الإلكتروني",
        username: "اسم المستخدم",
        memberSince: "عضو منذ",
        myFCLQuotes: "طلبات عرض السعر FCL الخاصة بي",
        noQuotes: "لا توجد طلبات عرض سعر حتى الآن",
        quoteNumber: "رقم الطلب",
        route: "المسار",
        containerType: "نوع الحاوية",
        containers: "عدد الحاويات",
        status: "الحالة",
        price: "السعر",
        date: "التاريخ",
        pending: "قيد الانتظار",
        processed: "تمت المعالجة",
        viewDetails: "عرض التفاصيل",
        edit: "تعديل",
        delete: "حذف",
        expand: "عرض التفاصيل",
        collapse: "إخفاء التفاصيل",
        origin: "من",
        destination: "إلى",
        cargoReadyDate: "تاريخ جاهزية الشحنة",
        commodityType: "نوع البضاعة",
        usageType: "نوع الاستخدام",
        totalWeight: "الوزن الإجمالي (كجم)",
        totalVolume: "الحجم الإجمالي (م³)",
        cargoValue: "قيمة الشحنة (يورو)",
        dangerousGoods: "بضائع خطرة",
        unNumber: "رقم UN",
        dangerousClass: "فئة الخطورة",
        pickupRequired: "مطلوب استلام",
        pickupAddress: "عنوان الاستلام",
        forkliftAvailable: "رافعة شوكية متاحة",
        euExportClearance: "إخلاء تصدير الاتحاد الأوروبي",
        cargoInsurance: "تأمين الشحنة",
        onCarriage: "نقل داخلي",
        customerDetails: "تفاصيل العميل",
        fullName: "الاسم الكامل",
        companyName: "اسم الشركة",
        phone: "الهاتف",
        preferredContact: "طريقة الاتصال المفضلة",
        deleteConfirm: "هل أنت متأكد من حذف هذا الطلب؟",
        deleteSuccess: "تم حذف الطلب بنجاح",
        updateSuccess: "تم تحديث الطلب بنجاح",
        error: "حدث خطأ",
        actions: "الإجراءات",
        editProfile: "تعديل الملف الشخصي",
        saveProfile: "حفظ التغييرات",
        cancel: "إلغاء",
        profileUpdated: "تم تحديث الملف الشخصي بنجاح",
        firstName: "الاسم الأول",
        lastName: "اسم العائلة",
        allFCLQuotes: "جميع طلبات عرض السعر FCL",
        approve: "موافقة",
        reject: "رفض",
        rejected: "مرفوض",
        approveConfirm: "هل أنت متأكد من الموافقة على هذا الطلب؟",
        rejectConfirm: "هل أنت متأكد من رفض هذا الطلب؟",
        approveSuccess: "تمت الموافقة على الطلب بنجاح",
        rejectSuccess: "تم رفض الطلب بنجاح",
        changeStatus: "تغيير الحالة",
        statusUpdated: "تم تحديث الحالة بنجاح",
        customer: "العميل",
        submittedBy: "مقدم من",
        userResponse: "رد المستخدم",
        accepted: "مقبول",
        editRequested: "تم طلب التعديل",
        userRequestToEdit: "طلب المستخدم تعديل العرض بهذه الرسالة:",
        amountPaid: "المبلغ المدفوع",
        totalPrice: "السعر الإجمالي",
        paymentProgress: "تقدم الدفع",
        updatePaidAmount: "تحديث المبلغ المدفوع",
        // Status translations
        CREATED: "تم الإنشاء",
        PENDING_PAYMENT: "في انتظار الدفع",
        PENDING_PICKUP: "في انتظار الاستلام",
        IN_TRANSIT_TO_AXEL: "في الطريق إلى أكسل",
        ARRIVED_AXEL: "وصل إلى أكسل",
        SORTING_AXEL: "فرز في أكسل",
        READY_FOR_EXPORT: "جاهز للتصدير",
        IN_TRANSIT_TO_SYRIA: "في الطريق إلى سوريا",
        ARRIVED_SYRIA: "وصل إلى سوريا",
        SYRIA_SORTING: "فرز في سوريا",
        READY_FOR_DELIVERY: "جاهز للتسليم",
        OUT_FOR_DELIVERY: "خارج للتسليم",
        DELIVERED: "تم التسليم",
        CANCELLED: "ملغى",
      },
      en: {
        dashboard: "Dashboard",
        welcome: "Welcome",
        welcomeBack: "Welcome back",
        loading: "Loading...",
        logout: "Logout",
        goToHome: "Go to Home",
        quickActions: "Quick Actions",
        createLCLShipment: "Create LCL Shipment to Syria",
        createLCLShipmentDesc: "Create a new LCL shipment request to Syria",
        trackShipment: "Track Shipment",
        trackShipmentDesc: "Track your existing shipments",
        fclQuote: "Request FCL Quote",
        fclQuoteDesc: "Request a quote for a full container load (FCL)",
        getQuote: "Get Quote",
        getQuoteDesc: "Request a shipping quote",
        profile: "Profile",
        profileDesc: "Manage your account settings",
        accountInfo: "Account Information",
        email: "Email",
        username: "Username",
        memberSince: "Member since",
        myFCLQuotes: "My FCL Quote Requests",
        noQuotes: "No quote requests yet",
        quoteNumber: "Quote Number",
        route: "Route",
        containerType: "Container Type",
        containers: "Containers",
        status: "Status",
        price: "Price",
        date: "Date",
        pending: "Pending",
        processed: "Processed",
        viewDetails: "View Details",
        edit: "Edit",
        delete: "Delete",
        expand: "View Details",
        collapse: "Hide Details",
        origin: "From",
        destination: "To",
        cargoReadyDate: "Cargo Ready Date",
        commodityType: "Commodity Type",
        usageType: "Usage Type",
        totalWeight: "Total Weight (KG)",
        totalVolume: "Total Volume (CBM)",
        cargoValue: "Cargo Value (EUR)",
        dangerousGoods: "Dangerous Goods",
        unNumber: "UN Number",
        dangerousClass: "Dangerous Class",
        pickupRequired: "Pickup Required",
        pickupAddress: "Pickup Address",
        forkliftAvailable: "Forklift Available",
        euExportClearance: "EU Export Clearance",
        cargoInsurance: "Cargo Insurance",
        onCarriage: "On-carriage",
        customerDetails: "Customer Details",
        fullName: "Full Name",
        companyName: "Company Name",
        phone: "Phone",
        preferredContact: "Preferred Contact",
        deleteConfirm: "Are you sure you want to delete this quote?",
        deleteSuccess: "Quote deleted successfully",
        updateSuccess: "Quote updated successfully",
        error: "An error occurred",
        actions: "Actions",
        editProfile: "Edit Profile",
        saveProfile: "Save Changes",
        cancel: "Cancel",
        profileUpdated: "Profile updated successfully",
        firstName: "First Name",
        lastName: "Last Name",
        allFCLQuotes: "All FCL Quote Requests",
        changeStatus: "Change Status",
        statusUpdated: "Status updated successfully",
        customer: "Customer",
        submittedBy: "Submitted by",
        userResponse: "User Response",
        accepted: "Accepted",
        editRequested: "Edit Requested",
        userRequestToEdit: "Edit request message:",
        amountPaid: "Amount Paid",
        totalPrice: "Total Price",
        paymentProgress: "Payment Progress",
        updatePaidAmount: "Update Paid Amount",
        // Status translations
        CREATED: "Created",
        OFFER_SENT: "Offer Sent",
        PENDING_PAYMENT: "Pending Payment",
        PENDING_PICKUP: "Pending Pickup",
        IN_TRANSIT_TO_AXEL: "In Transit to Axel",
        ARRIVED_AXEL: "Arrived Axel",
        SORTING_AXEL: "Sorting Axel",
        READY_FOR_EXPORT: "Ready for Export",
        IN_TRANSIT_TO_SYRIA: "In Transit to Syria",
        ARRIVED_SYRIA: "Arrived Syria",
        SYRIA_SORTING: "Syria Sorting",
        READY_FOR_DELIVERY: "Ready for Delivery",
        OUT_FOR_DELIVERY: "Out for Delivery",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
      },
    }),
    []
  );

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  // Fetch user's FCL quotes
  useEffect(() => {
    const fetchFCLQuotes = async () => {
      if (!isAuthenticated || !mounted) return;

      try {
        setQuotesLoading(true);
        const response = await apiService.getFCLQuotes();
        // Handle both paginated and non-paginated responses
        const quotes = response.data?.results || response.data || [];
        setFclQuotes(Array.isArray(quotes) ? quotes : []);
      } catch (error: any) {
        console.error("Error fetching FCL quotes:", error);
        if (error.response?.status === 401) {
          // User not authenticated, redirect to login
          router.push("/login");
        } else {
          setFclQuotes([]);
        }
      } finally {
        setQuotesLoading(false);
      }
    };

    fetchFCLQuotes();
  }, [isAuthenticated, mounted, router]);

  // Toggle quote expansion
  const toggleQuote = (quoteId: number) => {
    setExpandedQuotes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quoteId)) {
        newSet.delete(quoteId);
      } else {
        newSet.add(quoteId);
      }
      return newSet;
    });
  };

  // Handle delete
  const handleDelete = async (quoteId: number) => {
    try {
      await apiService.deleteFCLQuote(quoteId);
      setFclQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      setDeleteConfirm(null);
      alert(t.deleteSuccess);
    } catch (error: any) {
      console.error("Error deleting quote:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    }
  };

  // Handle edit - open edit modal
  const handleEdit = (quote: FCLQuote) => {
    setEditingQuote(quote);
  };

  // Handle profile edit
  const handleEditProfile = () => {
    // Populate profileData with current user values
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
    setEditingProfile(true);
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setProfileSaving(true);
      await apiService.updateProfile(profileData);

      // Refresh user data by reloading the page
      alert(t.profileUpdated);
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle cancel profile edit
  const handleCancelProfileEdit = () => {
    // Reset to original user data
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
      });
    }
    setEditingProfile(false);
  };

  // Handle update paid amount (admin only)
  const handleUpdatePaidAmount = async (quoteId: number) => {
    try {
      const quote = fclQuotes.find((q) => q.id === quoteId);
      if (!quote) return;

      const currentAmountPaid = quote.amount_paid || 0;
      const totalPrice = quote.total_price || 0;

      const amountPaidInput = prompt(
        language === "ar"
          ? `أدخل المبلغ المدفوع (الحالي: ${currentAmountPaid} EUR, السعر الإجمالي: ${totalPrice} EUR):`
          : `Enter amount paid (Current: ${currentAmountPaid} EUR, Total Price: ${totalPrice} EUR):`
      );
      if (amountPaidInput === null) {
        // User cancelled
        return;
      }
      const parsedAmount = parseFloat(amountPaidInput || "0");
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        alert(
          language === "ar"
            ? "يرجى إدخال مبلغ صحيح"
            : "Please enter a valid amount"
        );
        return;
      }
      if (totalPrice > 0 && parsedAmount > totalPrice) {
        alert(
          language === "ar"
            ? "المبلغ المدفوع لا يمكن أن يكون أكبر من السعر الإجمالي"
            : "Amount paid cannot be greater than total price"
        );
        return;
      }

      // Update amount_paid by calling status update with same status
      const response = await apiService.updateFCLQuoteStatus(
        quoteId,
        quote.status,
        undefined,
        parsedAmount,
        undefined
      );

      // Update the quote in the list immediately
      if (response.data?.data) {
        setFclQuotes((prevQuotes) =>
          prevQuotes.map((q) =>
            q.id === quoteId ? { ...q, ...response.data.data } : q
          )
        );
      }

      // Refresh quotes list to ensure consistency
      const quotesResponse = await apiService.getFCLQuotes();
      const quotes = quotesResponse.data?.results || quotesResponse.data || [];
      setFclQuotes(Array.isArray(quotes) ? quotes : []);

      alert(
        language === "ar"
          ? "تم تحديث المبلغ المدفوع بنجاح"
          : "Amount paid updated successfully"
      );
    } catch (error: any) {
      console.error("Error updating paid amount:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    }
  };

  // Handle status change (admin only)
  const handleStatusChange = async (quoteId: number, newStatus: string) => {
    try {
      let offerMessage = "";

      // If changing to OFFER_SENT, prompt for message
      if (newStatus === "OFFER_SENT") {
        offerMessage =
          prompt(
            language === "ar"
              ? "أدخل رسالة العرض للمستخدم:"
              : "Enter offer message for the user:"
          ) || "";
        if (offerMessage === null || offerMessage.trim() === "") {
          // User cancelled or empty message, don't update status
          alert(
            language === "ar"
              ? "يجب إدخال رسالة العرض"
              : "Offer message is required"
          );
          return;
        }
      }

      // If changing to PENDING_PAYMENT, always prompt for total price and amount paid
      let amountPaid: number | undefined = undefined;
      let totalPrice: number | undefined = undefined;
      if (newStatus === "PENDING_PAYMENT") {
        const quote = fclQuotes.find((q) => q.id === quoteId);
        const currentTotalPrice = quote?.total_price || 0;

        // Always prompt for total price
        const totalPriceInput = prompt(
          language === "ar"
            ? `أدخل السعر الإجمالي (EUR)${
                currentTotalPrice > 0 ? ` (الحالي: ${currentTotalPrice})` : ""
              }:`
            : `Enter total price (EUR)${
                currentTotalPrice > 0 ? ` (Current: ${currentTotalPrice})` : ""
              }:`
        );
        if (totalPriceInput === null) {
          // User cancelled, don't update status
          return;
        }
        const parsedTotalPrice = parseFloat(totalPriceInput || "0");
        if (isNaN(parsedTotalPrice) || parsedTotalPrice <= 0) {
          alert(
            language === "ar"
              ? "يرجى إدخال سعر إجمالي صحيح"
              : "Please enter a valid total price"
          );
          return;
        }
        totalPrice = parsedTotalPrice;

        // Prompt for amount paid
        const amountPaidInput = prompt(
          language === "ar"
            ? `أدخل المبلغ المدفوع (السعر الإجمالي: ${totalPrice} EUR):`
            : `Enter amount paid (Total Price: ${totalPrice} EUR):`
        );
        if (amountPaidInput === null) {
          // User cancelled, don't update status
          return;
        }
        const parsedAmount = parseFloat(amountPaidInput || "0");
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          alert(
            language === "ar"
              ? "يرجى إدخال مبلغ صحيح"
              : "Please enter a valid amount"
          );
          return;
        }
        if (parsedAmount > totalPrice) {
          alert(
            language === "ar"
              ? "المبلغ المدفوع لا يمكن أن يكون أكبر من السعر الإجمالي"
              : "Amount paid cannot be greater than total price"
          );
          return;
        }
        amountPaid = parsedAmount;
      }

      const response = await apiService.updateFCLQuoteStatus(
        quoteId,
        newStatus,
        offerMessage,
        amountPaid,
        totalPrice
      );

      // Update the quote in the list immediately with the response data
      if (response.data?.data) {
        setFclQuotes((prevQuotes) =>
          prevQuotes.map((q) =>
            q.id === quoteId ? { ...q, ...response.data.data } : q
          )
        );
      }

      // Refresh quotes list to ensure consistency
      const quotesResponse = await apiService.getFCLQuotes();
      const quotes = quotesResponse.data?.results || quotesResponse.data || [];
      setFclQuotes(Array.isArray(quotes) ? quotes : []);

      alert(t.statusUpdated);
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    }
  };

  // Get status color based on status value
  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      CREATED:
        "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300",
      OFFER_SENT:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
      PENDING_PAYMENT:
        "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300",
      PENDING_PICKUP:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
      IN_TRANSIT_TO_AXEL:
        "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300",
      ARRIVED_AXEL:
        "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300",
      SORTING_AXEL:
        "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-300",
      READY_FOR_EXPORT:
        "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border border-cyan-300",
      IN_TRANSIT_TO_SYRIA:
        "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300",
      ARRIVED_SYRIA:
        "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300",
      SYRIA_SORTING:
        "bg-gradient-to-r from-lime-100 to-lime-200 text-lime-800 border border-lime-300",
      READY_FOR_DELIVERY:
        "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300",
      OUT_FOR_DELIVERY:
        "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300",
      DELIVERED:
        "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300",
      CANCELLED:
        "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300",
    };
    return (
      statusColors[status] ||
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300"
    );
  };

  // Get status display name
  const getStatusDisplay = (status: string) => {
    return (t as any)[status] || status.replace(/_/g, " ");
  };

  // Get user response display text
  const getUserResponseText = (userResponse: string | undefined) => {
    if (!userResponse) return null;

    const tAny = t as any;
    const responseMap: { [key: string]: string } = {
      PENDING: tAny.pending || "Pending",
      ACCEPTED: tAny.accepted || "Accepted",
      REJECTED: tAny.rejected || "Rejected",
      EDIT_REQUESTED: tAny.editRequested || "Edit Requested",
    };

    return responseMap[userResponse] || null;
  };

  // Get simplified status for regular users
  const getUserStatus = (quote: FCLQuote) => {
    if (quote.user_response === "ACCEPTED") {
      // If accepted, show PENDING_PAYMENT status
      return quote.status === "PENDING_PAYMENT"
        ? "PENDING_PAYMENT"
        : "ACCEPTED";
    }
    if (quote.user_response === "REJECTED") return "REJECTED";
    if (quote.status === "OFFER_SENT" && quote.offer_message)
      return "OFFER_SENT";
    if (quote.status === "CREATED") return "CREATED";
    return "PENDING";
  };

  // Handle user response to offer
  const handleRespondToOffer = async (
    quoteId: number,
    response: "ACCEPTED" | "REJECTED" | "EDIT_REQUESTED",
    editMessage?: string
  ) => {
    try {
      await apiService.respondToOffer(quoteId, response, editMessage);

      // Refresh quotes list
      const quotesResponse = await apiService.getFCLQuotes();
      const quotes = quotesResponse.data?.results || quotesResponse.data || [];
      setFclQuotes(Array.isArray(quotes) ? quotes : []);

      // Reset edit request UI
      setShowEditRequest(null);
      setEditRequestMessage("");

      let message = "";
      if (response === "ACCEPTED") {
        message =
          language === "ar"
            ? "تم قبول العرض بنجاح"
            : "Offer accepted successfully";
      } else if (response === "REJECTED") {
        message =
          language === "ar"
            ? "تم رفض العرض بنجاح"
            : "Offer rejected successfully";
      } else if (response === "EDIT_REQUESTED") {
        message =
          language === "ar"
            ? "تم إرسال طلب التعديل بنجاح"
            : "Edit request sent successfully";
      }
      alert(message);
    } catch (error: any) {
      console.error("Error responding to offer:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingQuote) return;

    try {
      const formData = new FormData();

      // Route Details
      formData.append("origin_country", editingQuote.origin_country);
      formData.append("origin_city", editingQuote.origin_city);
      if (editingQuote.origin_zip)
        formData.append("origin_zip", editingQuote.origin_zip);
      formData.append("port_of_loading", editingQuote.port_of_loading);
      formData.append("destination_country", editingQuote.destination_country);
      formData.append("destination_city", editingQuote.destination_city);
      formData.append("port_of_discharge", editingQuote.port_of_discharge);

      // Container Details
      formData.append("container_type", editingQuote.container_type);
      formData.append(
        "number_of_containers",
        editingQuote.number_of_containers.toString()
      );
      formData.append("cargo_ready_date", editingQuote.cargo_ready_date);

      // Cargo Details
      formData.append("commodity_type", editingQuote.commodity_type);
      formData.append("usage_type", editingQuote.usage_type);
      formData.append("total_weight", editingQuote.total_weight.toString());
      formData.append("total_volume", editingQuote.total_volume.toString());
      formData.append("cargo_value", editingQuote.cargo_value.toString());
      formData.append("is_dangerous", editingQuote.is_dangerous.toString());
      if (editingQuote.un_number)
        formData.append("un_number", editingQuote.un_number);
      if (editingQuote.dangerous_class)
        formData.append("dangerous_class", editingQuote.dangerous_class);

      // Additional Services
      formData.append(
        "pickup_required",
        editingQuote.pickup_required.toString()
      );
      if (editingQuote.pickup_address)
        formData.append("pickup_address", editingQuote.pickup_address);
      formData.append(
        "forklift_available",
        editingQuote.forklift_available.toString()
      );
      formData.append(
        "eu_export_clearance",
        editingQuote.eu_export_clearance.toString()
      );
      formData.append(
        "cargo_insurance",
        editingQuote.cargo_insurance.toString()
      );
      formData.append("on_carriage", editingQuote.on_carriage.toString());

      // Customer Details
      formData.append("full_name", editingQuote.full_name);
      if (editingQuote.company_name)
        formData.append("company_name", editingQuote.company_name);
      formData.append("country", editingQuote.country);
      formData.append("phone", editingQuote.phone);
      formData.append("email", editingQuote.email);
      formData.append("preferred_contact", editingQuote.preferred_contact);

      const response = await apiService.updateFCLQuote(
        editingQuote.id,
        formData
      );

      // Refresh quotes list to get updated data
      const quotesResponse = await apiService.getFCLQuotes();
      const quotes = quotesResponse.data?.results || quotesResponse.data || [];
      setFclQuotes(Array.isArray(quotes) ? quotes : []);

      setEditingQuote(null);
      alert(t.updateSuccess);
    } catch (error: any) {
      console.error("Error updating quote:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    }
  };

  // Early return with static text to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Access translations only after mounted check to prevent hydration mismatch
  const t = translations[language];

  // Check if user is admin
  const isAdmin = user?.is_superuser || false;

  if (!isAuthenticated) {
    return null;
  }

  // Format member since date
  const memberSinceDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString(
        language === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "long",
        }
      )
    : null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50"
    >
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-20" aria-hidden="true" />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div
              className="bg-gradient-to-r from-primary-dark via-primary-dark to-primary-yellow rounded-2xl shadow-2xl p-8 md:p-10 mb-8 text-white relative"
              style={{ overflow: "visible" }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-yellow/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {t.welcome},{" "}
                    {user?.first_name || user?.username || t.welcomeBack}!
                  </h1>
                  <p className="text-white/90 text-lg">{user?.email}</p>
                  {memberSinceDate && (
                    <p className="text-white/80 text-sm mt-2">
                      {t.memberSince} {memberSinceDate}
                    </p>
                  )}
                </div>

                <div
                  className="flex flex-col sm:flex-row gap-3 items-center relative"
                  style={{ zIndex: 50, overflow: "visible" }}
                >
                  <div
                    className="bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 p-1"
                    style={{ overflow: "visible" }}
                  >
                    <LanguageSwitcher
                      language={language}
                      setLanguage={setLanguage}
                    />
                  </div>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-white/30"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                      />
                    </svg>
                    {t.goToHome}
                  </Link>
                  <button
                    onClick={logout}
                    className="px-6 py-3 bg-red-600/90 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t.logout}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Section - Only for regular users */}
            {!isAdmin && (
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                  {t.quickActions}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Create LCL Shipment */}
                  <Link
                    href="/create-shipment"
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-primary-yellow transform hover:-translate-y-2"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-yellow/10 rounded-lg flex items-center justify-center group-hover:bg-primary-yellow/20 transition-colors">
                        <svg
                          className="w-6 h-6 text-primary-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-primary-yellow transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                              : "M14 5l7 7m0 0l-7 7m7-7H3"
                          }
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-primary-yellow transition-colors">
                      {t.createLCLShipment}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t.createLCLShipmentDesc}
                    </p>
                  </Link>

                  {/* FCL Quote */}
                  <Link
                    href="/fcl-quote"
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-primary-dark transform hover:-translate-y-2"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-dark/10 rounded-lg flex items-center justify-center group-hover:bg-primary-dark/20 transition-colors">
                        <svg
                          className="w-6 h-6 text-primary-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-primary-dark transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                              : "M14 5l7 7m0 0l-7 7m7-7H3"
                          }
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-primary-yellow transition-colors">
                      {t.fclQuote}
                    </h3>
                    <p className="text-gray-600 text-sm">{t.fclQuoteDesc}</p>
                  </Link>

                  {/* Track Shipment */}
                  <Link
                    href="/tracking"
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-t-4 border-primary-dark transform hover:-translate-y-2"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-dark/10 rounded-lg flex items-center justify-center group-hover:bg-primary-dark/20 transition-colors">
                        <svg
                          className="w-6 h-6 text-primary-dark"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-primary-dark transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isRTL
                              ? "M10 19l-7-7m0 0l7-7m-7 7h18"
                              : "M14 5l7 7m0 0l-7 7m7-7H3"
                          }
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:text-primary-yellow transition-colors">
                      {t.trackShipment}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t.trackShipmentDesc}
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {/* FCL Quotes Section */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                {isAdmin ? t.allFCLQuotes : t.myFCLQuotes}
              </h2>

              {quotesLoading ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark mx-auto"></div>
                  <p className="mt-4 text-gray-600">{t.loading}</p>
                </div>
              ) : fclQuotes.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg">{t.noQuotes}</p>
                  <Link
                    href="/fcl-quote"
                    className="mt-4 inline-block px-6 py-3 bg-primary-yellow text-primary-dark rounded-lg font-semibold hover:bg-primary-yellow/90 transition-all"
                  >
                    {t.fclQuote}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {fclQuotes.map((quote) => {
                    const isExpanded = expandedQuotes.has(quote.id);
                    return (
                      <div
                        key={quote.id}
                        className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 hover:border-primary-yellow/50 transition-all duration-300 overflow-hidden"
                      >
                        {/* Summary Row */}
                        <div className="p-6 bg-gradient-to-br from-white to-gray-50/50">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                              {/* Quote Number */}
                              <div className="sm:col-span-2 lg:col-span-2 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {t.quoteNumber}
                                  </p>
                                </div>
                                <p
                                  className="font-bold text-primary-dark text-base sm:text-lg font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                                  title={
                                    quote.quote_number ||
                                    `FCL-${quote.id
                                      .toString()
                                      .padStart(6, "0")}`
                                  }
                                >
                                  {quote.quote_number ||
                                    `FCL-${quote.id
                                      .toString()
                                      .padStart(6, "0")}`}
                                </p>
                                {isAdmin && quote.user && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                      {t.submittedBy}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                      {quote.user.username}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Route */}
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {t.route}
                                </p>
                                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                  <span className="text-primary-dark">
                                    {quote.port_of_loading}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-primary-dark">
                                    {quote.port_of_discharge}
                                  </span>
                                </p>
                              </div>

                              {/* Container Type */}
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {t.containerType}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {quote.container_type}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {quote.number_of_containers} {t.containers}
                                </p>
                              </div>

                              {/* Status */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {t.status}
                                </p>
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getStatusColor(
                                    quote.status || "CREATED"
                                  )}`}
                                >
                                  {getStatusDisplay(quote.status || "CREATED")}
                                </span>
                              </div>

                              {/* Payment Progress */}
                              {quote.status === "PENDING_PAYMENT" && (
                                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {t.paymentProgress}
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-gray-600 font-medium">
                                        {t.amountPaid}
                                      </span>
                                      <span className="font-bold text-primary-dark">
                                        €{quote.amount_paid || 0}
                                      </span>
                                    </div>
                                    {quote.total_price &&
                                      quote.total_price > 0 && (
                                        <>
                                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500 shadow-sm"
                                              style={{
                                                width: `${Math.min(
                                                  100,
                                                  ((quote.amount_paid || 0) /
                                                    quote.total_price) *
                                                    100
                                                )}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <p className="text-xs font-bold text-gray-700">
                                              {Math.round(
                                                ((quote.amount_paid || 0) /
                                                  quote.total_price) *
                                                  100
                                              )}
                                              %
                                            </p>
                                            <p className="text-xs text-gray-600">
                                              €{quote.total_price || 0}
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    {isAdmin && (
                                      <button
                                        onClick={() =>
                                          handleUpdatePaidAmount(quote.id)
                                        }
                                        className="mt-2 w-full px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                      >
                                        {t.updatePaidAmount}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* User Response */}
                              {quote.user_response &&
                                quote.user_response !== "PENDING" && (
                                  <div className="sm:col-span-2 lg:col-span-1">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                      {t.userResponse}
                                    </p>
                                    <p className="text-xs text-gray-700 leading-relaxed">
                                      {quote.user_response ===
                                        "EDIT_REQUESTED" &&
                                      quote.edit_request_message
                                        ? `${t.userRequestToEdit} ${quote.edit_request_message}`
                                        : getUserResponseText(
                                            quote.user_response
                                          )}
                                    </p>
                                  </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap lg:flex-col lg:items-stretch">
                              <button
                                onClick={() => toggleQuote(quote.id)}
                                className="px-5 py-2.5 text-sm font-semibold text-primary-dark bg-gradient-to-r from-primary-yellow/20 to-primary-yellow/30 hover:from-primary-yellow/30 hover:to-primary-yellow/40 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-primary-yellow/30"
                              >
                                {isExpanded ? t.collapse : t.expand}
                              </button>
                              {isAdmin ? (
                                <>
                                  {/* Admin: Status dropdown */}
                                  <select
                                    value={quote.status || "CREATED"}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        quote.id,
                                        e.target.value
                                      )
                                    }
                                    className="px-4 py-2.5 text-sm font-semibold text-primary-dark bg-white border-2 border-gray-300 rounded-xl hover:border-primary-yellow focus:border-primary-yellow focus:outline-none focus:ring-2 focus:ring-primary-yellow/20 transition-all duration-200 shadow-sm"
                                  >
                                    <option value="CREATED">
                                      {getStatusDisplay("CREATED")}
                                    </option>
                                    <option value="OFFER_SENT">
                                      {getStatusDisplay("OFFER_SENT")}
                                    </option>
                                    <option value="PENDING_PAYMENT">
                                      {getStatusDisplay("PENDING_PAYMENT")}
                                    </option>
                                    <option value="PENDING_PICKUP">
                                      {getStatusDisplay("PENDING_PICKUP")}
                                    </option>
                                    <option value="IN_TRANSIT_TO_AXEL">
                                      {getStatusDisplay("IN_TRANSIT_TO_AXEL")}
                                    </option>
                                    <option value="ARRIVED_AXEL">
                                      {getStatusDisplay("ARRIVED_AXEL")}
                                    </option>
                                    <option value="SORTING_AXEL">
                                      {getStatusDisplay("SORTING_AXEL")}
                                    </option>
                                    <option value="READY_FOR_EXPORT">
                                      {getStatusDisplay("READY_FOR_EXPORT")}
                                    </option>
                                    <option value="IN_TRANSIT_TO_SYRIA">
                                      {getStatusDisplay("IN_TRANSIT_TO_SYRIA")}
                                    </option>
                                    <option value="ARRIVED_SYRIA">
                                      {getStatusDisplay("ARRIVED_SYRIA")}
                                    </option>
                                    <option value="SYRIA_SORTING">
                                      {getStatusDisplay("SYRIA_SORTING")}
                                    </option>
                                    <option value="READY_FOR_DELIVERY">
                                      {getStatusDisplay("READY_FOR_DELIVERY")}
                                    </option>
                                    <option value="OUT_FOR_DELIVERY">
                                      {getStatusDisplay("OUT_FOR_DELIVERY")}
                                    </option>
                                    <option value="DELIVERED">
                                      {getStatusDisplay("DELIVERED")}
                                    </option>
                                    <option value="CANCELLED">
                                      {getStatusDisplay("CANCELLED")}
                                    </option>
                                  </select>
                                  {/* Admin: Delete button */}
                                  <button
                                    onClick={() => setDeleteConfirm(quote.id)}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                  >
                                    {t.delete}
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Regular user: Edit and Delete */}
                                  <button
                                    onClick={() => handleEdit(quote)}
                                    className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-blue-200"
                                  >
                                    {t.edit}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(quote.id)}
                                    className="px-5 py-2.5 text-sm font-semibold text-red-700 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 border border-red-200"
                                  >
                                    {t.delete}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {/* Route Details */}
                              <div className="space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                  <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                  <h4 className="font-bold text-primary-dark text-lg">
                                    {t.route}
                                  </h4>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.origin}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {quote.origin_city}, {quote.origin_country}
                                    {quote.origin_zip &&
                                      ` (${quote.origin_zip})`}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                    <span className="font-medium">POL:</span>
                                    <span>{quote.port_of_loading}</span>
                                  </p>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.destination}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {quote.destination_city},{" "}
                                    {quote.destination_country}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                    <span className="font-medium">POD:</span>
                                    <span>{quote.port_of_discharge}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Cargo Details */}
                              <div className="space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                  <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                  <h4 className="font-bold text-primary-dark text-lg">
                                    {language === "ar"
                                      ? "تفاصيل الشحنة"
                                      : "Cargo Details"}
                                  </h4>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.commodityType}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {quote.commodity_type}
                                  </p>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.usageType}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900 capitalize">
                                    {quote.usage_type}
                                  </p>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.cargoReadyDate}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {new Date(
                                      quote.cargo_ready_date
                                    ).toLocaleDateString(
                                      language === "ar" ? "ar-SA" : "en-US"
                                    )}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      {t.totalWeight}
                                    </p>
                                    <p className="text-sm font-bold text-primary-dark">
                                      {quote.total_weight} kg
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                      {t.totalVolume}
                                    </p>
                                    <p className="text-sm font-bold text-primary-dark">
                                      {quote.total_volume} m³
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.cargoValue}
                                  </p>
                                  <p className="text-lg font-bold text-primary-dark">
                                    €{quote.cargo_value}
                                  </p>
                                </div>
                                {quote.is_dangerous && (
                                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-lg mt-3">
                                    <p className="text-xs font-bold text-red-800 mb-2 uppercase tracking-wide">
                                      {t.dangerousGoods}
                                    </p>
                                    {quote.un_number && (
                                      <p className="text-xs text-red-700 font-medium">
                                        {t.unNumber}: {quote.un_number}
                                      </p>
                                    )}
                                    {quote.dangerous_class && (
                                      <p className="text-xs text-red-700 font-medium">
                                        {t.dangerousClass}:{" "}
                                        {quote.dangerous_class}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Offer Message (for users) */}
                              {!isAdmin &&
                                quote.status === "OFFER_SENT" &&
                                quote.offer_message && (
                                  <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-6 rounded-xl shadow-sm mb-4">
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                      <h4 className="font-bold text-blue-900 text-lg">
                                        {language === "ar"
                                          ? "رسالة العرض"
                                          : "Offer Message"}
                                      </h4>
                                    </div>
                                    <p className="text-sm text-blue-900 mb-4 whitespace-pre-wrap leading-relaxed font-medium">
                                      {quote.offer_message}
                                    </p>
                                    {quote.user_response === "PENDING" && (
                                      <div className="space-y-4">
                                        {showEditRequest === quote.id ? (
                                          <div className="space-y-3">
                                            <label className="block text-sm font-medium text-blue-900">
                                              {language === "ar"
                                                ? "أدخل طلب التعديل"
                                                : "Enter your edit request"}
                                            </label>
                                            <textarea
                                              value={editRequestMessage}
                                              onChange={(e) =>
                                                setEditRequestMessage(
                                                  e.target.value
                                                )
                                              }
                                              placeholder={
                                                language === "ar"
                                                  ? "اكتب طلب التعديل هنا..."
                                                  : "Type your edit request here..."
                                              }
                                              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none transition-all"
                                              rows={4}
                                            />
                                            <div className="flex gap-3">
                                              <button
                                                onClick={() =>
                                                  handleRespondToOffer(
                                                    quote.id,
                                                    "EDIT_REQUESTED",
                                                    editRequestMessage
                                                  )
                                                }
                                                disabled={
                                                  !editRequestMessage.trim()
                                                }
                                                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                                              >
                                                {language === "ar"
                                                  ? "إرسال طلب التعديل"
                                                  : "Send Edit Request"}
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setShowEditRequest(null);
                                                  setEditRequestMessage("");
                                                }}
                                                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                              >
                                                {language === "ar"
                                                  ? "إلغاء"
                                                  : "Cancel"}
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex flex-wrap gap-3">
                                            <button
                                              onClick={() =>
                                                handleRespondToOffer(
                                                  quote.id,
                                                  "ACCEPTED"
                                                )
                                              }
                                              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                            >
                                              {language === "ar"
                                                ? "قبول"
                                                : "Accept"}
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleRespondToOffer(
                                                  quote.id,
                                                  "REJECTED"
                                                )
                                              }
                                              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                            >
                                              {language === "ar"
                                                ? "رفض"
                                                : "Decline"}
                                            </button>
                                            <button
                                              onClick={() => {
                                                setShowEditRequest(quote.id);
                                                setEditRequestMessage("");
                                              }}
                                              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                            >
                                              {language === "ar"
                                                ? "طلب تعديل"
                                                : "Request Edit"}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                    {quote.user_response === "ACCEPTED" && (
                                      <p className="text-sm font-semibold text-green-700">
                                        {language === "ar"
                                          ? "✓ تم قبول العرض"
                                          : "✓ Offer Accepted"}
                                      </p>
                                    )}
                                    {quote.user_response === "REJECTED" && (
                                      <p className="text-sm font-semibold text-red-700">
                                        {language === "ar"
                                          ? "✗ تم رفض العرض"
                                          : "✗ Offer Rejected"}
                                      </p>
                                    )}
                                    {quote.user_response ===
                                      "EDIT_REQUESTED" && (
                                      <div className="space-y-2">
                                        <p className="text-sm font-semibold text-orange-700">
                                          {language === "ar"
                                            ? "✓ تم إرسال طلب التعديل"
                                            : "✓ Edit Request Sent"}
                                        </p>
                                        {quote.edit_request_message && (
                                          <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-lg">
                                            <p className="text-xs font-semibold text-orange-900 mb-1">
                                              {language === "ar"
                                                ? "طلبك:"
                                                : "Your Request:"}
                                            </p>
                                            <p className="text-sm text-orange-800 whitespace-pre-wrap">
                                              {quote.edit_request_message}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* Customer & Services */}
                              <div className="space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                  <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                  <h4 className="font-bold text-primary-dark text-lg">
                                    {t.customerDetails}
                                  </h4>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.fullName}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {quote.full_name}
                                  </p>
                                </div>
                                {quote.company_name && (
                                  <div className="space-y-1 pt-3 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                      {t.companyName}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {quote.company_name}
                                    </p>
                                  </div>
                                )}
                                <div className="space-y-1 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.email}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900 break-all">
                                    {quote.email}
                                  </p>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.phone}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {quote.phone}
                                  </p>
                                </div>
                                <div className="space-y-1 pt-3 border-t border-gray-100">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    {t.preferredContact}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900 capitalize">
                                    {quote.preferred_contact}
                                  </p>
                                </div>

                                {/* Additional Services */}
                                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                  <p className="text-xs font-bold text-primary-dark uppercase tracking-wide mb-3">
                                    {language === "ar"
                                      ? "خدمات إضافية"
                                      : "Additional Services"}
                                  </p>
                                  <div className="space-y-2">
                                    {quote.pickup_required && (
                                      <div className="flex items-center gap-2 text-xs text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                        <span className="text-green-600 font-bold">
                                          ✓
                                        </span>
                                        <span className="font-medium">
                                          {t.pickupRequired}
                                        </span>
                                      </div>
                                    )}
                                    {quote.forklift_available && (
                                      <div className="flex items-center gap-2 text-xs text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                        <span className="text-green-600 font-bold">
                                          ✓
                                        </span>
                                        <span className="font-medium">
                                          {t.forkliftAvailable}
                                        </span>
                                      </div>
                                    )}
                                    {quote.eu_export_clearance && (
                                      <div className="flex items-center gap-2 text-xs text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                        <span className="text-green-600 font-bold">
                                          ✓
                                        </span>
                                        <span className="font-medium">
                                          {t.euExportClearance}
                                        </span>
                                      </div>
                                    )}
                                    {quote.cargo_insurance && (
                                      <div className="flex items-center gap-2 text-xs text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                        <span className="text-green-600 font-bold">
                                          ✓
                                        </span>
                                        <span className="font-medium">
                                          {t.cargoInsurance}
                                        </span>
                                      </div>
                                    )}
                                    {quote.on_carriage && (
                                      <div className="flex items-center gap-2 text-xs text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                                        <span className="text-green-600 font-bold">
                                          ✓
                                        </span>
                                        <span className="font-medium">
                                          {t.onCarriage}
                                        </span>
                                      </div>
                                    )}
                                    {!quote.pickup_required &&
                                      !quote.forklift_available &&
                                      !quote.eu_export_clearance &&
                                      !quote.cargo_insurance &&
                                      !quote.on_carriage && (
                                        <p className="text-xs text-gray-500 italic">
                                          {language === "ar"
                                            ? "لا توجد خدمات إضافية"
                                            : "No additional services"}
                                        </p>
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Price Info */}
                            {quote.total_price && (
                              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                                <div className="bg-gradient-to-r from-primary-yellow/10 to-primary-dark/10 rounded-xl p-5 border border-primary-yellow/20">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                                      {t.price}:
                                    </span>
                                    <span className="text-2xl font-bold text-primary-dark">
                                      €
                                      {parseFloat(
                                        quote.total_price.toString()
                                      ).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Edit Modal */}
              {editingQuote && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                  <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-primary-dark">
                        {t.edit} {t.quoteNumber}:{" "}
                        {editingQuote.quote_number ||
                          `FCL-${editingQuote.id.toString().padStart(6, "0")}`}
                      </h3>
                      <button
                        onClick={() => setEditingQuote(null)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Route Details */}
                      <div className="border-b pb-4">
                        <h4 className="font-bold text-primary-dark mb-4">
                          {t.route}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.origin}{" "}
                              {language === "ar" ? "البلد" : "Country"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.origin_country}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  origin_country: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.origin}{" "}
                              {language === "ar" ? "المدينة" : "City"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.origin_city}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  origin_city: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {language === "ar" ? "رمز بريدي" : "ZIP Code"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.origin_zip || ""}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  origin_zip: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {language === "ar"
                                ? "ميناء التحميل"
                                : "Port of Loading"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.port_of_loading}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  port_of_loading: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.destination}{" "}
                              {language === "ar" ? "البلد" : "Country"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.destination_country}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  destination_country: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.destination}{" "}
                              {language === "ar" ? "المدينة" : "City"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.destination_city}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  destination_city: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {language === "ar"
                                ? "ميناء التفريغ"
                                : "Port of Discharge"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.port_of_discharge}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  port_of_discharge: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Container & Cargo Details */}
                      <div className="border-b pb-4">
                        <h4 className="font-bold text-primary-dark mb-4">
                          {language === "ar"
                            ? "تفاصيل الحاوية والشحنة"
                            : "Container & Cargo Details"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.containerType}
                            </label>
                            <select
                              value={editingQuote.container_type}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  container_type: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            >
                              <option value="20DV">20DV - 20ft Dry Van</option>
                              <option value="40DV">40DV - 40ft Dry Van</option>
                              <option value="40HC">
                                40HC - 40ft High Cube
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.containers}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editingQuote.number_of_containers}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  number_of_containers:
                                    parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.cargoReadyDate}
                            </label>
                            <input
                              type="date"
                              value={editingQuote.cargo_ready_date}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  cargo_ready_date: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.commodityType}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.commodity_type}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  commodity_type: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.usageType}
                            </label>
                            <select
                              value={editingQuote.usage_type}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  usage_type: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            >
                              <option value="commercial">
                                {language === "ar" ? "تجاري" : "Commercial"}
                              </option>
                              <option value="personal">
                                {language === "ar" ? "شخصي" : "Personal"}
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.totalWeight}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingQuote.total_weight}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  total_weight: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.totalVolume}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingQuote.total_volume}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  total_volume: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.cargoValue}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingQuote.cargo_value}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  cargo_value: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingQuote.is_dangerous}
                                onChange={(e) =>
                                  setEditingQuote({
                                    ...editingQuote,
                                    is_dangerous: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {t.dangerousGoods}
                              </span>
                            </label>
                            {editingQuote.is_dangerous && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.unNumber}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingQuote.un_number || ""}
                                    onChange={(e) =>
                                      setEditingQuote({
                                        ...editingQuote,
                                        un_number: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.dangerousClass}
                                  </label>
                                  <input
                                    type="text"
                                    value={editingQuote.dangerous_class || ""}
                                    onChange={(e) =>
                                      setEditingQuote({
                                        ...editingQuote,
                                        dangerous_class: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="border-b pb-4">
                        <h4 className="font-bold text-primary-dark mb-4">
                          {t.customerDetails}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.fullName}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.full_name}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  full_name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.companyName}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.company_name || ""}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  company_name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.email}
                            </label>
                            <input
                              type="email"
                              value={editingQuote.email}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.phone}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.phone}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {language === "ar" ? "البلد" : "Country"}
                            </label>
                            <input
                              type="text"
                              value={editingQuote.country}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  country: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t.preferredContact}
                            </label>
                            <select
                              value={editingQuote.preferred_contact}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  preferred_contact: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            >
                              <option value="whatsapp">WhatsApp</option>
                              <option value="email">Email</option>
                              <option value="phone">
                                {language === "ar" ? "هاتف" : "Phone"}
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Additional Services */}
                      <div className="border-b pb-4">
                        <h4 className="font-bold text-primary-dark mb-4">
                          {language === "ar"
                            ? "خدمات إضافية"
                            : "Additional Services"}
                        </h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuote.pickup_required}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  pickup_required: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {t.pickupRequired}
                            </span>
                          </label>
                          {editingQuote.pickup_required && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.pickupAddress}
                              </label>
                              <textarea
                                value={editingQuote.pickup_address || ""}
                                onChange={(e) =>
                                  setEditingQuote({
                                    ...editingQuote,
                                    pickup_address: e.target.value,
                                  })
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                              />
                            </div>
                          )}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuote.forklift_available}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  forklift_available: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {t.forkliftAvailable}
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuote.eu_export_clearance}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  eu_export_clearance: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {t.euExportClearance}
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuote.cargo_insurance}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  cargo_insurance: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {t.cargoInsurance}
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingQuote.on_carriage}
                              onChange={(e) =>
                                setEditingQuote({
                                  ...editingQuote,
                                  on_carriage: e.target.checked,
                                })
                              }
                              className="w-4 h-4 text-primary-yellow border-gray-300 rounded focus:ring-primary-yellow"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {t.onCarriage}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end pt-4">
                        <button
                          onClick={() => setEditingQuote(null)}
                          className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {language === "ar" ? "إلغاء" : "Cancel"}
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-6 py-2 text-sm font-medium text-white bg-primary-yellow hover:bg-primary-yellow/90 rounded-lg transition-colors"
                        >
                          {language === "ar" ? "حفظ" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-bold text-primary-dark mb-4">
                      {t.delete}
                    </h3>
                    <p className="text-gray-700 mb-6">{t.deleteConfirm}</p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {language === "ar" ? "إلغاء" : "Cancel"}
                      </button>
                      <button
                        onClick={() => handleDelete(deleteConfirm)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-dark flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                  {t.accountInfo}
                </h2>
                {!editingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 text-sm font-medium text-primary-dark bg-primary-yellow hover:bg-primary-yellow/90 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {t.editProfile}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.username}
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {language === "ar"
                      ? "لا يمكن تغيير اسم المستخدم"
                      : "Username cannot be changed"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.email}
                  </label>
                  {editingProfile ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent text-lg"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {user?.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.firstName}
                  </label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          first_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent text-lg"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {user?.first_name || (
                        <span className="text-gray-400 italic">
                          {language === "ar" ? "غير محدد" : "Not set"}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                    {t.lastName}
                  </label>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          last_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent text-lg"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">
                      {user?.last_name || (
                        <span className="text-gray-400 italic">
                          {language === "ar" ? "غير محدد" : "Not set"}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              {editingProfile && (
                <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancelProfileEdit}
                    disabled={profileSaving}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary-yellow hover:bg-primary-yellow/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {profileSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                      </>
                    ) : (
                      t.saveProfile
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer language={language} />
    </div>
  );
}
