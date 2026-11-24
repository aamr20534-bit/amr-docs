# FEATURES_200_AUDIT.md — الجرد التفصيلي الشامل (234 وظيفة وزر)

| # | الموقع بالكود | الوظيفة / الزر | حالة الفحص الساكن | حالة التشغيل الحي |
|---|---|---|---|---|
| 1 | `src/components/common/Header.tsx:47` | (Icon) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 2 | `src/components/common/Header.tsx:56` | setView('dashboard')} className="flex items-c | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 3 | `src/components/common/Header.tsx:107` | updateSettings({ theme: isDark ? 'light' : 'd | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 4 | `src/components/common/Header.tsx:118` | setShowNotifs((v) => !v)} title={t('notificat | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 5 | `src/components/common/Header.tsx:135` | {t('markAllRead')} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 6 | `src/components/common/Header.tsx:172` | setView('settings')} title={t('settings')} cl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 7 | `src/components/common/PrintExportModal.tsx:64` | (Icon) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 8 | `src/components/common/PrintExportModal.tsx:123` | { setBusy(true); await onExportDocx(opts); se | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 9 | `src/components/common/PrintExportModal.tsx:138` | { setBusy(true); await onExportPdf(opts); set | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 10 | `src/components/common/PrintExportModal.tsx:152` | {isAr ? 'طباعة مباشرة' : 'Print Now'} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 11 | `src/components/common/PrintExportModal.tsx:161` | {isAr ? 'مشاركة الملف' : 'Share File'} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 12 | `src/components/common/PrintExportModal.tsx:183` | { setBusy(true); await onSaveAsCopy(copyName. | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 13 | `src/components/common/Sidebar.tsx:46` | handleSelect(item.id)} className={`w-full fle | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 14 | `src/components/common/Sidebar.tsx:82` | (Icon) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 15 | `src/components/common/Sidebar.tsx:94` | handleSelect(item.id)} className={`w-full fle | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 16 | `src/components/dashboard/Dashboard.tsx:228` | {t('newWord')} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 17 | `src/components/dashboard/Dashboard.tsx:237` | {t('newPdf')} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 18 | `src/components/dashboard/Dashboard.tsx:246` | fileInputRef.current?.click()} className="fle | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 19 | `src/components/dashboard/Dashboard.tsx:255` | setView('files')} className="flex items-cente | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 20 | `src/components/dashboard/Dashboard.tsx:264` | handleEditLatestOrNew('docx')} className="fle | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 21 | `src/components/dashboard/Dashboard.tsx:273` | handleEditLatestOrNew('pdf')} className="flex | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 22 | `src/components/dashboard/Dashboard.tsx:326` | setView('files')} className="bg-white dark:bg | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 23 | `src/components/dashboard/Dashboard.tsx:350` | setView('files')} className="text-xs font-sem | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 24 | `src/components/dashboard/Dashboard.tsx:368` | openDocument(doc)} className="flex items-cent | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 25 | `src/components/dashboard/Dashboard.tsx:412` | openDocument(doc)} className="w-full flex ite | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 26 | `src/components/dashboard/Dashboard.tsx:437` | setView('templates')} className="text-xs font | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 27 | `src/components/dashboard/Dashboard.tsx:448` | handleUseTemplate(tpl.id)} className="p-3.5 r | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 28 | `src/components/files/FileManager.tsx:188` | fileInputRef.current?.click()} className="inl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 29 | `src/components/files/FileManager.tsx:197` | setShowNewFolder(true)} className="inline-fle | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 30 | `src/components/files/FileManager.tsx:206` | { setMultiSelectMode((v) => !v); setSelectedI | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 31 | `src/components/files/FileManager.tsx:246` | { setActiveTab(id); if (id !== 'all') setCurr | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 32 | `src/components/files/FileManager.tsx:265` | setActiveTab(sec.id)} className={`px-3 py-1.5 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 33 | `src/components/files/FileManager.tsx:276` | { if (activeTab === sec.id) setActiveTab('all | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 34 | `src/components/files/FileManager.tsx:290` | setShowNewSection(true)} className="inline-fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 35 | `src/components/files/FileManager.tsx:300` | setCurrentFolderId(null)} className="px-3 py- | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 36 | `src/components/files/FileManager.tsx:317` | setConfirmTrashIds(Array.from(selectedIds))}  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 37 | `src/components/files/FileManager.tsx:341` | { e.stopPropagation(); removeFolder(f.id); }} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 38 | `src/components/files/FileManager.tsx:378` | toggleSelect(doc.id)} className="mt-1"> {isSe | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 39 | `src/components/files/FileManager.tsx:410` | upsertDocument({ ...doc, isFavorite: !doc.isF | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 40 | `src/components/files/FileManager.tsx:427` | restoreDocument(doc.id)} className="inline-fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 41 | `src/components/files/FileManager.tsx:435` | setConfirmPermId(doc.id)} className="inline-f | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 42 | `src/components/files/FileManager.tsx:446` | { setRenameTarget(doc); setRenameText(doc.nam | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 43 | `src/components/files/FileManager.tsx:457` | handleDuplicate(doc)} title={t('copy')} class | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 44 | `src/components/files/FileManager.tsx:465` | setMoveTarget(doc)} title={t('move')} classNa | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 45 | `src/components/files/FileManager.tsx:473` | setAssignSectionTarget(doc)} title={isAr ? 'إ | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 46 | `src/components/files/FileManager.tsx:481` | exportFileToDevice(doc.blob, doc.name)} title | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 47 | `src/components/files/FileManager.tsx:489` | shareDocumentFile(doc.blob, doc.name, doc.nam | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 48 | `src/components/files/FileManager.tsx:497` | setDetailsTarget(doc)} title={t('details')} c | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 49 | `src/components/files/FileManager.tsx:505` | setConfirmTrashIds([doc.id])} title={t('delet | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 50 | `src/components/files/FileManager.tsx:535` | setShowNewFolder(false)} className="px-3 py-1 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 51 | `src/components/files/FileManager.tsx:542` | {t('confirm')} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 52 | `src/components/files/FileManager.tsx:566` | setRenameTarget(null)} className="px-3 py-1.5 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 53 | `src/components/files/FileManager.tsx:573` | { if (renameText.trim()) { await upsertDocume | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 54 | `src/components/files/FileManager.tsx:600` | { await upsertDocument({ ...moveTarget, folde | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 55 | `src/components/files/FileManager.tsx:611` | { await upsertDocument({ ...moveTarget, folde | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 56 | `src/components/files/FileManager.tsx:625` | setMoveTarget(null)} className="w-full py-2 r | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 57 | `src/components/files/FileManager.tsx:647` | setDetailsTarget(null)} className="w-full mt- | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 58 | `src/components/files/FileManager.tsx:664` | setConfirmTrashIds(null)} className="px-3 py- | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 59 | `src/components/files/FileManager.tsx:671` | { for (const id of confirmTrashIds) await sof | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 60 | `src/components/files/FileManager.tsx:694` | setConfirmPermId(null)} className="px-3 py-1. | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 61 | `src/components/files/FileManager.tsx:701` | { await removeDocumentForever(confirmPermId); | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 62 | `src/components/files/FileManager.tsx:729` | setShowNewSection(false)} className="px-3 py- | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 63 | `src/components/files/FileManager.tsx:736` | { if (!newSectionName.trim()) return; await c | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 64 | `src/components/files/FileManager.tsx:760` | { await upsertDocument({ ...assignSectionTarg | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 65 | `src/components/files/FileManager.tsx:771` | { await upsertDocument({ ...assignSectionTarg | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 66 | `src/components/files/FileManager.tsx:786` | setAssignSectionTarget(null)} className="w-fu | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 67 | `src/components/fonts/FontLibrary.tsx:73` | inputRef.current?.click()} className="inline- | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 68 | `src/components/fonts/FontLibrary.tsx:112` | { const link = document.createElement('link') | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 69 | `src/components/fonts/FontLibrary.tsx:151` | setCategory(id)} className={`px-3.5 py-1.5 ro | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 70 | `src/components/fonts/FontLibrary.tsx:183` | toggleFavoriteFont(font.id)} className="p-1.5 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 71 | `src/components/fonts/FontLibrary.tsx:195` | removeFont(font.id)} className="p-1.5 rounded | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 72 | `src/components/templates/TemplatesGallery.tsx:136` | setShowAddModal(true)} className="inline-flex | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 73 | `src/components/templates/TemplatesGallery.tsx:166` | removeCustomTemplate(ct.id)} className="p-1.5 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 74 | `src/components/templates/TemplatesGallery.tsx:177` | openModelAsDoc(ct.title, ct.model, 'docx')} c | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 75 | `src/components/templates/TemplatesGallery.tsx:185` | openModelAsDoc(ct.title, ct.model, 'pdf')} cl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 76 | `src/components/templates/TemplatesGallery.tsx:220` | handleOpenTemplate(tpl, 'docx')} className="f | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 77 | `src/components/templates/TemplatesGallery.tsx:228` | handleOpenTemplate(tpl, 'pdf')} className="fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 78 | `src/components/templates/TemplatesGallery.tsx:276` | setShowAddModal(false)} className="px-3 py-1. | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 79 | `src/components/templates/TemplatesGallery.tsx:283` | {t('save')} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 80 | `src/components/word-editor/WordEditor.tsx:641` | isAr ? 'تراجع' : 'Undo' | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 81 | `src/components/word-editor/WordEditor.tsx:650` | isAr ? 'إعادة' : 'Redo' | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 82 | `src/components/word-editor/WordEditor.tsx:659` | { await saveCurrentDocument(true); showToast( | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 83 | `src/components/word-editor/WordEditor.tsx:670` | setShowPrintModal(true)} className="inline-fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 84 | `src/components/word-editor/WordEditor.tsx:685` | setFocusMode(false)} className="px-2.5 py-0.5 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 85 | `src/components/word-editor/WordEditor.tsx:704` | setRibbonTab(id)} className={`px-3 py-1.5 rou | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 86 | `src/components/word-editor/WordEditor.tsx:723` | { setActiveDocId(null); setModel( createEmpty | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 87 | `src/components/word-editor/WordEditor.tsx:741` | openDocxInputRef.current?.click()} className= | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 88 | `src/components/word-editor/WordEditor.tsx:749` | { const blob = await exportModelToDocxBlob(mo | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 89 | `src/components/word-editor/WordEditor.tsx:760` | { const blob = await exportDocxModelToPdfBlob | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 90 | `src/components/word-editor/WordEditor.tsx:771` | { const plain = model.blocks .map((b) => b.ty | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 91 | `src/components/word-editor/WordEditor.tsx:793` | { const bodyHtml = model.blocks .map((b) => { | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 92 | `src/components/word-editor/WordEditor.tsx:817` | setShowPrintModal(true)} className="inline-fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 93 | `src/components/word-editor/WordEditor.tsx:825` | { await addCustomTemplate({ id: createId('ctp | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 94 | `src/components/word-editor/WordEditor.tsx:873` | updateRunStyle({ fontSize: Math.min(48, (firs | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 95 | `src/components/word-editor/WordEditor.tsx:881` | updateRunStyle({ fontSize: Math.max(8, (first | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 96 | `src/components/word-editor/WordEditor.tsx:892` | updateRunStyle({ bold: !firstRun.bold })} cla | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 97 | `src/components/word-editor/WordEditor.tsx:900` | updateRunStyle({ italic: !firstRun.italic })} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 98 | `src/components/word-editor/WordEditor.tsx:908` | updateRunStyle({ underline: !firstRun.underli | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 99 | `src/components/word-editor/WordEditor.tsx:916` | updateRunStyle({ strike: !firstRun.strike })} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 100 | `src/components/word-editor/WordEditor.tsx:924` | updateRunStyle({ superScript: !firstRun.super | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 101 | `src/components/word-editor/WordEditor.tsx:932` | updateRunStyle({ subScript: !firstRun.subScri | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 102 | `src/components/word-editor/WordEditor.tsx:940` | { if (!selectedParagraph) return; const txt = | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 103 | `src/components/word-editor/WordEditor.tsx:983` | { if (!copiedFormat) { setCopiedFormat({ bold | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 104 | `src/components/word-editor/WordEditor.tsx:1006` | { const pin = settings.pinnedSnippet; if (!pi | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 105 | `src/components/word-editor/WordEditor.tsx:1059` | updateRunStyle({ bold: false, italic: false,  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 106 | `src/components/word-editor/WordEditor.tsx:1080` | updateSelectedParagraph((p) => ({ ...p, align | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 107 | `src/components/word-editor/WordEditor.tsx:1087` | updateSelectedParagraph((p) => ({ ...p, align | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 108 | `src/components/word-editor/WordEditor.tsx:1094` | updateSelectedParagraph((p) => ({ ...p, align | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 109 | `src/components/word-editor/WordEditor.tsx:1101` | updateSelectedParagraph((p) => ({ ...p, align | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 110 | `src/components/word-editor/WordEditor.tsx:1109` | updateSelectedParagraph((p) => ({ ...p, listT | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 111 | `src/components/word-editor/WordEditor.tsx:1122` | updateSelectedParagraph((p) => ({ ...p, listT | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 112 | `src/components/word-editor/WordEditor.tsx:1153` | updateSelectedParagraph((p) => ({ ...p, inden | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 113 | `src/components/word-editor/WordEditor.tsx:1163` | updateSelectedParagraph((p) => ({ ...p, inden | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 114 | `src/components/word-editor/WordEditor.tsx:1195` | updateSelectedParagraph((p) => ({ ...p, direc | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 115 | `src/components/word-editor/WordEditor.tsx:1208` | { commitModel((prev) => { const paras = prev. | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 116 | `src/components/word-editor/WordEditor.tsx:1227` | setShowFindReplace((v) => !v)} className="inl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 117 | `src/components/word-editor/WordEditor.tsx:1236` | { const txt = selectedParagraph?.runs.map((r) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 118 | `src/components/word-editor/WordEditor.tsx:1248` | { const txt = selectedParagraph?.runs.map((r) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 119 | `src/components/word-editor/WordEditor.tsx:1261` | commitModel((prev) => ({ ...prev, blocks: [ . | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 120 | `src/components/word-editor/WordEditor.tsx:1277` | { try { const clip = await navigator.clipboar | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 121 | `src/components/word-editor/WordEditor.tsx:1302` | addNewParagraphAfter(selectedBlockId // undef | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 122 | `src/components/word-editor/WordEditor.tsx:1310` | insertImageInputRef.current?.click()} classNa | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 123 | `src/components/word-editor/WordEditor.tsx:1318` | handleInsertTable(3, 3)} className="inline-fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 124 | `src/components/word-editor/WordEditor.tsx:1326` | setShowLinkModal(true)} className="inline-fle | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 125 | `src/components/word-editor/WordEditor.tsx:1334` | setShowSymbolModal(true)} className="inline-f | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 126 | `src/components/word-editor/WordEditor.tsx:1342` | setShowShapeModal(true)} className="inline-fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 127 | `src/components/word-editor/WordEditor.tsx:1350` | setShowEquationModal(true)} className="inline | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 128 | `src/components/word-editor/WordEditor.tsx:1358` | commitModel((prev) => ({ ...prev, blocks: [.. | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 129 | `src/components/word-editor/WordEditor.tsx:1370` | { const dateStr = new Date().toLocaleDateStri | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 130 | `src/components/word-editor/WordEditor.tsx:1387` | commitModel((prev) => ({ ...prev, blocks: [ . | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 131 | `src/components/word-editor/WordEditor.tsx:1408` | { const noteText = window.prompt(isAr ? 'أدخل | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 132 | `src/components/word-editor/WordEditor.tsx:1519` | { const headings = model.blocks.filter( (b):  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 133 | `src/components/word-editor/WordEditor.tsx:1569` | { const coverBlocks: DocxBlock[] = [ { id: cr | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 134 | `src/components/word-editor/WordEditor.tsx:1675` | commitModel((prev) => ({ ...prev, pageSetup:  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 135 | `src/components/word-editor/WordEditor.tsx:1838` | setShowFindReplace((v) => !v)} className="inl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 136 | `src/components/word-editor/WordEditor.tsx:1846` | setShowComments((v) => !v)} className="inline | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 137 | `src/components/word-editor/WordEditor.tsx:1862` | setShowVersionsModal(true)} className="inline | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 138 | `src/components/word-editor/WordEditor.tsx:1880` | setZoom((z) => Math.max(60, z - 15))} classNa | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 139 | `src/components/word-editor/WordEditor.tsx:1888` | setZoom((z) => Math.min(160, z + 15))} classN | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 140 | `src/components/word-editor/WordEditor.tsx:1895` | setZoom(100)} className="px-2.5 py-1 rounded- | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 141 | `src/components/word-editor/WordEditor.tsx:1902` | setShowRuler((v) => !v)} className={`inline-f | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 142 | `src/components/word-editor/WordEditor.tsx:1910` | setShowNavPane((v) => !v)} className={`inline | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 143 | `src/components/word-editor/WordEditor.tsx:1918` | setZoom(window.innerWidth {isAr ? 'ملاءمة الع | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 144 | `src/components/word-editor/WordEditor.tsx:1925` | setFocusMode((v) => !v)} className={`px-2.5 p | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 145 | `src/components/word-editor/WordEditor.tsx:1975` | { const next = (activeMatchIdx - 1 + searchMa | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 146 | `src/components/word-editor/WordEditor.tsx:1987` | { const next = (activeMatchIdx + 1) % searchM | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 147 | `src/components/word-editor/WordEditor.tsx:2001` | handleFindAndReplace(false)} className="px-3  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 148 | `src/components/word-editor/WordEditor.tsx:2008` | handleFindAndReplace(true)} className="px-3 p | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 149 | `src/components/word-editor/WordEditor.tsx:2029` | setSelectedBlockId(h.id)} className={`w-full  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 150 | `src/components/word-editor/WordEditor.tsx:2158` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 151 | `src/components/word-editor/WordEditor.tsx:2193` | commitModel((prev) => { const idx = prev.bloc | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 152 | `src/components/word-editor/WordEditor.tsx:2209` | commitModel((prev) => { const idx = prev.bloc | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 153 | `src/components/word-editor/WordEditor.tsx:2225` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 154 | `src/components/word-editor/WordEditor.tsx:2239` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 155 | `src/components/word-editor/WordEditor.tsx:2253` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 156 | `src/components/word-editor/WordEditor.tsx:2269` | { await updateSettings({ pinnedSnippet: { ima | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 157 | `src/components/word-editor/WordEditor.tsx:2279` | { setCopiedImageDataUrl(block.dataUrl); try { | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 158 | `src/components/word-editor/WordEditor.tsx:2298` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 159 | `src/components/word-editor/WordEditor.tsx:2430` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 160 | `src/components/word-editor/WordEditor.tsx:2464` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 161 | `src/components/word-editor/WordEditor.tsx:2498` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 162 | `src/components/word-editor/WordEditor.tsx:2514` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 163 | `src/components/word-editor/WordEditor.tsx:2530` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 164 | `src/components/word-editor/WordEditor.tsx:2555` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 165 | `src/components/word-editor/WordEditor.tsx:2581` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 166 | `src/components/word-editor/WordEditor.tsx:2624` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 167 | `src/components/word-editor/WordEditor.tsx:2640` | commitModel((prev) => ({ ...prev, blocks: pre | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 168 | `src/components/word-editor/WordEditor.tsx:2687` | updateRunStyle({ bold: !run.bold })} classNam | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 169 | `src/components/word-editor/WordEditor.tsx:2688` | updateRunStyle({ italic: !run.italic })} clas | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 170 | `src/components/word-editor/WordEditor.tsx:2689` | updateRunStyle({ underline: !run.underline }) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 171 | `src/components/word-editor/WordEditor.tsx:2704` | { await updateSettings({ pinnedSnippet: { tex | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 172 | `src/components/word-editor/WordEditor.tsx:2732` | { navigator.clipboard?.writeText(textVal); sh | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 173 | `src/components/word-editor/WordEditor.tsx:2743` | setSelectionToolbarBlockId(null)} className=" | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 174 | `src/components/word-editor/WordEditor.tsx:2813` | { e.stopPropagation(); commitModel((prev) =>  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 175 | `src/components/word-editor/WordEditor.tsx:2835` | { e.stopPropagation(); commitModel((prev) =>  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 176 | `src/components/word-editor/WordEditor.tsx:2881` | { if (!newCommentText.trim()) return; commitM | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 177 | `src/components/word-editor/WordEditor.tsx:2915` | commitModel((prev) => ({ ...prev, comments: p | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 178 | `src/components/word-editor/WordEditor.tsx:2954` | { updateSelectedParagraph((p) => ({ ...p, run | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 179 | `src/components/word-editor/WordEditor.tsx:2970` | setShowSymbolModal(false)} className="w-full  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 180 | `src/components/word-editor/WordEditor.tsx:3001` | setShowLinkModal(false)} className="px-3 py-1 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 181 | `src/components/word-editor/WordEditor.tsx:3008` | { commitModel((prev) => ({ ...prev, blocks: [ | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 182 | `src/components/word-editor/WordEditor.tsx:3052` | setEquationInput(eq)} className="px-2.5 py-1  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 183 | `src/components/word-editor/WordEditor.tsx:3070` | setShowEquationModal(false)} className="px-3  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 184 | `src/components/word-editor/WordEditor.tsx:3073` | { commitModel((prev) => ({ ...prev, blocks: [ | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 185 | `src/components/word-editor/WordEditor.tsx:3124` | { commitModel((prev) => ({ ...prev, blocks: [ | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 186 | `src/components/word-editor/WordEditor.tsx:3152` | setShowShapeModal(false)} className="w-full p | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 187 | `src/components/word-editor/WordEditor.tsx:3179` | { const restored = await parseDocxBlob(v.blob | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 188 | `src/components/word-editor/WordEditor.tsx:3195` | setShowVersionsModal(false)} className="w-ful | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 189 | `src/components/pdf-editor/PdfEditor.tsx:420` | openPdfRef.current?.click()} className="inlin | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 190 | `src/components/pdf-editor/PdfEditor.tsx:451` | setShowPageTools((v) => !v)} className={`inli | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 191 | `src/components/pdf-editor/PdfEditor.tsx:461` | setShowPdfComments((v) => !v)} className={`in | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 192 | `src/components/pdf-editor/PdfEditor.tsx:471` | handleSavePdf(true)} className="inline-flex i | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 193 | `src/components/pdf-editor/PdfEditor.tsx:479` | setShowPrintModal(true)} className="inline-fl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 194 | `src/components/pdf-editor/PdfEditor.tsx:513` | setTool(id)} className={`inline-flex items-ce | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 195 | `src/components/pdf-editor/PdfEditor.tsx:528` | insertImgRef.current?.click()} className="inl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 196 | `src/components/pdf-editor/PdfEditor.tsx:537` | setShowSignatureModal(true)} className="inlin | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 197 | `src/components/pdf-editor/PdfEditor.tsx:597` | { if (!pdfBlob) return; setPdfBlob(await rota | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 198 | `src/components/pdf-editor/PdfEditor.tsx:608` | { if (!pdfBlob) return; setPdfBlob(await addB | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 199 | `src/components/pdf-editor/PdfEditor.tsx:619` | { if (!pdfBlob) return; try { setPdfBlob(awai | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 200 | `src/components/pdf-editor/PdfEditor.tsx:634` | { if (!pdfBlob // numPages = numPages) { show | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 201 | `src/components/pdf-editor/PdfEditor.tsx:652` | mergePdfRef.current?.click()} className="px-2 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 202 | `src/components/pdf-editor/PdfEditor.tsx:667` | { if (!pdfBlob) return; const [s, e] = splitR | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 203 | `src/components/pdf-editor/PdfEditor.tsx:685` | { if (!pdfBlob) return; const comp = await co | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 204 | `src/components/pdf-editor/PdfEditor.tsx:698` | imgsToPdfRef.current?.click()} className="inl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 205 | `src/components/pdf-editor/PdfEditor.tsx:706` | {t('pdfToImages')} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 206 | `src/components/pdf-editor/PdfEditor.tsx:752` | setAnnotations((prev) => prev.map((a) => a.id | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 207 | `src/components/pdf-editor/PdfEditor.tsx:767` | { setAnnotations((prev) => prev.filter((a) => | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 208 | `src/components/pdf-editor/PdfEditor.tsx:966` | { navigator.clipboard?.writeText(pageText); s | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 209 | `src/components/pdf-editor/PdfEditor.tsx:994` | { if (!textDraft.trim()) return; setAnnotatio | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 210 | `src/components/pdf-editor/PdfEditor.tsx:1036` | { e.stopPropagation(); setAnnotations((prev)  | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 211 | `src/components/pdf-editor/PdfEditor.tsx:1058` | setCurrentPage((p) => Math.max(1, p - 1))} cl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 212 | `src/components/pdf-editor/PdfEditor.tsx:1069` | = numPages} onClick={() => setCurrentPage((p) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 213 | `src/components/pdf-editor/PdfEditor.tsx:1080` | setScale((s) => Math.max(0.6, Number((s - 0.2 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 214 | `src/components/pdf-editor/PdfEditor.tsx:1088` | setScale((s) => Math.min(2.4, Number((s + 0.2 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 215 | `src/components/pdf-editor/PdfEditor.tsx:1132` | { const ctx = sigCanvasRef.current?.getContex | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 216 | `src/components/pdf-editor/PdfEditor.tsx:1143` | setShowSignatureModal(false)} className="px-3 | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 217 | `src/components/pdf-editor/PdfEditor.tsx:1150` | {isAr ? 'إدراج التوقيع' : 'Insert Signature'} | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 218 | `src/components/settings/SettingsView.tsx:180` | { const target = settings.onlyofficeServerUrl | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 219 | `src/components/settings/SettingsView.tsx:217` | setView('fonts')} className="inline-flex item | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 220 | `src/components/settings/SettingsView.tsx:226` | {t('clearTrash')} ({trashDocs.length}) | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 221 | `src/components/settings/SettingsView.tsx:247` | setShowPrivacy((v) => !v)} className="inline- | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 222 | `ooxmlParser.ts` | تحليل بنية OOXML لملفات DOCX | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 223 | `docxExporter.ts` | تصدير DOCX حقيقي مع الجداول والصور والحدود | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 224 | `docxExporter.ts` | تصدير مستند Word إلى PDF عالي الدقة | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 225 | `pdfEngine.ts` | عرض PDF عالي الدقة عبر PDF.js وإلغاء التداخل | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 226 | `pdfEngine.ts` | حفظ طبقة التحرير والتوقيع داخل PDF عبر PDF-Lib | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 227 | `pdfEngine.ts` | تعديل النص المضمّن الأصلي في PDF (Reflow) | FAIL (قيد PDF-Lib) | FAIL (غير مدعوم محلياً) |
| 228 | `db.ts` | تخزين المستندات والخطوط والقوالب والأقسام في IndexedDB | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 229 | `WordEditor.tsx` | الحفظ التلقائي الفوري والطارئ عند الخروج | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 230 | `WordEditor.tsx` | اكتشاف الخطوط المفقودة وتحميلها تلقائياً | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 231 | `WordEditor.tsx` | النمط الثابت الدائم وشريط التحديد العائم | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 232 | `WordEditor.tsx` | صفحة الغلاف وقوالب العلامات المائية وتكرار/حذف الفقرة | PASS (Code Wired) | BLOCKED (يتطلب متصفح) |
| 233 | `capacitorBridge.ts` | دعم زر الرجوع ومشاركة وتصدير الملفات في Android | PASS (Code Wired) | BLOCKED (يتطلب هاتف APK) |
| 234 | `build-apk.yml` | بناء APK تلقائياً عبر GitHub Actions | PASS (Workflow Ready) | BLOCKED (يتطلب GitHub Actions) |
