import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { BASE_URL } from "../../utils/api.js";

const VideoCarousel = () => {
  const scrollRef = useRef(null);
  const videoRefs = useRef([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/videos/`);
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
        setVideos(data);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += direction === "left" ? -300 : 300;
    }
  };

  const handlePlay = (index) => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === index) {
          video.play();
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="relative bg-[#F9F5EE] py-8 flex justify-center items-center">
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-[#F9F5EE] py-8">
      <div className="flex items-center justify-center">
        {/* Left Chevron - Hidden on mobile, shown on desktop */}
        <button
          className="hidden md:block p-2 mx-4"
          onClick={() => scroll("left")}
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>

        {/* Video Carousel */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth space-x-4 px-4 w-full max-w-4xl"
          style={{ scrollbarWidth: 'none' }}
        >
          {videos.map((video, index) => (
            <div 
              key={video.id} 
              className="relative flex-shrink-0 w-[250px] h-[450px] flex items-center justify-center"
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={video.video_file}
                className="w-full h-full object-cover rounded-lg bg-black"
                muted
                loop
                playsInline
              />
              <button
                className="absolute inset-0 flex items-center justify-center"
                onClick={() => handlePlay(index)}
              >
                <Play size={40} className="text-white bg-black/50 rounded-full p-2" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Chevron - Hidden on mobile, shown on desktop */}
        <button
          className="hidden md:block p-2 mx-4"
          onClick={() => scroll("right")}
        >
          <ChevronRight size={24} className="text-gray-700" />
        </button>
      </div>

      {/* Mobile navigation indicators */}
      <div className="md:hidden flex justify-center mt-4 space-x-2">
        <button onClick={() => scroll("left")} className="p-2">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => scroll("right")} className="p-2">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default VideoCarousel;