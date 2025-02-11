import { useEffect, useState } from "react";

const useImageCache = (srcList = []) => {
  const [images, setImages] = useState({});

  useEffect(() => {
    const cache = {};
    let loaded = 0;
    srcList.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        loaded++;
        cache[src] = img;
        if (loaded === srcList.length) {
          setImages(cache);
        }
      };
      img.onerror = () => {
        loaded++;
        cache[src] = null;
        if (loaded === srcList.length) {
          setImages(cache);
        }
      };
    });
  }, [srcList]);

  return images;
};

export default useImageCache;
