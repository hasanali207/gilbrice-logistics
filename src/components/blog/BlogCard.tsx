/* eslint-disable @next/next/no-img-element */
import { BlogArticle } from "@/app/(WithCommonLayout)/blogs/page";
import Link from "next/link";
import React from "react";

const truncateText = (title: string, wordLimit: number) => {
  const words = title.split(" ");
  return words.length > wordLimit
    ? words.slice(0, wordLimit).join(" ") + "..."
    : title;
};
const BlogCard: React.FC<{ blog: BlogArticle }>  = ({ blog }) => {
  const dateOnly = blog?.publishedAt?.split("T")[0];

  return (
    <div className="bg-white text-black dark:text-white hover:shadow-lg dark:bg-gray-800 hover:shadow-blue-600 rounded-2xl overflow-hidden transition-transform hover:scale-101 my-6 mx-8 shadow-2xl ">
      <div className="relative">
        <img
          src={blog.urlToImage}
          alt={blog.title}
          className="w-full h-32 object-cover"
        />
        <span className="absolute top-2 right-2 bg-green-600 text-white text-sm px-3 py-1 rounded-md">
          {dateOnly}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold ">
          {truncateText(blog.title, 5)}
        </h3>
        <p className=" w-80 text-sm mt-2">
          {truncateText(blog.description, 15)}{" "}
          <Link
            href={`/blogs/${blog.author}`}
            className="text-blue-500 font-medium hover:underline md:text-lg"
          >
            Read More...
          </Link>
        </p>
        {/* <div className="flex items-center text-gray-600 text-sm mt-2">
        <span className="mr-2">👤 By Admin</span>
        <span className="mr-2">👁 455</span>
        <span>💬 20</span>
      </div> */}
      </div>
    </div>
  );
};

export default BlogCard;
