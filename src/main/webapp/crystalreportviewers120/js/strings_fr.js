// LOCALIZATION STRING

// Strings for calendar.js and calendar_param.js
var L_Today     = "Aujourd\'hui";
var L_January   = "Janvier";
var L_February  = "F\u00E9vrier";
var L_March     = "Mars";
var L_April     = "Avril";
var L_May       = "Mai";
var L_June      = "Juin";
var L_July      = "Juillet";
var L_August    = "Ao\u00FBt";
var L_September = "Septembre";
var L_October   = "Octobre";
var L_November  = "Novembre";
var L_December  = "D\u00E9cembre";
var L_Su        = "Di";
var L_Mo        = "Lu";
var L_Tu        = "Ma";
var L_We        = "Me";
var L_Th        = "Je";
var L_Fr        = "Ve";
var L_Sa        = "Sa";

// strings for dt_param.js
var L_TIME_SEPARATOR = ":";
var L_AM_DESIGNATOR = "AM";
var L_PM_DESIGNATOR = "PM";

// strings for range parameter
var L_FROM = "De {0}";
var L_TO = "A {0}";
var L_AFTER = "Apr\u00E8s {0}";
var L_BEFORE = "Avant {0}";
var L_FROM_TO = "De {0} \u00E0 {1}";
var L_FROM_BEFORE = "De {0} \u00E0 avant {1}";
var L_AFTER_TO = "Apr\u00E8s {0} \u00E0 {1}";
var L_AFTER_BEFORE = "Apr\u00E8s {0} \u00E0 avant {1}";

// Strings for prompts.js and prompts_param.js
var L_BadNumber     = "Un param\u00E8tre de type \"Nombre\" peut uniquement contenir un signe n\u00E9gatif, des chiffres (\"0-9\"), des symboles de regroupement de chiffres ou un s\u00E9parateur d\u00E9cimal.Veuillez corriger la valeur saisie pour ce param\u00E8tre.";
var L_BadCurrency   = "Un param\u00E8tre de type \"Devise\"  peut uniquement contenir un signe n\u00E9gatif, des chiffres (\"0-9\"), des symboles de regroupement de chiffres ou un s\u00E9parateur d\u00E9cimal.Veuillez corriger la valeur saisie pour ce param\u00E8tre.";
var L_BadDate       = "Un param\u00E8tre de type \"Date\" doit se pr\u00E9senter sous la forme \"Date(aaaa,mm,jj)\" o\u00F9 \"aaaa\" correspond aux quatre chiffres de l\'ann\u00E9e, \"mm\" au mois (par ex. janvier = 1) et \"jj\" au jour du mois donn\u00E9.";
var L_BadDateTime   = "Le format correct d\'un param\u00E8tre de type \"DateHeure\" est \"DateTime(aaaa,mm,jj,hh,mm,ss)\". \"aaaa\" correspond aux quatre chiffres de l\'ann\u00E9e, \"mm\" au mois (par ex. janvier = 1), \"jj\" au jour du mois, \"hh\" au nombre d\'heures en mode 24H, \"mm\" au nombre de minutes et \"ss\" au nombre de secondes.";
var L_BadTime       = "Un param\u00E8tre de type \"Heure\" doit se pr\u00E9senter sous la forme \"Time(hh,mm,ss)\",  \"hh\" correspondant au nombre d\'heures en mode 24H, \"mm\" au nombre de minutes et \"ss\" au nombre de secondes.";
var L_NoValue       = "Aucune valeur";
var L_BadValue      = "Pour d\u00E9finir \"Aucune valeur\", vous devez \u00E0 la fois d\u00E9finir les valeurs De et \u00C0 sur \"Aucune valeur\".";
var L_BadBound      = "Vous ne pouvez pas d\u00E9finir \"Aucune limite inf\u00E9rieure\" en m\u00EAme temps que \"Aucune limite sup\u00E9rieure\".";
var L_NoValueAlready = "Ce param\u00E8tre est d\u00E9j\u00E0 d\u00E9fini sur \"Aucune valeur\". Supprimez \"Aucune valeur\" avant d\'ajouter d\'autres valeurs.";
var L_RangeError    = "Le d\u00E9but de la plage ne peut pas \u00EAtre sup\u00E9rieur \u00E0 la fin de la plage.";
var L_NoDateEntered = "Vous devez saisir une date.";

// Strings for ../html/crystalexportdialog.htm
var L_ExportOptions     = "Options d\'exportation";
var L_PrintOptions      = "Options d\'impression";
var L_PrintPageTitle    = "Imprimer le rapport";
var L_ExportPageTitle   = "Exporter le rapport";
var L_OK                = "OK";
var L_Cancel            = "Annuler";
var L_PrintPageRange    = "Indiquez la plage de pages que vous voulez imprimer.";
var L_ExportPageRange   = "Indiquez la plage de pages que vous voulez exporter.";
var L_InvalidPageRange  = "Les valeurs de la plage de pages sont incorrectes. Veuillez saisir une plage de pages correcte.";
var L_ExportFormat      = "Veuillez s\u00E9lectionner un format d\'exportation dans la liste.";
var L_Formats           = "Format de fichier :";
var L_PageRange         = "Plage de pages :";
var L_All               = "Tout";
var L_Pages             = "Pages :";
var L_From              = "De :";
var L_To                = "A :";
var L_PrintStep0        = "Pour imprimer :";
var L_PrintStep1        = "1. Dans la bo\u00EEte de dialogue suivante qui s\'affiche, s\u00E9lectionnez l\'option \"Ouvrir ce fichier\", puis cliquez sur OK.";
var L_PrintStep2        = "2. Cliquez sur l\'ic\u00F4ne d\'impression d\'Acrobat Reader plut\u00F4t que sur le bouton d\'impression de votre navigateur.";
var L_RTFFormat         = "Format texte enrichi (RTF)";
var L_AcrobatFormat     = "PDF";
var L_CrystalRptFormat  = "Crystal Reports (RPT)";
var L_WordFormat        = "Microsoft Word (97-2003)";
var L_ExcelFormat       = "Microsoft Excel (97-2003)";
var L_ExcelRecordFormat = "Microsoft Excel (97-2003) Donn\u00E9es uniquement";
var L_EditableRTFFormat = "Microsoft Word (97-2003) - Modifiable";

// Strings for print.js
var L_PrintControlInstallError = "Impossible d\'installer le contr\u00F4le d\'impression ActiveX. Code d\'erreur : ";
var L_PrintControlPlugin = "PLug-in Contr\u00F4le d\'impression ActiveX de Crystal Reports";

// Strings for previewerror.js
var L_SessionExpired = "Votre session a expir\u00E9.";
var L_PleaseRefresh = "Cliquez sur le bouton Actualiser, puis faites une nouvelle tentative.";
