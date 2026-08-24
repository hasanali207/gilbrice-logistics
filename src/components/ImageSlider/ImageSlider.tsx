"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useEffect } from "react";

export default function ImageSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  // const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const { data: bannerimages = [], isLoading } = useQuery({
    queryKey: ["bannerimages"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API}/api/v1/banner`
      );
      const data = res.data?.data;
      return data.map((item: any) => item.imageUrl) || [];
    },
    refetchInterval: 5000, // auto refresh every 5s
  });

  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [emblaApi]);

  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-lg font-semibold">Loading slider...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Slider Container */}
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex">
          {bannerimages.map((src: any, index: any) => (
            <div
              className="flex-[0_0_100%] relative w-full lg:h-[550px] h-80"
              key={index}
            >
              <Image
                src={src as string}
                alt={`Slide ${index + 1}`}
                fill
                className="object-fit"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {/* <Button
        variant="secondary"
        size="icon"
        onClick={scrollPrev}
        className="absolute top-12 left-2 -translate-y-1/2 rounded shadow-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
      >
        <ChevronLeft />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        onClick={scrollNext}
        className="absolute top-12 left-13 -translate-y-1/2 rounded shadow-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
      >
        <ChevronRight />
      </Button> */}
    </div>
  );
}
