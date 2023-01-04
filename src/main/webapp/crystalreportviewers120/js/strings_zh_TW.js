// LOCALIZATION STRING

// Strings for calendar.js and calendar_param.js
var L_Today     = "\u4ECA\u5929";
var L_January   = "\u4E00\u6708";
var L_February  = "\u4E8C\u6708";
var L_March     = "\u4E09\u6708";
var L_April     = "\u56DB\u6708";
var L_May       = "\u4E94\u6708";
var L_June      = "\u516D\u6708";
var L_July      = "\u4E03\u6708";
var L_August    = "\u516B\u6708";
var L_September = "\u4E5D\u6708";
var L_October   = "\u5341\u6708";
var L_November  = "\u5341\u4E00\u6708";
var L_December  = "\u5341\u4E8C\u6708";
var L_Su        = "\u9031\u65E5";
var L_Mo        = "\u9031\u4E00";
var L_Tu        = "\u9031\u4E8C";
var L_We        = "\u9031\u4E09";
var L_Th        = "\u9031\u56DB";
var L_Fr        = "\u9031\u4E94";
var L_Sa        = "\u9031\u516D";

// strings for dt_param.js
var L_TIME_SEPARATOR = ":";
var L_AM_DESIGNATOR = "\u4E0A\u5348";
var L_PM_DESIGNATOR = "\u4E0B\u5348";

// strings for range parameter
var L_FROM = "\u5F9E {0}";
var L_TO = "\u5230 {0}";
var L_AFTER = "{0} \u4E4B\u5F8C";
var L_BEFORE = "{0} \u4E4B\u524D";
var L_FROM_TO = "\u5F9E {0} \u5230 {1}";
var L_FROM_BEFORE = "\u5F9E {0} \u5230 {1} \u4E4B\u524D";
var L_AFTER_TO = "\u5F9E {0} \u4E4B\u5F8C\u5230 {1}";
var L_AFTER_BEFORE = "\u5F9E {0} \u4E4B\u5F8C\u5230 {1} \u4E4B\u524D";

// Strings for prompts.js and prompts_param.js
var L_BadNumber     = "\u6B64\u53C3\u6578\u7684\u985E\u578B\u70BA [\u6578\u5B57]\uFF0C\u53EA\u80FD\u5305\u542B\u8CA0\u865F\u3001\u6578\u5B57 (\"0-9\")\u3001\u6578\u5B57\u5206\u4F4D\u7B26\u865F\u6216\u5C0F\u6578\u9EDE\u7B26\u865F\u3002\u8ACB\u66F4\u6B63\u8F38\u5165\u7684\u53C3\u6578\u503C\u3002";
var L_BadCurrency   = "\u6B64\u53C3\u6578\u7684\u985E\u578B\u70BA [\u8CA8\u5E63]\uFF0C\u53EA\u80FD\u5305\u542B\u8CA0\u865F\u3001\u6578\u5B57 (\"0-9\")\u3001\u6578\u5B57\u5206\u4F4D\u7B26\u865F\u6216\u5C0F\u6578\u9EDE\u7B26\u865F\u3002\u8ACB\u66F4\u6B63\u8F38\u5165\u7684\u53C3\u6578\u503C\u3002";
var L_BadDate       = "\u6B64\u53C3\u6578\u7684\u985E\u578B\u70BA [\u65E5\u671F]\uFF0C\u4E14\u683C\u5F0F\u5FC5\u9808\u70BA \"Date(yyyy,mm,dd)\"\uFF0C\u5176\u4E2D \"yyyy\" \u70BA\u56DB\u4F4D\u6578\u7684\u5E74\u4EFD\uFF0C\"mm\" \u70BA\u6708\u4EFD (\u4F8B\u5982\uFF0C\u4E00\u6708 = 1)\uFF0C\u800C \"dd\" \u5247\u70BA\u6307\u5B9A\u6708\u4EFD\u4E2D\u7684\u65E5\u6578\u3002";
var L_BadDateTime   = "\u6B64\u53C3\u6578\u7684\u985E\u578B\u70BA [\u65E5\u671F\u6642\u9593]\uFF0C\u4E14\u6B63\u78BA\u7684\u683C\u5F0F\u70BA \"DateTime(yyyy,mm,dd,hh,mm,ss)\"\u3002 \"yyyy\" \u70BA\u56DB\u4F4D\u6578\u7684\u5E74\u4EFD\uFF0C\"mm\" \u70BA\u6708\u4EFD (\u4F8B\u5982\uFF0C \u4E00\u6708 = 1)\uFF0C\"dd\" \u70BA\u65E5\u6578\uFF0C\"hh\" \u70BA 24 \u6642\u5236\u7684\u6642\u6578\uFF0C\"mm\" \u70BA\u5206\u9418\u6578\uFF0C\u800C \"ss\" \u5247\u70BA\u79D2\u6578\u3002";
var L_BadTime       = "\u6B64\u53C3\u6578\u7684\u985E\u578B\u70BA [\u6642\u9593]\uFF0C\u4E14\u683C\u5F0F\u5FC5\u9808\u70BA \"Time(hh,mm,ss)\"\uFF0C\u5176\u4E2D \"hh\" \u70BA 24 \u6642\u5236\u7684\u6642\u6578\uFF0C\"mm\" \u70BA\u5206\u9418\u6578\uFF0C\u800C \"ss\" \u5247\u70BA\u79D2\u6578\u3002";
var L_NoValue       = "\u6C92\u6709\u503C";
var L_BadValue      = "\u82E5\u8981\u8A2D\u5B9A\u6210 [\u6C92\u6709\u503C]\uFF0C\u5FC5\u9808\u540C\u6642\u5C07 [\u5F9E] \u548C [\u5230] \u7684\u503C\u8A2D\u6210 [\u6C92\u6709\u503C]\u3002";
var L_BadBound      = "[\u7121\u4E0B\u9650] \u4E0D\u80FD\u8207 [\u7121\u4E0A\u9650] \u4E00\u8D77\u8A2D\u5B9A\u3002";
var L_NoValueAlready = "\u6B64\u53C3\u6578\u5DF2\u8A2D\u5B9A\u70BA [\u6C92\u6709\u503C]\u3002\u5728\u65B0\u589E\u5176\u4ED6\u503C\u4E4B\u524D\uFF0C\u8ACB\u5148\u79FB\u9664 [\u6C92\u6709\u503C]";
var L_RangeError    = "\u7BC4\u570D\u8D77\u9EDE\u4E0D\u5F97\u5927\u65BC\u7BC4\u570D\u7D42\u9EDE\u3002";
var L_NoDateEntered = "\u5FC5\u9808\u8F38\u5165\u65E5\u671F\u3002";

// Strings for ../html/crystalexportdialog.htm
var L_ExportOptions     = "\u532F\u51FA\u9078\u9805";
var L_PrintOptions      = "\u5217\u5370\u9078\u9805";
var L_PrintPageTitle    = "\u5217\u5370\u5831\u8868";
var L_ExportPageTitle   = "\u532F\u51FA\u5831\u8868";
var L_OK                = "\u78BA\u5B9A";
var L_Cancel            = "\u53D6\u6D88";
var L_PrintPageRange    = "\u8F38\u5165\u8981\u5217\u5370\u7684\u9801\u9762\u7BC4\u570D\u3002";
var L_ExportPageRange   = "\u8F38\u5165\u8981\u532F\u51FA\u7684\u9801\u9762\u7BC4\u570D\u3002";
var L_InvalidPageRange  = "\u9801\u9762\u7BC4\u570D\u503C\u4E0D\u6B63\u78BA\u3002\u8ACB\u8F38\u5165\u6709\u6548\u7684\u9801\u9762\u7BC4\u570D\u3002";
var L_ExportFormat      = "\u8ACB\u5F9E\u6E05\u55AE\u4E2D\u9078\u53D6\u532F\u51FA\u683C\u5F0F\u3002";
var L_Formats           = "\u6A94\u6848\u683C\u5F0F:";
var L_PageRange         = "\u9801\u9762\u7BC4\u570D:";
var L_All               = "\u5168\u90E8";
var L_Pages             = "\u9801\u6578:";
var L_From              = "\u5F9E:";
var L_To                = "\u5230:";
var L_PrintStep0        = "\u82E5\u8981\u5217\u5370:";
var L_PrintStep1        = "1.  \u5728\u4E0B\u4E00\u500B\u51FA\u73FE\u7684\u5C0D\u8A71\u65B9\u584A\u4E2D\uFF0C\u9078\u53D6 [\u958B\u555F\u6B64\u6A94\u6848] \u9078\u9805\uFF0C\u7136\u5F8C\u6309\u4E00\u4E0B [\u78BA\u5B9A] \u6309\u9215\u3002";
var L_PrintStep2        = "2.  \u6309\u4E00\u4E0B Acrobat Reader \u529F\u80FD\u8868\u4E0A\u7684\u5370\u8868\u6A5F\u5716\u793A\uFF0C\u800C\u4E0D\u662F\u7DB2\u969B\u7DB2\u8DEF\u700F\u89BD\u5668\u4E0A\u7684\u5217\u5370\u6309\u9215\u3002";
var L_RTFFormat         = "Rich Text Format (RTF)";
var L_AcrobatFormat     = "PDF";
var L_CrystalRptFormat  = "Crystal Reports (RPT)";
var L_WordFormat        = "Microsoft Word (97-2003)";
var L_ExcelFormat       = "Microsoft Excel (97-2003)";
var L_ExcelRecordFormat = "Microsoft Excel (97-2003) \u53EA\u9650\u8CC7\u6599";
var L_EditableRTFFormat = "Microsoft Word (97-2003) - \u53EF\u7DE8\u8F2F";

// Strings for print.js
var L_PrintControlInstallError = "ActiveX \u5217\u5370\u63A7\u5236\u9805\u5B89\u88DD\u5931\u6557\u3002\u932F\u8AA4\u78BC:";
var L_PrintControlPlugin = "Crystal Reports ActiveX \u5217\u5370\u63A7\u5236\u9805 Plug-in";

// Strings for previewerror.js
var L_SessionExpired = "\u60A8\u7684\u5DE5\u4F5C\u968E\u6BB5\u5DF2\u903E\u6642\u3002";
var L_PleaseRefresh = "\u8ACB\u6309 [\u91CD\u65B0\u6574\u7406] \u6309\u9215\u4E26\u518D\u8A66\u4E00\u6B21\u3002";
