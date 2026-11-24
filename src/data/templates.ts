import { DocxDocumentModel, DocxParagraph, DocxTable, TemplateDefinition } from '../types';
import { defaultPageSetup } from '../engines/docx/ooxmlParser';
import { createId } from '../utils/fileHelpers';

function p(
  text: string,
  opts?: Partial<DocxParagraph> & { bold?: boolean; fontSize?: number; color?: string }
): DocxParagraph {
  return {
    id: createId('p'),
    type: 'paragraph',
    heading: opts?.heading || 'normal',
    align: opts?.align || 'right',
    direction: opts?.direction || 'rtl',
    lineSpacing: opts?.lineSpacing || 1.45,
    spaceAfter: opts?.spaceAfter ?? 6,
    listType: opts?.listType || 'none',
    runs: [
      {
        id: createId('r'),
        text,
        bold: opts?.bold,
        fontFamily: 'Cairo',
        fontSize: opts?.fontSize || (opts?.heading === 'h1' ? 18 : opts?.heading === 'h2' ? 14 : 12),
        color: opts?.color || (opts?.heading === 'h1' ? '#0F2942' : '#1E293B'),
      },
    ],
  };
}

function makeTable(rowsData: string[][], headerBg = '#0F2942'): DocxTable {
  return {
    id: createId('tbl'),
    type: 'table',
    borderColor: '#CBD5E1',
    rows: rowsData.map((row, rIdx) => ({
      id: createId('tr'),
      cells: row.map((cellText) => ({
        id: createId('tc'),
        backgroundColor: rIdx === 0 ? headerBg : rIdx % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
        paragraphs: [
          {
            id: createId('p'),
            type: 'paragraph',
            align: 'center',
            direction: 'rtl',
            runs: [
              {
                id: createId('r'),
                text: cellText,
                bold: rIdx === 0,
                fontFamily: 'Cairo',
                fontSize: 11,
                color: rIdx === 0 ? '#FFFFFF' : '#1E293B',
              },
            ],
          },
        ],
      })),
    })),
  };
}

function baseModel(title: string, blocks: DocxDocumentModel['blocks'], opts?: Partial<DocxDocumentModel['pageSetup']>): DocxDocumentModel {
  return {
    title,
    direction: 'rtl',
    pageSetup: {
      ...defaultPageSetup,
      ...opts,
    },
    blocks,
    comments: [],
  };
}

export const builtInTemplates: TemplateDefinition[] = [
  {
    id: 'tpl-cv',
    category: 'career',
    titleAr: 'سيرة ذاتية احترافية',
    titleEn: 'Professional Resume (CV)',
    descriptionAr: 'نموذج سيرة ذاتية منسق للأقسام الشخصية والخبرات والمهارات.',
    descriptionEn: 'Structured CV template with personal info, experience, and skills.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('السيرة الذاتية', [
        p('الاسم الكامل / المسمى الوظيفي', { heading: 'h1', align: 'center', bold: true }),
        p('البريد الإلكتروني: name@example.com  |  الهاتف: +20 100 000 0000  |  المدينة، الدولة', { align: 'center', color: '#475569', fontSize: 11 }),
        p('الملخص المهني', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('مهندس برمجيات / متخصص بخبرة عملية في تطوير الأنظمة وإدارة المشاريع وتحقيق نتائج ملموسة.'),
        p('الخبرات العملية', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('المسمى الوظيفي — اسم الشركة (2023 - الآن)', { bold: true }),
        p('قيادة تطوير الواجهات وتحسين الأداء بنسبة 40%.', { listType: 'bullet' }),
        p('تنسيق العمل مع فرق التصميم وضمان الجودة.', { listType: 'bullet' }),
        p('المؤهلات العلمية والمهارات', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        makeTable([
          ['المجال', 'التفاصيل', 'المستوى'],
          ['التعليم', 'بكالوريوس علوم الحاسب', 'امتياز'],
          ['المهارات التقنية', 'React, TypeScript, Node.js', 'متقدم'],
          ['اللغات', 'العربية، الإنجليزية', 'طلاقة'],
        ]),
      ]),
  },
  {
    id: 'tpl-uni-report',
    category: 'academic',
    titleAr: 'تقرير جامعي',
    titleEn: 'University Report',
    descriptionAr: 'قالب متكامل للتقارير الجامعية مع ملخص ومقدمة ونتائج ومراجع.',
    descriptionEn: 'Complete university report with abstract, methodology, results, and references.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel(
        'تقرير جامعي',
        [
          p('عنوان التقرير الجامعي', { heading: 'h1', align: 'center', bold: true }),
          p('إعداد الطالب: ..........................  |  إشراف الدكتور: ..........................', { align: 'center', color: '#475569' }),
          p('1. المقدمة', { heading: 'h2', bold: true, color: '#1D4ED8' }),
          p('يتناول هذا التقرير دراسة وتحليل الموضوع المحدد وفق المنهجية الأكاديمية المعتمدة.'),
          p('2. الأهداف والمنهجية', { heading: 'h2', bold: true, color: '#1D4ED8' }),
          p('تحديد المشكلة البحثية وجمع البيانات وتحليلها.', { listType: 'number' }),
          p('استعراض النتائج ومقارنتها بالدراسات السابقة.', { listType: 'number' }),
          p('3. النتائج والتوصيات', { heading: 'h2', bold: true, color: '#1D4ED8' }),
          p('أظهرت الدراسة أهمية تطبيق المعايير القياسية في التنفيذ.'),
        ],
        { headerText: 'تقرير جامعي — AMR DOCS', showPageNumbers: true }
      ),
  },
  {
    id: 'tpl-training',
    category: 'academic',
    titleAr: 'تقرير تدريب عملي',
    titleEn: 'Training Report',
    descriptionAr: 'تقرير توثيق فترة التدريب الميداني والمهام المنجزة.',
    descriptionEn: 'Internship and field training documentation report.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('تقرير التدريب العملي', [
        p('تقرير التدريب الميداني', { heading: 'h1', align: 'center', bold: true }),
        makeTable([
          ['اسم المتدرب', 'جهة التدريب', 'الفترة الزمنية', 'المشرف'],
          ['................', '................', 'من ... إلى ...', '................'],
        ]),
        p('المهام الأسبوعية المنجزة', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('التعرف على بيئة العمل وأدوات الفريق.', { listType: 'bullet' }),
        p('تنفيذ المهام العملية والمشاركة في المراجعات.', { listType: 'bullet' }),
        p('المهارات المكتسبة', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('تطوير مهارات التواصل المهني، العمل الجماعي، وحل المشكلات التقنية.'),
      ]),
  },
  {
    id: 'tpl-research',
    category: 'academic',
    titleAr: 'بحث علمي محكم',
    titleEn: 'Scientific Research Paper',
    descriptionAr: 'هيكل بحث علمي يشمل الملخص، الإشكالية، التحليل، والخاتمة.',
    descriptionEn: 'Academic paper structure with abstract, problem statement, analysis, and conclusion.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('بحث علمي', [
        p('عنوان البحث العلمي', { heading: 'h1', align: 'center', bold: true }),
        p('الملخص (Abstract)', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('يستعرض هذا البحث أثر التقنيات الحديثة في تحسين جودة الأداء المؤسسي.'),
        p('منهجية البحث', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('تم الاعتماد على المنهج الوصفي التحليلي لدراسة العينة البحثية.'),
        p('جدول البيانات والنتائج', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        makeTable([
          ['المتغير', 'النسبة قبل التطبيق', 'النسبة بعد التطبيق'],
          ['الكفاءة التشغيلية', '62%', '89%'],
          ['رضا المستفيدين', '70%', '94%'],
        ]),
        p('الخاتمة والمراجع', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('1. المرجع الأول — دار النشر العلمية، 2025.'),
      ]),
  },
  {
    id: 'tpl-official-letter',
    category: 'business',
    titleAr: 'خطاب رسمي',
    titleEn: 'Official Letter',
    descriptionAr: 'صيغة خطاب رسمي موجه للجهات والمؤسسات.',
    descriptionEn: 'Formal letter format for organizations and institutions.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel(
        'خطاب رسمي',
        [
          p('التاريخ: 23 / 11 / 2026', { align: 'left', color: '#475569' }),
          p('السادة / إدارة .......................... المحترمين', { heading: 'h2', bold: true }),
          p('السلام عليكم ورحمة الله وبركاته،،،'),
          p('الموضوع: ....................................................', { bold: true, color: '#1D4ED8' }),
          p('نهديكم أطيب التحيات، وبالإشارة إلى الموضوع أعلاه، نود إفادتكم بأننا نرغب في التنسيق معكم بشأن النقاط الموضحة أدناه.'),
          p('وتفضلوا بقبول فائق الاحترام والتقدير،،،'),
          p('مقدم الطلب / التوقيع', { align: 'left', bold: true }),
        ],
        { pageBorder: true, pageBorderColor: '#0F2942', pageBorderWidth: 1 }
      ),
  },
  {
    id: 'tpl-admin-letter',
    category: 'business',
    titleAr: 'خطاب إداري داخلي',
    titleEn: 'Administrative Memo',
    descriptionAr: 'مذكرة إدارية داخلية للتعميمات والقرارات.',
    descriptionEn: 'Internal administrative memo for announcements and directives.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('مذكرة إدارية', [
        p('مذكرة إدارية داخلية', { heading: 'h1', align: 'center', bold: true }),
        makeTable([
          ['من', 'إلى', 'الرقم المرجعي', 'التاريخ'],
          ['الإدارة العامة', 'جميع الأقسام', 'ADM-2026-01', '2026-11-23'],
        ]),
        p('نص التعميم الإداري', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('يُرجى من جميع الإدارات الالتزام بالضوابط والإجراءات المحدثة اعتبارًا من تاريخه.'),
      ]),
  },
  {
    id: 'tpl-invoice',
    category: 'finance',
    titleAr: 'فاتورة مبيعات / خدمات',
    titleEn: 'Commercial Invoice',
    descriptionAr: 'فاتورة منظمة بجدول الأصناف والكميات والضريبة والإجمالي.',
    descriptionEn: 'Structured invoice with line items, quantities, tax, and total.',
    defaultType: 'pdf',
    buildModel: () =>
      baseModel('فاتورة', [
        p('فاتورة ضريبية / خدمات', { heading: 'h1', align: 'center', bold: true }),
        p('رقم الفاتورة: INV-1024  |  العميل: ..........................  |  التاريخ: 2026-11-23', { align: 'center', color: '#475569' }),
        makeTable([
          ['م', 'البيان / الخدمة', 'الكمية', 'سعر الوحدة', 'الإجمالي'],
          ['1', 'تصميم وتطوير نظام', '1', '5000', '5000'],
          ['2', 'استضافة ودعم فني', '1', '1200', '1200'],
          ['', 'الإجمالي النهائي', '', '', '6200'],
        ]),
        p('شكراً لتعاملكم معنا — AMR DOCS', { align: 'center', color: '#1D4ED8', bold: true }),
      ]),
  },
  {
    id: 'tpl-contract',
    category: 'legal',
    titleAr: 'عقد اتفاق وتعاون',
    titleEn: 'Service Contract',
    descriptionAr: 'نموذج عقد قانوني يتضمن البنود والتزامات الطرفين والتوقيعات.',
    descriptionEn: 'Contract agreement template with clauses, obligations, and signatures.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('عقد اتفاق', [
        p('عقد تقديم خدمات واتفاق تعاون', { heading: 'h1', align: 'center', bold: true }),
        p('إنه في يوم ........... الموافق .... / .... / 2026 تم الاتفاق بين كل من:'),
        p('الطرف الأول: ..................................................', { bold: true }),
        p('الطرف الثاني: ..................................................', { bold: true }),
        p('البند الأول: موضوع العقد', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('يلتزم الطرف الثاني بتنفيذ الأعمال المتفق عليها وفق المواصفات الفنية المعتمدة.'),
        p('البند الثاني: المقابل المالي والمدة', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('يسري هذا العقد لمدة .......... تبدأ من تاريخ التوقيع.'),
        makeTable([
          ['توقيع الطرف الأول', 'توقيع الطرف الثاني'],
          ['الاسم: ................\nالتوقيع: ................', 'الاسم: ................\nالتوقيع: ................'],
        ]),
      ]),
  },
  {
    id: 'tpl-minutes',
    category: 'business',
    titleAr: 'محضر اجتماع',
    titleEn: 'Meeting Minutes',
    descriptionAr: 'نموذج لتسجيل الحضور وجدول الأعمال والقرارات والمهام.',
    descriptionEn: 'Meeting minutes template for attendees, agenda, decisions, and action items.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('محضر اجتماع', [
        p('محضر اجتماع رسمي', { heading: 'h1', align: 'center', bold: true }),
        makeTable([
          ['التاريخ والوقت', 'المكان', 'رئيس الاجتماع', 'الحضور'],
          ['2026-11-23 | 10:00 ص', 'قاعة الاجتماعات', '............', '............'],
        ]),
        p('القرارات والمهام', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        makeTable([
          ['المهمة', 'المسؤول', 'تاريخ الاستحقاق', 'الحالة'],
          ['مراجعة خطة الربع الأول', 'أحمد', '2026-12-01', 'قيد التنفيذ'],
          ['تجهيز العرض التقديمي', 'سارة', '2026-12-05', 'جديد'],
        ]),
      ]),
  },
  {
    id: 'tpl-study-notes',
    category: 'academic',
    titleAr: 'مذكرة دراسية',
    titleEn: 'Study Notes',
    descriptionAr: 'قالب لتلخيص المحاضرات والمفاهيم الأساسية والأسئلة.',
    descriptionEn: 'Clean study notes template for lectures, key concepts, and review questions.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('مذكرة دراسية', [
        p('ملخص المادة / المحاضرة', { heading: 'h1', align: 'center', bold: true }),
        p('الأفكار الرئيسية', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('المفهوم الأول: شرح مبسط للنقطة الأساسية.', { listType: 'bullet' }),
        p('المفهوم الثاني: أمثلة وتطبيقات عملية.', { listType: 'bullet' }),
        p('أسئلة للمراجعة', { heading: 'h2', bold: true, color: '#1D4ED8' }),
        p('1. ما هي المزايا الأساسية للنظام؟'),
      ]),
  },
  {
    id: 'tpl-project-cover',
    category: 'academic',
    titleAr: 'غلاف مشروع',
    titleEn: 'Project Cover Page',
    descriptionAr: 'صفحة غلاف أنيقة بإطار رسمي لمشاريع التخرج والأبحاث.',
    descriptionEn: 'Framed cover page for graduation projects and reports.',
    defaultType: 'pdf',
    buildModel: () =>
      baseModel(
        'غلاف مشروع',
        [
          p('اسم الجامعة / المؤسسة', { heading: 'h2', align: 'center', bold: true, color: '#1D4ED8' }),
          p('كلية الهندسة وتقنية المعلومات', { align: 'center', color: '#475569' }),
          p(' '),
          p('عنوان المشروع الرئيسي', { heading: 'h1', align: 'center', bold: true }),
          p('مشروع مقدم استكمالاً لمتطلبات التخرج للعام الدراسي 2026', { align: 'center' }),
          p(' '),
          p('إعداد: ....................................', { align: 'center', bold: true }),
          p('إشراف: ....................................', { align: 'center', bold: true }),
        ],
        { pageBorder: true, pageBorderColor: '#1D4ED8', pageBorderWidth: 2 }
      ),
  },
  {
    id: 'tpl-schedule',
    category: 'academic',
    titleAr: 'جدول دراسي أسبوعي',
    titleEn: 'Weekly Study Schedule',
    descriptionAr: 'جدول منظم لتوزيع المواد والحصص على أيام الأسبوع.',
    descriptionEn: 'Weekly timetable grid for classes and study blocks.',
    defaultType: 'docx',
    buildModel: () =>
      baseModel('الجدول الدراسي الأسبوعي', [
        p('الجدول الدراسي الأسبوعي', { heading: 'h1', align: 'center', bold: true }),
        makeTable([
          ['اليوم', '08:00 - 10:00', '10:00 - 12:00', '01:00 - 03:00'],
          ['الأحد', 'رياضيات', 'برمجة', 'مختبر'],
          ['الاثنين', 'فيزياء', 'لغة إنجليزية', 'مراجعة'],
          ['الثلاثاء', 'قواعد بيانات', 'خوارزميات', 'مشروع'],
          ['الأربعاء', 'شبكات', 'برمجة', 'تمارين'],
          ['الخميس', 'حلقة نقاش', 'مراجعة عامة', 'نشاط'],
        ]),
      ]),
  },
];
