/* eslint-disable @typescript-eslint/no-explicit-any */

export const postReview = async (
  tutorId: string,
  name: string,
  rating: number,
  reviewText: string,
  image:string
) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/api/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId,
          name,
          rating,
          reviewText,
          image
        }),
      }
    );

    const data = await response.json();

    return {
      success: true,
      message: data.message || "Review sent successfully!",
    };
  } catch (error) {
    console.error("Error sending Review: ", error);
    return { success: false };
  }
};

export const getReviews = async (tutorId: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/api/reviews/${tutorId}`,
      {
        next: {
          tags: ["REVIEWS"],
        },
      }
    );
    const data = await res.json();
    return data;
  } catch (error: any) {
    return { status: false, message: error.message };
  }
};
