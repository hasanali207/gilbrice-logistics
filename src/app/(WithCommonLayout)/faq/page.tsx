import FAQ from '@/components/faq/Faq'
import type { Metadata } from 'next'
 
export const metadata: Metadata={
  title: "TutorLink | FAQ",
  description : "TutorLink helps you to find Best tutors"
}

const FAQPage = () => {
    return (
        <div className = 'mt-22'>
            <FAQ/>
            
        </div>
    );
};

export default FAQPage;