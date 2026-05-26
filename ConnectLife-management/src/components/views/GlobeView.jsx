import Globe from "react-globe.gl";
import { useRef, useEffect } from "react";
import { marketLocations } from "../../data/marketLocations";

export default function GlobeView({ isDark, width = 600, height = 600 }) {
  const globeEl = useRef();

  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableZoom = false;
    globe.pointOfView({ altitude: 1.8 });
  }, []);

  return (
    <div style={{ width, height }}>
      <Globe
        ref={globeEl}
        width={width}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={
          isDark
            ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
            : "//unpkg.com/three-globe/example/img/earth-day.jpg"
        }
        showAtmosphere={true}
        atmosphereColor={isDark ? "#1a6fa8" : "#a8d8ea"}
        atmosphereAltitude={0.15}
        pointsData={marketLocations}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => isDark ? "#64c8ff" : "#ffffff"}
        pointRadius={0.35}
        pointAltitude={0.02}
      />
    </div>
  );
}