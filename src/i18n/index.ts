import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly as objects
const enTranslations = {
  "navigation": {
    "factory": "Factory",
    "machine": "Machine",
    "records": "Records",
    "warnings": "Warnings",
    "settings": "Settings",
    "account": {
      "settings": "Settings"
    },
    "language": {
      "chinese": "Chinese"
    }
  },
  "factory": {
    "title": "Add Factory",
    "editTitle": "Edit Factory", 
    "description": "Add factory and set warning conditions",
    "editDescription": "Edit factory information and set warning conditions",
    "info": "Factory Information",
    "warnings": "Warning Conditions",
    "name": "Factory Name",
    "namePlaceholder": "Enter factory name",
    "width": "Factory Width",
    "widthPlaceholder": "Factory width",
    "length": "Factory Length", 
    "lengthPlaceholder": "Factory length",
    "selectMachine": "Select Machine",
    "selectMachinePlaceholder": "Select machine",
    "copySettings": "Copy Settings",
    "copied": "Copied",
    "pasteSettings": "Paste Settings", 
    "pasted": "Pasted",
    "applyToAll": "Apply to All Machines",
    "defaultSettings": "Factory default settings will apply to all unconfigured new machines",
    "add": "Add",
    "addFactory": "New Factory",
    "update": "Update",
    "cancel": "Cancel",
    "allFactories": "All Factories",
    "sizeError": "Factory size is insufficient to accommodate all machines"
  },
  "machine": {
    "title": "Add Machine",
    "description": "Please enter machine name and IP address",
    "name": "Machine Name",
    "namePlaceholder": "Enter machine name",
    "ipAddress": "IP Address",
    "ipPlaceholder": "e.g.: 192.168.1.100",
    "adding": "Adding...",
    "add": "Add Machine",
    "cancel": "Cancel"
  },
  "warnings": {
    "severity": {
      "low": "Low",
      "medium": "Medium", 
      "high": "High",
      "critical": "Critical"
    },
    "details": "Details",
    "types": {
      "warning": "Warning",
      "attention": "Attention",
      "alert": "Alert", 
      "danger": "Danger",
      "temperatureHigh": "Temperature too high",
      "pressureLow": "Pressure too low",
      "operationAbnormal": "Operation abnormal",
      "systemUnstable": "System unstable",
      "maintenanceRequired": "Maintenance required",
      "energyAbnormal": "Energy consumption abnormal",
      "voltageFluctuation": "Voltage fluctuation",
      "equipmentFailure": "Equipment failure"
    }
  },
  "subscription": {
    "checking": "Checking subscription status",
    "loading": "Loading your account information...",
    "loadingPlans": "Loading plan information...",
    "required": "Subscription Required",
    "description": "Accessing the OPC UA Dashboard requires a valid subscription",
    "sectionDescription": "Manage your subscription plans and payment settings",
    "greeting": "Hello {username}! To continue using our industrial monitoring platform, please upgrade to a paid subscription.",
    "planTitle": "Subscription Plan",
    "month": "month",
    "year": "year",
    "features": {
      "unlimitedFactories": "Unlimited factory management",
      "realtimeMonitoring": "Real-time machine monitoring", 
      "dataAnalysis": "Data analysis reports",
      "alertSystem": "Alert system",
      "support24x7": "24/7 customer support",
      "dataExport": "Data export functionality"
    },
    "upgradeNow": "Upgrade Now",
    "refreshing": "Checking...",
    "refresh": "Recheck subscription status",
    "includesFeatures": "Included Features",
    "terms": "Cancel anytime • Secure payment • Instant activation",
    "alreadySubscribed": "Already have a subscription? Check your subscription status on",
    "settingsPage": "Settings Page",
    "invalidSession": "Invalid session ID",
    "verificationError": "Unable to verify subscription status, please refresh manually or contact customer service",
    "errors": {
      "loadPlans": "Unable to load subscription plans, please try again later",
      "createCheckout": "Unable to create payment page, please try again later", 
      "networkError": "Network connection issue, please check network and retry",
      "authError": "Authentication invalid, please login again",
      "paymentSetupError": "Payment setup error, please contact customer service",
      "requestError": "Request parameter error, please try again later",
      "openPortal": "Unable to open management page, please try again later",
      "cancelError": "Failed to cancel subscription, please try again later",
      "loadSubscription": "Error loading subscription information"
    },
    "status": {
      "active": "Active",
      "trialing": "Trial",
      "pastDue": "Past Due", 
      "canceled": "Canceled",
      "inactive": "Inactive"
    },
    "actions": {
      "opening": "Opening...",
      "manageSubscription": "Manage Subscription",
      "confirmCancel": "Confirm Cancel",
      "cancelSuccess": "Subscription cancelled, will stop at the end of current billing period."
    },
    "currentPeriod": "Current Period",
    "cancelSubscription": "Cancel Subscription", 
    "noActiveSubscription": "You currently have no active subscription",
    "selectPlanToStart": "Select a subscription plan below to start using our services",
    "currentStatus": {
      "title": "Current Subscription Status",
      "description": "View your current subscription plan and status"
    },
    "planSelection": {
      "title": "Choose Subscription Plan",
      "description": "Select the subscription plan that best suits your needs"
    },
    "redirecting": "Redirecting...",
    "cancelConfirmation": "Are you sure you want to cancel your subscription? You will be able to continue using the service until the current billing period ends",
    "cancelWarning": "After that, you will lose access to the dashboard.",
    "keepSubscription": "Keep Subscription",
    "cancelling": "Cancelling...",
    "success": {
      "title": "Subscription Successful!",
      "welcome": "Welcome to our professional service",
      "description": "Your subscription has been activated and you can now enjoy all professional features. You will receive a confirmation email with subscription details.",
      "subscriptionId": "Subscription ID",
      "startUsing": "Start Using",
      "manageSubscription": "Manage Subscription",
      "verifying": "Verifying payment...",
      "verifyingDescription": "Please wait, we are confirming your subscription status",
      "verificationFailed": "Verification Failed",
      "verificationFailedDescription": "Unable to verify your payment status, please try again later or contact customer service",
      "retryVerification": "Retry Verification",
      "backToSettings": "Back to Settings"
    },
    "cancel": {
      "title": "Subscription Cancelled",
      "subtitle": "Your payment process has been cancelled",
      "description": "No problem! You can return to complete the subscription process at any time. Your account has not been charged.",
      "tryAgain": "Subscribe Again",
      "backToSettings": "Back to Settings",
      "supportNote": "If you encounter any issues during the subscription process, please contact our customer service team, we are happy to help."
    }
  },
  "pages": {
    "settings": "Settings",
    "factory": "Factory", 
    "missionControl": "Mission Control Dashboard"
  },
  "settings": {
    "title": "Settings",
    "description": "Manage your account settings and application preferences",
    "tabs": {
      "personal": "Personal Information",
      "subscription": "Subscription Management"
    }
  },
  "dashboard": {
    "title": "Mission Control Dashboard",
    "description": "Real-time industrial machine monitoring and analytics",
    "views": {
      "production": "Production Status",
      "quality": "24h Quality View",
      "reports": "Reports", 
      "trends": "Trend Analysis",
      "correlation": "Correlation",
      "timeline": "Summary Timeline",
      "utilization": "Utilization",
      "gantt": "Equipment Gantt",
      "traceability": "Traceability"
    }
  },
  "personalSettings": {
    "title": "Personal Settings",
    "description": "Manage your account information and preferences",
    "personalInfo": {
      "title": "Personal Information",
      "description": "Update your basic account information",
      "username": "Username",
      "email": "Email",
      "usernameRequired": "Username is required",
      "usernameMinLength": "Username must be at least 2 characters",
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "saveChanges": "Save Changes",
      "updating": "Updating...",
      "changePassword": "Change Password",
      "updateSuccess": "Personal information updated successfully",
      "updateError": "Update failed, please try again later"
    },
    "appSettings": {
      "title": "Application Settings",
      "description": "Customize your application experience",
      "language": {
        "title": "Language Settings",
        "current": "Current language",
        "switch": "Switch Language",
        "traditionalChinese": "繁體中文",
        "simplifiedChinese": "简体中文",
        "english": "English"
      },
      "theme": {
        "title": "Theme Settings",
        "current": "Current theme",
        "lightMode": "Light Mode",
        "darkMode": "Dark Mode",
        "switchToLight": "Light Mode",
        "switchToDark": "Dark Mode"
      },
      "logout": {
        "title": "Logout Account",
        "description": "End current session and return to login page",
        "button": "Logout"
      }
    },
    "passwordDialog": {
      "title": "Change Password",
      "description": "Please enter your current password and new password",
      "currentPassword": "Current Password",
      "newPassword": "New Password",
      "confirmPassword": "Confirm New Password",
      "currentPasswordRequired": "Please enter your current password",
      "newPasswordRequired": "Please enter new password",
      "passwordMinLength": "Password must be at least 8 characters",
      "confirmPasswordRequired": "Please confirm new password",
      "passwordMismatch": "Passwords do not match",
      "cancel": "Cancel",
      "change": "Change Password",
      "changing": "Changing...",
      "changeSuccess": "Password changed successfully",
      "changeError": "Password change failed, please check if current password is correct"
    }
  },
  "machineStatus": {
    "running": "Running",
    "idle": "Idle",
    "alarm": "Alarm",
    "maintenance": "Maintenance"
  },
  "factoryView": {
    "online": "Online",
    "offline": "Offline",
    "warning": "Warning",
    "error": "Error",
    "refresh": "Refresh",
    "settings": "Settings",
    "deleteFactory": "Delete Factory",
    "machines": "machines",
    "dragInstruction": "Drag machines to rearrange them on the factory floor. Click empty spaces to add new machines."
  },
  "machineCard": {
    "utilization": "Utilization",
    "cycleTime": "Cycle Time",
    "shotCount": "Shot Count",
    "openMachine": "Open Machine",
    "quality24h": "24h Quality",
    "cycleTime60min": "Cycle Time (60min)",
    "shotRateMin": "Shot Rate (/min)",
    "dataAge": "Data age",
    "setpointsChanged": "Setpoints changed"
  },
  "qualityView": {
    "title": "Quality Metrics - 24 Hour View",
    "currentValue": "Current Value",
    "specViolations": "Spec Violations",
    "processCapability": "Process Capability",
    "trend": "Trend",
    "stable": "Stable",
    "target": "Target",
    "outOfSpec": "Out of Spec",
    "spcBands": "SPC Bands",
    "showOutliers": "Show Outliers",
    "medianSmoothing": "Median Smoothing",
    "regimeMarkers": "Regime Markers",
    "dimension": "Dimension (mm)",
    "rejectRate": "Reject Rate (%)",
    "temperature": "Temperature (°C)",
    "specLimits": "Spec Limits",
    "violations": "violations",
    "readings": "of readings",
    "cpkIndex": "Cpk index",
    "lastHours": "Last 4 hours",
    "processChanges": "Process Changes & Conditions",
    "dayShift": "Day Shift Started",
    "eveningShift": "Evening Shift Started",
    "nightShift": "Night Shift Started",
    "active": "Active",
    "completed": "Completed"
  },
  "correlationChart": {
    "title": "Correlation Analysis",
    "xAxisVariable": "X-Axis Variable",
    "yAxisVariable": "Y-Axis Variable",
    "colorBy": "Color By",
    "fitType": "Fit Type",
    "injectionPressure": "Injection Pressure",
    "temperature": "Temperature",
    "qualityScore": "Quality Score",
    "cycleTime": "Cycle Time",
    "mold": "Mold",
    "machine": "Machine",
    "shift": "Shift",
    "linear": "Linear",
    "loess": "LOESS",
    "none": "None",
    "pearsonR": "Pearson R",
    "rSquared": "R-Squared",
    "sampleSize": "Sample Size",
    "significance": "Significance",
    "strongPositive": "Strong positive",
    "strongCorrelation": "Strong Correlation",
    "exportData": "Export Data",
    "dataPoints": "Data points",
    "variance": "variance",
    "high": "High",
    "regressionStats": "Regression Statistics",
    "slope": "Slope",
    "intercept": "Intercept",
    "standardError": "Standard Error",
    "confidence": "Confidence",
    "outlierAnalysis": "Outlier Analysis",
    "totalOutliers": "Total Outliers",
    "outlierDescription": "Points beyond 2σ from regression line",
    "viewOutlierDetails": "View Outlier Details",
    "highPressureHighTemp": "High Pressure, High Temperature",
    "lowPressureLowTemp": "Low Pressure, Low Temperature",
    "highPressureLowTemp": "High Pressure, Low Temperature",
    "lowPressureHighTemp": "Low Pressure, High Temperature",
    "points": "points"
  },
  "summaryKPIs": {
    "totalMachines": "Total Machines",
    "running": "Running",
    "alarms": "Alarms",
    "avgUtilization": "Avg Utilization"
  }
};

const zhTWTranslations = {
  "navigation": {
    "factory": "工廠",
    "machine": "機台", 
    "records": "操作日誌",
    "warnings": "警告",
    "settings": "設定",
    "account": {
      "settings": "設定"
    },
    "language": {
      "chinese": "中文"
    }
  },
  "factory": {
    "title": "新增工廠",
    "editTitle": "編輯工廠",
    "description": "新增工廠並設定警告條件", 
    "editDescription": "編輯工廠資訊和設定警告條件",
    "info": "工廠資訊",
    "warnings": "警告條件",
    "name": "工廠名稱",
    "namePlaceholder": "輸入工廠名稱",
    "width": "工廠寬度",
    "widthPlaceholder": "工廠寬度",
    "length": "工廠長度",
    "lengthPlaceholder": "工廠長度", 
    "selectMachine": "選擇機台",
    "selectMachinePlaceholder": "選擇機台",
    "copySettings": "複製設定",
    "copied": "已複製",
    "pasteSettings": "貼上設定",
    "pasted": "已貼上",
    "applyToAll": "應用到所有機台",
    "defaultSettings": "工廠預設設定將應用於所有未配置的新機台",
    "add": "新增",
    "addFactory": "新廠區",
    "update": "更新", 
    "cancel": "取消",
    "allFactories": "全部廠區",
    "sizeError": "工廠大小不足以容納所有機台"
  },
  "machine": {
    "title": "新增機器",
    "description": "請輸入機器名稱和IP地址",
    "name": "機器名稱",
    "namePlaceholder": "輸入機器名稱",
    "ipAddress": "IP地址",
    "ipPlaceholder": "例如: 192.168.1.100",
    "adding": "新增中...",
    "add": "新增機器",
    "cancel": "取消"
  },
  "warnings": {
    "severity": {
      "low": "輕微",
      "medium": "中等",
      "high": "嚴重", 
      "critical": "危急"
    },
    "details": "詳情",
    "types": {
      "warning": "警告",
      "attention": "注意",
      "alert": "警示",
      "danger": "危險",
      "temperatureHigh": "溫度過高",
      "pressureLow": "壓力過低", 
      "operationAbnormal": "操作異常",
      "systemUnstable": "系統不穩",
      "maintenanceRequired": "維護需求",
      "energyAbnormal": "能耗異常",
      "voltageFluctuation": "電壓波動",
      "equipmentFailure": "設備故障"
    }
  },
  "subscription": {
    "checking": "檢查訂閱狀態",
    "loading": "正在載入您的帳戶資訊...",
    "loadingPlans": "載入方案資訊...", 
    "required": "需要訂閱",
    "description": "訪問 OPC UA 儀表板需要有效的訂閱",
    "sectionDescription": "管理您的訂閱計劃和付款設定",
    "greeting": "您好 {username}！要繼續使用我們的工業監控平台，請升級到付費訂閱。",
    "planTitle": "訂閱方案", 
    "month": "月",
    "year": "年",
    "features": {
      "unlimitedFactories": "無限制工廠管理",
      "realtimeMonitoring": "實時機器監控",
      "dataAnalysis": "數據分析報告",
      "alertSystem": "警報系統",
      "support24x7": "24/7 客戶支持",
      "dataExport": "數據導出功能"
    },
    "upgradeNow": "立即升級",
    "refreshing": "檢查中...",
    "refresh": "重新檢查訂閱狀態",
    "includesFeatures": "包含功能",
    "terms": "隨時可以取消 • 安全支付 • 即時啟用",
    "alreadySubscribed": "已經有訂閱了？請檢查您的訂閱狀態在",
    "settingsPage": "設定頁面",
    "invalidSession": "無效的會話ID", 
    "verificationError": "無法驗證訂閱狀態，請手動重新整理或聯繫客服",
    "errors": {
      "loadPlans": "無法載入訂閱方案，請稍後再試",
      "createCheckout": "無法創建付款頁面，請稍後再試",
      "networkError": "網絡連接問題，請檢查網絡並重試", 
      "authError": "認證失效，請重新登錄",
      "paymentSetupError": "付款設置錯誤，請聯繫客服",
      "requestError": "請求參數錯誤，請稍後再試",
      "openPortal": "無法打開管理頁面，請稍後再試",
      "cancelError": "取消訂閱失敗，請稍後再試",
      "loadSubscription": "載入訂閱資訊時發生錯誤"
    },
    "status": {
      "active": "活躍",
      "trialing": "試用中",
      "pastDue": "逾期",
      "canceled": "已取消", 
      "inactive": "未啟用"
    },
    "actions": {
      "opening": "打開中...",
      "manageSubscription": "管理訂閱",
      "confirmCancel": "確認取消",
      "cancelSuccess": "訂閱已取消，將在當前付費週期結束時停止。"
    },
    "currentPeriod": "當前週期",
    "cancelSubscription": "取消訂閱",
    "noActiveSubscription": "您目前沒有活躍的訂閱",
    "selectPlanToStart": "選擇下方的訂閱方案開始使用我們的服務",
    "currentStatus": {
      "title": "當前訂閱狀態",
      "description": "查看您當前的訂閱計劃和狀態"
    },
    "planSelection": {
      "title": "選擇訂閱方案",
      "description": "選擇最適合您的訂閱計劃"
    },
    "redirecting": "跳轉中...",
    "cancelConfirmation": "您確定要取消訂閱嗎？您將可以繼續使用服務直到當前付費週期結束",
    "cancelWarning": "之後將失去對儀表板的訪問權限。",
    "keepSubscription": "保留訂閱",
    "cancelling": "取消中...",
    "success": {
      "title": "訂閱成功！",
      "welcome": "歡迎加入我們的專業服務",
      "description": "您的訂閱已經激活，現在可以享受所有專業功能。您將收到一封確認郵件，其中包含訂閱詳情。",
      "subscriptionId": "訂閱ID",
      "startUsing": "開始使用",
      "manageSubscription": "管理訂閱",
      "verifying": "驗證付款中...",
      "verifyingDescription": "請稍候，我們正在確認您的訂閱狀態",
      "verificationFailed": "驗證失敗",
      "verificationFailedDescription": "無法驗證您的付款狀態，請稍後再試或聯繫客服",
      "retryVerification": "重新驗證",
      "backToSettings": "返回設置"
    },
    "cancel": {
      "title": "訂閱已取消",
      "subtitle": "您的付款過程已被取消",
      "description": "沒有問題！您可以隨時返回完成訂閱流程。您的賬戶沒有被收取任何費用。",
      "tryAgain": "重新訂閱",
      "backToSettings": "返回設置",
      "supportNote": "如果您在訂閱過程中遇到任何問題，請聯繫我們的客服團隊，我們很樂意為您提供幫助。"
    }
  },
  "pages": {
    "settings": "設定",
    "factory": "工廠",
    "missionControl": "任務控制面板"
  },
  "settings": {
    "title": "設定", 
    "description": "管理您的帳戶設定和應用程式偏好",
    "tabs": {
      "personal": "個人資訊",
      "subscription": "訂閱管理"
    }
  },
  "dashboard": {
    "title": "任務控制面板",
    "description": "實時工業機器監控與分析",
    "views": {
      "production": "生產狀態",
      "quality": "24小時品質視圖", 
      "reports": "報告",
      "trends": "趨勢分析",
      "correlation": "關聯分析",
      "timeline": "摘要時間線",
      "utilization": "利用率",
      "gantt": "設備甘特圖",
      "traceability": "追溯性"
    }
  },
  "personalSettings": {
    "title": "個人設定",
    "description": "管理您的帳戶資訊和偏好設定",
    "personalInfo": {
      "title": "個人資訊",
      "description": "更新您的帳戶基本資訊",
      "username": "用戶名",
      "email": "電子郵件",
      "usernameRequired": "用戶名為必填項",
      "usernameMinLength": "用戶名至少需要2個字符",
      "emailRequired": "電子郵件為必填項",
      "emailInvalid": "請輸入有效的電子郵件地址",
      "saveChanges": "保存更改",
      "updating": "更新中...",
      "changePassword": "更改密碼",
      "updateSuccess": "個人資訊已成功更新",
      "updateError": "更新失敗，請稍後再試"
    },
    "appSettings": {
      "title": "應用程式設定",
      "description": "自訂您的應用程式體驗",
      "language": {
        "title": "語言設定",
        "current": "當前語言",
        "switch": "切換語言",
        "traditionalChinese": "繁體中文",
        "simplifiedChinese": "簡體中文",
        "english": "English"
      },
      "theme": {
        "title": "主題設定",
        "current": "當前主題",
        "lightMode": "淺色模式",
        "darkMode": "深色模式",
        "switchToLight": "淺色模式",
        "switchToDark": "深色模式"
      },
      "logout": {
        "title": "登出帳戶",
        "description": "結束當前會話並返回登錄頁面",
        "button": "登出"
      }
    },
    "passwordDialog": {
      "title": "更改密碼",
      "description": "請輸入您的當前密碼和新密碼",
      "currentPassword": "當前密碼",
      "newPassword": "新密碼",
      "confirmPassword": "確認新密碼",
      "currentPasswordRequired": "請輸入當前密碼",
      "newPasswordRequired": "請輸入新密碼",
      "passwordMinLength": "密碼至少需要8個字符",
      "confirmPasswordRequired": "請確認新密碼",
      "passwordMismatch": "密碼不匹配",
      "cancel": "取消",
      "change": "更改密碼",
      "changing": "更改中...",
      "changeSuccess": "密碼已成功更改",
      "changeError": "密碼更改失敗，請檢查當前密碼是否正確"
    }
  },
  "machineStatus": {
    "running": "運行中",
    "idle": "閒置",
    "alarm": "警報",
    "maintenance": "維護中"
  },
  "factoryView": {
    "online": "線上",
    "offline": "離線",
    "warning": "警告",
    "error": "錯誤",
    "refresh": "刷新",
    "settings": "設定",
    "deleteFactory": "刪除廠區",
    "machines": "機台",
    "dragInstruction": "拖曳機台以重新排列在工廠車間。點擊空白處新增機台。"
  },
  "machineCard": {
    "utilization": "利用率",
    "cycleTime": "週期時間",
    "shotCount": "射膠次數",
    "openMachine": "打開機台",
    "quality24h": "24小時品質",
    "cycleTime60min": "週期時間 (60分鐘)",
    "shotRateMin": "射出率 (每分鐘)",
    "dataAge": "資料時效",
    "setpointsChanged": "設定點已變更"
  },
  "qualityView": {
    "title": "品質指標 - 24小時視圖",
    "currentValue": "目前數值",
    "specViolations": "規格違規",
    "processCapability": "製程能力",
    "trend": "趨勢",
    "stable": "穩定",
    "target": "目標",
    "outOfSpec": "超出規格",
    "spcBands": "SPC控制帶",
    "showOutliers": "顯示異常值",
    "medianSmoothing": "中位數平滑",
    "regimeMarkers": "狀態標記",
    "dimension": "尺寸 (mm)",
    "rejectRate": "不良率 (%)",
    "temperature": "溫度 (°C)",
    "specLimits": "規格限制",
    "violations": "違規",
    "readings": "讀數的",
    "cpkIndex": "Cpk指標",
    "lastHours": "最近4小時",
    "processChanges": "製程變更與狀況",
    "dayShift": "日班開始",
    "eveningShift": "晚班開始",
    "nightShift": "夜班開始",
    "active": "進行中",
    "completed": "已完成"
  },
  "correlationChart": {
    "title": "關聯分析",
    "xAxisVariable": "X軸變數",
    "yAxisVariable": "Y軸變數",
    "colorBy": "顏色分組",
    "fitType": "擬合類型",
    "injectionPressure": "射出壓力",
    "temperature": "溫度",
    "qualityScore": "品質得分",
    "cycleTime": "週期時間",
    "mold": "模具",
    "machine": "機台",
    "shift": "班別",
    "linear": "線性",
    "loess": "LOESS",
    "none": "無",
    "pearsonR": "皮爾森係數",
    "rSquared": "R平方",
    "sampleSize": "樣本大小",
    "significance": "顯著性",
    "strongPositive": "強正相關",
    "strongCorrelation": "強相關",
    "exportData": "匯出資料",
    "dataPoints": "資料點",
    "variance": "變異",
    "high": "高",
    "regressionStats": "回歸統計",
    "slope": "斜率",
    "intercept": "截距",
    "standardError": "標準誤差",
    "confidence": "信心水準",
    "outlierAnalysis": "異常值分析",
    "totalOutliers": "總異常值",
    "outlierDescription": "超出回歸線2σ的點",
    "viewOutlierDetails": "查看異常值詳情",
    "highPressureHighTemp": "高壓高溫",
    "lowPressureLowTemp": "低壓低溫",
    "highPressureLowTemp": "高壓低溫",
    "lowPressureHighTemp": "低壓高溫",
    "points": "點"
  },
  "summaryKPIs": {
    "totalMachines": "機台總數",
    "running": "運行中",
    "alarms": "警報",
    "avgUtilization": "平均利用率"
  }
};

const zhCNTranslations = {
  "navigation": {
    "factory": "工厂",
    "machine": "机台",
    "records": "操作日志",
    "warnings": "警告",
    "settings": "设置",
    "account": {
      "settings": "设置"
    },
    "language": {
      "chinese": "中文"
    }
  },
  "factory": {
    "title": "新增工厂",
    "editTitle": "编辑工厂",
    "description": "新增工厂并设定警告条件",
    "editDescription": "编辑工厂信息和设定警告条件", 
    "info": "工厂资讯",
    "warnings": "警告条件",
    "name": "工厂名称",
    "namePlaceholder": "输入工厂名称",
    "width": "工厂宽度",
    "widthPlaceholder": "工厂宽度",
    "length": "工厂长度",
    "lengthPlaceholder": "工厂长度",
    "selectMachine": "选择机台",
    "selectMachinePlaceholder": "选择机台",
    "copySettings": "复制设定",
    "copied": "已复制",
    "pasteSettings": "粘贴设定", 
    "pasted": "已粘贴",
    "applyToAll": "应用到所有机台",
    "defaultSettings": "工厂预设设定将应用于所有未配置的新机台",
    "add": "新增",
    "addFactory": "新厂区",
    "update": "更新",
    "cancel": "取消",
    "allFactories": "全部厂区",
    "sizeError": "工厂大小不足以容纳所有机台"
  },
  "machine": {
    "title": "新增机器",
    "description": "请输入机器名称和IP地址",
    "name": "机器名称",
    "namePlaceholder": "输入机器名称",
    "ipAddress": "IP地址",
    "ipPlaceholder": "例如: 192.168.1.100",
    "adding": "新增中...",
    "add": "新增机器",
    "cancel": "取消"
  },
  "warnings": {
    "severity": {
      "low": "轻微",
      "medium": "中等",
      "high": "严重",
      "critical": "危急"
    },
    "details": "详情",
    "types": {
      "warning": "警告",
      "attention": "注意",
      "alert": "警示", 
      "danger": "危险",
      "temperatureHigh": "温度过高",
      "pressureLow": "压力过低",
      "operationAbnormal": "操作异常",
      "systemUnstable": "系统不稳",
      "maintenanceRequired": "维护需求",
      "energyAbnormal": "能耗异常", 
      "voltageFluctuation": "电压波动",
      "equipmentFailure": "设备故障"
    }
  },
  "subscription": {
    "checking": "检查订阅状态",
    "loading": "正在载入您的账户信息...",
    "loadingPlans": "载入方案信息...",
    "required": "需要订阅", 
    "description": "访问 OPC UA 仪表板需要有效的订阅",
    "sectionDescription": "管理您的订阅计划和付款设定",
    "greeting": "您好 {username}！要继续使用我们的工业监控平台，请升级到付费订阅。",
    "planTitle": "订阅方案",
    "month": "月",
    "year": "年",
    "features": {
      "unlimitedFactories": "无限制工厂管理",
      "realtimeMonitoring": "实时机器监控",
      "dataAnalysis": "数据分析报告",
      "alertSystem": "警报系统",
      "support24x7": "24/7 客户支持",
      "dataExport": "数据导出功能"
    },
    "upgradeNow": "立即升级",
    "refreshing": "检查中...",
    "refresh": "重新检查订阅状态",
    "includesFeatures": "包含功能",
    "terms": "随时可以取消 • 安全支付 • 即时启用",
    "alreadySubscribed": "已经有订阅了？请检查您的订阅状态在",
    "settingsPage": "设定页面",
    "invalidSession": "无效的会话ID",
    "verificationError": "无法验证订阅状态，请手动重新整理或联系客服",
    "errors": {
      "loadPlans": "无法载入订阅方案，请稍后再试",
      "createCheckout": "无法创建付款页面，请稍后再试",
      "networkError": "网络连接问题，请检查网络并重试",
      "authError": "认证失效，请重新登录", 
      "paymentSetupError": "付款设置错误，请联系客服",
      "requestError": "请求参数错误，请稍后再试",
      "openPortal": "无法打开管理页面，请稍后再试",
      "cancelError": "取消订阅失败，请稍后再试",
      "loadSubscription": "载入订阅资讯时发生错误"
    },
    "status": {
      "active": "活跃",
      "trialing": "试用中", 
      "pastDue": "逾期",
      "canceled": "已取消",
      "inactive": "未启用"
    },
    "actions": {
      "opening": "打开中...",
      "manageSubscription": "管理订阅",
      "confirmCancel": "确认取消",
      "cancelSuccess": "订阅已取消，将在当前付费周期结束时停止。"
    },
    "currentPeriod": "当前周期",
    "cancelSubscription": "取消订阅",
    "noActiveSubscription": "您目前没有活跃的订阅",
    "selectPlanToStart": "选择下方的订阅方案开始使用我们的服务",
    "currentStatus": {
      "title": "当前订阅状态",
      "description": "查看您当前的订阅计划和状态"
    },
    "planSelection": {
      "title": "选择订阅方案",
      "description": "选择最适合您的订阅计划"
    },
    "redirecting": "跳转中...",
    "cancelConfirmation": "您确定要取消订阅吗？您将可以继续使用服务直到当前付费周期结束",
    "cancelWarning": "之后将失去对仪表板的访问权限。",
    "keepSubscription": "保留订阅",
    "cancelling": "取消中...",
    "success": {
      "title": "订阅成功！",
      "welcome": "欢迎加入我们的专业服务",
      "description": "您的订阅已经激活，现在可以享受所有专业功能。您将收到一封确认邮件，其中包含订阅详情。",
      "subscriptionId": "订阅ID",
      "startUsing": "开始使用",
      "manageSubscription": "管理订阅",
      "verifying": "验证付款中...",
      "verifyingDescription": "请稍候，我们正在确认您的订阅状态",
      "verificationFailed": "验证失败",
      "verificationFailedDescription": "无法验证您的付款状态，请稍后再试或联系客服",
      "retryVerification": "重新验证",
      "backToSettings": "返回设置"
    },
    "cancel": {
      "title": "订阅已取消",
      "subtitle": "您的付款过程已被取消",
      "description": "没有问题！您可以随时返回完成订阅流程。您的账户没有被收取任何费用。",
      "tryAgain": "重新订阅",
      "backToSettings": "返回设置",
      "supportNote": "如果您在订阅过程中遇到任何问题，请联系我们的客服团队，我们很乐意为您提供帮助。"
    }
  },
  "pages": {
    "settings": "设定",
    "factory": "工厂",
    "missionControl": "任务控制面板"
  },
  "settings": {
    "title": "设定",
    "description": "管理您的账户设定和应用程序偏好",
    "tabs": {
      "personal": "个人信息",
      "subscription": "订阅管理"
    }
  },
  "dashboard": {
    "title": "任务控制面板", 
    "description": "实时工业机器监控与分析",
    "views": {
      "production": "生产状态",
      "quality": "24小时品质视图",
      "reports": "报告",
      "trends": "趋势分析",
      "correlation": "关联分析",
      "timeline": "摘要时间线",
      "utilization": "利用率",
      "gantt": "设备甘特图",
      "traceability": "追溯性"
    }
  },
  "personalSettings": {
    "title": "个人设定",
    "description": "管理您的账户信息和偏好设定",
    "personalInfo": {
      "title": "个人信息",
      "description": "更新您的账户基本信息",
      "username": "用户名",
      "email": "电子邮箱",
      "usernameRequired": "用户名为必填项",
      "usernameMinLength": "用户名至少需要2个字符",
      "emailRequired": "电子邮箱为必填项",
      "emailInvalid": "请输入有效的电子邮箱地址",
      "saveChanges": "保存更改",
      "updating": "更新中...",
      "changePassword": "更改密码",
      "updateSuccess": "个人信息已成功更新",
      "updateError": "更新失败，请稍后再试"
    },
    "appSettings": {
      "title": "应用程序设定",
      "description": "自定义您的应用程序体验",
      "language": {
        "title": "语言设定",
        "current": "当前语言",
        "switch": "切换语言",
        "traditionalChinese": "繁体中文",
        "simplifiedChinese": "简体中文",
        "english": "English"
      },
      "theme": {
        "title": "主题设定",
        "current": "当前主题",
        "lightMode": "浅色模式",
        "darkMode": "深色模式",
        "switchToLight": "浅色模式",
        "switchToDark": "深色模式"
      },
      "logout": {
        "title": "登出账户",
        "description": "结束当前会话并返回登录页面",
        "button": "登出"
      }
    },
    "passwordDialog": {
      "title": "更改密码",
      "description": "请输入您的当前密码和新密码",
      "currentPassword": "当前密码",
      "newPassword": "新密码",
      "confirmPassword": "确认新密码",
      "currentPasswordRequired": "请输入当前密码",
      "newPasswordRequired": "请输入新密码",
      "passwordMinLength": "密码至少需要8个字符",
      "confirmPasswordRequired": "请确认新密码",
      "passwordMismatch": "密码不匹配",
      "cancel": "取消",
      "change": "更改密码",
      "changing": "更改中...",
      "changeSuccess": "密码已成功更改",
      "changeError": "密码更改失败，请检查当前密码是否正确"
    }
  },
  "machineStatus": {
    "running": "运行中",
    "idle": "闲置",
    "alarm": "警报",
    "maintenance": "维护中"
  },
  "factoryView": {
    "online": "在线",
    "offline": "离线",
    "warning": "警告",
    "error": "错误",
    "refresh": "刷新",
    "settings": "设定",
    "deleteFactory": "删除厂区",
    "machines": "机台",
    "dragInstruction": "拖拽机台以重新排列在工厂车间。点击空白处新增机台。"
  },
  "machineCard": {
    "utilization": "利用率",
    "cycleTime": "周期时间",
    "shotCount": "射胶次数",
    "openMachine": "打开机台",
    "quality24h": "24小时品质",
    "cycleTime60min": "周期时间 (60分钟)",
    "shotRateMin": "射出率 (每分钟)",
    "dataAge": "数据时效",
    "setpointsChanged": "设定点已变更"
  },
  "qualityView": {
    "title": "品质指标 - 24小时视图",
    "currentValue": "当前数值",
    "specViolations": "规格违规",
    "processCapability": "工艺能力",
    "trend": "趋势",
    "stable": "稳定",
    "target": "目标",
    "outOfSpec": "超出规格",
    "spcBands": "SPC控制带",
    "showOutliers": "显示异常值",
    "medianSmoothing": "中位数平滑",
    "regimeMarkers": "状态标记",
    "dimension": "尺寸 (mm)",
    "rejectRate": "不良率 (%)",
    "temperature": "温度 (°C)",
    "specLimits": "规格限制",
    "violations": "违规",
    "readings": "读数的",
    "cpkIndex": "Cpk指标",
    "lastHours": "最近4小时",
    "processChanges": "工艺变更与状况",
    "dayShift": "日班开始",
    "eveningShift": "晚班开始",
    "nightShift": "夜班开始",
    "active": "进行中",
    "completed": "已完成"
  },
  "correlationChart": {
    "title": "关联分析",
    "xAxisVariable": "X轴变量",
    "yAxisVariable": "Y轴变量",
    "colorBy": "颜色分组",
    "fitType": "拟合类型",
    "injectionPressure": "射出压力",
    "temperature": "温度",
    "qualityScore": "品质得分",
    "cycleTime": "周期时间",
    "mold": "模具",
    "machine": "机台",
    "shift": "班别",
    "linear": "线性",
    "loess": "LOESS",
    "none": "无",
    "pearsonR": "皮尔森系数",
    "rSquared": "R平方",
    "sampleSize": "样本大小",
    "significance": "显著性",
    "strongPositive": "强正相关",
    "strongCorrelation": "强相关",
    "exportData": "导出数据",
    "dataPoints": "数据点",
    "variance": "变异",
    "high": "高",
    "regressionStats": "回归统计",
    "slope": "斜率",
    "intercept": "截距",
    "standardError": "标准误差",
    "confidence": "置信水平",
    "outlierAnalysis": "异常值分析",
    "totalOutliers": "总异常值",
    "outlierDescription": "超出回归线2σ的点",
    "viewOutlierDetails": "查看异常值详情",
    "highPressureHighTemp": "高压高温",
    "lowPressureLowTemp": "低压低温",
    "highPressureLowTemp": "高压低温",
    "lowPressureHighTemp": "低压高温",
    "points": "点"
  },
  "summaryKPIs": {
    "totalMachines": "机台总数",
    "running": "运行中",
    "alarms": "警报",
    "avgUtilization": "平均利用率"
  }
};

const resources = {
  'en': {
    translation: enTranslations
  },
  'zh-TW': {
    translation: zhTWTranslations
  },
  'zh-CN': {
    translation: zhCNTranslations
  },
  'zh': {
    translation: zhTWTranslations // Fallback: generic 'zh' uses Traditional Chinese
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-TW', // Default language
    
    // Language fallback configuration
    fallbackLng: {
      'zh': ['zh-TW', 'en'], // Generic zh falls back to zh-TW, then en
      'zh-HK': ['zh-TW', 'en'], // Hong Kong uses Traditional Chinese
      'default': ['zh-TW', 'en']
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false // React already does escaping
    },

    // Additional options
    debug: false, // Disable debug to reduce console noise
    supportedLngs: ['en', 'zh-TW', 'zh-CN', 'zh'], // Add generic 'zh' support
    nonExplicitSupportedLngs: true,
    
    // Ensure synchronous loading
    initImmediate: false,
    
    // Missing key behavior
    returnNull: false,
    returnEmptyString: false,
    
    react: {
      useSuspense: false
    }
  }, (err, t) => {
    if (err) {
      console.error('i18n initialization error:', err);
    } else {
      console.log('i18n initialized successfully');
      console.log('Current language:', i18n.language);
      console.log('Available resources:', Object.keys(i18n.store.data));
      console.log('Test translation:', t('personalSettings.title'));
    }
  });

export default i18n;