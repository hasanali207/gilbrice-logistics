'use client';
import { useState } from 'react';

const faqData = [
  {
    question: 'How can I register as a tutor?',
    answer: 'To register as a tutor, click on the "Become a Tutor" button, fill in your personal details, subject expertise, availability, and other relevant information. Once submitted, our team will review your application and get back to you with the next steps.'
  },
  {
    question: 'How do I book a tutoring session?',
    answer: 'To book a session, browse available tutors based on your preferred subject, view their availability, and select a time that works for you. Follow the simple checkout process to complete your booking.'
  },
  {
    question: 'What subjects can I learn on TutorLink?',
    answer: 'TutorLink offers a wide range of subjects, including but not limited to Math, Science, History, English, Programming, and more. You can filter tutors based on your preferred subject.'
  },
  {
    question: 'How do I make payment for a session?',
    answer: 'Payments are made securely through our platform. Once you select a tutor and book a session, you’ll be prompted to complete the payment using various available methods.'
  },
  {
    question: 'Can I reschedule my session?',
    answer: 'Yes, you can reschedule your session as long as the tutor agrees and there is availability. You can contact your tutor directly through the platform to reschedule.'
  },
  {
    question: 'Do you offer any free sessions?',
    answer: 'We do not offer free sessions, but some tutors may offer a free trial class or discounted rates for first-time users. Check with individual tutors for any offers.'
  },
  {
    question: 'How do I update my personal information?',
    answer: 'You can update your personal details such as name, email, and subjects by logging into your account and editing your profile settings.'
  },
  {
    question: 'How do I get paid as a tutor?',
    answer: 'Once you start conducting sessions, your payment will be processed through the platform. You can choose your preferred payment method in your account settings.'
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Cancellation policies vary by tutor. However, generally, you can cancel up to 24 hours before the session for a full refund. Be sure to check individual tutor policies for more details.'
  },
  {
    question: 'Is TutorLink available internationally?',
    answer: 'Yes! TutorLink is available to students and tutors globally. You can book tutors from anywhere, and tutors can offer sessions from anywhere as long as they have a stable internet connection.'
  },
  {
    question: 'How do I contact customer support?',
    answer: 'If you have any questions or concerns, you can contact our customer support team through the "Contact Us" page or send us an email at support@tutorlink.com.'
  }
];

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleAnswer = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const filteredFAQ = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen max-w-7xl mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl  md:text-4xl font-bold text-center text-blue-600 dark:text-white  mb-8">Frequently Asked Questions</h2>

        {/* Search Box */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            placeholder="Search FAQs"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-3/4 sm:w-1/2 px-6 py-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all"
          />
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          {filteredFAQ.map((faq, index) => (
            <div
              key={index}
              className="border-b pb-6 dark:border-gray-700 transition-all duration-300"
            >
              <div
                onClick={() => toggleAnswer(index)}
                className="cursor-pointer flex justify-between items-center text-lg font-semibold  dark:text-gray-100 text-blue-600 transition-all"
              >
                <span>{faq.question}</span>
                <span className="text-xl">{activeIndex === index ? '-' : '+'}</span>
              </div>

              {activeIndex === index && (
                <div className="mt-4 text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
