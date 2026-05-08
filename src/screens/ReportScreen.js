import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { listOfflineReports, saveOfflineReport, syncOfflineReports } from "../services/offlineQueue";
import { colors } from "../theme";
import { resolveAdministrativeArea } from "../utils/adminArea";
import { createFootprintsAround, fetchOsmBuildings } from "../utils/buildingFootprints";
import { categories } from "../utils/categories";
import { defaultLocation, provinces } from "../utils/locations";

const initialForm = {
  language: "en",
  crisisId: "kinshasa-flood-response",
  category: "residential",
  crisisType: "flood",
  damageLevel: "partial",
  title: "",
  description: "",
  infrastructureName: "",
  assetId: "",
  debris: "unknown",
  electricityStatus: "unknown",
  healthServices: "unknown",
  urgentNeeds: [],
  accessBlocked: false,
  servicesDisrupted: false,
  livelihoodsAffected: false,
  peopleAtRisk: false,
  reporterName: "",
  reporterContact: "",
  reporterOrganization: "",
  reporterRole: "community_member",
  reporterConsent: false,
  locationDescription: "",
  province: defaultLocation.province,
  commune: defaultLocation.commune,
  lat: defaultLocation.lat,
  lng: defaultLocation.lng,
  image: null
};

function initialFormForLanguage(language = "en") {
  return { ...initialForm, language };
}

const incidents = [
  { key: "flood", label: "Flood", icon: "water-outline", color: "#60a5fa" },
  { key: "earthquake", label: "Earthquake", icon: "pulse-outline", color: "#ef4444" },
  { key: "tsunami", label: "Tsunami", icon: "boat-outline", color: "#0891b2" },
  { key: "hurricane", label: "Hurricane", icon: "thunderstorm-outline", color: "#64748b" },
  { key: "wildfire", label: "Wildfire", icon: "flame-outline", color: "#f97316" },
  { key: "explosion", label: "Explosion", icon: "warning-outline", color: "#b45309" },
  { key: "chemical_incident", label: "Chemical", icon: "flask-outline", color: "#16a34a" },
  { key: "conflict", label: "Conflict", icon: "shield-outline", color: "#8b5cf6" },
  { key: "civil_unrest", label: "Civil unrest", icon: "people-outline", color: "#db2777" },
  { key: "other", label: "Other", icon: "ellipsis-horizontal-outline", color: "#64748b" }
];

const severity = [
  { key: "minimal", label: "Low", color: colors.primary },
  { key: "partial", label: "Medium", color: colors.warning },
  { key: "complete", label: "High", color: colors.danger }
];

const languages = [
  { key: "en", label: "English" },
  { key: "fr", label: "Français" },
  { key: "es", label: "Español" },
  { key: "ar", label: "العربية" },
  { key: "zh", label: "中文" },
  { key: "ru", label: "Русский" }
];

const debrisOptions = [
  { key: "unknown", label: "Unknown" },
  { key: "no", label: "No debris" },
  { key: "yes", label: "Debris to clear" }
];

const electricityOptions = [
  { key: "unknown", label: "Unknown" },
  { key: "none", label: "No damage" },
  { key: "minor", label: "Minor disruption" },
  { key: "moderate", label: "Partial outage" },
  { key: "severe", label: "Major damage" },
  { key: "destroyed", label: "Destroyed" }
];

const healthOptions = [
  { key: "unknown", label: "Unknown" },
  { key: "functional", label: "Functional" },
  { key: "partial", label: "Partially functional" },
  { key: "disrupted", label: "Largely disrupted" },
  { key: "down", label: "Not functioning" }
];

const needsOptions = [
  { key: "water_food", label: "Water / food" },
  { key: "cash", label: "Cash assistance" },
  { key: "healthcare", label: "Healthcare" },
  { key: "shelter", label: "Shelter" },
  { key: "livelihoods", label: "Livelihoods" },
  { key: "wash", label: "WASH" },
  { key: "basic_services", label: "Basic services" },
  { key: "protection", label: "Protection" },
  { key: "local_support", label: "Local support" }
];

const uiText = {
  en: {
    what: "2. What happened?",
    whatSub: "Select the type of incident.",
    affected: "Affected infrastructure",
    language: "Language",
    anonymous: "Reporter contact is optional and visible only to authorized admins.",
    photo: "3. Add a photo",
    photoSub: "A clear photo helps responders validate the situation.",
    takePhoto: "Take a photo",
    upload: "Upload",
    tip: "Tip: photos are compressed before upload to save bandwidth.",
    describe: "4. Describe the situation",
    describeSub: "Provide short, clear, factual details.",
    title: "Short title",
    details: "Description",
    infraName: "Infrastructure name",
    buildingId: "Building or asset ID",
    severity: "Severity level",
    more: "Community impact",
    debris: "Debris near the site",
    electricity: "Electricity condition",
    health: "Health services",
    urgentNeeds: "Most pressing needs",
    where: "1. Where is it?",
    whereSub: "Confirm the location of the incident.",
    gps: "Use my location",
    map: "Select on map",
    landmark: "Landmark / location description",
    area: "Area",
    send: "Send report",
    next: "Next",
    offline: "Works offline. Will sync automatically.",
    thankYou: "Thank you!",
    savedOffline: "Saved offline",
    sentText: "Your report has been sent. It helps protect communities.",
    offlineText: "Your report will sync automatically when the connection returns.",
    summary: "Report summary",
    type: "Type",
    status: "Severity",
    location: "Location",
    backHome: "Back home",
    another: "Send another report"
  },
  fr: {
    what: "2. Que s'est-il passé ?",
    whatSub: "Sélectionnez le type d'incident.",
    affected: "Infrastructure touchée",
    language: "Langue",
    anonymous: "Le contact du signaleur est optionnel et visible seulement par les admins autorisés.",
    photo: "3. Ajouter une photo",
    photoSub: "Une photo claire aide les équipes à valider la situation.",
    takePhoto: "Prendre une photo",
    upload: "Importer",
    tip: "Astuce: les photos sont compressées avant l'envoi.",
    describe: "4. Décrire la situation",
    describeSub: "Ajoutez des détails courts, clairs et factuels.",
    title: "Titre court",
    details: "Description",
    infraName: "Nom de l'infrastructure",
    buildingId: "ID bâtiment ou asset",
    severity: "Niveau de gravité",
    more: "Impact communautaire",
    debris: "Débris sur le site",
    electricity: "État de l'électricité",
    health: "Services de santé",
    urgentNeeds: "Besoins les plus urgents",
    where: "1. Où est-ce ?",
    whereSub: "Confirmez le lieu de l'incident.",
    gps: "Utiliser ma position",
    map: "Sélectionner sur la carte",
    landmark: "Repère / description du lieu",
    area: "Zone",
    send: "Envoyer le rapport",
    next: "Suivant",
    offline: "Fonctionne hors ligne. Synchronisation automatique.",
    thankYou: "Merci !",
    savedOffline: "Enregistré hors ligne",
    sentText: "Votre signalement a été envoyé. Il aide à protéger les communautés.",
    offlineText: "Votre signalement sera synchronisé quand la connexion revient.",
    summary: "Résumé du signalement",
    type: "Type",
    status: "Gravité",
    location: "Localisation",
    backHome: "Accueil",
    another: "Envoyer un autre signalement"
  },
  es: {
    what: "2. ¿Qué ocurrió?",
    whatSub: "Seleccione el tipo de incidente.",
    affected: "Infraestructura afectada",
    language: "Idioma",
    anonymous: "El contacto del reportante es opcional y solo visible para administradores autorizados.",
    photo: "3. Agregar una foto",
    photoSub: "Una foto clara ayuda a validar la situación.",
    takePhoto: "Tomar foto",
    upload: "Subir",
    tip: "Consejo: las fotos se comprimen antes del envío.",
    describe: "4. Describa la situación",
    describeSub: "Proporcione detalles breves, claros y factuales.",
    title: "Título corto",
    details: "Descripción",
    infraName: "Nombre de infraestructura",
    buildingId: "ID de edificio o activo",
    severity: "Nivel de gravedad",
    more: "Impacto comunitario",
    debris: "Escombros en el sitio",
    electricity: "Estado eléctrico",
    health: "Servicios de salud",
    urgentNeeds: "Necesidades urgentes",
    where: "1. ¿Dónde está?",
    whereSub: "Confirme la ubicación del incidente.",
    gps: "Usar mi ubicación",
    map: "Seleccionar en mapa",
    landmark: "Referencia / descripción del lugar",
    area: "Área",
    send: "Enviar reporte",
    next: "Siguiente",
    offline: "Funciona sin conexión. Se sincroniza automáticamente.",
    thankYou: "¡Gracias!",
    savedOffline: "Guardado sin conexión",
    sentText: "Su reporte fue enviado. Ayuda a proteger comunidades.",
    offlineText: "Su reporte se sincronizará cuando vuelva la conexión.",
    summary: "Resumen del reporte",
    type: "Tipo",
    status: "Gravedad",
    location: "Ubicación",
    backHome: "Inicio",
    another: "Enviar otro reporte"
  },
  ar: {
    what: "2. ماذا حدث؟",
    whatSub: "اختر نوع الحادث.",
    affected: "البنية التحتية المتضررة",
    language: "اللغة",
    anonymous: "معلومات الاتصال اختيارية ومرئية فقط للمسؤولين المصرح لهم.",
    photo: "3. أضف صورة",
    photoSub: "الصورة الواضحة تساعد فرق الاستجابة على التحقق من الوضع.",
    takePhoto: "التقاط صورة",
    upload: "رفع صورة",
    tip: "نصيحة: يتم ضغط الصور قبل الإرسال لتقليل استهلاك البيانات.",
    describe: "4. صف الوضع",
    describeSub: "قدم تفاصيل قصيرة وواضحة وواقعية.",
    title: "عنوان قصير",
    details: "الوصف",
    infraName: "اسم البنية التحتية",
    buildingId: "معرف المبنى أو الأصل",
    severity: "مستوى الخطورة",
    more: "الأثر على المجتمع",
    debris: "الحطام في الموقع",
    electricity: "حالة الكهرباء",
    health: "الخدمات الصحية",
    urgentNeeds: "الاحتياجات الأكثر إلحاحا",
    where: "1. أين الموقع؟",
    whereSub: "أكد موقع الحادث.",
    gps: "استخدم موقعي",
    map: "اختر على الخريطة",
    landmark: "معلم / وصف الموقع",
    area: "المنطقة",
    send: "إرسال البلاغ",
    next: "التالي",
    offline: "يعمل دون اتصال. ستتم المزامنة تلقائيا.",
    thankYou: "شكرا!",
    savedOffline: "تم الحفظ دون اتصال",
    sentText: "تم إرسال بلاغك. إنه يساعد على حماية المجتمعات.",
    offlineText: "ستتم مزامنة بلاغك عند عودة الاتصال.",
    summary: "ملخص البلاغ",
    type: "النوع",
    status: "الخطورة",
    location: "الموقع",
    backHome: "العودة للرئيسية",
    another: "إرسال بلاغ آخر"
  },
  zh: {
    what: "2. 发生了什么？",
    whatSub: "选择事件类型。",
    affected: "受影响的基础设施",
    language: "语言",
    anonymous: "报告人联系方式为选填，仅授权管理员可见。",
    photo: "3. 添加照片",
    photoSub: "清晰的照片有助于救援人员核实情况。",
    takePhoto: "拍照",
    upload: "上传",
    tip: "提示：照片会在上传前压缩以节省流量。",
    describe: "4. 描述情况",
    describeSub: "请提供简短、清晰、真实的细节。",
    title: "简短标题",
    details: "描述",
    infraName: "基础设施名称",
    buildingId: "建筑或资产编号",
    severity: "严重程度",
    more: "社区影响",
    debris: "现场废墟",
    electricity: "电力状况",
    health: "卫生服务",
    urgentNeeds: "最紧急需求",
    where: "1. 在哪里？",
    whereSub: "确认事件地点。",
    gps: "使用我的位置",
    map: "在地图上选择",
    landmark: "地标 / 位置描述",
    area: "区域",
    send: "提交报告",
    next: "下一步",
    offline: "可离线使用。将自动同步。",
    thankYou: "谢谢！",
    savedOffline: "已离线保存",
    sentText: "您的报告已发送。它有助于保护社区。",
    offlineText: "连接恢复后将同步您的报告。",
    summary: "报告摘要",
    type: "类型",
    status: "严重程度",
    location: "位置",
    backHome: "返回首页",
    another: "提交另一份报告"
  },
  ru: {
    what: "2. Что произошло?",
    whatSub: "Выберите тип происшествия.",
    affected: "Пострадавшая инфраструктура",
    language: "Язык",
    anonymous: "Контакт заявителя необязателен и виден только авторизованным администраторам.",
    photo: "3. Добавьте фото",
    photoSub: "Четкое фото помогает службам проверить ситуацию.",
    takePhoto: "Сделать фото",
    upload: "Загрузить",
    tip: "Совет: фотографии сжимаются перед отправкой.",
    describe: "4. Опишите ситуацию",
    describeSub: "Укажите краткие, ясные и фактические детали.",
    title: "Краткий заголовок",
    details: "Описание",
    infraName: "Название инфраструктуры",
    buildingId: "ID здания или объекта",
    severity: "Уровень серьезности",
    more: "Влияние на сообщество",
    debris: "Завалы на месте",
    electricity: "Состояние электроснабжения",
    health: "Медицинские услуги",
    urgentNeeds: "Самые срочные потребности",
    where: "1. Где это?",
    whereSub: "Подтвердите местоположение происшествия.",
    gps: "Использовать мое местоположение",
    map: "Выбрать на карте",
    landmark: "Ориентир / описание места",
    area: "Район",
    send: "Отправить отчет",
    next: "Далее",
    offline: "Работает офлайн. Синхронизация будет автоматической.",
    thankYou: "Спасибо!",
    savedOffline: "Сохранено офлайн",
    sentText: "Ваш отчет отправлен. Он помогает защищать сообщества.",
    offlineText: "Ваш отчет синхронизируется при восстановлении связи.",
    summary: "Сводка отчета",
    type: "Тип",
    status: "Серьезность",
    location: "Местоположение",
    backHome: "На главную",
    another: "Отправить еще один отчет"
  }
};

const uiOverrides = {
  en: {
    uploadHint: "or upload from gallery",
    titlePlaceholder: "E.g. bridge partially damaged",
    infraPlaceholder: "E.g. central market bridge",
    assetPlaceholder: "Optional building footprint or local ID",
    sending: "Sending...",
    loadFootprints: "Load building footprints",
    footprintLoading: "Loading OSM building footprints...",
    footprintLoaded: "OSM buildings loaded. Tap a footprint to attach it.",
    footprintNone: "No OSM building found nearby. Offline selectable grid is available.",
    footprintUnavailable: "OSM is unavailable now. Offline selectable grid is available.",
    landmarkPlaceholder: "E.g. school near the central market",
    coordinates: "Coordinates",
    ready: "Ready",
    titleError: "Add a short title.",
    descriptionError: "Add at least 10 characters.",
    stillOffline: "report(s) still offline. They will sync when the connection returns."
  },
  fr: {
    uploadHint: "ou importer depuis la galerie",
    titlePlaceholder: "Ex. pont partiellement endommagé",
    infraPlaceholder: "Ex. pont du marché central",
    assetPlaceholder: "Empreinte bâtiment ou ID local optionnel",
    sending: "Envoi...",
    loadFootprints: "Charger les empreintes bâtiment",
    footprintLoading: "Chargement des bâtiments OSM...",
    footprintLoaded: "bâtiments OSM chargés. Touchez une empreinte pour l'attacher.",
    footprintNone: "Aucun bâtiment OSM proche. La grille hors ligne reste disponible.",
    footprintUnavailable: "OSM est indisponible. La grille hors ligne reste disponible.",
    landmarkPlaceholder: "Ex. école près du marché central",
    coordinates: "Coordonnées",
    ready: "Prêt",
    titleError: "Ajoutez un titre court.",
    descriptionError: "Ajoutez au moins 10 caractères.",
    stillOffline: "signalement(s) encore hors ligne. Ils seront synchronisés au retour de la connexion."
  },
  es: {
    uploadHint: "o subir desde la galería",
    titlePlaceholder: "Ej. puente parcialmente dañado",
    infraPlaceholder: "Ej. puente del mercado central",
    assetPlaceholder: "Huella de edificio o ID local opcional",
    sending: "Enviando...",
    loadFootprints: "Cargar huellas de edificios",
    footprintLoading: "Cargando edificios OSM...",
    footprintLoaded: "edificios OSM cargados. Toca una huella para adjuntarla.",
    footprintNone: "No se encontró un edificio OSM cercano. La cuadrícula offline está disponible.",
    footprintUnavailable: "OSM no está disponible. La cuadrícula offline está disponible.",
    landmarkPlaceholder: "Ej. escuela cerca del mercado central",
    coordinates: "Coordenadas",
    ready: "Listo",
    titleError: "Agrega un título corto.",
    descriptionError: "Agrega al menos 10 caracteres.",
    stillOffline: "reporte(s) siguen offline. Se sincronizarán cuando vuelva la conexión."
  },
  ar: {
    uploadHint: "أو ارفع من المعرض",
    titlePlaceholder: "مثال: جسر متضرر جزئيا",
    infraPlaceholder: "مثال: جسر السوق المركزي",
    assetPlaceholder: "بصمة مبنى أو معرف محلي اختياري",
    sending: "جار الإرسال...",
    loadFootprints: "تحميل بصمات المباني",
    footprintLoading: "جار تحميل مباني OSM...",
    footprintLoaded: "مبان OSM محملة. المس بصمة لإرفاقها.",
    footprintNone: "لا يوجد مبنى OSM قريب. الشبكة دون اتصال متاحة.",
    footprintUnavailable: "OSM غير متاح الآن. الشبكة دون اتصال متاحة.",
    landmarkPlaceholder: "مثال: مدرسة قرب السوق المركزي",
    coordinates: "الإحداثيات",
    ready: "جاهز",
    titleError: "أضف عنوانا قصيرا.",
    descriptionError: "أضف 10 أحرف على الأقل.",
    stillOffline: "بلاغ/بلاغات لا تزال دون اتصال. ستتزامن عند عودة الاتصال."
  },
  zh: {
    uploadHint: "或从相册上传",
    titlePlaceholder: "例如：桥梁部分损坏",
    infraPlaceholder: "例如：中央市场桥",
    assetPlaceholder: "可选建筑轮廓或本地 ID",
    sending: "正在发送...",
    loadFootprints: "加载建筑轮廓",
    footprintLoading: "正在加载 OSM 建筑...",
    footprintLoaded: "个 OSM 建筑已加载。点击轮廓进行关联。",
    footprintNone: "附近没有 OSM 建筑。离线可选网格可用。",
    footprintUnavailable: "OSM 当前不可用。离线可选网格可用。",
    landmarkPlaceholder: "例如：中央市场附近学校",
    coordinates: "坐标",
    ready: "就绪",
    titleError: "添加简短标题。",
    descriptionError: "至少添加 10 个字符。",
    stillOffline: "个报告仍离线。连接恢复后会同步。"
  },
  ru: {
    uploadHint: "или загрузите из галереи",
    titlePlaceholder: "Напр. мост частично поврежден",
    infraPlaceholder: "Напр. мост у центрального рынка",
    assetPlaceholder: "Контур здания или локальный ID, необязательно",
    sending: "Отправка...",
    loadFootprints: "Загрузить контуры зданий",
    footprintLoading: "Загрузка зданий OSM...",
    footprintLoaded: "зданий OSM загружено. Нажмите контур, чтобы прикрепить.",
    footprintNone: "Поблизости нет здания OSM. Доступна офлайн-сетка.",
    footprintUnavailable: "OSM сейчас недоступен. Доступна офлайн-сетка.",
    landmarkPlaceholder: "Напр. школа возле центрального рынка",
    coordinates: "Координаты",
    ready: "Готово",
    titleError: "Добавьте короткий заголовок.",
    descriptionError: "Добавьте минимум 10 символов.",
    stillOffline: "сообщений еще офлайн. Они синхронизируются после подключения."
  }
};

function tr(language, key) {
  return ({ ...uiText.en, ...uiOverrides.en, ...(uiText[language] || {}), ...(uiOverrides[language] || {}) })[key] || key;
}

export default function ReportScreen({ navigation, initialLanguage = "en" }) {
  const { token, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => initialFormForLanguage(initialLanguage));
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [footprints, setFootprints] = useState([]);
  const [selectedFootprint, setSelectedFootprint] = useState(null);
  const [footprintStatus, setFootprintStatus] = useState("");
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [dynamicArea, setDynamicArea] = useState(null);
  const provinceNames = Array.from(new Set([form.province, ...Object.keys(provinces)].filter(Boolean)));
  const communeOptions = Array.from(new Set([form.commune, ...(provinces[form.province] || [])].filter(Boolean)));
  const mapRegion = {
    latitude: Number(form.lat) || defaultLocation.lat,
    longitude: Number(form.lng) || defaultLocation.lng,
    latitudeDelta: 0.009,
    longitudeDelta: 0.009
  };

  useEffect(() => {
    refreshOfflineCount();
  }, []);

  useEffect(() => {
    if (step === 1) {
      loadFootprints({ lat: form.lat, lng: form.lng });
    }
  }, [step, form.lat, form.lng]);

  async function refreshOfflineCount() {
    const items = await listOfflineReports().catch(() => []);
    setOfflineCount(items.length);
  }

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setApiError("");
  }

  async function loadFootprints(location) {
    const lat = Number(location.lat ?? location.latitude);
    const lng = Number(location.lng ?? location.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    setFootprintStatus(tr(form.language, "footprintLoading"));
    try {
      const osmFootprints = await fetchOsmBuildings({ lat, lng });
      if (osmFootprints.length) {
        setFootprints(osmFootprints);
        setFootprintStatus(`${osmFootprints.length} ${tr(form.language, "footprintLoaded")}`);
        return;
      }
      const fallback = createFootprintsAround({ lat, lng }, `${form.commune}, ${form.province}`);
      setFootprints(fallback);
      setFootprintStatus(tr(form.language, "footprintNone"));
    } catch (error) {
      const fallback = createFootprintsAround({ lat, lng }, `${form.commune}, ${form.province}`);
      setFootprints(fallback);
      setFootprintStatus(tr(form.language, "footprintUnavailable"));
    }
  }

  function updateMapLocation(coordinate) {
    setSelectedFootprint(null);
    setForm((current) => ({
      ...current,
      lat: coordinate.latitude,
      lng: coordinate.longitude
    }));
    setErrors((current) => ({ ...current, location: "" }));
    setApiError("");
    resolveAreaForCoordinate(coordinate).catch(() => {});
  }

  async function resolveAreaForCoordinate(coordinate) {
    try {
      const area = await resolveAdministrativeArea({ ...coordinate, language: form.language });
      if (!area?.province && !area?.commune) return;
      setDynamicArea(area);
      setForm((current) => ({
        ...current,
        province: area.province || current.province,
        commune: area.commune || current.commune,
        locationDescription: current.locationDescription || area.addressText || ""
      }));
    } catch (_error) {
      setDynamicArea(null);
    }
  }

  function updateLocationFromCanvas(event) {
    if (!mapSize.width || !mapSize.height) return;
    const { locationX, locationY } = event.nativeEvent;
    const latitude = mapRegion.latitude + (0.5 - locationY / mapSize.height) * mapRegion.latitudeDelta;
    const longitude = mapRegion.longitude + (locationX / mapSize.width - 0.5) * mapRegion.longitudeDelta;
    updateMapLocation({ latitude, longitude });
  }

  function footprintBoxStyle(footprint) {
    if (!mapSize.width || !mapSize.height || !Array.isArray(footprint.positions)) return null;
    const lats = footprint.positions.map((point) => point.latitude);
    const lngs = footprint.positions.map((point) => point.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const left = ((minLng - (mapRegion.longitude - mapRegion.longitudeDelta / 2)) / mapRegion.longitudeDelta) * mapSize.width;
    const right = ((maxLng - (mapRegion.longitude - mapRegion.longitudeDelta / 2)) / mapRegion.longitudeDelta) * mapSize.width;
    const top = (((mapRegion.latitude + mapRegion.latitudeDelta / 2) - maxLat) / mapRegion.latitudeDelta) * mapSize.height;
    const bottom = (((mapRegion.latitude + mapRegion.latitudeDelta / 2) - minLat) / mapRegion.latitudeDelta) * mapSize.height;
    return {
      left: Math.max(6, Math.min(mapSize.width - 34, left)),
      top: Math.max(6, Math.min(mapSize.height - 34, top)),
      width: Math.max(28, Math.min(92, right - left)),
      height: Math.max(22, Math.min(76, bottom - top))
    };
  }

  function validate(targetStep = step) {
    const nextErrors = {};
    if (targetStep >= 1 && (!form.lat || !form.lng)) nextErrors.location = "Confirm a location.";
    if (targetStep >= 2 && !form.crisisType) nextErrors.crisisType = "Select the incident type.";
    if (targetStep >= 3 && !form.image) nextErrors.image = "Add a photo of the damaged infrastructure.";
    if (targetStep >= 4) {
      if (!form.title.trim() || form.title.trim().length < 3) nextErrors.title = tr(form.language, "titleError");
      if (!form.description.trim() || form.description.trim().length < 10) nextErrors.description = tr(form.language, "descriptionError");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (!validate(step)) return;
    setStep((current) => Math.min(current + 1, 4));
  }

  function previousStep() {
    if (step === 1) {
      navigation.goBack?.();
      return;
    }
    setStep((current) => Math.max(current - 1, 1));
  }

  async function choosePhoto(source) {
    const options = { mediaTypes: ["images"], quality: 0.42 };
    let result;
    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setApiError("Camera permission is required.");
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }
    if (!result.canceled) update("image", result.assets[0]);
  }

  function toggleNeed(key) {
    setForm((current) => ({
      ...current,
      urgentNeeds: current.urgentNeeds.includes(key) ? current.urgentNeeds.filter((item) => item !== key) : [...current.urgentNeeds, key]
    }));
  }

  function composeDescription(payload) {
    const selectedNeeds = payload.urgentNeeds.map((key) => labelFor(needsOptions, key)).join(", ") || "None selected";
    const communityDetails = [
      `Infrastructure: ${payload.infrastructureName || "Not specified"}`,
      `Building/asset ID: ${payload.assetId || "Not specified"}`,
      `Debris: ${labelFor(debrisOptions, payload.debris)}`,
      `Electricity: ${labelFor(electricityOptions, payload.electricityStatus)}`,
      `Health services: ${labelFor(healthOptions, payload.healthServices)}`,
      `Urgent needs: ${selectedNeeds}`,
      `Access blocked: ${payload.accessBlocked ? "Yes" : "No"}`,
      `Services disrupted: ${payload.servicesDisrupted ? "Yes" : "No"}`,
      `Livelihoods affected: ${payload.livelihoodsAffected ? "Yes" : "No"}`,
      `People at risk: ${payload.peopleAtRisk ? "Yes" : "No"}`
    ].join("\n");
    return `${payload.description.trim()}\n\nUNDP modular fields:\n${communityDetails}`;
  }

  async function useCurrentLocation() {
    setApiError("");
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setApiError("Location permission is required.");
      return;
    }
    const current = await Location.getCurrentPositionAsync({});
    setSelectedFootprint(null);
    setForm((existing) => ({
      ...existing,
      lat: current.coords.latitude,
      lng: current.coords.longitude
    }));
    await resolveAreaForCoordinate({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    await loadFootprints({ lat: current.coords.latitude, lng: current.coords.longitude });
  }

  function buildFormData(payload) {
    const body = new FormData();
    const footprint = payload.selectedFootprint;
    body.append("title", payload.title.trim());
    body.append("description", composeDescription(payload));
    body.append("category", payload.category);
    body.append("infrastructureType", payload.category);
    body.append("infrastructureName", payload.infrastructureName.trim());
    body.append("assetId", payload.assetId.trim());
    body.append("crisisType", payload.crisisType);
    body.append("damageLevel", payload.damageLevel);
    body.append("language", payload.language);
    body.append("debris", payload.debris);
    body.append("locationDescription", payload.locationDescription.trim());
    body.append("accessBlocked", String(payload.accessBlocked));
    body.append("servicesDisrupted", String(payload.servicesDisrupted));
    body.append("livelihoodsAffected", String(payload.livelihoodsAffected));
    body.append("peopleAtRisk", String(payload.peopleAtRisk));
    body.append("reporterName", payload.reporterName.trim());
    body.append("reporterContact", payload.reporterContact.trim());
    body.append("reporterOrganization", payload.reporterOrganization.trim());
    body.append("reporterRole", payload.reporterRole);
    body.append("reporterConsent", String(payload.reporterConsent));
    body.append("channel", "mobile");
    body.append("collectionTime", payload.collectionTime || new Date().toISOString());
    body.append("offlineCreatedAt", payload.offlineCreatedAt || "");
    body.append("offlineSyncedAt", payload.offlineCreatedAt ? new Date().toISOString() : "");
    body.append("appVersion", "mobile-mvp");
    body.append("crisisId", payload.crisisId || "kinshasa-flood-response");
    body.append("buildingFootprintId", footprint?.id || payload.assetId.trim() || `${payload.province}-${payload.commune}-${Number(payload.lat).toFixed(5)}-${Number(payload.lng).toFixed(5)}`);
    body.append("buildingFootprintName", footprint?.name || payload.infrastructureName.trim());
    body.append("buildingFootprintSource", footprint?.source || (payload.assetId.trim() ? "user-provided" : "gps-derived-prototype"));
    if (footprint?.geometry) body.append("buildingFootprintGeometry", JSON.stringify(footprint.geometry));
    body.append("province", payload.province);
    body.append("commune", payload.commune);
    body.append("lat", String(payload.lat));
    body.append("lng", String(payload.lng));
    body.append("address", payload.locationDescription.trim() || payload.dynamicArea?.addressText || `${payload.commune}, ${payload.province}`);
    if (payload.image) {
      body.append("images", {
        uri: payload.image.uri,
        name: payload.image.fileName || "tala-report.jpg",
        type: payload.image.mimeType || "image/jpeg"
      });
    }
    return body;
  }

  async function sendPayload(payload) {
    await api(isAuthenticated ? "/reports" : "/reports/guest", { method: "POST", body: buildFormData(payload) }, token);
  }

  async function submit() {
    if (submitting || !validate(4)) return;
    setSubmitting(true);
    setApiError("");
    const payload = { ...form, selectedFootprint, dynamicArea, collectionTime: new Date().toISOString() };
    try {
      await sendPayload(payload);
      setSuccess({ mode: "sent", payload });
      setForm(initialFormForLanguage(payload.language));
    } catch (sendError) {
      try {
        const offlinePayload = { ...payload, offlineCreatedAt: new Date().toISOString() };
        await saveOfflineReport(offlinePayload);
        await refreshOfflineCount();
        setSuccess({ mode: "offline", payload: offlinePayload, reason: sendError.message });
        setForm(initialFormForLanguage(payload.language));
      } catch (offlineError) {
        setApiError(offlineError.message || "Unable to save this report offline. Please keep the app open and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function syncQueue() {
    setSubmitting(true);
    setApiError("");
    try {
      const result = await syncOfflineReports(sendPayload);
      await refreshOfflineCount();
      if (result.failed.length > 0) {
        setApiError(`${result.failed.length} ${tr(form.language, "stillOffline")}`);
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <SafeAreaView style={styles.successScreen}>
        <View style={styles.successIcon}>
          <Ionicons name={success.mode === "offline" ? "cloud-offline-outline" : "checkmark"} size={56} color={colors.primary} />
        </View>
        <Text style={styles.successTitle}>{success.mode === "offline" ? tr(success.payload.language, "savedOffline") : tr(success.payload.language, "thankYou")}</Text>
        <Text style={styles.successText}>
          {success.mode === "offline" ? tr(success.payload.language, "offlineText") : tr(success.payload.language, "sentText")}
        </Text>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>{tr(success.payload.language, "summary")}</Text>
          <SummaryRow label={tr(success.payload.language, "type")} value={labelFor(incidents, success.payload.crisisType)} />
          <SummaryRow label={tr(success.payload.language, "status")} value={labelFor(severity, success.payload.damageLevel)} tone={severity.find((item) => item.key === success.payload.damageLevel)?.color} />
          <SummaryRow label={tr(success.payload.language, "location")} value={`${Number(success.payload.lat).toFixed(4)}, ${Number(success.payload.lng).toFixed(4)}`} />
          <SummaryRow label={tr(success.payload.language, "area")} value={`${success.payload.commune}, ${success.payload.province}`} />
        </View>
        {offlineCount > 0 ? (
          <Pressable style={styles.secondaryWide} onPress={syncQueue} disabled={submitting}>
            <Ionicons name="sync-outline" size={20} color="#071a4f" />
            <Text style={styles.secondaryText}>Sync pending reports</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.linkButton} onPress={() => navigation.goBack?.()}>
          <Text style={styles.linkText}>{tr(success.payload.language, "backHome")}</Text>
        </Pressable>
        <Pressable
          style={styles.linkButton}
          onPress={() => {
            setSuccess(null);
            setStep(1);
          }}
        >
          <Text style={styles.linkText}>{tr(success.payload.language, "another")}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <Pressable onPress={previousStep} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#071a4f" />
        </Pressable>
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={[styles.progressBar, item <= step && styles.progressActive]} />
          ))}
        </View>
        <View style={styles.backButton} />
      </View>

      {apiError ? <Text style={styles.error}>{apiError}</Text> : null}
      {offlineCount > 0 ? (
        <Pressable onPress={syncQueue} style={styles.offlinePill} disabled={submitting}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
          <Text style={styles.offlineText}>{offlineCount} offline report(s) waiting</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 2 ? (
          <View>
            <ScreenTitle title={tr(form.language, "what")} subtitle={tr(form.language, "whatSub")} />
            <Text style={styles.smallLabel}>{tr(form.language, "language")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {languages.map((item) => (
                <Chip key={item.key} label={item.label} active={form.language === item.key} onPress={() => update("language", item.key)} />
              ))}
            </ScrollView>
            <View style={styles.incidentGrid}>
              {incidents.map((item) => (
                <IncidentCard key={item.key} item={item} active={form.crisisType === item.key} onPress={() => update("crisisType", item.key)} />
              ))}
            </View>
            <Text style={styles.smallLabel}>{tr(form.language, "affected")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {categories.map((item) => (
                <Chip key={item.key} label={item.label} icon={item.icon} active={form.category === item.key} color={item.color} onPress={() => update("category", item.key)} />
              ))}
            </ScrollView>
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#071a4f" />
              <Text style={styles.infoText}>{tr(form.language, "anonymous")}</Text>
            </View>
            <PrimaryButton title={tr(form.language, "next")} icon="arrow-forward" onPress={nextStep} />
          </View>
        ) : null}

        {step === 3 ? (
          <View>
            <ScreenTitle title={tr(form.language, "photo")} subtitle={tr(form.language, "photoSub")} />
            <Pressable style={styles.photoBox} onPress={() => choosePhoto("camera")}>
              {form.image ? (
                <Image source={{ uri: form.image.uri }} style={styles.photoPreview} resizeMode="cover" />
              ) : (
                <View style={styles.photoEmpty}>
                  <View style={styles.cameraCircle}>
                    <Ionicons name="camera-outline" size={42} color={colors.primary} />
                  </View>
                  <Text style={styles.photoTitle}>{tr(form.language, "takePhoto")}</Text>
                  <Text style={styles.photoHint}>{tr(form.language, "uploadHint")}</Text>
                </View>
              )}
            </Pressable>
            {errors.image ? <Text style={styles.fieldError}>{errors.image}</Text> : null}
            <View style={styles.twoButtons}>
              <SecondaryButton title={tr(form.language, "takePhoto")} icon="camera-outline" onPress={() => choosePhoto("camera")} grow />
              <SecondaryButton title={tr(form.language, "upload")} icon="image-outline" onPress={() => choosePhoto("library")} grow />
            </View>
            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={24} color={colors.primary} />
              <Text style={styles.tipText}>{tr(form.language, "tip")}</Text>
            </View>
            <PrimaryButton title={tr(form.language, "next")} icon="arrow-forward" onPress={nextStep} />
          </View>
        ) : null}

        {step === 4 ? (
          <View>
            <ScreenTitle title={tr(form.language, "describe")} subtitle={tr(form.language, "describeSub")} />
            <FieldBlock label={tr(form.language, "title")} error={errors.title}>
              <TextInput value={form.title} onChangeText={(value) => update("title", value.slice(0, 80))} placeholder={tr(form.language, "titlePlaceholder")} placeholderTextColor="#94a3b8" style={styles.input} />
              <Text style={styles.counter}>{form.title.length}/80</Text>
            </FieldBlock>
            <FieldBlock label={tr(form.language, "details")} error={errors.description}>
              <TextInput
                value={form.description}
                onChangeText={(value) => update("description", value.slice(0, 500))}
                placeholder="What happened? What is damaged? Any immediate risk?"
                placeholderTextColor="#94a3b8"
                multiline
                style={[styles.input, styles.textarea]}
              />
              <Text style={styles.counter}>{form.description.length}/500</Text>
            </FieldBlock>
            <FieldBlock label={tr(form.language, "infraName")}>
              <TextInput value={form.infrastructureName} onChangeText={(value) => update("infrastructureName", value.slice(0, 120))} placeholder={tr(form.language, "infraPlaceholder")} placeholderTextColor="#94a3b8" style={styles.input} />
            </FieldBlock>
            <FieldBlock label={tr(form.language, "buildingId")}>
              <TextInput value={form.assetId} onChangeText={(value) => update("assetId", value.slice(0, 80))} placeholder={tr(form.language, "assetPlaceholder")} placeholderTextColor="#94a3b8" style={styles.input} />
            </FieldBlock>
            <Text style={styles.smallLabel}>Reporter details for admin follow-up</Text>
            <FieldBlock label="Name optional">
              <TextInput value={form.reporterName} onChangeText={(value) => update("reporterName", value.slice(0, 120))} placeholder="Your name, optional" placeholderTextColor="#94a3b8" style={styles.input} />
            </FieldBlock>
            <FieldBlock label="Phone or email optional">
              <TextInput value={form.reporterContact} onChangeText={(value) => update("reporterContact", value.slice(0, 160))} placeholder="Only visible to admin" placeholderTextColor="#94a3b8" style={styles.input} />
            </FieldBlock>
            <View style={styles.flagGrid}>
              <ToggleRow label="Response teams may contact me" value={form.reporterConsent} onPress={() => update("reporterConsent", !form.reporterConsent)} />
            </View>
            <Text style={styles.smallLabel}>{tr(form.language, "severity")}</Text>
            <View style={styles.severityRow}>
              {severity.map((item) => (
                <SeverityButton key={item.key} item={item} active={form.damageLevel === item.key} onPress={() => update("damageLevel", item.key)} />
              ))}
            </View>
            <Text style={styles.smallLabel}>{tr(form.language, "more")}</Text>
            <Text style={styles.smallLabel}>{tr(form.language, "debris")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {debrisOptions.map((item) => (
                <Chip key={item.key} label={item.label} active={form.debris === item.key} onPress={() => update("debris", item.key)} />
              ))}
            </ScrollView>
            <Text style={styles.smallLabel}>{tr(form.language, "electricity")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {electricityOptions.map((item) => (
                <Chip key={item.key} label={item.label} active={form.electricityStatus === item.key} onPress={() => update("electricityStatus", item.key)} />
              ))}
            </ScrollView>
            <Text style={styles.smallLabel}>{tr(form.language, "health")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {healthOptions.map((item) => (
                <Chip key={item.key} label={item.label} active={form.healthServices === item.key} onPress={() => update("healthServices", item.key)} />
              ))}
            </ScrollView>
            <Text style={styles.smallLabel}>{tr(form.language, "urgentNeeds")}</Text>
            <View style={styles.needGrid}>
              {needsOptions.map((item) => (
                <NeedChip key={item.key} label={item.label} active={form.urgentNeeds.includes(item.key)} onPress={() => toggleNeed(item.key)} />
              ))}
            </View>
            <View style={styles.flagGrid}>
              <ToggleRow label="Access blocked" value={form.accessBlocked} onPress={() => update("accessBlocked", !form.accessBlocked)} />
              <ToggleRow label="Services disrupted" value={form.servicesDisrupted} onPress={() => update("servicesDisrupted", !form.servicesDisrupted)} />
              <ToggleRow label="Livelihoods affected" value={form.livelihoodsAffected} onPress={() => update("livelihoodsAffected", !form.livelihoodsAffected)} />
              <ToggleRow label="People at risk" value={form.peopleAtRisk} onPress={() => update("peopleAtRisk", !form.peopleAtRisk)} />
            </View>
            <PrimaryButton title={submitting ? tr(form.language, "sending") : tr(form.language, "send")} icon="paper-plane-outline" onPress={submit} disabled={submitting} />
            <Text style={styles.offlineNote}>{tr(form.language, "offline")}</Text>
          </View>
        ) : null}

        {step === 1 ? (
          <View>
            <ScreenTitle title={tr(form.language, "where")} subtitle={tr(form.language, "whereSub")} />
            <SecondaryButton title={tr(form.language, "gps")} icon="locate-outline" onPress={useCurrentLocation} strong />
            <SecondaryButton title={tr(form.language, "loadFootprints")} icon="business-outline" onPress={() => loadFootprints({ lat: form.lat, lng: form.lng })} />
            <Pressable
              style={styles.nativeMapWrap}
              onLayout={(event) => setMapSize(event.nativeEvent.layout)}
              onPress={updateLocationFromCanvas}
            >
              <View style={styles.mapGridVerticalA} />
              <View style={styles.mapGridVerticalB} />
              <View style={styles.mapGridHorizontalA} />
              <View style={styles.mapGridHorizontalB} />
              <View style={styles.mapRoadA} />
              <View style={styles.mapRoadB} />
              {footprints.map((footprint) => {
                const box = footprintBoxStyle(footprint);
                if (!box) return null;
                return (
                  <Pressable
                    key={footprint.id}
                    style={[
                      styles.footprintBox,
                      box,
                      selectedFootprint?.id === footprint.id && styles.footprintBoxActive
                    ]}
                    onPress={() => {
                      setSelectedFootprint(footprint);
                      setApiError("");
                    }}
                  >
                    <Text style={styles.footprintBoxText}>{selectedFootprint?.id === footprint.id ? "Selected" : ""}</Text>
                  </Pressable>
                );
              })}
              <View style={styles.centerPin}>
                <Ionicons name="location" size={34} color={colors.primary} />
              </View>
              <View style={styles.footprintBadge}>
                <Ionicons name="business-outline" size={16} color={colors.primaryDark} />
                <Text style={styles.footprintBadgeText}>{footprintStatus || "Tap map to move the report pin."}</Text>
              </View>
            </Pressable>
            {selectedFootprint ? (
              <View style={styles.selectedFootprint}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <View style={styles.selectedFootprintCopy}>
                  <Text style={styles.selectedFootprintText}>{selectedFootprint.name}</Text>
                  <Text style={styles.selectedFootprintId}>{selectedFootprint.source} - {selectedFootprint.id}</Text>
                </View>
              </View>
            ) : null}
            <FieldBlock label={tr(form.language, "landmark")}>
              <TextInput
                value={form.locationDescription}
                onChangeText={(value) => update("locationDescription", value.slice(0, 260))}
                placeholder={tr(form.language, "landmarkPlaceholder")}
                placeholderTextColor="#94a3b8"
                multiline
                style={[styles.input, styles.landmarkInput]}
              />
            </FieldBlock>
            <View style={styles.locationCard}>
              <View>
                <Text style={styles.coordLabel}>{tr(form.language, "coordinates")}</Text>
                <Text style={styles.coordValue}>{Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}</Text>
                {dynamicArea?.country ? <Text style={styles.coordArea}>{dynamicArea.country}</Text> : null}
              </View>
              <Text style={styles.editText}>{tr(form.language, "ready")}</Text>
            </View>
            <Text style={styles.smallLabel}>{tr(form.language, "area")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {provinceNames.slice(0, 10).map((province) => (
                <Chip key={province} label={province} active={form.province === province} onPress={() => setForm((current) => ({ ...current, province, commune: provinces[province]?.[0] || "" }))} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {communeOptions.map((commune) => (
                <Chip key={commune} label={commune} active={form.commune === commune} onPress={() => update("commune", commune)} />
              ))}
            </ScrollView>
            {errors.location ? <Text style={styles.fieldError}>{errors.location}</Text> : null}
            <PrimaryButton title={tr(form.language, "next")} icon="arrow-forward" onPress={nextStep} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ScreenTitle({ title, subtitle }) {
  return (
    <View style={styles.screenTitle}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepSubtitle}>{subtitle}</Text>
    </View>
  );
}

function IncidentCard({ item, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.incidentCard, active && styles.incidentActive, pressed && styles.pressed]}>
      <Ionicons name={item.icon} size={42} color={item.color} />
      <Text style={styles.incidentLabel}>{item.label}</Text>
    </Pressable>
  );
}

function Chip({ label, icon, active, color, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      {icon ? <Ionicons name={icon} size={16} color={active ? colors.primary : color || colors.muted} /> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SeverityButton({ item, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.severity, { borderColor: active ? item.color : `${item.color}55`, backgroundColor: active ? `${item.color}16` : "#fff" }, pressed && styles.pressed]}>
      <Text style={[styles.severityText, { color: item.color }]}>{item.label}</Text>
    </Pressable>
  );
}

function NeedChip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.needChip, active && styles.needChipActive, pressed && styles.pressed]}>
      <Text style={[styles.needText, active && styles.needTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({ label, value, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.toggleRow, value && styles.toggleRowActive, pressed && styles.pressed]}>
      <Ionicons name={value ? "checkmark-circle" : "ellipse-outline"} size={22} color={value ? colors.primary : colors.muted} />
      <Text style={[styles.toggleText, value && styles.toggleTextActive]}>{label}</Text>
    </Pressable>
  );
}

function FieldBlock({ label, error, children }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function PrimaryButton({ title, icon, onPress, disabled }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, disabled && styles.disabled, pressed && styles.pressed]}>
      <Text style={styles.primaryText}>{title}</Text>
      {icon ? <Ionicons name={icon} size={22} color="#fff" /> : null}
    </Pressable>
  );
}

function SecondaryButton({ title, icon, onPress, strong, grow }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, grow && styles.secondaryGrow, strong && styles.secondaryStrong, pressed && styles.pressed]}>
      {icon ? <Ionicons name={icon} size={22} color={strong ? colors.primaryDark : "#071a4f"} /> : null}
      <Text style={[styles.secondaryText, strong && styles.secondaryStrongText]}>{title}</Text>
    </Pressable>
  );
}

function SummaryRow({ label, value, tone }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, tone ? { color: tone } : null]}>{value}</Text>
    </View>
  );
}

function labelFor(items, key) {
  return items.find((item) => item.key === key)?.label || key;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#fff",
    flex: 1,
    paddingHorizontal: 22
  },
  topbar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    paddingBottom: 12,
    paddingTop: 6
  },
  backButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40
  },
  progress: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center"
  },
  progressBar: {
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    height: 6,
    width: 48
  },
  progressActive: {
    backgroundColor: colors.primary
  },
  content: {
    paddingBottom: 28
  },
  screenTitle: {
    marginBottom: 20,
    marginTop: 8
  },
  stepTitle: {
    color: "#071a4f",
    fontSize: 25,
    fontWeight: "900"
  },
  stepSubtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 6
  },
  incidentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22
  },
  incidentCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    height: 112,
    justifyContent: "center",
    width: "47%"
  },
  incidentActive: {
    backgroundColor: "#f0fdf4",
    borderColor: colors.primary
  },
  incidentLabel: {
    color: "#071a4f",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 12
  },
  smallLabel: {
    color: "#071a4f",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
    marginTop: 8
  },
  chips: {
    gap: 8,
    paddingBottom: 12,
    paddingRight: 16
  },
  chip: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  chipActive: {
    backgroundColor: "#ecfdf5",
    borderColor: colors.primary
  },
  chipText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900"
  },
  chipTextActive: {
    color: colors.primaryDark
  },
  infoBox: {
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
    marginTop: 8,
    padding: 16
  },
  infoText: {
    color: "#334155",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  photoBox: {
    borderColor: "#9bd8b2",
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 240,
    marginBottom: 18,
    overflow: "hidden"
  },
  photoEmpty: {
    alignItems: "center",
    backgroundColor: "#fbfefc",
    flex: 1,
    justifyContent: "center"
  },
  cameraCircle: {
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 999,
    height: 92,
    justifyContent: "center",
    marginBottom: 18,
    width: 92
  },
  photoTitle: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "900"
  },
  photoHint: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6
  },
  photoPreview: {
    height: "100%",
    width: "100%"
  },
  twoButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20
  },
  tipBox: {
    alignItems: "center",
    backgroundColor: "#eef8f1",
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
    padding: 16
  },
  tipText: {
    color: "#334155",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  fieldBlock: {
    marginBottom: 18
  },
  fieldLabel: {
    color: "#071a4f",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8
  },
  input: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: "#071a4f",
    fontSize: 15,
    fontWeight: "700",
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  textarea: {
    minHeight: 138,
    textAlignVertical: "top"
  },
  counter: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "right"
  },
  severityRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22
  },
  severity: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 15
  },
  severityText: {
    fontSize: 13,
    fontWeight: "900"
  },
  needGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16
  },
  needChip: {
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  needChipActive: {
    backgroundColor: "#ecfdf5",
    borderColor: colors.primary
  },
  needText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900"
  },
  needTextActive: {
    color: colors.primaryDark
  },
  flagGrid: {
    gap: 9,
    marginBottom: 22
  },
  toggleRow: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 13
  },
  toggleRowActive: {
    backgroundColor: "#f0fdf4",
    borderColor: colors.primary
  },
  toggleText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900"
  },
  toggleTextActive: {
    color: colors.primaryDark
  },
  nativeMapWrap: {
    backgroundColor: "#e0f2fe",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 260,
    marginBottom: 12,
    marginTop: 14,
    overflow: "hidden"
  },
  mapGridVerticalA: {
    backgroundColor: "rgba(15, 118, 110, 0.12)",
    height: "100%",
    left: "32%",
    position: "absolute",
    width: 1
  },
  mapGridVerticalB: {
    backgroundColor: "rgba(15, 118, 110, 0.12)",
    height: "100%",
    left: "67%",
    position: "absolute",
    width: 1
  },
  mapGridHorizontalA: {
    backgroundColor: "rgba(15, 118, 110, 0.12)",
    height: 1,
    position: "absolute",
    top: "34%",
    width: "100%"
  },
  mapGridHorizontalB: {
    backgroundColor: "rgba(15, 118, 110, 0.12)",
    height: 1,
    position: "absolute",
    top: "66%",
    width: "100%"
  },
  mapRoadA: {
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    height: 16,
    left: -30,
    position: "absolute",
    top: 96,
    transform: [{ rotate: "-18deg" }],
    width: 430
  },
  mapRoadB: {
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    height: 13,
    left: -20,
    position: "absolute",
    top: 162,
    transform: [{ rotate: "24deg" }],
    width: 420
  },
  footprintBox: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.84)",
    borderColor: "#0f766e",
    borderRadius: 5,
    borderWidth: 1,
    justifyContent: "center",
    position: "absolute"
  },
  footprintBoxActive: {
    backgroundColor: "rgba(22, 163, 74, 0.34)",
    borderColor: colors.primary,
    borderWidth: 2
  },
  footprintBoxText: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: "900"
  },
  centerPin: {
    left: "50%",
    marginLeft: -17,
    marginTop: -34,
    position: "absolute",
    top: "50%"
  },
  footprintBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    bottom: 12,
    flexDirection: "row",
    gap: 7,
    left: 12,
    maxWidth: "88%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "absolute"
  },
  footprintBadgeText: {
    color: "#0f172a",
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "900"
  },
  selectedFootprint: {
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderColor: "#bbf7d0",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    padding: 12
  },
  selectedFootprintCopy: {
    flex: 1
  },
  selectedFootprintText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900"
  },
  selectedFootprintId: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3
  },
  landmarkInput: {
    minHeight: 82,
    textAlignVertical: "top"
  },
  locationCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    padding: 16
  },
  coordLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4
  },
  coordValue: {
    color: "#071a4f",
    fontSize: 15,
    fontWeight: "900"
  },
  coordArea: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  editText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900"
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    elevation: 4,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 58,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 54,
    paddingHorizontal: 14
  },
  secondaryGrow: {
    flex: 1
  },
  secondaryStrong: {
    borderColor: colors.primary,
    flex: 0,
    width: "100%"
  },
  secondaryText: {
    color: "#071a4f",
    fontSize: 14,
    fontWeight: "900"
  },
  secondaryStrongText: {
    color: colors.primaryDark
  },
  disabled: {
    opacity: 0.62
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
  },
  error: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    color: colors.danger,
    fontWeight: "800",
    marginBottom: 10,
    padding: 12
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6
  },
  offlinePill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff7ed",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  offlineText: {
    color: "#9a3412",
    fontSize: 12,
    fontWeight: "900"
  },
  offlineNote: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center"
  },
  successScreen: {
    alignItems: "center",
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22
  },
  successIcon: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 999,
    height: 112,
    justifyContent: "center",
    marginBottom: 24,
    width: 112
  },
  successTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center"
  },
  successText: {
    color: "#eafff1",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 24,
    marginTop: 8,
    maxWidth: 280,
    textAlign: "center"
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    padding: 18,
    width: "100%"
  },
  summaryTitle: {
    color: "#071a4f",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7
  },
  summaryLabel: {
    color: colors.muted,
    fontWeight: "800"
  },
  summaryValue: {
    color: "#071a4f",
    flexShrink: 1,
    fontWeight: "900",
    textAlign: "right"
  },
  secondaryWide: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 8,
    minHeight: 54,
    width: "100%"
  },
  linkButton: {
    padding: 11
  },
  linkText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900"
  }
});
