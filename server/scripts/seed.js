const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const ADMIN_EMAIL = 'admin@campusconnect.edu';
const ADMIN_PASSWORD = 'Admin@123';

const collegeInfo = [
  {
    category: 'Admissions',
    question: 'What is the eligibility criteria for undergraduate admission?',
    answer:
      'Candidates must have completed 10+2 (or equivalent) with a minimum of 60% aggregate marks in Physics, Chemistry, and Mathematics/Biology, and must qualify the college entrance test or a valid national-level entrance exam score.',
    keywords: 'eligibility, admission criteria, ug admission, 10+2, entrance exam, cutoff',
  },
  {
    category: 'Admissions',
    question: 'How do I apply for admission online?',
    answer:
      'Visit the official college admissions portal, register with your email and phone number, fill out the application form, upload the required documents (mark sheets, ID proof, photograph), and pay the application fee online to submit.',
    keywords: 'apply online, admission form, registration, application process, apply',
  },
  {
    category: 'Admissions',
    question: 'What documents are required at the time of admission?',
    answer:
      'You need your 10th and 12th mark sheets, transfer certificate, migration certificate, category certificate (if applicable), passport-size photographs, Aadhaar card, and entrance exam scorecard.',
    keywords: 'documents required, admission documents, tc, migration certificate, mark sheet',
  },
  {
    category: 'Fees',
    question: 'What is the fee structure for the B.Tech program?',
    answer:
      'The B.Tech program fee is approximately Rs. 1,20,000 per year, which includes tuition, library, and lab fees. Hostel and mess charges are billed separately based on room type.',
    keywords: 'fee structure, btech fees, tuition fee, course fee, semester fee',
  },
  {
    category: 'Fees',
    question: 'What payment modes are accepted for fee payment?',
    answer:
      'Fees can be paid online via net banking, debit/credit card, or UPI through the student portal, or offline via demand draft in favor of the college at the accounts office.',
    keywords: 'fee payment, payment mode, online payment, demand draft, upi',
  },
  {
    category: 'Fees',
    question: 'Is there a provision for fee installments?',
    answer:
      'Yes, the college allows fee payment in two installments per semester on request, subject to approval from the accounts office. A written request must be submitted before the semester begins.',
    keywords: 'installment, fee installment, part payment, emi fees',
  },
  {
    category: 'Hostel',
    question: 'What are the hostel facilities available on campus?',
    answer:
      'Separate hostels are available for boys and girls with Wi-Fi, 24/7 water and power backup, mess facility, laundry service, common recreation rooms, and round-the-clock security.',
    keywords: 'hostel facilities, accommodation, boys hostel, girls hostel, room facilities',
  },
  {
    category: 'Hostel',
    question: 'How do I apply for hostel accommodation?',
    answer:
      'After confirming admission, submit the hostel application form available on the student portal along with the hostel fee. Rooms are allocated on a first-come-first-served basis subject to availability.',
    keywords: 'hostel application, hostel admission, room allotment, hostel booking',
  },
  {
    category: 'Exams',
    question: 'What is the minimum attendance required to appear for exams?',
    answer:
      'Students must maintain a minimum of 75% attendance in each subject to be eligible to sit for the semester-end examinations. Condonation up to 65% may be granted only on valid medical grounds.',
    keywords: 'attendance, minimum attendance, exam eligibility, condonation',
  },
  {
    category: 'Exams',
    question: 'When are the semester examinations conducted?',
    answer:
      'Semester examinations are usually conducted in the last two weeks of May (even semesters) and November (odd semesters). The exact datesheet is published on the college website a month in advance.',
    keywords: 'exam schedule, semester exam, datesheet, exam dates',
  },
  {
    category: 'Exams',
    question: 'How can I apply for revaluation of my answer sheet?',
    answer:
      'Submit a revaluation request through the student portal within 10 days of result declaration along with the prescribed fee per subject. Revalued results are usually declared within 3 weeks.',
    keywords: 'revaluation, recheck, answer sheet recheck, re-evaluation',
  },
  {
    category: 'Scholarships',
    question: 'What scholarships are available for meritorious students?',
    answer:
      'The college offers a Merit Scholarship covering up to 50% tuition fee waiver for students scoring above 90% in the qualifying exam, along with government scholarships for SC/ST/OBC and economically weaker sections.',
    keywords: 'scholarship, merit scholarship, fee waiver, financial aid',
  },
  {
    category: 'Scholarships',
    question: 'How do I apply for a government scholarship?',
    answer:
      'Register on the National Scholarship Portal (NSP) with your caste/income certificate and bank details, then submit the same application copy to the college scholarship cell for institutional verification.',
    keywords: 'nsp, government scholarship, national scholarship portal, income certificate',
  },
  {
    category: 'Placement',
    question: 'What is the average placement package offered on campus?',
    answer:
      'The average placement package is around Rs. 6.5 LPA, with the highest package touching Rs. 24 LPA in the last placement season. Over 85% of eligible students were placed across core and IT sectors.',
    keywords: 'placement package, average salary, highest package, placement stats',
  },
  {
    category: 'Placement',
    question: 'Which companies visit the campus for recruitment?',
    answer:
      'Recruiters include TCS, Infosys, Wipro, Accenture, Capgemini, and several core-sector companies along with startups, visiting through the Training & Placement Cell every academic year.',
    keywords: 'recruiters, companies, campus placement, tpo, placement drive',
  },
  {
    category: 'Transport',
    question: 'Is bus transport facility available for students?',
    answer:
      'Yes, the college operates buses on multiple routes covering the city and nearby towns. Route details and fee structure are available at the transport office, and seats are allotted on a first-come basis.',
    keywords: 'bus facility, transport, college bus, bus route',
  },
  {
    category: 'Faculty',
    question: 'How can I contact my department faculty or HOD?',
    answer:
      'Faculty contact details and office hours are listed on the department page of the college website. You can also reach out via the official college email ID or visit the department office during working hours.',
    keywords: 'faculty contact, hod, department contact, professor email',
  },
];

const announcements = [
  {
    title: 'Odd Semester Examination Datesheet Released',
    description:
      'The datesheet for the upcoming odd semester examinations has been published on the student portal. Students are advised to check their exam schedule and download their admit cards before the due date.',
  },
  {
    title: 'Campus Placement Drive - TCS & Infosys',
    description:
      'TCS and Infosys will be conducting an on-campus recruitment drive next week. Eligible final-year students must register through the Training & Placement Cell portal before the registration deadline.',
  },
  {
    title: 'Annual Cultural Fest "Zenith" Announced',
    description:
      'The college is proud to announce its annual cultural fest, bringing together music, dance, and technical competitions. Registrations for various events are now open through the student council.',
  },
];

async function seed() {
  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      ['Admin User', ADMIN_EMAIL, passwordHash]
    );

    const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]);
    const adminId = adminResult.rows[0] ? adminResult.rows[0].id : null;

    const countResult = await pool.query('SELECT COUNT(*) FROM college_information');
    const infoCount = parseInt(countResult.rows[0].count, 10);

    if (infoCount > 0) {
      console.log('college_information already has data - skipping info/announcement seeding.');
    } else {
      for (const item of collegeInfo) {
        await pool.query(
          `INSERT INTO college_information (category, question, answer, keywords, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [item.category, item.question, item.answer, item.keywords, adminId]
        );
      }

      for (const item of announcements) {
        await pool.query(
          `INSERT INTO announcements (title, description, created_by)
           VALUES ($1, $2, $3)`,
          [item.title, item.description, adminId]
        );
      }

      console.log(`Seeded ${collegeInfo.length} college_information rows and ${announcements.length} announcements.`);
    }

    console.log('Seed complete. Admin login: admin@campusconnect.edu / Admin@123');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
