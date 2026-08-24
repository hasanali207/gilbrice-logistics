"use client";

import { useKeenSlider } from "keen-slider/react";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Ahmed Rahman",
    role: "Business Owner",
    comment:
      "Gilbrice Logistics has made our international shipments much easier. Their service is reliable and professional.",
  },
  {
    name: "Sarah Khan",
    role: "Online Seller",
    comment:
      "The tracking process is simple and the team keeps us updated. Very good logistics experience.",
  },
  {
    name: "James Wilson",
    role: "Business Customer",
    comment:
      "Professional communication, secure handling, and dependable delivery. Highly recommended.",
  },
  {
    name: "Nusrat Jahan",
    role: "Regular Customer",
    comment:
      "I appreciate how easy the whole shipment process is. The support team is also very helpful.",
  },
];

const ReviewSection = () => {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: {
      perView: 3,
      spacing: 20,
    },
    breakpoints: {
      "(max-width: 1024px)": {
        slides: {
          perView: 2,
          spacing: 15,
        },
      },
      "(max-width: 640px)": {
        slides: {
          perView: 1,
          spacing: 10,
        },
      },
    },
  });

  return (
    <section className="bg-gray-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-secondary">
            Customer Experience
          </span>

          <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
            Trusted by Our Customers
          </h2>

          <p className="mt-4 text-gray-500">
            We believe great logistics is built on trust, communication, and
            consistent service.
          </p>
        </div>

        <div ref={sliderRef} className="keen-slider mt-14 py-3">
          {reviews.map((review) => (
            <div key={review.name} className="keen-slider__slide ">
              <div className="relative h-full rounded-2xl border border-gray-100 bg-white p-7 shadow-sm p-6">
                <Quote
                  size={34}
                  className="absolute right-6 top-6  text-secondary/10"
                />

                <div className="flex gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className="mt-5 text-sm leading-7 text-gray-600">
                  “{review.comment}”
                </p>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <p className="font-bold text-gray-900">{review.name}</p>
                  <p className="mt-1 text-xs text-secondary">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
