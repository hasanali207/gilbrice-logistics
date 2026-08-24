import BlogCard from "@/components/blog/BlogCard";
import BlogHeader from "@/components/blog/BlogHeader";
import type { Metadata } from 'next'
 
export const metadata: Metadata={
  title: "TutorLink | Blogs",
  description : "TutorLink helps you to find Best tutors"
}

export type BlogArticle = {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
};

const BlogPage = async () => {
  const res = await fetch(
    "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=a893a3bfa6ff4d6ba04ffebee2a4e707",
    {
      next: { revalidate: 30 },
    }
  );
  const BlogData = await res.json()

  return (
    <div className="max-w-7xl mx-auto text-white flex flex-col justify-center items-center mt-22">
       <BlogHeader></BlogHeader>
     <div className="md:grid md:grid-cols-2 lg:grid-cols-3 justify-between gap-4 md:gap-2 mt-8">
      {
        BlogData?.articles?.map((item:BlogArticle,index:number)=><BlogCard key={index} blog={item}></BlogCard>)
      }
     </div>
    </div>
  );
};

export default BlogPage;
