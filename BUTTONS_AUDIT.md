# BUTTONS_AUDIT.md — جرد وفحص جميع الأزرار (197 زر)

> **منهجية الفحص:** تم استخراج جميع عناصر `<button>` تلقائياً من الكود المصدري (`src/**/*.tsx`) والتحقق من وجود معالج `onClick` فعلي لكل زر. الفحص الساكن يثبت ربط الكود (`PASS (Code Wired)`), بينما اختبار النقر الفعلي في المتصفح واللمس على الهاتف مسجل كـ `BLOCKED` لتعطل `npm install` والمتصفح داخل بيئة الفحص المعزولة.

| # | الملف والسطر | اسم/وصف الزر | الربط البرمجي | حالة الفحص الساكن | حالة الاختبار التفاعلي (DOM/Touch) |
|---|---|---|---|---|---|
| 1 | `src/components/common/Header.tsx:47` | (Icon Button) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 2 | `src/components/common/Header.tsx:56` | setView('dashboard')} className="flex items-c | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 3 | `src/components/common/Header.tsx:107` | updateSettings({ theme: isDark ? 'light' : 'd | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 4 | `src/components/common/Header.tsx:118` | setShowNotifs((v) => !v)} title={t('notificat | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 5 | `src/components/common/Header.tsx:135` | {t('markAllRead')} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 6 | `src/components/common/Header.tsx:172` | setView('settings')} title={t('settings')} cl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 7 | `src/components/common/PrintExportModal.tsx:64` | (Icon Button) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 8 | `src/components/common/PrintExportModal.tsx:123` | { setBusy(true); await onExportDocx(opts); se | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 9 | `src/components/common/PrintExportModal.tsx:138` | { setBusy(true); await onExportPdf(opts); set | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 10 | `src/components/common/PrintExportModal.tsx:152` | {isAr ? 'طباعة مباشرة' : 'Print Now'} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 11 | `src/components/common/PrintExportModal.tsx:161` | {isAr ? 'مشاركة الملف' : 'Share File'} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 12 | `src/components/common/PrintExportModal.tsx:183` | { setBusy(true); await onSaveAsCopy(copyName. | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 13 | `src/components/common/Sidebar.tsx:46` | handleSelect(item.id)} className={`w-full fle | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 14 | `src/components/common/Sidebar.tsx:82` | (Icon Button) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 15 | `src/components/common/Sidebar.tsx:94` | handleSelect(item.id)} className={`w-full fle | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 16 | `src/components/dashboard/Dashboard.tsx:228` | {t('newWord')} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 17 | `src/components/dashboard/Dashboard.tsx:237` | {t('newPdf')} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 18 | `src/components/dashboard/Dashboard.tsx:246` | fileInputRef.current?.click()} className="fle | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 19 | `src/components/dashboard/Dashboard.tsx:255` | setView('files')} className="flex items-cente | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 20 | `src/components/dashboard/Dashboard.tsx:264` | handleEditLatestOrNew('docx')} className="fle | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 21 | `src/components/dashboard/Dashboard.tsx:273` | handleEditLatestOrNew('pdf')} className="flex | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 22 | `src/components/dashboard/Dashboard.tsx:326` | setView('files')} className="bg-white dark:bg | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 23 | `src/components/dashboard/Dashboard.tsx:350` | setView('files')} className="text-xs font-sem | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 24 | `src/components/dashboard/Dashboard.tsx:368` | openDocument(doc)} className="flex items-cent | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 25 | `src/components/dashboard/Dashboard.tsx:412` | openDocument(doc)} className="w-full flex ite | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 26 | `src/components/dashboard/Dashboard.tsx:437` | setView('templates')} className="text-xs font | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 27 | `src/components/dashboard/Dashboard.tsx:448` | handleUseTemplate(tpl.id)} className="p-3.5 r | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 28 | `src/components/files/FileManager.tsx:188` | fileInputRef.current?.click()} className="inl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 29 | `src/components/files/FileManager.tsx:197` | setShowNewFolder(true)} className="inline-fle | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 30 | `src/components/files/FileManager.tsx:206` | { setMultiSelectMode((v) => !v); setSelectedI | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 31 | `src/components/files/FileManager.tsx:246` | { setActiveTab(id); if (id !== 'all') setCurr | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 32 | `src/components/files/FileManager.tsx:265` | setActiveTab(sec.id)} className={`px-3 py-1.5 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 33 | `src/components/files/FileManager.tsx:276` | { if (activeTab === sec.id) setActiveTab('all | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 34 | `src/components/files/FileManager.tsx:290` | setShowNewSection(true)} className="inline-fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 35 | `src/components/files/FileManager.tsx:300` | setCurrentFolderId(null)} className="px-3 py- | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 36 | `src/components/files/FileManager.tsx:317` | setConfirmTrashIds(Array.from(selectedIds))}  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 37 | `src/components/files/FileManager.tsx:341` | { e.stopPropagation(); removeFolder(f.id); }} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 38 | `src/components/files/FileManager.tsx:378` | toggleSelect(doc.id)} className="mt-1"> {isSe | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 39 | `src/components/files/FileManager.tsx:410` | upsertDocument({ ...doc, isFavorite: !doc.isF | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 40 | `src/components/files/FileManager.tsx:427` | restoreDocument(doc.id)} className="inline-fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 41 | `src/components/files/FileManager.tsx:435` | setConfirmPermId(doc.id)} className="inline-f | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 42 | `src/components/files/FileManager.tsx:446` | { setRenameTarget(doc); setRenameText(doc.nam | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 43 | `src/components/files/FileManager.tsx:457` | handleDuplicate(doc)} title={t('copy')} class | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 44 | `src/components/files/FileManager.tsx:465` | setMoveTarget(doc)} title={t('move')} classNa | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 45 | `src/components/files/FileManager.tsx:473` | setAssignSectionTarget(doc)} title={isAr ? 'إ | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 46 | `src/components/files/FileManager.tsx:481` | exportFileToDevice(doc.blob, doc.name)} title | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 47 | `src/components/files/FileManager.tsx:489` | shareDocumentFile(doc.blob, doc.name, doc.nam | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 48 | `src/components/files/FileManager.tsx:497` | setDetailsTarget(doc)} title={t('details')} c | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 49 | `src/components/files/FileManager.tsx:505` | setConfirmTrashIds([doc.id])} title={t('delet | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 50 | `src/components/files/FileManager.tsx:535` | setShowNewFolder(false)} className="px-3 py-1 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 51 | `src/components/files/FileManager.tsx:542` | {t('confirm')} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 52 | `src/components/files/FileManager.tsx:566` | setRenameTarget(null)} className="px-3 py-1.5 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 53 | `src/components/files/FileManager.tsx:573` | { if (renameText.trim()) { await upsertDocume | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 54 | `src/components/files/FileManager.tsx:600` | { await upsertDocument({ ...moveTarget, folde | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 55 | `src/components/files/FileManager.tsx:611` | { await upsertDocument({ ...moveTarget, folde | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 56 | `src/components/files/FileManager.tsx:625` | setMoveTarget(null)} className="w-full py-2 r | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 57 | `src/components/files/FileManager.tsx:647` | setDetailsTarget(null)} className="w-full mt- | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 58 | `src/components/files/FileManager.tsx:664` | setConfirmTrashIds(null)} className="px-3 py- | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 59 | `src/components/files/FileManager.tsx:671` | { for (const id of confirmTrashIds) await sof | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 60 | `src/components/files/FileManager.tsx:694` | setConfirmPermId(null)} className="px-3 py-1. | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 61 | `src/components/files/FileManager.tsx:701` | { await removeDocumentForever(confirmPermId); | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 62 | `src/components/files/FileManager.tsx:729` | setShowNewSection(false)} className="px-3 py- | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 63 | `src/components/files/FileManager.tsx:736` | { if (!newSectionName.trim()) return; await c | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 64 | `src/components/files/FileManager.tsx:760` | { await upsertDocument({ ...assignSectionTarg | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 65 | `src/components/files/FileManager.tsx:771` | { await upsertDocument({ ...assignSectionTarg | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 66 | `src/components/files/FileManager.tsx:786` | setAssignSectionTarget(null)} className="w-fu | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 67 | `src/components/fonts/FontLibrary.tsx:73` | inputRef.current?.click()} className="inline- | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 68 | `src/components/fonts/FontLibrary.tsx:112` | { const link = document.createElement('link') | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 69 | `src/components/fonts/FontLibrary.tsx:151` | setCategory(id)} className={`px-3.5 py-1.5 ro | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 70 | `src/components/fonts/FontLibrary.tsx:183` | toggleFavoriteFont(font.id)} className="p-1.5 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 71 | `src/components/fonts/FontLibrary.tsx:195` | removeFont(font.id)} className="p-1.5 rounded | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 72 | `src/components/templates/TemplatesGallery.tsx:136` | setShowAddModal(true)} className="inline-flex | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 73 | `src/components/templates/TemplatesGallery.tsx:166` | removeCustomTemplate(ct.id)} className="p-1.5 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 74 | `src/components/templates/TemplatesGallery.tsx:177` | openModelAsDoc(ct.title, ct.model, 'docx')} c | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 75 | `src/components/templates/TemplatesGallery.tsx:185` | openModelAsDoc(ct.title, ct.model, 'pdf')} cl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 76 | `src/components/templates/TemplatesGallery.tsx:220` | handleOpenTemplate(tpl, 'docx')} className="f | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 77 | `src/components/templates/TemplatesGallery.tsx:228` | handleOpenTemplate(tpl, 'pdf')} className="fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 78 | `src/components/templates/TemplatesGallery.tsx:276` | setShowAddModal(false)} className="px-3 py-1. | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 79 | `src/components/templates/TemplatesGallery.tsx:283` | {t('save')} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 80 | `src/components/word-editor/WordEditor.tsx:556` | isAr ? 'تراجع' : 'Undo' | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 81 | `src/components/word-editor/WordEditor.tsx:565` | isAr ? 'إعادة' : 'Redo' | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 82 | `src/components/word-editor/WordEditor.tsx:574` | { await saveCurrentDocument(true); showToast( | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 83 | `src/components/word-editor/WordEditor.tsx:585` | setShowPrintModal(true)} className="inline-fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 84 | `src/components/word-editor/WordEditor.tsx:611` | setRibbonTab(id)} className={`px-3 py-1.5 rou | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 85 | `src/components/word-editor/WordEditor.tsx:630` | { setActiveDocId(null); setModel( createEmpty | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 86 | `src/components/word-editor/WordEditor.tsx:648` | openDocxInputRef.current?.click()} className= | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 87 | `src/components/word-editor/WordEditor.tsx:656` | { const blob = await exportModelToDocxBlob(mo | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 88 | `src/components/word-editor/WordEditor.tsx:667` | { const blob = await exportDocxModelToPdfBlob | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 89 | `src/components/word-editor/WordEditor.tsx:678` | setShowPrintModal(true)} className="inline-fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 90 | `src/components/word-editor/WordEditor.tsx:686` | { await addCustomTemplate({ id: createId('ctp | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 91 | `src/components/word-editor/WordEditor.tsx:734` | updateRunStyle({ fontSize: Math.min(48, (firs | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 92 | `src/components/word-editor/WordEditor.tsx:742` | updateRunStyle({ fontSize: Math.max(8, (first | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 93 | `src/components/word-editor/WordEditor.tsx:753` | updateRunStyle({ bold: !firstRun.bold })} cla | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 94 | `src/components/word-editor/WordEditor.tsx:761` | updateRunStyle({ italic: !firstRun.italic })} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 95 | `src/components/word-editor/WordEditor.tsx:769` | updateRunStyle({ underline: !firstRun.underli | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 96 | `src/components/word-editor/WordEditor.tsx:777` | updateRunStyle({ strike: !firstRun.strike })} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 97 | `src/components/word-editor/WordEditor.tsx:785` | updateRunStyle({ superScript: !firstRun.super | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 98 | `src/components/word-editor/WordEditor.tsx:793` | updateRunStyle({ subScript: !firstRun.subScri | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 99 | `src/components/word-editor/WordEditor.tsx:801` | { if (!selectedParagraph) return; const txt = | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 100 | `src/components/word-editor/WordEditor.tsx:844` | { if (!copiedFormat) { setCopiedFormat({ bold | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 101 | `src/components/word-editor/WordEditor.tsx:868` | updateRunStyle({ bold: false, italic: false,  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 102 | `src/components/word-editor/WordEditor.tsx:889` | updateSelectedParagraph((p) => ({ ...p, align | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 103 | `src/components/word-editor/WordEditor.tsx:896` | updateSelectedParagraph((p) => ({ ...p, align | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 104 | `src/components/word-editor/WordEditor.tsx:903` | updateSelectedParagraph((p) => ({ ...p, align | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 105 | `src/components/word-editor/WordEditor.tsx:910` | updateSelectedParagraph((p) => ({ ...p, align | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 106 | `src/components/word-editor/WordEditor.tsx:918` | updateSelectedParagraph((p) => ({ ...p, listT | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 107 | `src/components/word-editor/WordEditor.tsx:931` | updateSelectedParagraph((p) => ({ ...p, listT | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 108 | `src/components/word-editor/WordEditor.tsx:945` | updateSelectedParagraph((p) => ({ ...p, inden | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 109 | `src/components/word-editor/WordEditor.tsx:955` | updateSelectedParagraph((p) => ({ ...p, inden | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 110 | `src/components/word-editor/WordEditor.tsx:985` | updateSelectedParagraph((p) => ({ ...p, direc | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 111 | `src/components/word-editor/WordEditor.tsx:999` | setShowFindReplace((v) => !v)} className="inl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 112 | `src/components/word-editor/WordEditor.tsx:1008` | { const txt = selectedParagraph?.runs.map((r) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 113 | `src/components/word-editor/WordEditor.tsx:1020` | { const txt = selectedParagraph?.runs.map((r) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 114 | `src/components/word-editor/WordEditor.tsx:1033` | commitModel((prev) => ({ ...prev, blocks: [ . | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 115 | `src/components/word-editor/WordEditor.tsx:1049` | { try { const clip = await navigator.clipboar | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 116 | `src/components/word-editor/WordEditor.tsx:1074` | addNewParagraphAfter(selectedBlockId // undef | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 117 | `src/components/word-editor/WordEditor.tsx:1082` | insertImageInputRef.current?.click()} classNa | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 118 | `src/components/word-editor/WordEditor.tsx:1090` | handleInsertTable(3, 3)} className="inline-fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 119 | `src/components/word-editor/WordEditor.tsx:1098` | setShowLinkModal(true)} className="inline-fle | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 120 | `src/components/word-editor/WordEditor.tsx:1106` | setShowSymbolModal(true)} className="inline-f | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 121 | `src/components/word-editor/WordEditor.tsx:1114` | setShowShapeModal(true)} className="inline-fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 122 | `src/components/word-editor/WordEditor.tsx:1122` | setShowEquationModal(true)} className="inline | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 123 | `src/components/word-editor/WordEditor.tsx:1130` | commitModel((prev) => ({ ...prev, blocks: [.. | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 124 | `src/components/word-editor/WordEditor.tsx:1192` | { const headings = model.blocks.filter( (b):  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 125 | `src/components/word-editor/WordEditor.tsx:1297` | commitModel((prev) => ({ ...prev, pageSetup:  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 126 | `src/components/word-editor/WordEditor.tsx:1443` | setShowFindReplace((v) => !v)} className="inl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 127 | `src/components/word-editor/WordEditor.tsx:1451` | setShowComments((v) => !v)} className="inline | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 128 | `src/components/word-editor/WordEditor.tsx:1467` | setShowVersionsModal(true)} className="inline | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 129 | `src/components/word-editor/WordEditor.tsx:1485` | setZoom((z) => Math.max(60, z - 15))} classNa | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 130 | `src/components/word-editor/WordEditor.tsx:1493` | setZoom((z) => Math.min(160, z + 15))} classN | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 131 | `src/components/word-editor/WordEditor.tsx:1500` | setZoom(100)} className="px-2.5 py-1 rounded- | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 132 | `src/components/word-editor/WordEditor.tsx:1507` | setShowRuler((v) => !v)} className={`inline-f | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 133 | `src/components/word-editor/WordEditor.tsx:1515` | setShowNavPane((v) => !v)} className={`inline | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 134 | `src/components/word-editor/WordEditor.tsx:1553` | handleFindAndReplace(false)} className="px-3  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 135 | `src/components/word-editor/WordEditor.tsx:1560` | handleFindAndReplace(true)} className="px-3 p | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 136 | `src/components/word-editor/WordEditor.tsx:1581` | setSelectedBlockId(h.id)} className={`w-full  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 137 | `src/components/word-editor/WordEditor.tsx:1701` | { setCopiedImageDataUrl(block.dataUrl); try { | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 138 | `src/components/word-editor/WordEditor.tsx:1720` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 139 | `src/components/word-editor/WordEditor.tsx:1852` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 140 | `src/components/word-editor/WordEditor.tsx:1886` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 141 | `src/components/word-editor/WordEditor.tsx:1920` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 142 | `src/components/word-editor/WordEditor.tsx:1936` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 143 | `src/components/word-editor/WordEditor.tsx:1952` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 144 | `src/components/word-editor/WordEditor.tsx:1977` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 145 | `src/components/word-editor/WordEditor.tsx:2021` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 146 | `src/components/word-editor/WordEditor.tsx:2037` | commitModel((prev) => ({ ...prev, blocks: pre | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 147 | `src/components/word-editor/WordEditor.tsx:2084` | updateRunStyle({ bold: !run.bold })} classNam | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 148 | `src/components/word-editor/WordEditor.tsx:2085` | updateRunStyle({ italic: !run.italic })} clas | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 149 | `src/components/word-editor/WordEditor.tsx:2086` | updateRunStyle({ underline: !run.underline }) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 150 | `src/components/word-editor/WordEditor.tsx:2101` | { navigator.clipboard?.writeText(textVal); sh | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 151 | `src/components/word-editor/WordEditor.tsx:2112` | setSelectionToolbarBlockId(null)} className=" | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 152 | `src/components/word-editor/WordEditor.tsx:2183` | { if (!newCommentText.trim()) return; commitM | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 153 | `src/components/word-editor/WordEditor.tsx:2217` | commitModel((prev) => ({ ...prev, comments: p | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 154 | `src/components/word-editor/WordEditor.tsx:2256` | { updateSelectedParagraph((p) => ({ ...p, run | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 155 | `src/components/word-editor/WordEditor.tsx:2272` | setShowSymbolModal(false)} className="w-full  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 156 | `src/components/word-editor/WordEditor.tsx:2303` | setShowLinkModal(false)} className="px-3 py-1 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 157 | `src/components/word-editor/WordEditor.tsx:2310` | { commitModel((prev) => ({ ...prev, blocks: [ | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 158 | `src/components/word-editor/WordEditor.tsx:2354` | setEquationInput(eq)} className="px-2.5 py-1  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 159 | `src/components/word-editor/WordEditor.tsx:2372` | setShowEquationModal(false)} className="px-3  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 160 | `src/components/word-editor/WordEditor.tsx:2375` | { commitModel((prev) => ({ ...prev, blocks: [ | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 161 | `src/components/word-editor/WordEditor.tsx:2426` | { commitModel((prev) => ({ ...prev, blocks: [ | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 162 | `src/components/word-editor/WordEditor.tsx:2454` | setShowShapeModal(false)} className="w-full p | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 163 | `src/components/word-editor/WordEditor.tsx:2481` | { const restored = await parseDocxBlob(v.blob | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 164 | `src/components/word-editor/WordEditor.tsx:2497` | setShowVersionsModal(false)} className="w-ful | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 165 | `src/components/pdf-editor/PdfEditor.tsx:420` | openPdfRef.current?.click()} className="inlin | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 166 | `src/components/pdf-editor/PdfEditor.tsx:451` | setShowPageTools((v) => !v)} className={`inli | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 167 | `src/components/pdf-editor/PdfEditor.tsx:461` | setShowPdfComments((v) => !v)} className={`in | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 168 | `src/components/pdf-editor/PdfEditor.tsx:471` | handleSavePdf(true)} className="inline-flex i | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 169 | `src/components/pdf-editor/PdfEditor.tsx:479` | setShowPrintModal(true)} className="inline-fl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 170 | `src/components/pdf-editor/PdfEditor.tsx:513` | setTool(id)} className={`inline-flex items-ce | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 171 | `src/components/pdf-editor/PdfEditor.tsx:528` | insertImgRef.current?.click()} className="inl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 172 | `src/components/pdf-editor/PdfEditor.tsx:537` | setShowSignatureModal(true)} className="inlin | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 173 | `src/components/pdf-editor/PdfEditor.tsx:597` | { if (!pdfBlob) return; setPdfBlob(await rota | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 174 | `src/components/pdf-editor/PdfEditor.tsx:608` | { if (!pdfBlob) return; setPdfBlob(await addB | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 175 | `src/components/pdf-editor/PdfEditor.tsx:619` | { if (!pdfBlob) return; try { setPdfBlob(awai | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 176 | `src/components/pdf-editor/PdfEditor.tsx:634` | { if (!pdfBlob // numPages = numPages) { show | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 177 | `src/components/pdf-editor/PdfEditor.tsx:652` | mergePdfRef.current?.click()} className="px-2 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 178 | `src/components/pdf-editor/PdfEditor.tsx:667` | { if (!pdfBlob) return; const [s, e] = splitR | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 179 | `src/components/pdf-editor/PdfEditor.tsx:685` | { if (!pdfBlob) return; const comp = await co | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 180 | `src/components/pdf-editor/PdfEditor.tsx:698` | imgsToPdfRef.current?.click()} className="inl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 181 | `src/components/pdf-editor/PdfEditor.tsx:706` | {t('pdfToImages')} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 182 | `src/components/pdf-editor/PdfEditor.tsx:739` | setAnnotations((prev) => prev.map((a) => a.id | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 183 | `src/components/pdf-editor/PdfEditor.tsx:754` | { setAnnotations((prev) => prev.filter((a) => | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 184 | `src/components/pdf-editor/PdfEditor.tsx:953` | { navigator.clipboard?.writeText(pageText); s | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 185 | `src/components/pdf-editor/PdfEditor.tsx:981` | { if (!textDraft.trim()) return; setAnnotatio | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 186 | `src/components/pdf-editor/PdfEditor.tsx:1023` | { e.stopPropagation(); setAnnotations((prev)  | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 187 | `src/components/pdf-editor/PdfEditor.tsx:1045` | setCurrentPage((p) => Math.max(1, p - 1))} cl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 188 | `src/components/pdf-editor/PdfEditor.tsx:1056` | = numPages} onClick={() => setCurrentPage((p) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 189 | `src/components/pdf-editor/PdfEditor.tsx:1067` | setScale((s) => Math.max(0.6, Number((s - 0.2 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 190 | `src/components/pdf-editor/PdfEditor.tsx:1075` | setScale((s) => Math.min(2.4, Number((s + 0.2 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 191 | `src/components/pdf-editor/PdfEditor.tsx:1119` | { const ctx = sigCanvasRef.current?.getContex | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 192 | `src/components/pdf-editor/PdfEditor.tsx:1130` | setShowSignatureModal(false)} className="px-3 | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 193 | `src/components/pdf-editor/PdfEditor.tsx:1137` | {isAr ? 'إدراج التوقيع' : 'Insert Signature'} | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 194 | `src/components/settings/SettingsView.tsx:180` | { const target = settings.onlyofficeServerUrl | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 195 | `src/components/settings/SettingsView.tsx:217` | setView('fonts')} className="inline-flex item | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 196 | `src/components/settings/SettingsView.tsx:226` | {t('clearTrash')} ({trashDocs.length}) | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
| 197 | `src/components/settings/SettingsView.tsx:247` | setShowPrivacy((v) => !v)} className="inline- | `onClick` موجود | PASS (Code Wired) | BLOCKED (يحتاج متصفح) |
