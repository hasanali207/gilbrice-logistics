import Image from 'next/image'
import React from 'react'
import { Metadata } from 'next'

type Props = {
  params: {
    blogId: string;
  };
};

// 👇 Dynamic metadata based on blog title
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedParams = decodeURIComponent(params?.blogId);
  const res = await fetch(
    "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=a893a3bfa6ff4d6ba04ffebee2a4e707",
    { next: { revalidate: 30 } }
  );
  const BlogData = await res.json();
  const blog = BlogData?.articles?.find((item: any) => item.author === decodedParams);

  return {
    title: blog?.title || "Blog",
    description: blog?.description || "Explore this blog post on TutorLink!",
  };
}

const BlogDetailsPage = async ({ params }: Props) => {
  const decodedParams = decodeURIComponent(params?.blogId);
  const res = await fetch(
    "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=a893a3bfa6ff4d6ba04ffebee2a4e707",
    { next: { revalidate: 30 } }
  );
  const BlogData = await res.json();
  const singleBlog = BlogData?.articles?.filter((item: any) => item.author === decodedParams);

  const blog = singleBlog?.[0];

  if (!blog) return <p className="text-center text-lg pt-20">Blog not found.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 bg-blue-50 dark:bg-gray-900 text-black dark:text-white">
      <div className="max-w-3xl w-full mx-auto p-6 shadow-md bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Image
          src={blog?.urlToImage}
          alt={blog?.title}
          width={600}
          height={400}
          className="w-full h-60 object-cover rounded-lg"
        />
        <h1 className="text-2xl md:text-4xl font-bold my-6 dark:text-gray-100">{blog.title}</h1>
        <div className="dark:text-gray-300 text-sm mb-4">📅 {new Date(blog.publishedAt).toLocaleDateString()}</div>
        <p className="text-lg dark:text-gray-300">
          {blog.description} {blog.description} {blog.description}
        </p>
      </div>
    </div>
  );
};

export default BlogDetailsPage;
