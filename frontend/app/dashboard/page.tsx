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
  certificate_of_origin_type?: string;
  destination_customs_clearance: boolean;
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
  edit_request_status?: string;
  edit_request_messages?: EditRequestMessage[];
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

interface EditRequestMessage {
  id: number;
  quote: number;
  sender: number;
  sender_name: string;
  sender_email: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface ProductRequest {
  id: number;
  user: number;
  user_username: string;
  user_email: string;
  product_name: string;
  language: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface LCLShipment {
  id: number;
  shipment_number: string;
  direction: "eu-sy" | "sy-eu";
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  sender_postal_code: string;
  sender_country: string;
  receiver_name: string;
  receiver_email: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_postal_code: string;
  receiver_country: string;
  parcels: any[];
  eu_pickup_address?: string;
  eu_pickup_city?: string;
  eu_pickup_postal_code?: string;
  eu_pickup_country?: string;
  eu_pickup_weight?: number;
  selected_eu_shipping_method?: number;
  selected_eu_shipping_name?: string;
  syria_province?: string;
  syria_weight?: number;
  payment_method?: string;
  payment_status?: string;
  stripe_session_id?: string;
  total_price: number;
  amount_paid: number;
  status: string;
  tracking_number?: string;
  sendcloud_id?: number;
  created_at: string;
  updated_at: string;
  paid_at?: string;
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
  const [lclShipments, setLclShipments] = useState<LCLShipment[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(true);
  const [expandedShipments, setExpandedShipments] = useState<Set<number>>(new Set());
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
  const [showConversation, setShowConversation] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState<{ [key: number]: string }>(
    {}
  );
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const [approvingDeclining, setApprovingDeclining] = useState<number | null>(
    null
  );
  const [processingPayment, setProcessingPayment] = useState<number | null>(
    null
  );
  const [productRequests, setProductRequests] = useState<ProductRequest[]>([]);
  const [editingProductRequest, setEditingProductRequest] = useState<number | null>(null);
  const [productRequestStatus, setProductRequestStatus] = useState<string>("");
  const [productRequestNotes, setProductRequestNotes] = useState<string>("");
  const [updatingProductRequest, setUpdatingProductRequest] = useState(false);

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
        track: "تتبع",
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
        myLCLShipments: "شحناتي LCL",
        allLCLShipments: "جميع شحنات LCL",
        noShipments: "لا توجد شحنات حتى الآن",
        shipmentNumber: "رقم الشحنة",
        direction: "الاتجاه",
        euToSy: "أوروبا إلى سوريا",
        syToEu: "سوريا إلى أوروبا",
        trackingNumber: "رقم التتبع",
        noTracking: "لا يوجد رقم تتبع",
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
        IN_TRANSIT_TO_WATTWEG_5: "في الطريق إلى واتفيج 5",
        ARRIVED_WATTWEG_5: "وصل إلى واتفيج 5",
        SORTING_WATTWEG_5: "فرز في واتفيج 5",
        READY_FOR_EXPORT: "جاهز للتصدير",
        IN_TRANSIT_TO_DESTINATION: "في الطريق إلى الوجهة",
        ARRIVED_DESTINATION: "وصل إلى الوجهة",
        DESTINATION_SORTING: "فرز في الوجهة",
        READY_FOR_DELIVERY: "جاهز للتسليم",
        OUT_FOR_DELIVERY: "خارج للتسليم",
        DELIVERED: "تم التسليم",
        CANCELLED: "ملغى",
        // Product Requests
        myProductRequests: "طلبات المنتجات الخاصة بي",
        noProductRequests: "لا توجد طلبات منتجات حتى الآن",
        productName: "اسم المنتج",
        requestStatus: "حالة الطلب",
        requestDate: "تاريخ الطلب",
        adminNotes: "ملاحظات الإدارة",
        PENDING: "قيد المراجعة",
        APPROVED: "تمت الموافقة",
        REJECTED: "مرفوض",
        allProductRequests: "كل طلبات المنتجات",
        requestedBy: "طلب من",
        updateStatus: "تحديث الحالة",
        addNotes: "إضافة ملاحظات",
        save: "حفظ",
        updating: "جاري التحديث...",
        updated: "تم التحديث بنجاح",
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
        track: "Track",
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
        myLCLShipments: "My LCL Shipments",
        allLCLShipments: "All LCL Shipments",
        noShipments: "No shipments yet",
        shipmentNumber: "Shipment Number",
        direction: "Direction",
        euToSy: "Europe to Syria",
        syToEu: "Syria to Europe",
        trackingNumber: "Tracking Number",
        noTracking: "No tracking number",
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
        IN_TRANSIT_TO_WATTWEG_5: "In Transit to Wattweg 5",
        ARRIVED_WATTWEG_5: "Arrived Wattweg 5",
        SORTING_WATTWEG_5: "Sorting Wattweg 5",
        READY_FOR_EXPORT: "Ready for Export",
        IN_TRANSIT_TO_DESTINATION: "In Transit to Destination",
        ARRIVED_DESTINATION: "Arrived at Destination",
        DESTINATION_SORTING: "Sorting at Destination",
        READY_FOR_DELIVERY: "Ready for Delivery",
        OUT_FOR_DELIVERY: "Out for Delivery",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
        // Product Requests
        myProductRequests: "My Product Requests",
        noProductRequests: "No product requests yet",
        productName: "Product Name",
        requestStatus: "Request Status",
        requestDate: "Request Date",
        adminNotes: "Admin Notes",
        PENDING: "Under Review",
        APPROVED: "Approved",
        REJECTED: "Rejected",
        allProductRequests: "All Product Requests",
        requestedBy: "Requested by",
        updateStatus: "Update Status",
        addNotes: "Add Notes",
        save: "Save",
        updating: "Updating...",
        updated: "Updated successfully",
      },
    }),
    []
  );

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, loading, isAuthenticated, router]);

  // Handle payment return from Stripe
  useEffect(() => {
    if (typeof window !== "undefined" && mounted) {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");
      const quoteId = params.get("quote_id");
      const type = params.get("type");
      
      if (paymentStatus === "success" && type === "shipment") {
        // Refresh shipments to get updated payment status
        const fetchShipments = async () => {
          try {
            const response = await apiService.getShipments();
            const shipments = response.data?.results || response.data || [];
            setLclShipments(Array.isArray(shipments) ? shipments : []);
            
            // Show success message
            alert(
              language === "ar"
                ? "تم الدفع بنجاح! سيتم تحديث حالة الشحنة قريباً."
                : "Payment successful! Shipment status will be updated shortly."
            );
            
            // Clean URL
            window.history.replaceState({}, "", "/dashboard");
          } catch (error: any) {
            console.error("Error fetching shipments after payment:", error);
          }
        };
        
        fetchShipments();
        return;
      }
      
      if (paymentStatus === "success") {
        // Refresh quotes to get updated payment status
        const fetchQuotes = async () => {
          try {
            const response = await apiService.getFCLQuotes();
            const quotes = response.data?.results || response.data || [];
            setFclQuotes(Array.isArray(quotes) ? quotes : []);
            
            // If we have a quote_id, try to get updated payment status
            if (quoteId) {
              try {
                const paymentResponse = await apiService.getPaymentStatus(parseInt(quoteId));
                if (paymentResponse.data?.success) {
                  const paymentData = paymentResponse.data;
                  const message = language === "ar"
                    ? `تم استلام الدفعة بنجاح! المبلغ المدفوع: €${paymentData.amount_paid?.toFixed(2) || "0.00"} من إجمالي €${paymentData.total_price?.toFixed(2) || "0.00"}`
                    : `Payment received successfully! Amount paid: €${paymentData.amount_paid?.toFixed(2) || "0.00"} of €${paymentData.total_price?.toFixed(2) || "0.00"}`;
                  alert(message);
                } else {
                  alert(
                    language === "ar"
                      ? "تم استلام الدفعة بنجاح! سيتم تحديث المبلغ المدفوع قريباً."
                      : "Payment received successfully! The paid amount will be updated shortly."
                  );
                }
              } catch (error) {
                console.error("Error fetching payment status:", error);
                alert(
                  language === "ar"
                    ? "تم استلام الدفعة بنجاح! سيتم تحديث المبلغ المدفوع قريباً."
                    : "Payment received successfully! The paid amount will be updated shortly."
                );
              }
            } else {
              alert(
                language === "ar"
                  ? "تم استلام الدفعة بنجاح! سيتم تحديث المبلغ المدفوع قريباً."
                  : "Payment received successfully! The paid amount will be updated shortly."
              );
            }
          } catch (error) {
            console.error("Error refreshing quotes:", error);
            alert(
              language === "ar"
                ? "تم استلام الدفعة بنجاح! سيتم تحديث المبلغ المدفوع قريباً."
                : "Payment received successfully! The paid amount will be updated shortly."
            );
          }
        };
        fetchQuotes();
        // Remove query param from URL
        window.history.replaceState({}, "", window.location.pathname);
      } else if (paymentStatus === "canceled") {
        alert(
          language === "ar"
            ? "تم إلغاء عملية الدفع."
            : "Payment was canceled."
        );
        // Remove query param from URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [mounted, language]);

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

  // Fetch LCL shipments
  useEffect(() => {
    const fetchLCLShipments = async () => {
      if (!isAuthenticated || !mounted) return;

      try {
        setShipmentsLoading(true);
        const response = await apiService.getShipments();
        const shipments = response.data?.results || response.data || [];
        setLclShipments(Array.isArray(shipments) ? shipments : []);
      } catch (error: any) {
        console.error("Error fetching LCL shipments:", error);
        if (error.response?.status === 401) {
          router.push("/login");
        } else {
          setLclShipments([]);
        }
      } finally {
        setShipmentsLoading(false);
      }
    };

    fetchLCLShipments();
  }, [isAuthenticated, mounted, router]);

  // Fetch user's product requests (or all for admin)
  useEffect(() => {
    const fetchProductRequests = async () => {
      if (!isAuthenticated || !mounted) return;

      try {
        // If admin, fetch all requests; if user, fetch only theirs
        const response = user?.is_superuser
          ? await apiService.getAllProductRequests()
          : await apiService.getUserProductRequests();
          
        if (response.data?.success && Array.isArray(response.data.data)) {
          setProductRequests(response.data.data);
        } else {
          setProductRequests([]);
        }
      } catch (error: any) {
        console.error("Error fetching product requests:", error);
        setProductRequests([]);
      }
    };

    fetchProductRequests();
  }, [isAuthenticated, mounted, user?.is_superuser]);

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

  // Toggle shipment expansion
  const toggleShipment = (shipmentId: number) => {
    setExpandedShipments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(shipmentId)) {
        newSet.delete(shipmentId);
      } else {
        newSet.add(shipmentId);
      }
      return newSet;
    });
  };

  // Check if quote can be edited/deleted
  // Admins can always edit/delete, regular users can only edit/delete before PENDING_PAYMENT
  const canEditOrDelete = (status: string): boolean => {
    // Admins can always edit/delete
    if (user?.is_superuser) {
      return true;
    }
    // Regular users can only edit/delete quotes with these statuses
    const statusesBeforePayment = ["CREATED", "OFFER_SENT"];
    return statusesBeforePayment.includes(status);
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
    if (!canEditOrDelete(quote.status)) {
      alert(
        language === "ar"
          ? "لا يمكن تعديل أو حذف الطلب بعد بدء عملية الدفع"
          : "Cannot edit or delete quote after payment process has started"
      );
      return;
    }
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

  // Handle send payment reminder (admin only)
  const handleSendPaymentReminder = async (quoteId: number) => {
    try {
      await apiService.sendPaymentReminder(quoteId);
      alert(
        language === "ar"
          ? "تم إرسال تذكير الدفع بنجاح"
          : "Payment reminder sent successfully"
      );
    } catch (error: any) {
      console.error("Error sending payment reminder:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    }
  };

  // Handle initiate payment (for users)
  const handleInitiatePayment = async (quoteId: number) => {
    try {
      setProcessingPayment(quoteId);
      const response = await apiService.initiatePayment(quoteId);
      
      if (response.data?.success && response.data?.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error(response.data?.error || "Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Error initiating payment:", error);
      alert(t.error + ": " + (error.response?.data?.error || error.response?.data?.message || error.message));
      setProcessingPayment(null);
    }
  };

  // Handle edit product request (admin only)
  const handleEditProductRequest = (request: ProductRequest) => {
    setEditingProductRequest(request.id);
    setProductRequestStatus(request.status);
    setProductRequestNotes(request.admin_notes || "");
  };

  // Handle update product request (admin only)
  const handleUpdateProductRequest = async () => {
    if (!editingProductRequest) return;

    try {
      setUpdatingProductRequest(true);
      await apiService.updateProductRequest(editingProductRequest, {
        status: productRequestStatus,
        admin_notes: productRequestNotes,
      });

      // Refresh product requests
      const response = await apiService.getAllProductRequests();
      if (response.data?.success && Array.isArray(response.data.data)) {
        setProductRequests(response.data.data);
      }

      setEditingProductRequest(null);
      setProductRequestStatus("");
      setProductRequestNotes("");
      alert(t.updated);
    } catch (error: any) {
      console.error("Error updating product request:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    } finally {
      setUpdatingProductRequest(false);
    }
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
      const quote = fclQuotes.find((q) => q.id === quoteId);
      if (!quote) return;

      // Check if payment is 100% before allowing status updates to IN_TRANSIT_TO_DESTINATION and beyond
      const restrictedStatuses = [
        "IN_TRANSIT_TO_DESTINATION",
        "ARRIVED_DESTINATION",
        "DESTINATION_SORTING",
        "READY_FOR_DELIVERY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
      ];
      if (restrictedStatuses.includes(newStatus)) {
        if (quote.total_price && quote.total_price > 0) {
          const paymentPercentage =
            ((quote.amount_paid || 0) / quote.total_price) * 100;
          if (paymentPercentage < 100) {
            alert(
              language === "ar"
                ? `لا يمكن تحديث الحالة إلى ${getStatusDisplay(
                    newStatus
                  )}. يجب إكمال الدفع بنسبة 100%. الدفع الحالي: ${paymentPercentage.toFixed(
                    1
                  )}%`
                : `Cannot update status to ${getStatusDisplay(
                    newStatus
                  )}. Payment must be 100% complete. Current payment: ${paymentPercentage.toFixed(
                    1
                  )}%`
            );
            return;
          }
        } else {
          alert(
            language === "ar"
              ? "يجب تحديد السعر الإجمالي أولاً"
              : "Total price must be set first"
          );
          return;
        }
      }

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
      IN_TRANSIT_TO_WATTWEG_5:
        "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300",
      ARRIVED_WATTWEG_5:
        "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300",
      SORTING_WATTWEG_5:
        "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-300",
      READY_FOR_EXPORT:
        "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border border-cyan-300",
      IN_TRANSIT_TO_DESTINATION:
        "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-300",
      ARRIVED_DESTINATION:
        "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300",
      DESTINATION_SORTING:
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

  // Handle sending reply in edit request conversation
  const handleSendReply = async (quoteId: number) => {
    const message = replyMessage[quoteId]?.trim();
    if (!message) {
      alert(language === "ar" ? "يجب إدخال رسالة" : "Please enter a message");
      return;
    }

    try {
      setSendingReply(quoteId);
      const response = await apiService.sendEditRequestReply(quoteId, message);

      // Refresh quotes list to get updated messages
      const quotesResponse = await apiService.getFCLQuotes();
      const quotes = quotesResponse.data?.results || quotesResponse.data || [];
      setFclQuotes(Array.isArray(quotes) ? quotes : []);

      // Clear reply message
      setReplyMessage((prev) => ({ ...prev, [quoteId]: "" }));

      alert(
        language === "ar" ? "تم إرسال الرد بنجاح" : "Reply sent successfully"
      );
    } catch (error: any) {
      console.error("Error sending reply:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    } finally {
      setSendingReply(null);
    }
  };

  // Handle approve/decline edit request (admin only)
  const handleApproveDeclineEditRequest = async (
    quoteId: number,
    action: "approve" | "decline",
    message?: string
  ) => {
    try {
      setApprovingDeclining(quoteId);
      await apiService.approveOrDeclineEditRequest(quoteId, action, message);

      // Refresh quotes list
      const quotesResponse = await apiService.getFCLQuotes();
      const quotes = quotesResponse.data?.results || quotesResponse.data || [];
      setFclQuotes(Array.isArray(quotes) ? quotes : []);

      // Close conversation
      setShowConversation(null);

      alert(
        language === "ar"
          ? action === "approve"
            ? "تم الموافقة على طلب التعديل"
            : "تم رفض طلب التعديل"
          : action === "approve"
          ? "Edit request approved"
          : "Edit request declined"
      );
    } catch (error: any) {
      console.error("Error approving/declining edit request:", error);
      alert(t.error + ": " + (error.response?.data?.message || error.message));
    } finally {
      setApprovingDeclining(null);
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

            {/* Admin Actions Section */}
            {isAdmin && (
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                  {language === "ar" ? "إدارة النظام" : "System Management"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Pricing Management Card - Enhanced Design */}
                  <Link
                    href="/dashboard/pricing"
                    className="group relative bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-primary-yellow transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-yellow to-orange-400 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-dark to-primary-yellow rounded-full blur-3xl"></div>
              </div>

                    <div className="relative flex items-start gap-4">
                      {/* Icon Container with Gradient */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-yellow via-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          {/* Inner Glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          
                          <svg
                            className="w-8 h-8 text-white relative z-10 drop-shadow-lg"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>

                        {/* Pulsing Ring */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-primary-yellow animate-ping opacity-20"></div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-yellow via-orange-500 to-primary-dark bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                          {language === "ar"
                            ? "💰 إدارة الأسعار"
                            : "💰 Pricing Management"}
                        </h3>
                        <p className="text-sm text-gray-700 font-medium mb-2">
                          {language === "ar"
                            ? "إدارة أسعار المنتجات والتغليف"
                            : "Manage product and packaging prices"}
                        </p>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold border border-yellow-200">
                            {language === "ar" ? "LCL" : "LCL"}
                          </span>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold border border-orange-200">
                            {language === "ar" ? "التغليف" : "Packaging"}
                          </span>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg
                          className="w-6 h-6 text-primary-yellow"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Shine Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-yellow via-orange-400 to-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </Link>

                  {/* Syrian Internal Transport Management Card */}
                  <Link
                    href="/dashboard/syria-transport"
                    className="group relative bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-primary-yellow transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-yellow rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-dark rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative flex items-start gap-4">
                      {/* Icon Container */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-yellow to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <div className="absolute inset-0 bg-primary-yellow rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          
                          <svg
                            className="w-8 h-8 text-white relative z-10 drop-shadow-lg"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                          </svg>
                        </div>

                        <div className="absolute inset-0 rounded-2xl border-2 border-primary-yellow animate-ping opacity-20"></div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:scale-105 transition-transform duration-300">
                          {language === "ar"
                            ? "النقل الداخلي - سورية"
                            : "Internal Transport - Syria"}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                          {language === "ar"
                            ? "إدارة أسعار النقل حسب المحافظات"
                            : "Manage transport prices by province"}
                        </p>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-yellow-50 text-primary-dark px-2 py-1 rounded-full font-semibold border border-primary-yellow">
                            {language === "ar" ? "النقل الداخلي" : "Domestic"}
                          </span>
                          <span className="text-xs bg-yellow-50 text-primary-dark px-2 py-1 rounded-full font-semibold border border-primary-yellow">
                            {language === "ar" ? "حساب تلقائي" : "Auto Calculate"}
                          </span>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg
                          className="w-6 h-6 text-primary-yellow"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Shine Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-yellow via-yellow-400 to-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </Link>

                  {/* Shipping Settings (Sendcloud Profit Margin) Card */}
                  <Link
                    href="/dashboard/shipping-settings"
                    className="group relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-primary-yellow transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-yellow to-blue-400 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-dark to-purple-400 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative flex items-start gap-4">
                      {/* Icon Container */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <div className="absolute inset-0 bg-blue-400 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          
                          <svg
                            className="w-8 h-8 text-white relative z-10 drop-shadow-lg"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>

                        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-20"></div>
                      </div>

                      {/* Text Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-dark mb-2 group-hover:scale-105 transition-transform duration-300">
                          {language === "ar"
                            ? "إعدادات الشحن"
                            : "Shipping Settings"}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                          {language === "ar"
                            ? "إدارة هوامش الربح على Sendcloud"
                            : "Manage Sendcloud profit margins"}
                        </p>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold border border-blue-200">
                            {language === "ar" ? "Sendcloud" : "Sendcloud"}
                          </span>
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-semibold border border-purple-200">
                            {language === "ar" ? "هامش ربح" : "Profit Margin"}
                          </span>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg
                          className="w-6 h-6 text-primary-yellow"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={language === "ar" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom Shine Effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-primary-yellow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </Link>
                </div>
              </div>
            )}

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
                  {!isAdmin && (
                <Link
                      href="/fcl-quote"
                      className="mt-4 inline-block px-6 py-3 bg-primary-yellow text-primary-dark rounded-lg font-semibold hover:bg-primary-yellow/90 transition-all"
                >
                      {t.fclQuote}
                </Link>
                  )}
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

                              {/* Payment Progress - Show for all statuses after OFFER_SENT */}
                              {quote.status !== "CREATED" &&
                                quote.total_price &&
                                quote.total_price > 0 && (
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
                                          {t.totalPrice}: €
                                          {quote.total_price || 0}
                                        </p>
                                      </div>
                                      {/* Warning message if payment is not 100% */}
                                      {((quote.amount_paid || 0) /
                                        quote.total_price) *
                                        100 <
                                        100 && (
                                        <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                                          <p className="text-xs font-semibold text-yellow-800">
                                            {language === "ar"
                                              ? "⚠️ يرجى إكمال الدفع للمتابعة"
                                              : "⚠️ Please complete payment to continue"}
                                          </p>
                                          <p className="text-xs text-yellow-700 mt-1">
                                            {language === "ar"
                                              ? `المبلغ المتبقي: €${(
                                                  quote.total_price -
                                                  (quote.amount_paid || 0)
                                                ).toFixed(2)}`
                                              : `Remaining amount: €${(
                                                  quote.total_price -
                                                  (quote.amount_paid || 0)
                                                ).toFixed(2)}`}
                                          </p>
                                        </div>
                                      )}
                                      {/* Payment button for users when status is PENDING_PAYMENT */}
                                      {!isAdmin &&
                                        quote.status === "PENDING_PAYMENT" &&
                                        ((quote.amount_paid || 0) /
                                          quote.total_price) *
                                          100 <
                                          100 && (
                                          <button
                                            onClick={() =>
                                              handleInitiatePayment(quote.id)
                                            }
                                            disabled={
                                              processingPayment === quote.id
                                            }
                                            className="mt-3 w-full px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                          >
                                            {processingPayment === quote.id ? (
                                              <>
                                                <svg
                                                  className="animate-spin h-4 w-4 text-white"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                  ></circle>
                                                  <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                  ></path>
                                                </svg>
                                                <span>
                                                  {language === "ar"
                                                    ? "جاري التوجيه..."
                                                    : "Redirecting..."}
                                                </span>
                                              </>
                                            ) : (
                                              <>
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
                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                  />
                                                </svg>
                                                <span>
                                                  {language === "ar"
                                                    ? "دفع إلكتروني"
                                                    : "Pay Online"}
                                                </span>
                                              </>
                                            )}
                                          </button>
                                        )}
                                    </div>
                                    {isAdmin && (
                                      <div className="mt-2 space-y-2">
                                        <button
                                          onClick={() =>
                                            handleUpdatePaidAmount(quote.id)
                                          }
                                          className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                        >
                                          {t.updatePaidAmount}
                                        </button>
                                        {((quote.amount_paid || 0) /
                                          quote.total_price) *
                                          100 <
                                          100 && (
                                          <button
                                            onClick={() =>
                                              handleSendPaymentReminder(
                                                quote.id
                                              )
                                            }
                                            className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                              />
                                            </svg>
                                            <span>
                                              {language === "ar"
                                                ? "إرسال تذكير الدفع"
                                                : "Send Payment Reminder"}
                                            </span>
                                          </button>
                                        )}
                                      </div>
                                    )}
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
                                      {quote.user_response === "EDIT_REQUESTED"
                                        ? language === "ar"
                                          ? "طلب تعديل نشط"
                                          : "Active Edit Request"
                                        : getUserResponseText(
                                            quote.user_response
                                          )}
                                    </p>
                                  </div>
                                )}
                              {/* Admin: Offer Conversation (when offer is sent) */}
                              {isAdmin &&
                                quote.status === "OFFER_SENT" &&
                                quote.offer_message && (
                                  <div className="sm:col-span-2 lg:col-span-3 mt-4 space-y-3">
                                    <button
                                      onClick={() =>
                                        setShowConversation(
                                          showConversation === quote.id
                                            ? null
                                            : quote.id
                                        )
                                      }
                                      className="w-full px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                    >
                                      {showConversation === quote.id
                                        ? language === "ar"
                                          ? "إخفاء المحادثة"
                                          : "Hide Conversation"
                                        : language === "ar"
                                        ? "عرض المحادثة"
                                        : "View Conversation"}
                                    </button>
                                    {showConversation === quote.id && (
                                      <div className="bg-white border-2 border-blue-300 rounded-2xl p-5 space-y-4 shadow-lg">
                                        <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                          <h5 className="text-sm font-bold text-blue-900">
                                            {language === "ar"
                                              ? "المحادثة"
                                              : "Conversation"}
                                          </h5>
                                        </div>
                                        {/* Conversation Messages */}
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 py-2">
                                          {quote.edit_request_messages &&
                                          quote.edit_request_messages.length >
                                            0 ? (
                                            quote.edit_request_messages.map(
                                              (msg: EditRequestMessage) => (
                                                <div
                                                  key={msg.id}
                                                  className={`flex items-start gap-3 ${
                                                    msg.is_admin
                                                      ? "flex-row-reverse"
                                                      : "flex-row"
                                                  }`}
                                                >
                                                  {/* Avatar */}
                                                  <div
                                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                                                      msg.is_admin
                                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                                        : "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                                                    }`}
                                                  >
                                                    {msg.is_admin
                                                      ? "A"
                                                      : msg.sender_name
                                                          .charAt(0)
                                                          .toUpperCase()}
                                                  </div>
                                                  {/* Message Bubble */}
                                                  <div
                                                    className={`flex flex-col max-w-[75%] ${
                                                      msg.is_admin
                                                        ? "items-end"
                                                        : "items-start"
                                                    }`}
                                                  >
                                                    <div
                                                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                                                        msg.is_admin
                                                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                                                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-bl-md"
                                                      }`}
                                                    >
                                                      <div
                                                        className={`flex items-center gap-2 mb-2 ${
                                                          msg.is_admin
                                                            ? "text-blue-100"
                                                            : "text-gray-600"
                                                        }`}
                                                      >
                                                        <span className="text-xs font-semibold">
                                                          {msg.is_admin
                                                            ? language === "ar"
                                                              ? "أنت"
                                                              : "You"
                                                            : msg.sender_name}
                                                        </span>
                                                        <span className="text-[10px] opacity-75">
                                                          {new Date(
                                                            msg.created_at
                                                          ).toLocaleString(
                                                            language === "ar"
                                                              ? "ar-SA"
                                                              : "en-US",
                                                            {
                                                              month: "short",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                            }
                                                          )}
                                                        </span>
                                                      </div>
                                                      <p
                                                        className={`text-sm whitespace-pre-wrap leading-relaxed ${
                                                          msg.is_admin
                                                            ? "text-white"
                                                            : "text-gray-800"
                                                        }`}
                                                      >
                                                        {msg.message}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )
                                          ) : (
                                            <div className="text-center py-8">
                                              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                                                <svg
                                                  className="w-8 h-8 text-gray-400"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                  />
                                                </svg>
                                              </div>
                                              <p className="text-sm text-gray-500">
                                                {language === "ar"
                                                  ? "لا توجد رسائل بعد"
                                                  : "No messages yet"}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Admin Reply Input and Actions */}
                                        {(quote.user_response === "PENDING" ||
                                          (quote.user_response ===
                                            "EDIT_REQUESTED" &&
                                            quote.edit_request_status ===
                                              "PENDING")) && (
                                          <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 relative">
                                                <textarea
                                                  value={
                                                    replyMessage[quote.id] || ""
                                                  }
                                                  onChange={(e) =>
                                                    setReplyMessage((prev) => ({
                                                      ...prev,
                                                      [quote.id]:
                                                        e.target.value,
                                                    }))
                                                  }
                                                  placeholder={
                                                    language === "ar"
                                                      ? "اكتب ردك هنا..."
                                                      : "Type your reply here..."
                                                  }
                                                  className="w-full px-4 py-3 pr-12 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all shadow-sm"
                                                  rows={3}
                                                />
                                              </div>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                              <button
                                                onClick={() =>
                                                  handleSendReply(quote.id)
                                                }
                                                disabled={
                                                  sendingReply === quote.id ||
                                                  !replyMessage[
                                                    quote.id
                                                  ]?.trim()
                                                }
                                                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
                                              >
                                                {sendingReply === quote.id ? (
                                                  <>
                                                    <svg
                                                      className="animate-spin h-4 w-4"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                      ></circle>
                                                      <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                      ></path>
                                                    </svg>
                                                    <span>
                                                      {language === "ar"
                                                        ? "جاري الإرسال..."
                                                        : "Sending..."}
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <span>
                                                      {language === "ar"
                                                        ? "إرسال رد"
                                                        : "Send Reply"}
                                                    </span>
                                                  </>
                                                )}
                                              </button>
                                              {/* Approve/Decline buttons - only show when edit request is pending */}
                                              {quote.user_response ===
                                                "EDIT_REQUESTED" &&
                                                quote.edit_request_status ===
                                                  "PENDING" && (
                                                  <div className="flex gap-2">
                                                    <button
                                                      onClick={() => {
                                                        const message = prompt(
                                                          language === "ar"
                                                            ? "رسالة اختيارية للموافقة:"
                                                            : "Optional message for approval:"
                                                        );
                                                        handleApproveDeclineEditRequest(
                                                          quote.id,
                                                          "approve",
                                                          message || undefined
                                                        );
                                                      }}
                                                      disabled={
                                                        approvingDeclining ===
                                                        quote.id
                                                      }
                                                      className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none"
                                                    >
                                                      {approvingDeclining ===
                                                      quote.id
                                                        ? language === "ar"
                                                          ? "جاري..."
                                                          : "Processing..."
                                                        : language === "ar"
                                                        ? "موافقة"
                                                        : "Approve"}
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        const message = prompt(
                                                          language === "ar"
                                                            ? "رسالة اختيارية للرفض:"
                                                            : "Optional message for decline:"
                                                        );
                                                        handleApproveDeclineEditRequest(
                                                          quote.id,
                                                          "decline",
                                                          message || undefined
                                                        );
                                                      }}
                                                      disabled={
                                                        approvingDeclining ===
                                                        quote.id
                                                      }
                                                      className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none"
                                                    >
                                                      {approvingDeclining ===
                                                      quote.id
                                                        ? language === "ar"
                                                          ? "جاري..."
                                                          : "Processing..."
                                                        : language === "ar"
                                                        ? "رفض"
                                                        : "Decline"}
                                                    </button>
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Status Badge for Edit Request */}
                                        {quote.user_response ===
                                          "EDIT_REQUESTED" &&
                                          quote.edit_request_status &&
                                          quote.edit_request_status !==
                                            "PENDING" && (
                                            <div
                                              className={`text-center py-2 px-4 rounded-lg ${
                                                quote.edit_request_status ===
                                                "APPROVED"
                                                  ? "bg-green-50 text-green-700 border border-green-200"
                                                  : "bg-red-50 text-red-700 border border-red-200"
                                              }`}
                                            >
                                              <p className="text-sm font-semibold">
                                                {quote.edit_request_status ===
                                                "APPROVED"
                                                  ? language === "ar"
                                                    ? "✓ تمت الموافقة على طلب التعديل"
                                                    : "✓ Edit Request Approved"
                                                  : language === "ar"
                                                  ? "✗ تم رفض طلب التعديل"
                                                  : "✗ Edit Request Declined"}
                                              </p>
                                            </div>
                                          )}
                                      </div>
                                    )}
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
                              <button
                                onClick={() =>
                                  router.push(`/tracking?id=${quote.id}`)
                                }
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                              >
                                {t.track}
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
                                    <option value="IN_TRANSIT_TO_WATTWEG_5">
                                      {getStatusDisplay(
                                        "IN_TRANSIT_TO_WATTWEG_5"
                                      )}
                                    </option>
                                    <option value="ARRIVED_WATTWEG_5">
                                      {getStatusDisplay("ARRIVED_WATTWEG_5")}
                                    </option>
                                    <option value="SORTING_WATTWEG_5">
                                      {getStatusDisplay("SORTING_WATTWEG_5")}
                                    </option>
                                    <option value="READY_FOR_EXPORT">
                                      {getStatusDisplay("READY_FOR_EXPORT")}
                                    </option>
                                    <option
                                      value="IN_TRANSIT_TO_DESTINATION"
                                      disabled={
                                        !!(
                                          quote.total_price &&
                                          quote.total_price > 0 &&
                                          ((quote.amount_paid || 0) /
                                            quote.total_price) *
                                            100 <
                                            100
                                        )
                                      }
                                    >
                                      {getStatusDisplay("IN_TRANSIT_TO_DESTINATION")}
                                      {quote.total_price &&
                                      quote.total_price > 0 &&
                                      ((quote.amount_paid || 0) /
                                        quote.total_price) *
                                        100 <
                                        100
                                        ? ` (${
                                            language === "ar"
                                              ? "يتطلب دفع 100%"
                                              : "Requires 100% payment"
                                          })`
                                        : ""}
                                    </option>
                                    <option
                                      value="ARRIVED_DESTINATION"
                                      disabled={
                                        !!(
                                          quote.total_price &&
                                          quote.total_price > 0 &&
                                          ((quote.amount_paid || 0) /
                                            quote.total_price) *
                                            100 <
                                            100
                                        )
                                      }
                                    >
                                      {getStatusDisplay("ARRIVED_DESTINATION")}
                                      {quote.total_price &&
                                      quote.total_price > 0 &&
                                      ((quote.amount_paid || 0) /
                                        quote.total_price) *
                                        100 <
                                        100
                                        ? ` (${
                                            language === "ar"
                                              ? "يتطلب دفع 100%"
                                              : "Requires 100% payment"
                                          })`
                                        : ""}
                                    </option>
                                    <option
                                      value="DESTINATION_SORTING"
                                      disabled={
                                        !!(
                                          quote.total_price &&
                                          quote.total_price > 0 &&
                                          ((quote.amount_paid || 0) /
                                            quote.total_price) *
                                            100 <
                                            100
                                        )
                                      }
                                    >
                                      {getStatusDisplay("DESTINATION_SORTING")}
                                      {quote.total_price &&
                                      quote.total_price > 0 &&
                                      ((quote.amount_paid || 0) /
                                        quote.total_price) *
                                        100 <
                                        100
                                        ? ` (${
                                            language === "ar"
                                              ? "يتطلب دفع 100%"
                                              : "Requires 100% payment"
                                          })`
                                        : ""}
                                    </option>
                                    <option
                                      value="READY_FOR_DELIVERY"
                                      disabled={
                                        !!(
                                          quote.total_price &&
                                          quote.total_price > 0 &&
                                          ((quote.amount_paid || 0) /
                                            quote.total_price) *
                                            100 <
                                            100
                                        )
                                      }
                                    >
                                      {getStatusDisplay("READY_FOR_DELIVERY")}
                                      {quote.total_price &&
                                      quote.total_price > 0 &&
                                      ((quote.amount_paid || 0) /
                                        quote.total_price) *
                                        100 <
                                        100
                                        ? ` (${
                                            language === "ar"
                                              ? "يتطلب دفع 100%"
                                              : "Requires 100% payment"
                                          })`
                                        : ""}
                                    </option>
                                    <option
                                      value="OUT_FOR_DELIVERY"
                                      disabled={
                                        !!(
                                          quote.total_price &&
                                          quote.total_price > 0 &&
                                          ((quote.amount_paid || 0) /
                                            quote.total_price) *
                                            100 <
                                            100
                                        )
                                      }
                                    >
                                      {getStatusDisplay("OUT_FOR_DELIVERY")}
                                      {quote.total_price &&
                                      quote.total_price > 0 &&
                                      ((quote.amount_paid || 0) /
                                        quote.total_price) *
                                        100 <
                                        100
                                        ? ` (${
                                            language === "ar"
                                              ? "يتطلب دفع 100%"
                                              : "Requires 100% payment"
                                          })`
                                        : ""}
                                    </option>
                                    <option
                                      value="DELIVERED"
                                      disabled={
                                        !!(
                                          quote.total_price &&
                                          quote.total_price > 0 &&
                                          ((quote.amount_paid || 0) /
                                            quote.total_price) *
                                            100 <
                                            100
                                        )
                                      }
                                    >
                                      {getStatusDisplay("DELIVERED")}
                                      {quote.total_price &&
                                      quote.total_price > 0 &&
                                      ((quote.amount_paid || 0) /
                                        quote.total_price) *
                                        100 <
                                        100
                                        ? ` (${
                                            language === "ar"
                                              ? "يتطلب دفع 100%"
                                              : "Requires 100% payment"
                                          })`
                                        : ""}
                                    </option>
                                    <option value="CANCELLED">
                                      {getStatusDisplay("CANCELLED")}
                                    </option>
                                  </select>
                                  {/* Admin: Delete button */}
                                  <button
                                    onClick={() => {
                                      if (!canEditOrDelete(quote.status)) {
                                        alert(
                                          language === "ar"
                                            ? "لا يمكن حذف الطلب بعد بدء عملية الدفع"
                                            : "Cannot delete quote after payment process has started"
                                        );
                                        return;
                                      }
                                      setDeleteConfirm(quote.id);
                                    }}
                                    disabled={!canEditOrDelete(quote.status)}
                                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                      canEditOrDelete(quote.status)
                                        ? "text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer"
                                        : "text-gray-400 bg-gray-200 cursor-not-allowed opacity-60"
                                    }`}
                                  >
                                    {t.delete}
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Regular user: Edit and Delete */}
                                  <button
                                    onClick={() => handleEdit(quote)}
                                    disabled={!canEditOrDelete(quote.status)}
                                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border ${
                                      canEditOrDelete(quote.status)
                                        ? "text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer"
                                        : "text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                                    }`}
                                  >
                                    {t.edit}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!canEditOrDelete(quote.status)) {
                                        alert(
                                          language === "ar"
                                            ? "لا يمكن حذف الطلب بعد بدء عملية الدفع"
                                            : "Cannot delete quote after payment process has started"
                                        );
                                        return;
                                      }
                                      setDeleteConfirm(quote.id);
                                    }}
                                    disabled={!canEditOrDelete(quote.status)}
                                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border ${
                                      canEditOrDelete(quote.status)
                                        ? "text-red-700 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer"
                                        : "text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed opacity-60"
                                    }`}
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
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                        <h4 className="font-bold text-blue-900 text-lg">
                                          {language === "ar"
                                            ? "رسالة العرض"
                                            : "Offer Message"}
                                        </h4>
                                      </div>
                                      <button
                                        onClick={() =>
                                          setShowConversation(
                                            showConversation === quote.id
                                              ? null
                                              : quote.id
                                          )
                                        }
                                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                      >
                                        {showConversation === quote.id
                                          ? language === "ar"
                                            ? "إخفاء المحادثة"
                                            : "Hide Conversation"
                                          : language === "ar"
                                          ? "عرض المحادثة"
                                          : "View Conversation"}
                                      </button>
                                    </div>
                                    <p className="text-sm text-blue-900 mb-4 whitespace-pre-wrap leading-relaxed font-medium">
                                      {quote.offer_message}
                                    </p>
                                    {/* Conversation Thread */}
                                    {showConversation === quote.id && (
                                      <div className="bg-white border-2 border-blue-300 rounded-2xl p-5 space-y-4 mt-4 shadow-lg">
                                        <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                          <h5 className="text-sm font-bold text-blue-900">
                                            {language === "ar"
                                              ? "المحادثة"
                                              : "Conversation"}
                                          </h5>
                                        </div>
                                        {/* Conversation Messages */}
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 py-2">
                                          {quote.edit_request_messages &&
                                          quote.edit_request_messages.length >
                                            0 ? (
                                            quote.edit_request_messages.map(
                                              (msg: EditRequestMessage) => (
                                                <div
                                                  key={msg.id}
                                                  className={`flex items-start gap-3 ${
                                                    msg.is_admin
                                                      ? "flex-row-reverse"
                                                      : "flex-row"
                                                  }`}
                                                >
                                                  {/* Avatar */}
                                                  <div
                                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                                                      msg.is_admin
                                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                                        : "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                                                    }`}
                                                  >
                                                    {msg.is_admin
                                                      ? "A"
                                                      : msg.sender_name
                                                          .charAt(0)
                                                          .toUpperCase()}
                                                  </div>
                                                  {/* Message Bubble */}
                                                  <div
                                                    className={`flex flex-col max-w-[75%] ${
                                                      msg.is_admin
                                                        ? "items-end"
                                                        : "items-start"
                                                    }`}
                                                  >
                                                    <div
                                                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                                                        msg.is_admin
                                                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                                                          : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-bl-md"
                                                      }`}
                                                    >
                                                      <div
                                                        className={`flex items-center gap-2 mb-2 ${
                                                          msg.is_admin
                                                            ? "text-blue-100"
                                                            : "text-gray-600"
                                                        }`}
                                                      >
                                                        <span className="text-xs font-semibold">
                                                          {msg.is_admin
                                                            ? language === "ar"
                                                              ? "المسؤول"
                                                              : "Admin"
                                                            : msg.sender_name}
                                                        </span>
                                                        <span className="text-[10px] opacity-75">
                                                          {new Date(
                                                            msg.created_at
                                                          ).toLocaleString(
                                                            language === "ar"
                                                              ? "ar-SA"
                                                              : "en-US",
                                                            {
                                                              month: "short",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                            }
                                                          )}
                                                        </span>
                                                      </div>
                                                      <p
                                                        className={`text-sm whitespace-pre-wrap leading-relaxed ${
                                                          msg.is_admin
                                                            ? "text-white"
                                                            : "text-gray-800"
                                                        }`}
                                                      >
                                                        {msg.message}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )
                                          ) : (
                                            <div className="text-center py-8">
                                              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                                                <svg
                                                  className="w-8 h-8 text-gray-400"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                  />
                                                </svg>
                                              </div>
                                              <p className="text-sm text-gray-500">
                                                {language === "ar"
                                                  ? "لا توجد رسائل بعد"
                                                  : "No messages yet"}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Reply Input */}
                                        {quote.user_response === "PENDING" && (
                                          <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 relative">
                                                <textarea
                                                  value={
                                                    replyMessage[quote.id] || ""
                                                  }
                                                  onChange={(e) =>
                                                    setReplyMessage((prev) => ({
                                                      ...prev,
                                                      [quote.id]:
                                                        e.target.value,
                                                    }))
                                                  }
                                                  placeholder={
                                                    language === "ar"
                                                      ? "اكتب ردك هنا..."
                                                      : "Type your reply here..."
                                                  }
                                                  className="w-full px-4 py-3 pr-12 text-sm border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all shadow-sm"
                                                  rows={3}
                                                />
                                              </div>
                                            </div>
                                            <div className="flex justify-end">
                                              <button
                                                onClick={() =>
                                                  handleSendReply(quote.id)
                                                }
                                                disabled={
                                                  sendingReply === quote.id ||
                                                  !replyMessage[
                                                    quote.id
                                                  ]?.trim()
                                                }
                                                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
                                              >
                                                {sendingReply === quote.id ? (
                                                  <>
                                                    <svg
                                                      className="animate-spin h-4 w-4"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                      ></circle>
                                                      <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                      ></path>
                                                    </svg>
                                                    <span>
                                                      {language === "ar"
                                                        ? "جاري الإرسال..."
                                                        : "Sending..."}
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <span>
                                                      {language === "ar"
                                                        ? "إرسال"
                                                        : "Send"}
                                                    </span>
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
                                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                      />
                                                    </svg>
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
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
                                        {/* Status Badge */}
                                        {quote.edit_request_status &&
                                          quote.edit_request_status !==
                                            "PENDING" && (
                                            <div
                                              className={`text-center py-2 px-4 rounded-lg ${
                                                quote.edit_request_status ===
                                                "APPROVED"
                                                  ? "bg-green-50 text-green-700 border border-green-200"
                                                  : "bg-red-50 text-red-700 border border-red-200"
                                              }`}
                                            >
                                              <p className="text-sm font-semibold">
                                                {quote.edit_request_status ===
                                                "APPROVED"
                                                  ? language === "ar"
                                                    ? "✓ تمت الموافقة على طلب التعديل"
                                                    : "✓ Edit Request Approved"
                                                  : language === "ar"
                                                  ? "✗ تم رفض طلب التعديل"
                                                  : "✗ Edit Request Declined"}
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
                                      {quote.total_price
                                        ? parseFloat(
                                            quote.total_price.toString()
                                          ).toFixed(2)
                                        : "0.00"}
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

            {/* LCL Shipments Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                {user?.is_superuser ? t.allLCLShipments : t.myLCLShipments}
              </h2>

              {shipmentsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-yellow mb-4"></div>
                  <p className="text-gray-600 text-lg">{t.loading}</p>
                </div>
              ) : lclShipments.length === 0 ? (
                <div className="text-center py-12">
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg">{t.noShipments}</p>
                  {!user?.is_superuser && (
                    <Link
                      href="/create-shipment"
                      className="mt-4 inline-block px-6 py-3 bg-primary-yellow text-primary-dark rounded-lg font-semibold hover:bg-primary-yellow/90 transition-all"
                    >
                      {t.createLCLShipment}
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {lclShipments.map((shipment) => {
                    const isExpanded = expandedShipments.has(shipment.id);
                    return (
                      <div
                        key={shipment.id}
                        className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 hover:border-primary-yellow/50 transition-all duration-300 overflow-hidden"
                      >
                        {/* Summary Row */}
                        <div className="p-6 bg-gradient-to-br from-white to-gray-50/50">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                              {/* Shipment Number */}
                              <div className="sm:col-span-2 lg:col-span-2 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {t.shipmentNumber}
                                  </p>
                                </div>
                                <p
                                  className="font-bold text-primary-dark text-base sm:text-lg font-mono whitespace-nowrap overflow-hidden text-ellipsis"
                                  title={shipment.shipment_number}
                                >
                                  {shipment.shipment_number}
                                </p>
                                {user?.is_superuser && shipment.user && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                      {t.submittedBy}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                                      {shipment.user.username}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Direction */}
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {t.direction}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {shipment.direction === "eu-sy" ? t.euToSy : t.syToEu}
                                </p>
                              </div>

                              {/* Status */}
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                  {t.status}
                                </p>
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm ${getStatusColor(
                                    shipment.status || "CREATED"
                                  )}`}
                                >
                                  {getStatusDisplay(shipment.status || "CREATED")}
                                </span>
                                {shipment.tracking_number && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">
                                      {t.trackingNumber}
                                    </p>
                                    <p className="text-xs font-mono font-semibold text-primary-dark">
                                      {shipment.tracking_number}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleShipment(shipment.id)}
                                className="px-4 py-2 text-sm font-semibold text-primary-dark bg-primary-yellow/10 hover:bg-primary-yellow/20 rounded-lg transition-all"
                              >
                                {isExpanded ? t.collapse : t.expand}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-6 bg-gray-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Sender Info */}
                              <div className="space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                  <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                  <h4 className="font-bold text-primary-dark text-lg">
                                    {language === "ar" ? "المرسل" : "Sender"}
                                  </h4>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {shipment.sender_name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {shipment.sender_email}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {shipment.sender_phone}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {shipment.sender_address}, {shipment.sender_city}, {shipment.sender_country}
                                  </p>
                                </div>
                              </div>

                              {/* Receiver Info */}
                              <div className="space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                  <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                  <h4 className="font-bold text-primary-dark text-lg">
                                    {language === "ar" ? "المستلم" : "Receiver"}
                                  </h4>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {shipment.receiver_name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {shipment.receiver_email}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {shipment.receiver_phone}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {shipment.receiver_address}, {shipment.receiver_city}, {shipment.receiver_country}
                                  </p>
                                </div>
                              </div>

                              {/* Parcels */}
                              {shipment.parcels && shipment.parcels.length > 0 && (
                                <div className="md:col-span-2 space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                    <h4 className="font-bold text-primary-dark text-lg">
                                      {language === "ar" ? "الطرود" : "Parcels"}
                                    </h4>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {shipment.parcels.map((parcel: any, idx: number) => (
                                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <p className="text-sm font-semibold text-gray-900 mb-2">
                                          {language === "ar" ? `طرد ${idx + 1}` : `Parcel ${idx + 1}`}
                                        </p>
                                        <div className="text-xs text-gray-600 space-y-1">
                                          {parcel.weight && (
                                            <p>{language === "ar" ? "الوزن" : "Weight"}: {parcel.weight} kg</p>
                                          )}
                                          {parcel.cbm && (
                                            <p>{language === "ar" ? "الحجم" : "CBM"}: {parcel.cbm} m³</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Payment Info */}
                              {shipment.total_price > 0 && (
                                <div className="md:col-span-2 space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                    <h4 className="font-bold text-primary-dark text-lg">
                                      {language === "ar" ? "معلومات الدفع" : "Payment Information"}
                                    </h4>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">
                                        {t.totalPrice}
                                      </p>
                                      <p className="text-sm font-bold text-primary-dark">
                                        €{shipment.total_price.toFixed(2)}
                                      </p>
                                    </div>
                                    {shipment.payment_method && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          {language === "ar" ? "طريقة الدفع" : "Payment Method"}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900 capitalize">
                                          {shipment.payment_method}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Tracking */}
                              {shipment.tracking_number && (
                                <div className="md:col-span-2 space-y-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                                    <div className="w-1 h-6 bg-gradient-to-b from-primary-yellow to-primary-dark rounded-full"></div>
                                    <h4 className="font-bold text-primary-dark text-lg">
                                      {t.trackingNumber}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className="text-sm font-mono font-semibold text-primary-dark">
                                      {shipment.tracking_number}
                                    </p>
                                    <Link
                                      href={`/tracking?tracking=${shipment.tracking_number}`}
                                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-dark hover:bg-primary-dark/90 rounded-lg transition-all"
                                    >
                                      {t.track}
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Requests Card */}
            {productRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
                <h2 className="text-2xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-primary-yellow rounded-full"></div>
                  {user?.is_superuser ? t.allProductRequests : t.myProductRequests}
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          {t.productName}
                        </th>
                        {user?.is_superuser && (
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            {t.requestedBy}
                          </th>
                        )}
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          {t.requestStatus}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          {t.requestDate}
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          {t.adminNotes}
                        </th>
                        {user?.is_superuser && (
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            {t.actions}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {productRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">
                              {request.product_name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({request.language === "ar" ? "عربي" : "English"})
                            </span>
                          </td>
                          {user?.is_superuser && (
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {request.user_username || (language === "ar" ? "مجهول" : "Anonymous")}
                                </div>
                                {request.user_email && (
                                  <div className="text-gray-500 text-xs">{request.user_email}</div>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                request.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : request.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {t[request.status]}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(request.created_at).toLocaleDateString(
                              language === "ar" ? "ar-SA" : "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {request.admin_notes ? (
                              <span className="text-gray-700 text-sm">
                                {request.admin_notes}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-sm">
                                {language === "ar" ? "لا توجد ملاحظات" : "No notes"}
                              </span>
                            )}
                          </td>
                          {user?.is_superuser && (
                            <td className="py-4 px-4">
                              <button
                                onClick={() => handleEditProductRequest(request)}
                                className="text-primary-yellow hover:text-primary-yellow/80 font-medium text-sm flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {t.edit}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {productRequests.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {t.noProductRequests}
                  </p>
                )}

                {/* Edit Product Request Modal */}
                {editingProductRequest && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                      <h3 className="text-lg font-bold text-primary-dark mb-4">
                        {t.updateStatus}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.requestStatus}
                          </label>
                          <select
                            value={productRequestStatus}
                            onChange={(e) => setProductRequestStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                          >
                            <option value="PENDING">{t.PENDING}</option>
                            <option value="APPROVED">{t.APPROVED}</option>
                            <option value="REJECTED">{t.REJECTED}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.adminNotes}
                          </label>
                          <textarea
                            value={productRequestNotes}
                            onChange={(e) => setProductRequestNotes(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                            placeholder={language === "ar" ? "أضف ملاحظات..." : "Add notes..."}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end mt-6">
                        <button
                          onClick={() => {
                            setEditingProductRequest(null);
                            setProductRequestStatus("");
                            setProductRequestNotes("");
                          }}
                          disabled={updatingProductRequest}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={handleUpdateProductRequest}
                          disabled={updatingProductRequest}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-yellow hover:bg-primary-yellow/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {updatingProductRequest ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              {t.updating}
                            </>
                          ) : (
                            t.save
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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

      <Footer />
    </div>
  );
}
